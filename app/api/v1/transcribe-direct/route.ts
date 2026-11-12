import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const accessKey = process.env.AUDIO_BRIDGE_API_KEY;
  if (!accessKey || request.headers.get("authorization") !== `Bearer ${accessKey}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return NextResponse.json({ error: "Serviço de transcrição indisponível." }, { status: 503 });

  try {
    const incoming = await request.formData();
    const audio = incoming.get("audio");
    if (!(audio instanceof File)) return NextResponse.json({ error: "Envie um arquivo de áudio." }, { status: 400 });
    if (audio.size === 0) return NextResponse.json({ error: "O arquivo está vazio." }, { status: 400 });
    if (audio.size > 25 * 1024 * 1024) return NextResponse.json({ error: "O áudio ultrapassa o limite de 25 MB." }, { status: 413 });
    const audioExtension = /\\.(opus|ogg|oga|mp3|m4a|wav|aac|amr|3gp|webm|mp4)$/i.test(audio.name);
    if (!(audio.type.startsWith("audio/") || audio.type === "video/mp4" || audio.type === "application/ogg" || audioExtension)) return NextResponse.json({ error: "Formato de áudio não suportado." }, { status: 415 });

    const groqForm = new FormData();
    groqForm.append("file", audio, audio.name || "audio.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("response_format", "verbose_json");
    groqForm.append("temperature", "0");
    const language = String(incoming.get("language") || "pt").slice(0, 12);
    const context = String(incoming.get("context") || "Transcrição de atendimento imobiliário em português do Brasil. Preserve nomes próprios, empreendimentos, valores e telefones.").slice(0, 900);
    if (language) groqForm.append("language", language);
    if (context) groqForm.append("prompt", context);

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: groqForm,
      signal: AbortSignal.timeout(55000),
    });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: result?.error?.message || "Falha no serviço de transcrição." }, { status: response.status });
    return NextResponse.json({ text: result.text || "", language: result.language || "pt", duration: result.duration || null, segments: result.segments || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao transcrever o áudio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

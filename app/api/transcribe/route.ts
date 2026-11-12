import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const accessKey = process.env.AUDIO_BRIDGE_API_KEY;
  if (accessKey && request.headers.get("authorization") !== `Bearer ${accessKey}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada. Crie uma chave gratuita na Groq e adicione nas variáveis da Vercel." }, { status: 503 });
  }

  let blobUrl = "";
  try {
    const body = await request.json() as { url?: string; language?: string; context?: string };
    blobUrl = body.url || "";

    if (!blobUrl.startsWith("https://")) {
      return NextResponse.json({ error: "URL inválida." }, { status: 400 });
    }

    const parsedUrl = new URL(blobUrl);
    if (!parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com")) {
      return NextResponse.json({ error: "Use uma URL do Vercel Blob." }, { status: 400 });
    }

    const audioResponse = await fetch(blobUrl);
    if (!audioResponse.ok) throw new Error("Não foi possível baixar o áudio.");

    const bytes = Buffer.from(await audioResponse.arrayBuffer());
    if (bytes.length > 25 * 1024 * 1024) throw new Error("Arquivo acima de 25 MB.");

    const contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
    const extension = contentType.includes("wav") ? "wav"
      : contentType.includes("mp4") ? "mp4"
      : contentType.includes("webm") ? "webm"
      : contentType.includes("ogg") ? "ogg"
      : contentType.includes("flac") ? "flac"
      : "mp3";

    const form = new FormData();
    form.append("file", new Blob([bytes], { type: contentType }), `audio.${extension}`);
    form.append("model", "whisper-large-v3-turbo");
    form.append("response_format", "verbose_json");
    form.append("temperature", "0");
    if (body.language) form.append("language", body.language);
    if (body.context) form.append("prompt", body.context.slice(0, 900));

    const transcriptionResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    });

    const result = await transcriptionResponse.json();
    if (!transcriptionResponse.ok) {
      const message = result?.error?.message || "Falha ao transcrever com Groq.";
      return NextResponse.json({ error: message }, { status: transcriptionResponse.status });
    }

    return NextResponse.json({
      text: result.text || "",
      language: result.language,
      duration: result.duration,
      segments: result.segments || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro na transcrição." },
      { status: 500 },
    );
  } finally {
    if (blobUrl) {
      try { await del(blobUrl); } catch {}
    }
  }
}

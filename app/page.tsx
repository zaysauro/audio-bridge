"use client";

import { useRef, useState } from "react";

type Segment = { start: number; end: number; text: string };
type Transcription = { text: string; language?: string; duration?: number; segments?: Segment[] };

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Transcription | null>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("auto");
  const [context, setContext] = useState("");
  const [copied, setCopied] = useState(false);

  async function transcribe() {
    if (!file || file.size > 25 * 1024 * 1024) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: blob.url,
          language: language === "auto" ? undefined : language,
          context,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível transcrever o áudio.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setBusy(false);
    }
  }

  function exportResult(format: "txt" | "json" | "srt") {
    if (!result) return;
    const body = format === "json"
      ? JSON.stringify(result, null, 2)
      : format === "srt"
        ? (result.segments || []).map((segment, index) =>
            `${index + 1}\n${timestamp(segment.start)} --> ${timestamp(segment.end)}\n${segment.text}\n`
          ).join("\n")
        : result.text;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cadena-transcricao.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function chooseFile(nextFile?: File) {
    if (!nextFile) return;
    setError("");
    setResult(null);
    if (nextFile.size > 25 * 1024 * 1024) {
      setFile(null);
      setError("O arquivo ultrapassa o limite de 25 MB.");
      return;
    }
    setFile(nextFile);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Cadena Audio início">
          <span className="brand-symbol">C</span>
          <span className="brand-name">cadena<span>audio</span></span>
        </a>
        <div className="topbar-right">
          <span className="internal-label"><i /> FERRAMENTA INTERNA</span>
          <a className="docs-link" href="/docs">Como funciona <span>↗</span></a>
        </div>
      </header>

      <section className="intro">
        <div className="eyebrow"><span /> PRODUTIVIDADE · CADENA IMÓVEIS</div>
        <h1>Converta conversas<br />em <em>informação.</em></h1>
        <p className="intro-copy">
          Transforme áudios de clientes, reuniões e atendimentos em texto organizado.
          Envie o arquivo, escolha o idioma e receba a transcrição em instantes.
        </p>
        <div className="trust-line">
          <span><b>01</b> Envie o áudio</span>
          <span className="trust-divider" />
          <span><b>02</b> Transcreva</span>
          <span className="trust-divider" />
          <span><b>03</b> Exporte o texto</span>
        </div>
      </section>

      <section className="workspace">
        <div className="workspace-heading">
          <div>
            <div className="section-kicker">ÁREA DE TRANSCRIÇÃO</div>
            <h2>Novo arquivo</h2>
          </div>
          <div className="format-pill"><span /> PROCESSAMENTO SEGURO</div>
        </div>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="audio/*,video/mp4,video/webm"
          onChange={(event) => chooseFile(event.target.files?.[0])}
        />

        <button
          className={`upload-zone ${file ? "has-file" : ""}`}
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            chooseFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="upload-icon">↑</span>
          <strong>{file ? file.name : "Arraste seu áudio para cá"}</strong>
          <span className="upload-hint">{file ? `${(file.size / 1048576).toFixed(2)} MB · arquivo selecionado` : "ou clique para procurar no dispositivo"}</span>
          <span className="upload-formats">MP3 · WAV · M4A · WEBM · MP4 · até 25 MB</span>
        </button>

        <div className="form-grid">
          <label className="field">
            <span>IDIOMA DO ÁUDIO</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="auto">Detectar automaticamente</option>
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="ja">Japonês</option>
              <option value="fr">Francês</option>
            </select>
          </label>
          <label className="field">
            <span>CONTEXTO E VOCABULÁRIO <small>OPCIONAL</small></span>
            <input
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Ex.: nomes, imóveis, bairros, empreendimentos..."
            />
          </label>
        </div>

        <button className="transcribe-button" disabled={!file || busy} onClick={transcribe}>
          {busy ? <><span className="spinner" /> Transcrevendo áudio...</> : <>Transcrever áudio <span>↗</span></>}
        </button>

        {error && <div className="error-message" role="alert">{error}</div>}

        {result && (
          <section className="result-panel">
            <div className="result-heading">
              <div>
                <div className="section-kicker">PROCESSAMENTO CONCLUÍDO</div>
                <h2>Transcrição pronta</h2>
              </div>
              <div className="result-meta">
                {result.language || "Idioma detectado"}
                {result.duration ? ` · ${Math.round(result.duration)} s` : ""}
              </div>
            </div>
            <div className="transcript-text">{result.text}</div>
            <div className="result-actions">
              <button onClick={copyResult}>{copied ? "Copiado ✓" : "Copiar texto"}</button>
              <button onClick={() => exportResult("txt")}>Baixar TXT</button>
              <button onClick={() => exportResult("json")}>Exportar JSON</button>
              {result.segments?.length ? <button onClick={() => exportResult("srt")}>Exportar SRT</button> : null}
            </div>
          </section>
        )}
      </section>

      <section className="privacy-note">
        <span className="privacy-icon">✓</span>
        <div>
          <strong>Privacidade e armazenamento</strong>
          <p>O áudio é enviado temporariamente para processamento e removido após a tentativa de transcrição. Revise o conteúdo antes de compartilhar informações de clientes.</p>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-brand">CADENA <b>IMÓVEIS</b></span>
        <span>Ferramenta interna de produtividade</span>
        <span>© 2026 Cadena</span>
      </footer>
    </main>
  );
}

function timestamp(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = Math.floor(value % 60);
  const millis = Math.round((value - Math.floor(value)) * 1000);
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":") + "," + String(millis).padStart(3, "0");
}

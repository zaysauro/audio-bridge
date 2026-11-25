export default function Docs() {
  return (
    <main style={{ maxWidth: 850, margin: "65px auto", padding: "0 24px", color: "#f5f5f2", fontFamily: "Arial, sans-serif", lineHeight: 1.75 }}>
      <a href="/" style={{ color: "#f1c84b", textDecoration: "none" }}>← Voltar ao Cadena Audio</a>
      <p style={{ color: "#f1c84b", fontSize: 11, letterSpacing: 2, marginTop: 34 }}>CADENA IMÓVEIS · FERRAMENTA INTERNA</p>
      <h1 style={{ fontSize: 38, marginBottom: 8 }}>Como usar o Cadena Audio</h1>
      <p style={{ color: "#aeb2b3" }}>Transforme gravações de atendimentos, reuniões e conversas em texto que você pode copiar ou exportar.</p>
      <h2 style={{ marginTop: 34 }}>Passo a passo</h2>
      <ol>
        <li>Selecione um arquivo de áudio ou vídeo compatível.</li>
        <li>Escolha o idioma ou mantenha a detecção automática.</li>
        <li>Se necessário, informe nomes próprios, bairros, empreendimentos ou termos que ajudem no reconhecimento.</li>
        <li>Clique em <strong>Transcrever áudio</strong> e aguarde o processamento.</li>
        <li>Copie o texto ou exporte em TXT, JSON ou SRT quando disponível.</li>
      </ol>
      <h2 style={{ marginTop: 34 }}>Formatos e limites</h2>
      <p>MP3, WAV, M4A, WEBM, MP4 e outros formatos de áudio aceitos pelo navegador. Limite máximo por arquivo: 25 MB.</p>
      <h2 style={{ marginTop: 34 }}>Privacidade</h2>
      <p>O arquivo é enviado temporariamente ao Vercel Blob para processamento e removido após a tentativa de transcrição. O serviço utiliza o modelo Whisper Large V3 Turbo por meio da Groq. Não envie gravações sem autorização ou conteúdo que não possa ser tratado pelos serviços externos envolvidos.</p>
      <h2 style={{ marginTop: 34 }}>Integração técnica</h2>
      <p>O serviço mantém endpoints HTTP para integrações autorizadas:</p>
      <ul>
        <li><code>GET /api/v1/health</code> — status do serviço.</li>
        <li><code>POST /api/upload</code> — autorização de upload temporário para Blob.</li>
        <li><code>POST /api/transcribe</code> — transcrição a partir de uma URL do Blob.</li>
        <li><code>POST /api/v1/transcribe-direct</code> — transcrição direta com autenticação Bearer.</li>
      </ul>
      <p style={{ color: "#92979a", fontSize: 12, marginTop: 48, borderTop: "1px solid #2b2e30", paddingTop: 18 }}>Cadena Audio · Ferramenta interna de produtividade · Cadena Imóveis</p>
    </main>
  );
}

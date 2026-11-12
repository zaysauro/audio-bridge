# AudioBridge

Serviço independente de transcrição de áudio com interface web e endpoints HTTP para integrar Amparo, Sofia e outras ferramentas.

## Stack
Next.js App Router · TypeScript · Groq Whisper Large V3 Turbo · Vercel Blob.

## Variáveis de ambiente
- `GROQ_API_KEY` — obrigatória para transcrição. Gere gratuitamente em https://console.groq.com/keys.
- `BLOB_READ_WRITE_TOKEN` — obrigatória para upload temporário no Vercel Blob.
- `AUDIO_BRIDGE_API_KEY` — opcional; bearer compartilhado para proteger o endpoint de transcrição.

A chave Groq é usada somente no servidor e nunca deve ser colocada no código do navegador.

## Desenvolvimento
```bash
npm install
npm run dev
```

Configure um Blob Store na Vercel e adicione as variáveis de ambiente. Após alterar variáveis na Vercel, faça um novo deployment.

## Endpoints
- `GET /api/v1/health` — status.
- `POST /api/upload` — handshake de upload direto para Blob.
- `POST /api/transcribe` — recebe JSON com URL do blob, idioma opcional e contexto opcional.

O motor padrão é `whisper-large-v3-turbo`, via API da Groq. A resposta inclui texto, idioma, duração e segmentos com timestamps quando fornecidos pelo provedor.

## Limites e segurança
- Limite de upload/transcrição atual: 25 MB.
- O plano gratuito da Groq tem limites de uso por organização e pode responder HTTP 429 quando a cota for atingida. Consulte https://console.groq.com/docs/rate-limits.
- Arquivos temporários são removidos após a tentativa de transcrição.
- Esta versão ainda não tem autenticação multiusuário, API keys individuais, cotas por cliente, histórico ou medição de consumo. Reforce esses controles antes de abrir o serviço como plataforma multi-tenant ou processar gravações confidenciais.

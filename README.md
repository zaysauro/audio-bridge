# AudioBridge

Serviço independente de transcrição de áudio com interface web e endpoints HTTP para integrar Amparo, Sofia e outras ferramentas.

## Stack
Next.js App Router · TypeScript · OpenAI Audio Transcriptions · Vercel Blob.

## Variáveis
- OPENAI_API_KEY (obrigatória)
- BLOB_READ_WRITE_TOKEN (obrigatória para upload temporário)
- AUDIO_BRIDGE_API_KEY (opcional, bearer compartilhado)

## Desenvolvimento
```bash
npm install
npm run dev
```
Configure um Blob Store na Vercel e adicione as variáveis de ambiente. A chave OpenAI é usada somente no servidor.

## Endpoints
- GET /api/v1/health — status.
- POST /api/upload — handshake de upload direto para Blob.
- POST /api/transcribe — JSON com URL do blob, idioma opcional e contexto opcional.

Arquivos temporários são removidos após transcrição. Limite atual: 25 MB. Esta fundação ainda não tem autenticação multiusuário, API keys individuais, cotas, histórico, medição de consumo ou seleção de provedor; esses controles são necessários antes de abrir o serviço como plataforma multi-tenant.

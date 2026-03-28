# Configuracao das APIs

## Gemini

Variaveis usadas:

```text
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta
```

Quando `GEMINI_API_KEY` estiver presente:

- o endpoint `POST /api/assistant/chat` usa o Gemini
- o backend pede uma resposta estruturada em JSON
- o chat tenta extrair nome, telefone, servico e preferencias de horario

Quando a chave nao estiver presente:

- o projeto cai automaticamente no modo local em `server/services/fallback-assistant.js`

## WhatsApp Cloud API

Variaveis usadas:

```text
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_NOTIFY_TO=5588999999999
```

Uso de cada variavel:

- `WHATSAPP_ACCESS_TOKEN`: token da Cloud API
- `WHATSAPP_PHONE_NUMBER_ID`: ID do numero emissor configurado na Meta
- `WHATSAPP_VERIFY_TOKEN`: token usado na verificacao do webhook
- `WHATSAPP_GRAPH_VERSION`: versao da Graph API usada nas chamadas
- `WHATSAPP_NOTIFY_TO`: numero opcional que recebe notificacoes de novos agendamentos

## Endpoints envolvidos

- `GET /webhooks/whatsapp`: validacao da assinatura inicial do webhook
- `POST /webhooks/whatsapp`: recebimento das mensagens da Meta
- `POST https://graph.facebook.com/{version}/{phone-number-id}/messages`: envio da resposta pelo backend

## Exemplo no PowerShell

```powershell
$env:GEMINI_API_KEY="sua-chave"
$env:WHATSAPP_ACCESS_TOKEN="seu-token"
$env:WHATSAPP_PHONE_NUMBER_ID="123456789"
$env:WHATSAPP_VERIFY_TOKEN="token-local"
$env:WHATSAPP_NOTIFY_TO="5588999999999"
node server.js
```

## Observacoes

- O formulario do site continua exigindo e-mail.
- O chat do site e o WhatsApp podem registrar pre-agendamentos sem e-mail, porque nesses canais o retorno principal acontece por telefone.
- Se o WhatsApp nao estiver configurado, os agendamentos continuam sendo salvos normalmente no SQLite.

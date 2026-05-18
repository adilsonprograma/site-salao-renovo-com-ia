# Renovo Cabeleireiros & ColorIA

Landing page institucional com:

- formulario de agendamento salvo em SQLite
- chat de atendimento com modo local ou Gemini
- webhook e envio de mensagens via WhatsApp Cloud API
- front-end e back-end separados por responsabilidade
- painel admin com autenticacao por cookie HttpOnly

## Estrutura principal

```text
.
|-- data/
|-- docs/
|   |-- ARQUITETURA.md
|   |-- CONFIGURACAO_APIS.md
|   `-- API.md
|-- legacy/
|   `-- python-version/
|-- notes/
|   |-- guides/
|   `-- history/
|-- public/
|   |-- assets/
|   |   |-- images/
|   |   |-- scripts/
|   |   `-- styles/
|   |-- admin.html
|   |-- index.html
|   `-- login.html
|-- server/
|   |-- auth.js
|   |-- services/
|   |   |-- appointments.js
|   |   |-- assistant.js
|   |   |-- fallback-assistant.js
|   |   |-- gemini.js
|   |   `-- whatsapp.js
|   |-- config.js
|   |-- database.js
|   |-- http.js
|   |-- routes.js
|   |-- static-server.js
|   `-- validation.js
|-- package.json
`-- server.js
```

## Como executar

```powershell
node server.js
```

ou

```powershell
npm start
```

Depois abra:

```text
http://localhost:3000
```

## Scripts

```powershell
cmd /c npm run check
```

Observacao:
No PowerShell deste ambiente o `npm.ps1` pode estar bloqueado por politica de execucao, por isso o uso de `cmd /c` e o caminho mais seguro.

## Endpoints

- `GET /api/health`: status do servidor, banco e integracoes
- `GET /api/integrations`: resumo das integracoes configuradas
- `GET /api/appointments`: lista agendamentos recentes
- `POST /api/appointments`: salva um agendamento manual
- `POST /api/assistant/chat`: conversa com a ColorIA pelo site
- `POST /api/admin/login`: inicia sessao do painel admin
- `POST /api/admin/logout`: encerra a sessao do painel admin
- `GET /api/admin/status`: valida a sessao atual
- `GET /api/admin/appointments`: lista protegida do painel
- `POST /api/admin/appointments/:id/notify`: reenfileira a notificacao do agendamento
- `GET /webhooks/whatsapp`: verificacao do webhook da Meta
- `POST /webhooks/whatsapp`: recebe mensagens do WhatsApp Cloud API

## Integracoes

- Gemini: usado para interpretar conversas e montar pre-agendamentos quando `GEMINI_API_KEY` estiver configurada
- WhatsApp Cloud API: usada para responder mensagens do WhatsApp e opcionalmente notificar a equipe sobre novos agendamentos

Veja os detalhes em `docs/CONFIGURACAO_APIS.md`.

## Pastas de apoio

- `docs/ARQUITETURA.md`
- `docs/API.md`
- `docs/CONFIGURACAO_APIS.md`
- `notes/guides/`
- `legacy/python-version/`

# 🔌 Referência Completa de API - Renovo Cabeleireiros

**Base URL:** `http://localhost:3000/api` (local) | `https://seu-dominio.com/api` (produção)

**Autenticação:** Cookie HttpOnly (`admin_session_id`)

---

## 📑 Índice

1. [Autenticação](#autenticação)
2. [Health & Status](#health--status)
3. [Agendamentos](#agendamentos)
4. [Assistente IA](#assistente-ia)
5. [Admin (Protegido)](#admin-protegido)
6. [Webhooks](#webhooks)
7. [Códigos de Erro](#códigos-de-erro)

---

## 🔐 Autenticação

### POST `/admin/login`

Autentica um usuário e cria uma sessão.

**Request:**
```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login realizado com sucesso!"
}
```

**Headers de Response:**
```
Set-Cookie: admin_session_id=xxxx; HttpOnly; SameSite=Strict; Max-Age=7200; Path=/
```

**Response (401 Unauthorized):**
```json
{
  "message": "Usuário ou senha incorretos"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

---

### POST `/admin/logout`

Encerra a sessão do usuário.

**Request:**
```bash
POST /api/admin/logout
Cookie: admin_session_id=xxxx
```

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Headers de Response:**
```
Set-Cookie: admin_session_id=; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Strict
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt
```

---

### GET `/admin/status`

Verifica se o usuário está autenticado (protegido).

**Request:**
```bash
GET /api/admin/status
Cookie: admin_session_id=xxxx
```

**Response (200 OK):**
```json
{
  "authenticated": true,
  "user": {
    "username": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Não autenticado"
}
```

**Exemplo cURL:**
```bash
curl http://localhost:3000/api/admin/status -b cookies.txt
```

---

## 📊 Health & Status

### GET `/health`

Verifica o status do servidor e integrações.

**Request:**
```bash
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "databaseFile": "/app/data/appointments.json",
  "integrations": {
    "gemini": {
      "configured": true,
      "model": "gemini-2.5-flash",
      "enabled": true
    },
    "whatsapp": {
      "configured": true,
      "enabled": true,
      "phoneNumberId": "1234567890"
    }
  }
}
```

---

### GET `/integrations`

Obtém o status de todas as integrações.

**Request:**
```bash
GET /api/integrations
```

**Response (200 OK):**
```json
{
  "gemini": {
    "configured": true,
    "model": "gemini-2.5-flash",
    "enabled": true
  },
  "whatsapp": {
    "configured": true,
    "enabled": true,
    "phoneNumberId": "123456789",
    "graphVersion": "v23.0"
  }
}
```

---

## 📅 Agendamentos

### POST `/appointments`

Cria um novo agendamento.

**Request:**
```bash
POST /api/appointments
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "telefone": "(88) 99999-1111",
  "servico": "Corte + Coloração",
  "dataPreferencial": "2026-04-20",
  "horarioPreferencial": "14:00",
  "origemAgendamento": "site_form",
  "cep": "60614040",
  "logradouro": "Rua Principal",
  "bairro": "Centro",
  "localidade": "Russas, CE"
}
```

**Campos obrigatórios:**
- `nome` (string, 1-100 caracteres)
- `email` (string, email válido)
- `telefone` (string, 10-15 caracteres)
- `servico` (string)

**Campos opcionais:**
- `dataPreferencial`
- `horarioPreferencial`
- `cep`, `logradouro`, `bairro`, `localidade`

**Response (201 Created):**
```json
{
  "message": "Agendamento criado com sucesso!",
  "appointment": {
    "id": "1234567890",
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "telefone": "(88) 99999-1111",
    "servico": "Corte + Coloração",
    "created_at": "2026-04-18T10:30:00",
    "status": "pendente"
  },
  "notification": {
    "method": "whatsapp",
    "sent": true,
    "timestamp": "2026-04-18T10:30:05"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Erros na validação dos dados",
  "errors": [
    "Nome é obrigatório",
    "Email inválido"
  ]
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "telefone": "(88) 99999-1111",
    "servico": "Corte"
  }'
```

---

### GET `/appointments?limit=25`

Lista agendamentos recentes (público).

**Request:**
```bash
GET /api/appointments?limit=25
```

**Query Parameters:**
- `limit` (opcional, padrão: 25, máximo: 1000)

**Response (200 OK):**
```json
{
  "appointments": [
    {
      "id": "1234567890",
      "nome": "Maria Silva",
      "email": "maria@example.com",
      "telefone": "(88) 99999-1111",
      "servico": "Corte + Coloração",
      "created_at": "2026-04-18T10:30:00",
      "status": "pendente"
    },
    {
      "id": "0987654321",
      "nome": "Ana Costa",
      "email": "ana@example.com",
      "telefone": "(88) 99999-2222",
      "servico": "Hidratação",
      "created_at": "2026-04-17T14:15:00",
      "status": "confirmado"
    }
  ]
}
```

**Exemplo cURL:**
```bash
curl "http://localhost:3000/api/appointments?limit=10"
```

---

### POST `/admin/appointments/[ID]/notify`

Reenviar notificação de agendamento via WhatsApp (protegido).

**Request:**
```bash
POST /api/admin/appointments/1234567890/notify
Cookie: admin_session_id=xxxx
```

**Response (200 OK):**
```json
{
  "message": "Notificação reenviada com sucesso",
  "appointment": {
    "id": "1234567890",
    "nome": "Maria Silva",
    "telefone": "(88) 99999-1111"
  },
  "notification": {
    "method": "whatsapp",
    "sent": true,
    "timestamp": "2026-04-18T10:35:10"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Agendamento não encontrado"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Não autenticado"
}
```

---

### GET `/admin/appointments?limit=25`

Lista agendamentos com acesso administrativo (protegido).

**Request:**
```bash
GET /api/admin/appointments?limit=25
Cookie: admin_session_id=xxxx
```

**Query Parameters:**
- `limit` (opcional, padrão: 25)

**Response (200 OK):**
```json
{
  "appointments": [
    {
      "id": "1234567890",
      "nome": "Maria Silva",
      "email": "maria@example.com",
      "telefone": "(88) 99999-1111",
      "servico": "Corte + Coloração",
      "dataPreferencial": "2026-04-20",
      "created_at": "2026-04-18T10:30:00",
      "status": "pendente"
    }
  ],
  "user": {
    "username": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Não autenticado. Faça login para continuar."
}
```

---

## 🤖 Assistente IA

### POST `/assistant/chat`

Enviar mensagem para ColorIA (assistente).

**Request:**
```bash
POST /api/assistant/chat
Content-Type: application/json

{
  "message": "Qual cor fica melhor em cabelo castanho?",
  "sessionId": "user-maria-123",
  "phone": "(88) 99999-1111",
  "name": "Maria"
}
```

**Campos:**
- `message` (obrigatório, string)
- `sessionId` (obrigatório, string única por usuário)
- `phone` (opcional)
- `name` (opcional)

**Response (200 OK):**
```json
{
  "response": "Para cabelo castanho, recomendo morena iluminada com mechas honey blend...",
  "suggestions": [
    "Morena iluminada com mechas honey",
    "Cobre quente com reflexos dourados",
    "Castanho chocolate com iluminação"
  ],
  "followUp": "Gostaria de agendar uma consulta?"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Envie uma mensagem para o assistente."
}
```

**Response (503 Service Unavailable):**
```json
{
  "response": "Desculpa, estou temporariamente indisponível. Tente novamente mais tarde.",
  "error": "Gemini API unavailable"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual cor fica bem em cabelo preto?",
    "sessionId": "user-123"
  }'
```

---

## 🛡️ Admin (Protegido)

Todas as rotas admin requerem autenticação via cookie.

### GET `/admin/appointments?limit=25`

*Ver [Agendamentos → Admin](#getadminappointmentslimit25)*

---

### POST `/admin/appointments/[ID]/notify`

*Ver [Agendamentos → Notify](#postadmin-appointmentsidnotify)*

---

### GET `/admin/status`

*Ver [Autenticação → Status](#getadminstatus)*

---

## 🔗 Webhooks

### POST `/webhooks/whatsapp`

Receber mensagens do WhatsApp Cloud API (webhook).

**Configurar em:**
Meta for Developers → WhatsApp → App → Settings → Webhook

**Request (do WhatsApp):**
```json
{
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "5588991234567",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "text": {
                  "body": "Olá, gostaria de agendar um corte"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response (200 OK):**
```
EVENT_RECEIVED
```

**GET (Verification)**

Webhook também responde a GET para verificação:

**Request:**
```bash
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=yyy
```

**Response (200 OK):**
```
yyy
```

---

## ⚠️ Códigos de Erro

### 200 OK
Requisição bem-sucedida.

### 201 Created
Recurso criado com sucesso.

### 204 No Content
Requisição bem-sucedida, sem conteúdo.

### 400 Bad Request
Dados inválidos ou faltando campos obrigatórios.

```json
{
  "message": "Erros na validação",
  "errors": ["campo1 é obrigatório"]
}
```

### 401 Unauthorized
Não autenticado ou sessão expirada.

```json
{
  "message": "Não autenticado"
}
```

### 403 Forbidden
Acesso negado (arquivo estático não permitido).

```json
{
  "message": "Acesso negado"
}
```

### 404 Not Found
Recurso não encontrado.

```json
{
  "message": "Recurso não encontrado"
}
```

### 405 Method Not Allowed
Método HTTP não permitido.

```json
{
  "message": "Método não permitido"
}
```

### 500 Internal Server Error
Erro do servidor.

```json
{
  "message": "Não foi possível concluir a operação agora"
}
```

### 503 Service Unavailable
Serviço indisponível (ex: API externa).

```json
{
  "message": "Serviço temporariamente indisponível"
}
```

---

## 🔄 Rate Limiting

Atualmente SEM rate limiting implementado.

**Roadmap:** Implementar rate limiting para `/admin/login` (max 5 tentativas/min)

---

## 📦 Versionamento de API

Versão atual: **v1** (implícita em todos os endpoints)

Endpoints sempre serão: `/api/[rota]`

---

## 🧪 Exemplos Completos

### Fluxo Completo: Login → Admin → Agendamentos

```bash
# 1. Login
COOKIE_JAR="/tmp/cookies.txt"
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_JAR"

# 2. Verificar autenticação
curl http://localhost:3000/api/admin/status -b "$COOKIE_JAR"

# 3. Listar agendamentos
curl "http://localhost:3000/api/admin/appointments?limit=10" -b "$COOKIE_JAR"

# 4. Reenviar notificação
curl -X POST "http://localhost:3000/api/admin/appointments/1234567890/notify" \
  -b "$COOKIE_JAR"

# 5. Logout
curl -X POST http://localhost:3000/api/admin/logout -b "$COOKIE_JAR"
```

### Fluxo: Chat IA

```bash
# 1. Primeira mensagem
curl -X POST http://localhost:3000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual cor fica bem em cabelo castanho?",
    "sessionId": "user-maria-1"
  }'

# 2. Segunda mensagem (mesma sessão)
curl -X POST http://localhost:3000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "E se eu tiver cabelocomprido?",
    "sessionId": "user-maria-1"
  }'
```

---

**Última atualização**: 18 de Abril de 2026

**Próxima versão planejada**: v2 (com mais endpoints administrativos)

# 🏗️ Arquitetura Detalhada - Renovo Cabeleireiros

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET/CLIENTE                      │
│                   (Navegador do Usuário)                │
└────────────────────────┬────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌──────────────┐            ┌──────────────────┐
    │  Frontend    │            │  Arquivos        │
    │  (HTML/JS)   │            │  Estáticos       │
    └──────────────┘            └──────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Python HTTP Server (main.py)  │
        │  ├─ Request Handler            │
        │  ├─ Route Dispatcher           │
        │  └─ Response Encoder           │
        └────────────────┬───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐   ┌──────────┐   ┌────────────┐
    │  Routes │   │ Services │   │ Database   │
    │  /api   │   │  Layer   │   │  (JSON)    │
    └─────────┘   └──────────┘   └────────────┘
         │               │
         ▼               ▼
    ┌─────────────────────────────────────┐
    │  Integrações Externas               │
    │  ├─ Google Gemini API               │
    │  ├─ WhatsApp Cloud API              │
    │  └─ Email/Webhook                   │
    └─────────────────────────────────────┘
```

---

## 1. Camada Frontend

### Arquitetura Frontend

```
Frontend (Navegador)
├── HTML Pages
│   ├── index.html (Landing page)
│   ├── login.html (Autenticação)
│   └── admin.html (Dashboard)
│
├── JavaScript (ES6 Modules)
│   ├── app.js (Inicialização)
│   ├── auth-client.js (API de autenticação)
│   ├── login.js (Lógica do login)
│   ├── admin-protected.js (Lógica do admin)
│   ├── modules/ (Componentes reutilizáveis)
│   │   ├── chat-widget.js
│   │   ├── contact-form.js
│   │   ├── gallery-carousel.js
│   │   └── hero-section.js
│   └── services/ (Chamadas de API)
│       └── api-client.js
│
└── CSS (Cascade Stylesheets)
    ├── main.css (Estilos globais)
    ├── login.css (Tema de login)
    └── admin.css (Tema administrativo)
```

### Fluxo de Renderização

```
Página carrega
    ↓
DOM ParseHTMLL
    ↓
Scripts carregam (ES6 modules)
    ↓
app.js executa initXXX()
    ↓
Componentes inicializam
    ├─ initGalleryCarousel()
    ├─ initChatWidget()
    ├─ initContactForm()
    └─ event listeners agregados
    ↓
Página renderizada e interativa
```

### Comunicação Frontend-Backend

```javascript
// Frontend usa auth-client.js para fazer requisições

// Exemplo: Login
const response = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',  // Envia cookies
    body: JSON.stringify({ username, password })
});

// Cookies são gerenciados automaticamente pelo navegador
// Cada requisição subsequente envia o cookie automaticamente
```

---

## 2. Camada Backend (Python)

### Estrutura de Aplicação

```
main.py (Entry Point)
├── Cria ThreadingHTTPServer
├── Registra RenovoRequestHandler
└── Aguarda requisições

RenovoRequestHandler (Herança de BaseHTTPRequestHandler)
├── do_GET() → _handle_request()
├── do_POST() → _handle_request()
├── do_OPTIONS() → _handle_request()
└── do_HEAD() → _handle_request()

route_request(handler) em routes.py
├── Parse URL (pathname, query params)
├── Match contra padrões de rota
├── Chama handler específico
└── Envia resposta JSON/HTML
```

### Fluxo de Requisição

```
1. Cliente faz requisição (GET/POST)
         ↓
2. ThreadingHTTPServer recebe
         ↓
3. RenovoRequestHandler._handle_request()
         ↓
4. route_request(handler) em routes.py
         ↓
5. Parse URL: /api/admin/login → pathname="/api/admin/login"
         ↓
6. Match rota: if pathname == "/api/admin/login"
         ↓
7. Chama handle_admin_login(handler)
         ↓
8. Handler valida e processa
         ↓
9. send_json(handler, 200, {"resultado": "ok"})
         ↓
10. Response enviada ao cliente
```

### Services (Lógica de Negócios)

#### auth.py - Autenticação
```python
_sessions = {
    "session_id": {
        "username": "admin",
        "timestamp": 1234567890,
        "token": "token_xxx"
    }
}

Funções principais:
├─ login_user(username, password) → {"success": bool, "session_id": str}
├─ is_user_logged_in(session_id) → bool
├─ logout_user(session_id) → bool
├─ get_current_session(session_id) → dict
└─ require_auth(handler) → dict (middleware)
```

#### appointments.py - Agendamentos
```python
Funções principais:
├─ create_appointment(payload) → {"isValid": bool, "appointment": dict}
├─ list_appointments(limit) → [dict]
├─ notify_existing_appointment(id) → {"ok": bool, "notification": dict}
└─ (Persiste em data/appointments.json)
```

#### assistant.py - ColorIA (Orquestração)
```python
Funções principais:
├─ run_assistant_turn(platform, message, session_id) → {"response": str, ...}
├─ process_whatsapp_webhook_payload(payload) → None
└─ Coordena Gemini + WhatsApp
```

#### gemini.py - Google Gemini API
```python
Funções principais:
├─ send_gemini_request(messages, model) → str
├─ _build_system_prompt() → str
└─ Suporta conversas multi-turno
```

#### whatsapp.py - WhatsApp Cloud API
```python
Funções principais:
├─ send_whatsapp_message(phone, message) → bool
├─ verify_whatsapp_webhook(params) → {"ok": bool, "challenge": str}
└─ process_incoming_message(payload) → None
```

### Database (data/appointments.json)

```json
[
  {
    "id": "1234567890",
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "telefone": "(88) 99999-1111",
    "servico": "Corte + Coloração",
    "dataPreferencial": "2026-04-20",
    "horarioPreferencial": "14:00",
    "created_at": "2026-04-18T10:30:00",
    "origemAgendamento": "site_form",
    "status": "pendente"
  }
]
```

---

## 3. Fluxos de Funcionalidades

### Fluxo: Novo Agendamento

```
1. Cliente preenche formulário em index.html
         ↓
2. Valida localmente em JavaScript
         ↓
3. POST /api/appointments com dados
         ↓
4. Backend recebe em handle_appointments_create()
         ↓
5. Valida dados em validation.py
         ↓
6. Cria agendamento em appointments.py
         ↓
7. Salva em data/appointments.json
         ↓
8. Envia notificação WhatsApp
         ↓
9. Responde JSON com resultado
         ↓
10. Frontend mostra confirmação
```

### Fluxo: Login Admin

```
1. Usuario vai para login.html
         ↓
2. Clica "Entrar"
         ↓
3. POST /api/admin/login com credenciais
         ↓
4. Backend: handle_admin_login()
         ↓
5. auth.py: login_user() valida credenciais
         ↓
6. Se OK: Cria sessão em _sessions
         ↓
7. Set-Cookie: admin_session_id=xxx (HttpOnly)
         ↓
8. Frontend recebe resposta
         ↓
9. Redireciona para admin.html
         ↓
10. admin.html faz GET /api/admin/status
         ↓
11. Backend valida cookie com require_auth()
         ↓
12. Se válido: Retorna dados
         ↓
13. Painel carrega agendamentos
```

### Fluxo: Chat ColorIA

```
1. Usuário abre chat widget em index.html
         ↓
2. Digite mensagem no chat
         ↓
3. POST /api/assistant/chat com message
         ↓
4. Backend: handle_assistant_chat()
         ↓
5. assistant.py: run_assistant_turn()
         ↓
6. Recupera histórico da sessão
         ↓
7. Chama gemini.py: send_gemini_request()
         ↓
8. Google Gemini API processa
         ↓
9. Retorna resposta IA
         ↓
10. Backend envia JSON ao frontend
         ↓
11. Chat widget renderiza resposta
```

### Fluxo: Webhook WhatsApp

```
1. Cliente envia mensagem no WhatsApp
         ↓
2. WhatsApp Cloud envia POST /webhooks/whatsapp
         ↓
3. Backend verifica webhook token
         ↓
4. assistant.py: process_whatsapp_webhook_payload()
         ↓
5. Extrai mensagem do payload
         ↓
6. Chama run_assistant_turn()
         ↓
7. Gera resposta com Gemini
         ↓
8. whatsapp.py: send_whatsapp_message()
         ↓
9. Envia resposta via WhatsApp Cloud API
         ↓
10. Cliente recebe mensagem
```

---

## 4. Padrões de Segurança

### Cookies HttpOnly

```python
# Definir cookie seguro em http_utils.py
Set-Cookie: admin_session_id=valor;
    HttpOnly;        # Não acessível via JavaScript
    SameSite=Strict; # Proteção CSRF
    Path=/;          # Válido para toda aplicação
    Max-Age=7200     # 2 horas
```

**Vantagens:**
- ✅ Protege contra XSS (stealing de cookies)
- ✅ Protege contra CSRF com SameSite
- ✅ Renovação automática de sessão

### Validação de Entrada

```python
# validation.py
def validate_appointment(data):
    errors = []
    
    if not data.get('nome'):
        errors.append("Nome é obrigatório")
    
    if not is_valid_email(data.get('email')):
        errors.append("Email inválido")
    
    if not is_valid_phone(data.get('telefone')):
        errors.append("Telefone inválido")
    
    return {"isValid": len(errors) == 0, "errors": errors}
```

### CORS

```python
# http_utils.py - Build CORS headers
def build_cors_headers(handler):
    return {
        "Access-Control-Allow-Origin": handler.headers.get("Origin") or "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
```

---

## 5. Integração com Serviços Externos

### Google Gemini API

```
Frontend
    ↓
POST /api/assistant/chat
    ↓
Backend: gemini.py
    ↓
HTTP Request para: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
    ↓
Request Body:
{
  "contents": [
    {"role": "user", "parts": [{"text": "..."}]}
  ],
  "systemInstruction": {...}
}
    ↓
Response:
{
  "candidates": [{
    "content": {
      "parts": [{"text": "resposta IA"}]
    }
  }]
}
    ↓
Backend formata resposta
    ↓
Retorna ao frontend
```

### WhatsApp Cloud API

```
Frontend (Agendamento)
    ↓
POST /api/appointments
    ↓
Backend: whatsapp.py
    ↓
HTTP Request para: https://graph.instagram.com/v23.0/{phone_number_id}/messages
    ↓
Headers:
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
    ↓
Request Body:
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "5588991234567",
  "type": "text",
  "text": {"body": "Seu agendamento foi confirmado..."}
}
    ↓
Response:
{"messages": [{"id": "xxx"}]}
    ↓
Backend registra envio
    ↓
Ou webhook /webhooks/whatsapp recebe mensagens
```

---

## 6. Performance e Escalabilidade

### Otimizações Atuais

- ✅ **HTTP Server Threading**: Múltiplas requisições simultâneas
- ✅ **Cache de Gemini**: Evita requisições duplicadas
- ✅ **JSON simples**: Rápido para leitura/escrita
- ✅ **Assets minificados**: CSS e JS otimizados
- ✅ **Lazy loading**: Imagens carregam sob demanda

### Melhorias Futuras

- [ ] Banco de dados PostgreSQL (ao invés de JSON)
- [ ] Redis para cache de sessões
- [ ] CDN para arquivos estáticos
- [ ] Rate limiting
- [ ] Compressão GZIP
- [ ] Service Workers (offline)

---

## 7. Lifecycle de Dados

### Dados de Agendamento

```
1. Cliente envia dados
   └─ nome, email, telefone, servico, etc
   
2. Backend valida
   └─ Verifica campos obrigatórios
   
3. Salva em data/appointments.json
   └─ Cria arquivo se não existir
   
4. Notifica WhatsApp
   └─ Envia mensagem ao cliente
   
5. Retorna ao frontend
   └─ Sucesso com ID do agendamento
   
6. Admin visualiza em painel
   └─ GET /api/admin/appointments
```

### Dados de Sessão

```
1. Login bem-sucedido
   └─ Cria entrada em _sessions (memória)
   
2. Set-Cookie ao cliente
   └─ browser guarda cookie
   
3. Cada requisição envia cookie
   └─ Header: Cookie: admin_session_id=xxx
   
4. Backend valida sessão
   └─ require_auth() confirma validade
   
5. Timeout após 2 horas
   └─ Sessão removida automaticamente
   
6. Logout
   └─ Remove de _sessions
   └─ Set-Cookie vazio para limpar
```

---

## 8. Tratamento de Erros

### Frontend

```javascript
try {
    const response = await fetch('/api/...');
    
    if (!response.ok) {
        if (response.status === 401) {
            // Redirecionar para login
            window.location.href = 'login.html';
        } else if (response.status === 400) {
            // Mostrar erro de validação
            showError(data.message);
        }
    }
} catch (error) {
    // Erro de conexão
    showError('Erro ao conectar com servidor');
}
```

### Backend

```python
try:
    result = processar_dados(payload)
except ValidationError as e:
    send_json(handler, 400, {"message": str(e)})
except DatabaseError as e:
    send_json(handler, 500, {"message": "Erro ao salvar dados"})
except Exception as e:
    print(f"Erro inesperado: {e}")
    send_json(handler, 500, {"message": "Erro do servidor"})
```

---

## 9. Roadmap de Arquitetura

### Curto Prazo (Próximas 2-4 semanas)
- [ ] Migrar JSON para PostgreSQL
- [ ] Implementar Redis para sessões
- [ ] Adicionar logging estruturado

### Médio Prazo (1-3 meses)
- [ ] Microserviços para Gemini/WhatsApp
- [ ] Implementar 2FA
- [ ] API Gateway com rate limiting

### Longo Prazo (3-6 meses)
- [ ] Aplicativo mobile
- [ ] GraphQL API
- [ ] Real-time notifications com WebSockets
- [ ] Multi-tenant support

---

**Última atualização**: 18 de Abril de 2026

# 📂 Estrutura Completa do Projeto - Renovo Cabeleireiros

## Visão Geral da Organização

```
projeto-salao-com-ia/
│
├── 📄 Documentação Principal
│   ├── README_NOVO.md                    ⭐ LEIA PRIMEIRO (guia completo)
│   ├── .env.example                       Variáveis de ambiente
│   ├── .gitignore
│   ├── LICENSE
│   └── STRUCTURE.md                       Este arquivo
│
├── 📂 frontend/                           Frontend Público
│   ├── index.html                         Landing page principal
│   ├── login.html                         Página de login
│   ├── admin.html                         Painel administrativo
│   │
│   └── 📂 assets/
│       ├── 📂 images/                     Fotos do salão
│       │   ├── renovo-salao.png
│       │   ├── 20260328_102923.jpg
│       │   ├── 20260328_102936.jpg
│       │   └── 20260328_102912.jpg
│       │
│       ├── 📂 styles/                     Folhas de estilo CSS
│       │   ├── main.css                   Estilos globais (1000+ linhas)
│       │   ├── login.css                  Tema do login
│       │   ├── admin.css                  Tema administrativo
│       │   └── (variáveis CSS, grid, flexbox, animations)
│       │
│       └── 📂 scripts/                    JavaScript ES6 Modules
│           ├── app.js                     Inicialização principal
│           ├── auth-client.js             🔐 Cliente de autenticação
│           ├── login.js                   Lógica do formulário login
│           ├── admin-protected.js         Lógica do painel admin
│           │
│           ├── 📂 modules/                Componentes reutilizáveis
│           │   ├── chat-widget.js         Widget de chat IA
│           │   ├── contact-form.js        Formulário de contato
│           │   ├── gallery-carousel.js    Carrossel de fotos
│           │   └── hero-section.js        Seção hero da landing
│           │
│           └── 📂 services/               Serviços de API
│               └── api-client.js          Cliente HTTP genérico
│
├── 📂 backend/                            Backend Python
│   │
│   └── 📂 python/
│       ├── main.py                        🚀 Servidor HTTP principal
│       ├── requirements.txt               Dependências (vazio, sem deps)
│       ├── .env.example                   Vars de ambiente
│       │
│       ├── 📂 app/
│       │   ├── __init__.py
│       │   ├── config.py                  Leitura de env vars
│       │   ├── routes.py                  🔀 Roteador de requisições
│       │   ├── database.py                📦 Persistência JSON
│       │   ├── http_utils.py              🔧 Funções HTTP (cookies, headers)
│       │   ├── validation.py              ✅ Validação de dados
│       │   ├── static_server.py           📁 Servidor de arquivos estáticos
│       │   │
│       │   └── 📂 services/               💼 Lógica de negócio
│       │       ├── __init__.py
│       │       ├── auth.py                🔐 Autenticação & Sessões
│       │       ├── appointments.py        📅 CRUD Agendamentos
│       │       ├── assistant.py           🤖 Orquestrador IA
│       │       ├── gemini.py              🎨 Google Gemini API
│       │       ├── whatsapp.py            💬 WhatsApp Cloud API
│       │       └── fallback_assistant.py  📝 Assistente fallback
│       │
│       └── 📂 data/                       💾 Banco de dados (JSON)
│           ├── appointments.json          Agendamentos
│           └── sessions.json              Sessões (opcional)
│
├── 📂 docs/                               📚 Documentação
│   ├── README_NOVO.md                     ⭐ Guia completo
│   ├── ARQUITETURA_DETALHADA.md           🏗️ Detalhes técnicos
│   ├── API.md                             🔌 Referência de API
│   ├── SETUP.md                           ⚙️ Guia de instalação
│   ├── STRUCTURE.md                       📂 Estrutura de pastas
│   ├── DEPLOYMENT.md                      🚀 Deploy em produção
│   │
│   └── 📂 previews/                       📸 Screenshots
│       ├── landing-page.png
│       ├── admin-panel.png
│       └── chat-widget.png
│
└── 📂 scripts/                            🔧 Scripts auxiliares
    ├── setup.ps1                          Setup para Windows
    └── setup.sh                           Setup para Mac/Linux
```

---

## 📊 Detalhamento por Tipo de Arquivo

### 1. Arquivos HTML

| Arquivo | Propósito | Usuário |
|---------|-----------|---------|
| `frontend/index.html` | Landing page com hero, galeria, contato | Público |
| `frontend/login.html` | Página de autenticação | Admin |
| `frontend/admin.html` | Painel de controle | Admin |

**Conteúdo típico:**
- Estrutura semântica (header, nav, main, footer)
- Integração com CSS e Scripts (modules ES6)
- Formulários com validação
- Acessibilidade (ARIA labels, semantic HTML5)

### 2. Arquivos CSS

| Arquivo | Linhas | Conteúdo |
|---------|--------|----------|
| `assets/styles/main.css` | ~1500 | Variáveis, layout base, componentes |
| `assets/styles/login.css` | ~400 | Formulário login, modal |
| `assets/styles/admin.css` | ~400 | Dashboard, tabelas, cards |

**Recursos:**
- CSS Custom Properties (--brand, --accent, etc)
- Flexbox & Grid
- Media queries responsivas
- Animações suaves
- Dark mode para chat

### 3. Arquivos JavaScript

#### Frontend

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `app.js` | ~10 | Bootstrap da aplicação |
| `auth-client.js` | ~80 | API de autenticação |
| `login.js` | ~80 | Lógica do formulário |
| `admin-protected.js` | ~150 | Lógica do painel |
| `modules/chat-widget.js` | ~200 | Widget de chat |
| `modules/contact-form.js` | ~150 | Formulário de contato |
| `modules/gallery-carousel.js` | ~200 | Carrossel de imagens |
| `services/api-client.js` | ~50 | Cliente HTTP |

**Padrões:**
- ES6 Modules (`import`/`export`)
- Vanilla JS (sem framework)
- Event-driven
- Async/await para API calls
- Sem dependências externas

#### Backend Python

| Arquivo | Linhas | Propósito |
|---------|--------|-----------|
| `main.py` | ~40 | Servidor HTTP |
| `config.py` | ~50 | Leitura de env |
| `routes.py` | ~150 | Roteamento |
| `database.py` | ~100 | Persistência |
| `http_utils.py` | ~100 | Helpers HTTP |
| `validation.py` | ~150 | Validações |
| `auth.py` | ~150 | Autenticação |
| `appointments.py` | ~100 | Agendamentos |
| `assistant.py` | ~100 | Orquestração IA |
| `gemini.py` | ~80 | API Gemini |
| `whatsapp.py` | ~120 | API WhatsApp |

**Padrões:**
- Python 3.8+
- Type hints parciais
- Funções puras onde possível
- Error handling explícito

### 4. Arquivos de Configuração

| Arquivo | Conteúdo |
|---------|----------|
| `.env.example` | Template de variáveis |
| `requirements.txt` | Dependências Python (vazio) |
| `.gitignore` | Arquivos a ignorar |
| `package.json` | (Herança Node.js, não usado) |

---

## 🔄 Fluxos de Dados

### Fluxo 1: Novo Agendamento

```
frontend/assets/scripts/modules/contact-form.js
    ↓ User submete formulário
frontend/assets/scripts/services/api-client.js
    ↓ POST /api/appointments
backend/python/app/routes.py
    ↓ handle_appointments_create()
backend/python/app/services/appointments.py
    ↓ create_appointment()
backend/python/app/validation.py
    ↓ validate_appointment()
backend/python/app/database.py
    ↓ save_to_json()
backend/python/data/appointments.json
    ↓ Persist
backend/python/app/services/whatsapp.py
    ↓ send_whatsapp_message()
    ↓ HTTP POST para WhatsApp Cloud API
Cliente recebe SMS/WhatsApp
```

### Fluxo 2: Login Admin

```
frontend/login.html
    ↓ User submete credenciais
frontend/assets/scripts/login.js
    ↓ POST /api/admin/login
backend/python/app/routes.py
    ↓ handle_admin_login()
backend/python/app/services/auth.py
    ↓ login_user() → cria sessão
backend/python/app/http_utils.py
    ↓ set_session_cookie()
Response com Set-Cookie
    ↓ Browser salva cookie
frontend/login.html
    ↓ Redireciona para admin.html
frontend/admin.html
    ↓ Carrega painel
frontend/assets/scripts/admin-protected.js
    ↓ GET /api/admin/appointments (com cookie)
backend/python/app/services/auth.py
    ↓ require_auth() valida sessão
backend/python/app/routes.py
    ↓ handle_admin_appointments_list()
backend/python/data/appointments.json
    ↓ Lê agendamentos
Response JSON
    ↓ Frontend renderiza tabela
```

### Fluxo 3: Chat IA

```
frontend/index.html
    ↓ User abre chat widget
frontend/assets/scripts/modules/chat-widget.js
    ↓ User digita mensagem
frontend/assets/scripts/services/api-client.js
    ↓ POST /api/assistant/chat
backend/python/app/routes.py
    ↓ handle_assistant_chat()
backend/python/app/services/assistant.py
    ↓ run_assistant_turn()
backend/python/app/services/gemini.py
    ↓ HTTP POST para Google Gemini API
Google Gemini
    ↓ IA processa mensagem
Resposta IA
    ↓ Backend retorna JSON
frontend/assets/scripts/modules/chat-widget.js
    ↓ Renderiza resposta no chat
User vê resposta
```

---

## 🔐 Proteção de Rotas

```
❌ Não protegido (público):
├─ GET  /
├─ GET  /login.html
├─ GET  /admin.html
├─ GET  /api/health
├─ GET  /api/integrations
├─ GET  /api/appointments
├─ POST /api/appointments
├─ POST /api/assistant/chat
└─ POST /webhooks/whatsapp

🔒 Protegido (requer autenticação):
├─ POST /api/admin/login
├─ POST /api/admin/logout
├─ GET  /api/admin/status
├─ GET  /api/admin/appointments
└─ POST /api/admin/appointments/[ID]/notify
```

---

## 💾 Persistência de Dados

### Agendamentos (appointments.json)

```json
[
  {
    "id": "timestamp_ou_uuid",
    "nome": "Nome do cliente",
    "email": "email@example.com",
    "telefone": "(88) 99999-9999",
    "servico": "Tipo de serviço",
    "dataPreferencial": "YYYY-MM-DD",
    "horarioPreferencial": "HH:MM",
    "cep": "60614040",
    "logradouro": "Rua...",
    "bairro": "Bairro...",
    "localidade": "Cidade, UF",
    "created_at": "2026-04-18T10:30:00",
    "origemAgendamento": "site_form|whatsapp|webhook",
    "status": "pendente|confirmado|cancelado"
  }
]
```

### Sessões (em memória)

```python
_sessions = {
    "session_id_xxx": {
        "username": "admin",
        "timestamp": 1713447600.5,
        "token": "token_abc123"
    }
}
```

---

## 📦 Dependências

### Frontend
- ❌ Nenhuma! (Vanilla JS puro)
- ✅ Navegador moderno (ES6 modules)

### Backend Python
- ❌ Nenhuma dependência externa!
- ✅ `http.server` (built-in)
- ✅ `json` (built-in)
- ✅ `urllib` (built-in)
- ✅ `secrets` (built-in Python 3.6+)

**Nota:** Gemini e WhatsApp usam `urllib` nativa (HTTP requests sem requests lib)

---

## 🔌 Integrações Externas

### Google Gemini API

```
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}
Método: POST
Payload: JSON com mensagens
Response: JSON com conteúdo gerado
```

### WhatsApp Cloud API

```
Endpoint: https://graph.instagram.com/v23.0/{phone_number_id}/messages
Método: POST
Auth: Bearer token
Payload: JSON com mensagem/destinatário
Response: JSON com confirmação de envio
```

---

## 📈 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Arquivos HTML | 3 |
| Arquivos CSS | 3 |
| Arquivos JS (Frontend) | 8 |
| Arquivos PY (Backend) | 12 |
| Linhas de código total | ~3500 |
| Dependências externas | 0 |
| Módulos Python built-in | 10+ |
| Integrations | 2 (Gemini, WhatsApp) |

---

## 🔄 Processo de Development

### Adicionar Nova Feature

1. **Decidir local**: Frontend ou Backend?
2. **Frontend**:
   - Editar `frontend/assets/scripts/` ou `frontend/*.html`
   - Adicionar CSS em `assets/styles/`
   - Testar em navegador

3. **Backend**:
   - Criar função em `app/services/`
   - Expor rota em `app/routes.py`
   - Testar com curl

4. **Conectar**:
   - Adicionar fetch em `frontend/assets/scripts/services/`
   - Invocar de componente

### Adicionar Nova Rota

1. Em `app/routes.py`:
```python
if pathname == "/api/minha-rota" and handler.command == "POST":
    handle_minha_rota(handler)
    return

def handle_minha_rota(handler):
    payload = read_json_body(handler)
    # ... processar
    send_json(handler, 200, resultado)
```

2. Em `frontend/assets/scripts/services/api-client.js`:
```javascript
export async function mihaRota(data) {
    return fetch('/api/minha-rota', { ... });
}
```

3. Em componente:
```javascript
const response = await mihaRota(data);
```

---

## 📚 Documentação Relacionada

- [README_NOVO.md](README_NOVO.md) - Guia completo principal
- [ARQUITETURA_DETALHADA.md](ARQUITETURA_DETALHADA.md) - Fluxos técnicos
- [API.md](API.md) - Referência de endpoints
- [SETUP.md](SETUP.md) - Como instalar e configurar
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy em produção

---

## 🎯 Quick Links

- **Servidor**: `http://localhost:3000`
- **Landing**: `http://localhost:3000/`
- **Admin**: `http://localhost:3000/admin.html`
- **Health**: `http://localhost:3000/api/health`
- **API**: `http://localhost:3000/api/`

---

**Última atualização**: 18 de Abril de 2026

**Versão**: 2.0.0 (Python Backend)

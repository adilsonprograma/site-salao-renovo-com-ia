# 🎨 Renovo Cabeleireiros - Plataforma Completa com IA

Plataforma web moderna para um salão de beleza com agendamento assistido por IA, integração com WhatsApp e painel administrativo protegido.

**Status:** ✅ Funcional | **Versão:** 2.0.0 (Python Backend)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [API Reference](#api-reference)
- [Autenticação](#autenticação)
- [Desenvolvimento](#desenvolvimento)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

**Renovo Cabeleireiros** é uma plataforma web inteligente para gerenciar um atelier de beleza com:

- 🌐 **Landing page responsiva** com galeria de fotos
- 🤖 **Assistente ColorIA** (powered by Google Gemini)
- 📅 **Sistema de agendamentos** com WhatsApp
- 👨‍💼 **Painel administrativo** protegido por senha
- 📊 **Dashboard** para visualizar agendamentos
- 🔐 **Autenticação segura** com cookies HTTP

---

## ✨ Características

### Frontend
- ✅ Design elegante e responsivo (mobile-first)
- ✅ Carrossel de fotos interativo
- ✅ Chat widget com ColorIA
- ✅ Formulário de agendamento
- ✅ Integração WhatsApp
- ✅ Painel administrativo protegido
- ✅ Dark mode em chat

### Backend (Python)
- ✅ HTTP Server nativo (sem dependências externas)
- ✅ Autenticação com cookies HttpOnly
- ✅ Gerenciamento de agendamentos
- ✅ Integração Gemini AI
- ✅ Integração WhatsApp Cloud API
- ✅ Banco de dados JSON simples
- ✅ Proteção CORS e segurança

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Frontend (JavaScript)            │
│  ├─ Landing Page (index.html)           │
│  ├─ Login (login.html)                  │
│  ├─ Admin (admin.html)                  │
│  └─ Assets (styles, scripts)            │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/HTTPS
               │ REST API
               ▼
┌─────────────────────────────────────────┐
│      Backend (Python HTTP Server)        │
│  ├─ API Routes                          │
│  ├─ Auth Service (sessões)              │
│  ├─ Appointments (agendamentos)         │
│  ├─ Assistant (Gemini AI)               │
│  ├─ WhatsApp Integration                │
│  └─ Database (JSON)                     │
└──────────────┬──────────────────────────┘
               │
               ├─ Google Gemini API
               ├─ WhatsApp Cloud API
               └─ Local JSON Database
```

---

## 📁 Estrutura do Projeto

```
projeto-salao-com-ia/
│
├── README.md                          # Este arquivo
├── .env.example                       # Variáveis de ambiente
├── .gitignore
│
├── 📂 frontend/                       # Frontend JavaScript
│   ├── index.html                     # Landing page
│   ├── login.html                     # Página de login
│   ├── admin.html                     # Painel administrativo
│   │
│   └── 📂 assets/
│       ├── 📂 images/                 # Fotos do salão
│       │   └── *.jpg, *.png
│       │
│       ├── 📂 styles/                 # Estilos CSS
│       │   ├── main.css               # Estilos globais
│       │   ├── login.css              # Estilos do login
│       │   └── admin.css              # Estilos do admin
│       │
│       └── 📂 scripts/                # Scripts JavaScript
│           ├── app.js                 # Inicialização
│           ├── auth-client.js         # Cliente de autenticação
│           ├── login.js               # Lógica do login
│           ├── admin-protected.js     # Lógica do admin
│           │
│           ├── 📂 modules/            # Módulos reutilizáveis
│           │   ├── chat-widget.js
│           │   ├── contact-form.js
│           │   ├── gallery-carousel.js
│           │   └── hero-section.js
│           │
│           └── 📂 services/           # Serviços de API
│               └── api-client.js      # Cliente HTTP
│
├── 📂 backend/                        # Backend Python
│   ├── 📂 python/
│   │   ├── main.py                    # Servidor principal
│   │   ├── requirements.txt           # Dependências
│   │   ├── .env.example               # Variáveis de ambiente
│   │   │
│   │   └── 📂 app/
│   │       ├── __init__.py
│   │       ├── config.py              # Configurações
│   │       ├── routes.py              # Rotas da API
│   │       ├── database.py            # Banco de dados
│   │       ├── http_utils.py          # Utilitários HTTP
│   │       ├── validation.py          # Validação de dados
│   │       ├── static_server.py       # Servidor estático
│   │       │
│   │       └── 📂 services/
│   │           ├── __init__.py
│   │           ├── auth.py            # Autenticação
│   │           ├── appointments.py    # Agendamentos
│   │           ├── assistant.py       # Assistente IA
│   │           ├── gemini.py          # Integração Gemini
│   │           ├── whatsapp.py        # Integração WhatsApp
│   │           └── fallback_assistant.py
│   │
│   └── 📂 data/                       # Dados (gerado em runtime)
│       ├── appointments.json
│       └── sessions.json
│
├── 📂 docs/                           # Documentação
│   ├── ARQUITETURA.md                 # Detalhes arquitetura
│   ├── API.md                         # Referência de API
│   ├── SETUP.md                       # Guia de instalação
│   ├── DEPLOYMENT.md                  # Deploy em produção
│   └── previews/                      # Screenshots
│
└── 📂 scripts/                        # Scripts auxiliares
    └── setup.ps1                      # Setup Windows
```

---

## 🚀 Instalação

### Pré-requisitos

- **Python 3.8+** (para backend)
- **Node.js 14+** (opcional, só para referência)
- **Git**

### Setup Rápido

#### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-usuario/projeto-salao-com-ia.git
cd projeto-salao-com-ia
```

#### 2️⃣ Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
# GEMINI_API_KEY=seu_api_key_aqui
# WHATSAPP_ACCESS_TOKEN=seu_token_aqui
# PORT=3000
```

#### 3️⃣ Iniciar o servidor Python

```bash
cd backend/python
python main.py
```

Servidor iniciará em: **http://localhost:3000**

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz ou em `backend/python/`:

```env
# Servidor
PORT=3000

# Gemini AI
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta

# WhatsApp
WHATSAPP_ACCESS_TOKEN=sua_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
WHATSAPP_VERIFY_TOKEN=seu_verify_token_aqui
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_NOTIFY_TO=seu_numero_aqui

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Chave Gemini AI

1. Ir para [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Criar nova chave de API
3. Copiar para `.env` como `GEMINI_API_KEY`

### Integração WhatsApp

1. Criar conta no [Meta for Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business Account
3. Obter Access Token e Phone Number ID
4. Adicionar ao `.env`

---

## 📱 Como Usar

### Para Usuários

#### Landing Page
1. Acesse **http://localhost:3000**
2. Navegue pelas seções:
   - **Início**: Apresentação do salão
   - **Galeria**: Fotos do ambiente
   - **Sobre**: Informações do negócio
   - **Horários**: Funcionamento
   - **Contato**: Formulário e info

#### ColorIA (Assistente)
1. Clique em **"Agenda & ColorIA"** ou **"Abrir ColorIA"**
2. Chat com assistente IA
3. Obtenha recomendações de cor e agendamentos

#### Agendar Serviço
1. Clique em **"Reservar horário"**
2. Preencha o formulário
3. Envie para WhatsApp automaticamente

### Para Administradores

#### Acesso ao Painel Admin
1. Clique em **"Admin"** no header
2. Faça login com:
   - **Usuário**: `admin`
   - **Senha**: `admin123` (trocar em produção!)
3. Acesso aos agendamentos

#### Funcionalidades Admin
- 📊 Ver agendamentos recentes
- 📤 Enviar confirmações via WhatsApp
- 🔧 Verificar status das integrações
- 👤 Gerenciar sessões

---

## 🔌 API Reference

### Base URL
```
http://localhost:3000/api
```

### Rotas Públicas

#### GET `/health`
Verificar status do servidor
```bash
curl http://localhost:3000/api/health
```

#### GET `/integrations`
Verificar status das integrações
```bash
curl http://localhost:3000/api/integrations
```

#### GET `/appointments?limit=25`
Listar agendamentos recentes (público)
```bash
curl http://localhost:3000/api/appointments?limit=25
```

#### POST `/appointments`
Criar novo agendamento
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@example.com",
    "telefone": "(88) 99999-1111",
    "servico": "Corte + Coloração",
    "origemAgendamento": "site_form"
  }'
```

#### POST `/assistant/chat`
Chat com ColorIA
```bash
curl -X POST http://localhost:3000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual cor fica bem em cabelo castanho?",
    "sessionId": "user-123"
  }'
```

### Rotas Protegidas (Requer Autenticação)

#### POST `/admin/login`
Fazer login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

#### POST `/admin/logout`
Fazer logout
```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt
```

#### GET `/admin/appointments?limit=25`
Listar agendamentos (protegido)
```bash
curl http://localhost:3000/api/admin/appointments?limit=25 -b cookies.txt
```

#### GET `/admin/status`
Verificar status da sessão
```bash
curl http://localhost:3000/api/admin/status -b cookies.txt
```

### Webhooks

#### POST `/webhooks/whatsapp`
Receber mensagens do WhatsApp
```
Configurar em: Meta for Developers > WhatsApp > Webhook
```

---

## 🔐 Autenticação

### Como funciona

1. **Login**: POST `/api/admin/login` com credenciais
2. **Resposta**: Recebe `Set-Cookie` com session ID
3. **Requisições**: Cookie enviado automaticamente
4. **Proteção**: Middleware valida session antes de permitir acesso
5. **Timeout**: Sessão expira após 2 horas de inatividade

### Cookies

- **Nome**: `admin_session_id`
- **Tipo**: HttpOnly (não acessível via JS)
- **Proteção**: SameSite=Strict (CSRF protection)
- **Duração**: 2 horas
- **Transmissão**: HTTPS em produção

### Credenciais Padrão

```
Usuário: admin
Senha: admin123
```

⚠️ **Importante**: Mudar em produção!

---

## 👨‍💻 Desenvolvimento

### Stack Tecnológico

**Frontend:**
- HTML5 semântico
- CSS3 (Grid, Flexbox, animations)
- Vanilla JavaScript (ES6+)
- Sem dependências externas

**Backend:**
- Python 3.8+
- `http.server` nativo
- Google Gemini API
- WhatsApp Cloud API

**Database:**
- JSON (desenvolvimento)
- PostgreSQL recomendado para produção

### Estrutura de Arquivos - Melhor Entender

**Backend Python** (`backend/python/app/`):

| Arquivo | Responsabilidade |
|---------|-----------------|
| `config.py` | Ler variáveis de ambiente |
| `routes.py` | Definir rotas HTTP |
| `database.py` | Ler/escrever dados JSON |
| `http_utils.py` | Funções HTTP (cookies, headers) |
| `validation.py` | Validar entrada de dados |
| `static_server.py` | Servir arquivos estáticos |
| `services/auth.py` | Autenticação e sessões |
| `services/appointments.py` | CRUD de agendamentos |
| `services/assistant.py` | ColorIA (orquestração) |
| `services/gemini.py` | Integração Google Gemini |
| `services/whatsapp.py` | Integração WhatsApp Cloud |

### Fluxo de uma Requisição

```
1. Cliente (JavaScript) faz requisição
        ↓
2. HTTP Server recebe em main.py
        ↓
3. route_request() em routes.py decide o caminho
        ↓
4. Chama handler específico (ex: handle_appointments_create)
        ↓
5. Handler chama serviço (ex: create_appointment)
        ↓
6. Serviço processa e retorna resultado
        ↓
7. Handler envia resposta JSON ao cliente
```

### Adicionar Nova Rota

1. Criar função handler em `routes.py`:
```python
def handle_nova_rota(handler):
    payload = read_json_body(handler)
    # processar...
    send_json(handler, 200, {"resultado": "ok"})
```

2. Adicionar em `route_request()`:
```python
if pathname == "/api/nova-rota" and handler.command == "POST":
    handle_nova_rota(handler)
    return
```

### Teste Local

```bash
# Iniciar servidor
python main.py

# Em outro terminal, testar
curl http://localhost:3000/api/health

# Ou abrir navegador
http://localhost:3000
```

---

## 🌐 Deployment

### Opção 1: Heroku (Recomendado para começar)

1. Criar conta em [Heroku](https://www.heroku.com)
2. Instalar Heroku CLI
3. Deploy:
```bash
heroku create seu-app-name
heroku config:set GEMINI_API_KEY=seu_key
heroku config:set WHATSAPP_ACCESS_TOKEN=seu_token
git push heroku main
```

### Opção 2: VPS (DigitalOcean, AWS, etc.)

1. Alugar VPS com Ubuntu
2. Instalar Python 3.8+
3. Configurar variáveis de ambiente
4. Usar Gunicorn + Nginx:

```bash
# Instalar
pip install gunicorn
sudo apt install nginx

# Rodar
gunicorn -w 4 -b 0.0.0.0:3000 backend.python.main:app

# Configurar Nginx como proxy reverso
```

### Opção 3: Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/python .
CMD ["python", "main.py"]
```

```bash
docker build -t salao-com-ia .
docker run -p 3000:3000 -e GEMINI_API_KEY=xxx salao-com-ia
```

### Checklist de Produção

- [ ] Mudar credenciais admin
- [ ] Configurar HTTPS (SSL/TLS)
- [ ] Adicionar rate limiting
- [ ] Configurar CORS corretamente
- [ ] Implementar logging
- [ ] Usar banco de dados real (PostgreSQL)
- [ ] Backup automático de dados
- [ ] Monitoramento (Sentry, NewRelic)
- [ ] CDN para arquivos estáticos
- [ ] Cache de agendamentos

---

## 🐛 Troubleshooting

### Problema: "Address already in use"

**Solução**: Mudar porta em `.env`
```env
PORT=3001
```

### Problema: Gemini API retorna erro

**Checklist**:
1. Verificar se `GEMINI_API_KEY` está correto
2. Verificar limite de requisições da API
3. Checar internet
4. Ver logs no console

### Problema: WhatsApp não envia mensagens

**Checklist**:
1. Token válido? `WHATSAPP_ACCESS_TOKEN`
2. Phone ID correto? `WHATSAPP_PHONE_NUMBER_ID`
3. Webhook verificado?
4. Número está na lista aprovada?

### Problema: Cookies não funcionam

**Verificar**:
1. `credentials: 'include'` no fetch
2. `SameSite=Strict` no cookie
3. HTTPS em produção (não localhost)
4. Domain correto

### Problema: Admin não carrega agendamentos

**Soluções**:
1. Verificar autenticação: GET `/api/admin/status`
2. Ver console do navegador (F12)
3. Checar arquivo de dados: `backend/python/data/appointments.json`

### Modo Debug

Adicionar em `main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 📚 Documentação Adicional

- [API Completa](docs/API.md)
- [Arquitetura Detalhada](docs/ARQUITETURA.md)
- [Setup Avançado](docs/SETUP.md)
- [Deployment em Produção](docs/DEPLOYMENT.md)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE.

---

## 📞 Suporte

- 📧 Email: seu-email@example.com
- 💬 Discord/Slack: link
- 🐛 Issues: GitHub Issues

---

## 🎯 Roadmap

- [ ] Dashboard com gráficos (Chart.js)
- [ ] 2FA para admin
- [ ] Sistema de notificações por email
- [ ] App mobile (React Native)
- [ ] Integração Google Calendar
- [ ] Relatórios em PDF
- [ ] Sincronização com Instagram
- [ ] Analytics avançado

---

## 👏 Agradecimentos

- Google Gemini API
- Meta WhatsApp Cloud API
- Comunidade open source

---

**Criado com ❤️ para Renovo Cabeleireiros | 2026**

**Última atualização**: 18 de Abril de 2026

# ⚙️ Guia de Setup e Configuração - Renovo Cabeleireiros

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Local](#instalação-local)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Integração Gemini](#integração-gemini)
5. [Integração WhatsApp](#integração-whatsapp)
6. [Primeira Execução](#primeira-execução)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Pré-requisitos

### Sistema Operacional
- Windows, macOS ou Linux
- (Python roda em qualquer SO)

### Software Necessário
- **Python 3.8+**
- **Git**
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Conta Google** (para Gemini API)
- **Conta Meta/Facebook** (para WhatsApp)

### Hardware Mínimo
- 512 MB RAM
- 100 MB espaço em disco
- Conexão de internet

---

## 💻 Instalação Local

### 1. Verificar Python

```bash
# Windows (PowerShell ou CMD)
python --version

# Mac/Linux
python3 --version
```

**Esperado:** `Python 3.8+`

Se não tiver:
- **Windows**: Baixar em [python.org](https://www.python.org/downloads/)
- **Mac**: `brew install python3`
- **Linux**: `sudo apt install python3`

### 2. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/projeto-salao-com-ia.git
cd projeto-salao-com-ia
```

### 3. Estrutura Inicial

```
projeto-salao-com-ia/
├── README_NOVO.md (este é o principal agora)
├── .env.example
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   └── assets/
├── backend/
│   └── python/
│       ├── main.py
│       ├── requirements.txt
│       └── app/
└── docs/
```

---

## 🔧 Configuração do Projeto

### 1. Criar Arquivo .env

```bash
# Na raiz do projeto
cp .env.example .env
```

Abra `.env` em seu editor favorito.

### 2. Configurar Variáveis Básicas

```env
# Mínimo necessário
PORT=3000

# Deixar em branco por enquanto
GEMINI_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

### 3. Testes Iniciais (Sem Integrações)

O projeto pode rodar sem Gemini e WhatsApp, mas com funcionalidades limitadas:
- ✅ Landing page
- ✅ Formulário de agendamento
- ✅ Admin (sem integração)
- ❌ Chat com IA
- ❌ WhatsApp

---

## 🤖 Integração Gemini

### Passo 1: Obter Chave Gemini API

1. Ir para [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Fazer login com conta Google
3. Clicar em **"Create API key"**
4. Copiar a chave gerada

### Passo 2: Configurar .env

Adicione em `.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1beta
```

### Passo 3: Testar Integração

```bash
cd backend/python
python -c "
from app.services.gemini import send_gemini_request
result = send_gemini_request([{'role': 'user', 'parts': [{'text': 'Olá!'}]}], 'gemini-2.5-flash')
print('✓ Gemini funcionando!' if result else '✗ Erro na API')
"
```

**Esperado:** `✓ Gemini funcionando!`

---

## 💬 Integração WhatsApp

### Passo 1: Criar App no Meta

1. Ir para [Meta for Developers](https://developers.facebook.com/)
2. Fazer login / criar conta
3. Ir para **"Apps"** → **"Create App"**
4. Escolher **"Business"** como tipo
5. Nome: "Renovo Cabeleireiros"
6. Preencher dados e criar

### Passo 2: Configurar WhatsApp Cloud API

1. Abrir app criado
2. Buscar por **"WhatsApp"** na lista de produtos
3. Clicar em **"Add"**
4. Aguardar configuração

### Passo 3: Obter Credenciais

No painel do WhatsApp:

1. **Access Token**:
   - Ir para **Settings** → **API credentials**
   - Gerar novo token
   - Copiar

2. **Phone Number ID**:
   - Ir para **Phone numbers**
   - Selecionar seu número
   - Copiar "Phone Number ID"

3. **Verify Token** (seu próprio):
   - Use qualquer string: `meu_token_super_secreto_123`

### Passo 4: Configurar .env

```env
WHATSAPP_ACCESS_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id_aqui
WHATSAPP_VERIFY_TOKEN=seu_verify_token_unico_aqui
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_NOTIFY_TO=(88)9932949360
```

### Passo 5: Configurar Webhook

1. Meta for Developers → WhatsApp → Settings
2. **Webhook URL**:
   ```
   https://seu-dominio.com/webhooks/whatsapp
   ```
   (em desenvolvimento, pode ser ngrok)

3. **Verify Token**: 
   ```
   seu_verify_token_unico_aqui
   ```

4. **Subscribe to this webhook**: `messages`

5. Clicar **"Save"**

### Passo 6: Testar WhatsApp

Para testar localmente com webhook:

```bash
# Instalar ngrok (https://ngrok.com)
ngrok http 3000

# Usar URL gerada no webhook do Meta
# Ex: https://abc123.ngrok.io/webhooks/whatsapp
```

---

## 🚀 Primeira Execução

### Iniciar o Servidor

```bash
# Navegar para backend Python
cd backend/python

# Executar
python main.py
```

**Esperado:**
```
Servidor iniciando na porta 3000...
Acesse: http://localhost:3000
```

### Acessar no Navegador

1. Abrir navegador
2. Digitar: `http://localhost:3000`
3. Você deve ver a landing page

### Testar Funcionalidades

#### Landing Page
- [ ] Galeria de fotos carrega
- [ ] Chat widget abre (sem respostas se sem Gemini)
- [ ] Formulário de agendamento renderiza

#### Admin
1. Clicar em **"Admin"**
2. Fazer login: `admin` / `admin123`
3. Ver painel

#### Criar Agendamento
1. Preencher formulário
2. Submeter
3. Ver confirmação
4. Checar em Admin

---

## 📝 Estrutura de Pastas - Guia Rápido

| Pasta | Conteúdo | Editar? |
|-------|----------|---------|
| `frontend/` | HTML, CSS, JS | ✅ Sim |
| `backend/python/` | Servidor Python | ✅ Sim |
| `backend/python/app/services/` | Lógica de negócios | ✅ Sim |
| `docs/` | Documentação | ✅ Sim |
| `backend/python/data/` | Banco de dados JSON | ⚠️ Gerado |

---

## 🔍 Verificação de Saúde

### Testar API

```bash
# Health check
curl http://localhost:3000/api/health

# Integrations status
curl http://localhost:3000/api/integrations

# Listar agendamentos
curl http://localhost:3000/api/appointments?limit=5
```

---

## 🐛 Troubleshooting

### Problema 1: "Address already in use"

**Solução:**
```bash
# Mudar porta em .env
PORT=3001

# Ou matar processo na porta 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Problema 2: "Module not found"

```
ModuleNotFoundError: No module named 'app'
```

**Solução:**
```bash
# Certifique-se de estar em backend/python/
cd backend/python
python main.py
```

### Problema 3: "Gemini API key not valid"

```
AuthenticationError: Could not authenticate request
```

**Solução:**
1. Verificar chave em `.env` (sem espaços)
2. Testar em [AI Studio](https://aistudio.google.com)
3. Gerar nova chave se necessário

### Problema 4: Cookies não funcionam

**Causa:** Navegador privado/incógnito

**Solução:** Usar navegação normal

---

## 📚 Próximos Passos

1. **Desenvolvimento Local**
   - Editar `frontend/index.html` e `backend/python/app/services/`
   - Testar em `http://localhost:3000`

2. **Deploy**
   - Ver [docs/DEPLOYMENT.md](DEPLOYMENT.md)

3. **Produção**
   - Mudar credenciais
   - Configurar HTTPS
   - Implementar banco de dados real

---

## 💡 Dicas

- 🔄 Servidor reinicia automaticamente? NÃO. Faça manualmente se editar Python.
- 🔒 `.env` não versionar (adicionar em `.gitignore`)
- 📱 Testar responsivo com `F12` → Device Toggle
- 🐛 Ver logs em tempo real no console do servidor

---

**Última atualização**: 18 de Abril de 2026

**Próxima seção**: [API Reference](API.md)

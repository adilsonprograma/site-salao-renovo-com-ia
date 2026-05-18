# Sistema de Login e Admin com Backend Python - Renovo Cabeleireiros

## 📋 O que foi migrado

Sistema de autenticação **totalmente funcional** agora com backend Python usando `http.server` (sem dependências externas).

### Arquivos criados/atualizados

**Backend Python:**
- `app/services/auth.py` - Sistema de autenticação (novo)
- `app/routes.py` - Rotas de login/logout/admin protegidas (atualizado)
- `app/http_utils.py` - Funções para lidar com cookies (atualizado)

**Frontend JavaScript:**
- `assets/scripts/auth-client.js` - Cliente que comunica com a API Python (novo)
- `assets/scripts/login.js` - Atualizado para usar API Python
- `assets/scripts/admin-protected.js` - Atualizado para usar API Python

## 🔐 Como funciona

### Fluxo de autenticação

```
User faz login (login.html)
    ↓
POST /api/admin/login (credenciais)
    ↓
Backend Python valida em auth.py
    ↓
Se OK: Cria sessão em memória + Define cookie HTTP
    ↓
Frontend redireciona para admin.html
    ↓
Cada requisição envia cookie automaticamente (credentials: include)
    ↓
Backend verifica cookie com require_auth()
    ↓
Se válido: Retorna dados protegidos
Se inválido: Redireciona para login
```

## 🚀 Usando o backend Python

### 1. Iniciar o servidor

```bash
cd python-version
python main.py
```

O servidor inicia em `http://localhost:3000`

### 2. Credenciais padrão

```
Usuário: admin
Senha: admin123
```

### 3. Endpoints da API

#### Login
```
POST /api/admin/login
Body: { "username": "admin", "password": "admin123" }
Response: { "message": "Login realizado com sucesso!" }
Headers: Set-Cookie: admin_session_id=...
```

#### Logout
```
POST /api/admin/logout
Headers: Cookie: admin_session_id=...
Response: { "message": "Logout realizado com sucesso" }
Headers: Set-Cookie: ... (limpa cookie)
```

#### Ver agendamentos (protegido)
```
GET /api/admin/appointments?limit=25
Headers: Cookie: admin_session_id=...
Response: { "appointments": [...], "user": { "username": "admin" } }
```

#### Verificar status (protegido)
```
GET /api/admin/status
Headers: Cookie: admin_session_id=...
Response: { "authenticated": true, "user": { "username": "admin" } }
```

## 🔒 Segurança implementada

### Backend (Python)

✅ **Validação de credenciais**
- Comparação direta (melhorar com hash)

✅ **Sessões com timeout**
- 2 horas de inatividade
- Automaticamente limpas na verificação

✅ **Cookies HTTP**
- `HttpOnly` - não acessível via JavaScript
- `SameSite=Strict` - proteção CSRF
- `Secure` - (adicionar em produção com HTTPS)

✅ **Proteção de rotas**
- Middleware `require_auth()` valida todo acesso
- Session ID seguro com `secrets.token_urlsafe()`

### Frontend (JavaScript)

✅ **Credenciais: include**
- Envia cookies automaticamente nas requisições

✅ **Redirecionamento automático**
- 401 Unauthorized redireciona para login

✅ **Proteção de página**
- `protectPage()` bloqueia acesso não autorizado

## 📝 Estrutura de dados

### Sessão em memória (Python)

```python
_sessions = {
    "session_id_123": {
        "username": "admin",
        "timestamp": 1713447600.5,
        "token": "token_abc123",
        "session_id": "session_id_123"
    }
}
```

### Cookie (HTTP)

```
admin_session_id=session_id_123; 
Path=/; 
HttpOnly; 
SameSite=Strict; 
Max-Age=7200
```

## 🔧 Melhorias para produção

### Backend Python

- [ ] Usar Hash de senha (bcrypt)
- [ ] Banco de dados para armazenar usuários
- [ ] Banco de dados para armazenar sessões
- [ ] HTTPS obrigatório
- [ ] Rate limiting para login
- [ ] Implementar 2FA
- [ ] Logging e auditoria
- [ ] JWT com refresh tokens

### Frontend

- [ ] Criptografia de dados sensíveis
- [ ] Session timeout com aviso
- [ ] Proteção contra XSS
- [ ] Proteção contra CSRF (usar tokens)

## 📁 Arquivo config.py

O `config.py` já integra com as variáveis de ambiente:

```python
config = {
    "port": 3000,  # Alterar com PORT env var
    "gemini": {...},
    "whatsapp": {...}
}
```

## 🧪 Testando a API com curl

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# Ver agendamentos (com cookie)
curl -X GET "http://localhost:3000/api/admin/appointments?limit=10" \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt

# Verificar sessão
curl -X GET http://localhost:3000/api/admin/status \
  -b cookies.txt
```

## ⚠️ Diferenças com a versão JavaScript anterior

| Aspecto | JavaScript | Python |
|---------|-----------|--------|
| Armazenamento | localStorage | Sessão em memória do servidor |
| Cookies | Não | Sim (HttpOnly) |
| Acesso offline | Sim (persiste) | Não (servidor necessário) |
| Segurança | Básica | Melhorada |
| Persistência | Entre abas | Perde ao reiniciar servidor |
| Compartilhamento | Entre abas | Entre usuários |

## 🔄 Migrando dados

Se quiser persistir sessões em banco de dados:

1. Criar tabela `sessions`
2. Modificar `app/services/auth.py` para usar banco de dados
3. Adicionar limpeza automática de sessões expiradas

## 📞 Suporte

Para modificações ou integração:

1. **Backend**: Revisar `app/services/auth.py` e `app/routes.py`
2. **Frontend**: Revisar `assets/scripts/auth-client.js`
3. **Cookies**: Revisar `app/http_utils.py`

## ✅ Próximos passos

1. Testar em produção com HTTPS
2. Implementar persistência em banco de dados
3. Adicionar 2FA
4. Implementar rate limiting
5. Adicionar logging e auditoria

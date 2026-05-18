# Sistema de Login e Painel Admin - Renovo Cabeleireiros

## 📋 O que foi criado

Um sistema completo de autenticação e painel administrativo para acessar agendamentos e integracoes.

### Arquivos criados/modificados:

1. **index.html** - Adicionado botão "Admin" no header
2. **login.html** - Página de login com design elegante
3. **admin.html** - Painel administrativo protegido
4. **assets/scripts/auth.js** - Sistema de autenticação com localStorage
5. **assets/scripts/login.js** - Lógica do formulário de login
6. **assets/scripts/admin-protected.js** - Proteção e lógica do admin
7. **assets/styles/login.css** - Estilos da página de login
8. **assets/styles/admin.css** - Estilos do painel admin

## 🔐 Credenciais de Acesso

**Usuário:** `admin`  
**Senha:** `admin123`

### ⚠️ Importante para Produção

Essas credenciais são apenas para demonstração. Em um ambiente de produção, você DEVE:

- Implementar autenticação real com backend seguro
- Usar tokens JWT em vez de localStorage simples
- Adicionar hash de senha e validações de segurança
- Implementar HTTPS obrigatório
- Adicionar rate limiting para proteção contra força bruta

## 🚀 Como usar

### 1. Acessar o Login

1. Clique no botão **"Admin"** no header do site (index.html)
2. Você será redirecionado para a página de login (`login.html`)

### 2. Fazer Login

1. Digite as credenciais de acesso:
   - Usuário: `admin`
   - Senha: `admin123`
2. Clique em "Entrar"
3. Você será redirecionado para o painel administrativo

### 3. Usar o Painel Admin

No painel (`admin.html`) você pode:

- **Visualizar agendamentos**: Lista todos os agendamentos recentes
- **Filtrar resultados**: Alterar a quantidade de agendamentos exibidos (10, 25, 50, 100)
- **Enviar para WhatsApp**: Clique no botão "WhatsApp" para enviar um agendamento
- **Ver status das integracoes**: Verifique a saúde das APIs e serviços
- **Fazer logout**: Clique no botão "Sair" para encerrar a sessão

## 🔄 Fluxo de Autenticação

```
index.html (botão Admin)
    ↓
login.html (validação de credenciais)
    ↓
auth.js (armazena sessão em localStorage)
    ↓
admin.html (verifica autenticação via protectPage())
    ↓
admin-protected.js (carrega dados e oferece funcionalidades)
```

## 📝 Detalhes Técnicos

### Sistema de Sessão

- **Armazenamento**: localStorage (browser)
- **Chave**: `admin_session`
- **Duração**: 2 horas de inatividade
- **Dados armazenados**: username, timestamp, token

### Proteção de Página

Quando um usuário tenta acessar `admin.html` sem estar autenticado:

1. A função `protectPage()` é acionada
2. Verifica se existe sessão válida em localStorage
3. Se inválida ou expirada, redireciona para `login.html`
4. Se válida, carrega o conteúdo normalmente

### Carregamento de Dados

O painel admin tenta:

1. **Primeiro**: Carregar dados da API em `/api/appointments`
2. **Se falhar**: Exibe dados de demonstração como fallback
3. **Status**: Mostra mensagem informando qual modo está em uso

## 🎨 Design

O sistema segue o design elegante do Renovo Cabeleireiros com:

- Cores da marca (verde-oliva e rosa claro)
- Tipografia Cormorant Garamond e Manrope
- Cards com backdrop blur
- Animations suaves
- Design responsivo para mobile

## 🔗 Links Úteis

- **Página inicial**: `index.html`
- **Login**: `login.html`
- **Admin**: `admin.html`
- **API de agendamentos**: `/api/appointments`

## 📱 Responsividade

O sistema é totalmente responsivo:
- Layout de login adapta para mobile
- Painel admin reorganiza-se em telas menores
- Botões e inputs têm tamanho adequado para touch

## 🐛 Troubleshooting

### Não consigo acessar o admin

1. Verifique se está usando as credenciais corretas (admin/admin123)
2. Confirme se localStorage está habilitado no navegador
3. Limpe o cache e cookies
4. Tente em uma aba anônima/privada

### A sessão expirou

1. Significa que você ficou 2 horas sem interagir com o painel
2. Faça login novamente para continuar

### Dados de demonstração aparecem

1. A API pode não estar disponível no momento
2. Verifique se o backend está rodando
3. Verifique o console do navegador (F12) para erros

## 🔒 Segurança

Melhorias sugeridas para produção:

- [ ] Implementar autenticação de dois fatores (2FA)
- [ ] Adicionar logs de acesso
- [ ] Implementar controle de papel (admin, gerente, operador)
- [ ] Criptografar dados sensíveis em transit
- [ ] Implementar session timeout com aviso
- [ ] Adicionar proteção CSRF
- [ ] Implementar rate limiting

## 📞 Suporte

Para modificações ou problemas, revise:

1. `assets/scripts/auth.js` - Sistema de autenticação
2. `assets/scripts/login.js` - Formulário de login
3. `assets/scripts/admin-protected.js` - Lógica do admin
4. `assets/styles/login.css` - Estilos de login
5. `assets/styles/admin.css` - Estilos do admin

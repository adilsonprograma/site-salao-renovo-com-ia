# Renovo Cabeleireiros & ColorIA

> Landing page moderna para o **Renovo Cabeleireiros** — salão de beleza localizado em Russas/CE. Inclui galeria interativa, formulário de agendamento, chat com assistente virtual (ColorIA) e painel administrativo.

---

## 🌐 Demo Online (GitHub Pages — Gratuito)

🔗 **[https://adilsonprograma.github.io/site-salao-renovo-com-ia/](https://adilsonprograma.github.io/site-salao-renovo-com-ia/)**

O site é **100% estático** e roda direto no GitHub Pages sem necessidade de servidor pago.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Deploy no GitHub Pages](#-deploy-no-github-pages)
- [Funcionalidades](#-funcionalidades)
- [Guia de Estilos (Dark Theme)](#-guia-de-estilos-dark-theme)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Visão Geral

O projeto é uma **single-page application (SPA)** estática que apresenta o salão Renovo Cabeleireiros com:

- **Hero section** com chamada principal, métricas e cards flutuantes animados
- **Galeria carrossel** com fotos do salão (navegação por botões e indicadores)
- **Seção sobre** com cards de serviços (cortes, coloração, tratamentos)
- **Horários** em tabela responsiva
- **Formulário de contato** com busca automática de CEP via ViaCEP
- **Chat ColorIA** — assistente virtual com fluxo de agendamento, consultoria de cor e tendências
- **Design dark theme** com glassmorphism, animações suaves e tipografia premium

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica e acessível |
| **CSS3 (Vanilla)** | Dark theme, glassmorphism, animações, responsividade |
| **JavaScript (ES Modules)** | Carrossel, chat, formulário, animações de scroll |
| **Google Fonts** | Outfit (títulos) + Inter (corpo) + Material Symbols |
| **GitHub Pages** | Deploy gratuito (arquivos estáticos) |

> **Sem frameworks, sem build tools, sem dependências de produção.** Tudo roda direto no navegador.

---

## 📁 Estrutura de Pastas

```
site-salao-renovo-com-ia/
├── index.html                    # Página principal (GitHub Pages serve daqui)
├── admin.html                    # Painel administrativo
├── README.md                     # Este arquivo
├── package.json                  # Scripts npm (dev server local)
│
├── assets/                       # Recursos estáticos
│   ├── images/                   # Fotos do salão
│   │   ├── renovo-salao.png
│   │   ├── 20260328_102912.jpg
│   │   ├── 20260328_102923.jpg
│   │   └── 20260328_102936.jpg
│   │
│   ├── scripts/                  # JavaScript modular
│   │   ├── app.js                # Entry point — inicializa todos os módulos
│   │   ├── modules/
│   │   │   ├── gallery-carousel.js   # Lógica do carrossel de imagens
│   │   │   ├── chat-widget.js        # Chat ColorIA com fluxo de menu
│   │   │   ├── contact-form.js       # Validação e envio do formulário
│   │   │   └── animations.js         # IntersectionObserver para fade-up
│   │   └── services/
│   │       └── api-client.js         # Cliente HTTP para comunicação com API
│   │
│   └── styles/
│       ├── main.css              # Estilos da landing page (dark theme)
│       ├── admin.css             # Estilos do painel admin
│       └── login.css             # Estilos da página de login
│
├── public/                       # Versão espelho (servida pelo Node server)
├── server/                       # Backend Node.js (opcional, para API)
├── server.js                     # Entry point do servidor (opcional)
├── data/                         # Dados locais (agendamentos JSON)
├── docs/                         # Documentação técnica
│   ├── API.md
│   ├── ARQUITETURA.md
│   ├── ARQUITETURA_DETALHADA.md
│   ├── CONFIGURACAO_APIS.md
│   └── SETUP.md
└── tests/                        # Testes automatizados
    └── site.test.js              # Teste Playwright (verificação de carga)
```

---

## 🚀 Como Rodar Localmente

### Opção 1: Abrir direto no navegador (mais simples)

Basta abrir o arquivo `index.html` no navegador. Tudo funciona offline exceto:
- Google Fonts (precisa de internet)
- Busca de CEP via ViaCEP API

### Opção 2: Dev server local

```bash
# Instalar dependências (apenas dev server)
npm install

# Iniciar servidor local
npm run dev
# Acesse: http://localhost:8080
```

### Opção 3: Servidor Node.js completo (com API de agendamentos)

```bash
# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# Iniciar o servidor
node server.js
# Acesse: http://localhost:3000
```

---

## 📦 Deploy no GitHub Pages

O site já está configurado para deploy automático no GitHub Pages. Os arquivos estáticos estão na raiz do repositório (`/`), que é o que o GitHub Pages serve por padrão.

### Passos para configurar (caso necessário):

1. Vá em **Settings > Pages** no seu repositório GitHub
2. Em **Source**, selecione **Deploy from a branch**
3. Selecione a branch `main` e a pasta `/ (root)`
4. Clique em **Save**
5. Aguarde alguns minutos e acesse: `https://seu-usuario.github.io/site-salao-renovo-com-ia/`

### Para atualizar o site:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

O GitHub Pages atualiza automaticamente em ~1 minuto.

---

## ✨ Funcionalidades

### 🎠 Carrossel de Imagens
- Navegação por setas e indicadores (dots)
- Transição suave com cubic-bezier
- Zoom sutil na imagem ativa
- Overlay com gradiente para legibilidade do texto

### 💬 Chat ColorIA
- Menu interativo: 1 = Agendamento, 2 = Consultoria de Cor, 3 = Tendências
- Sub-menus com opções detalhadas
- Animação de entrada suave
- Botão flutuante (FAB) sempre visível

### 📝 Formulário de Contato
- Validação client-side de campos obrigatórios
- Busca automática de endereço pelo CEP (ViaCEP API)
- Datalist com sugestões de serviço
- Feedback visual de status

### 🎨 Dark Theme com Glassmorphism
- Paleta escura com acentos verdes vibrantes
- Cards com `backdrop-filter: blur()` para efeito vidro
- Gradientes aurora animados no background
- Hover effects com elevação e sombra
- Micro-animações em botões, cards e navegação

---

## 🎨 Guia de Estilos (Dark Theme)

### Paleta de Cores

| Variável | Cor | Uso |
|---|---|---|
| `--brand` | `#c0d36e` | Cor principal (verde-lima) |
| `--brand-deep` | `#9ab04c` | Botões, hover, destaques |
| `--ink` | `#e8ece4` | Texto principal (claro) |
| `--muted` | `#a8b0a2` | Texto secundário |
| `--card-bg` | `rgba(28,33,26,0.75)` | Fundo dos cards |
| `--surface` | `rgba(30,35,28,0.6)` | Superfícies translúcidas |
| Background | `#0f1210` | Fundo geral da página |

### Tipografia

- **Títulos (h1–h3):** Outfit, bold, tracking apertado
- **Corpo (p, labels):** Inter, regular/medium
- **Ícones:** Material Symbols Outlined

### Breakpoints

| Breakpoint | Comportamento |
|---|---|
| `≥ 900px` | Layout desktop (grid de 2 colunas) |
| `< 900px` | Layout mobile (coluna única) |
| `< 640px` | Ajustes finos de padding e tipografia |

---

## 🤝 Contribuindo

1. Faça um **fork** do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça suas mudanças e commit: `git commit -m "Adiciona minha feature"`
4. Push para a branch: `git push origin minha-feature`
5. Abra um **Pull Request**

### Convenções

- Commits em português
- CSS organizado por seções com comentários
- JavaScript em ES Modules (`import`/`export`)
- Nomes de variáveis CSS com prefixo semântico (`--brand-`, `--card-`, etc.)

---

## 📄 Licença

Projeto desenvolvido por **Adilson**, inspirado na proposta do Renovo Cabeleireiros.

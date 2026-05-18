# Estrutura do projeto

O projeto foi reorganizado para ficar mais simples de manter e mais rapido de entender por qualquer dev que entrar depois.

## Como ficou dividido

```text
.
|-- assets/
|   |-- images/
|   |   `-- renovo-salao.png
|   |-- scripts/
|   |   |-- app.js
|   |   `-- modules/
|   |       |-- chat-widget.js
|   |       `-- contact-form.js
|   `-- styles/
|       `-- main.css
|-- docs/
|   |-- EXPLICACAO_INDEX.md
|   `-- previews/
|-- index.html
`-- README.md
```

## Responsabilidade de cada parte

- `index.html`: guarda somente a estrutura da pagina e as referencias para CSS, JS e imagem principal.
- `assets/styles/main.css`: centraliza o visual da landing page e do widget do chat.
- `assets/scripts/app.js`: ponto de entrada do front-end.
- `assets/scripts/modules/contact-form.js`: cuida da mascara do CEP, consulta ao ViaCEP e comportamento do formulario.
- `assets/scripts/modules/chat-widget.js`: cuida da abertura do chat, envio de mensagens e regras da ColorIA.
- `docs/`: concentra documentacao e imagens de apoio.

## Vantagens dessa organizacao

- Fica claro onde editar estilo, estrutura ou comportamento.
- O HTML principal fica enxuto e mais semantico.
- O JavaScript foi separado por responsabilidade, o que reduz acoplamento.
- Imagens e documentacao deixam de poluir a raiz do projeto.

## Ponto de entrada para manutencao

Se voce quiser mexer em uma area especifica:

- Layout e visual: `assets/styles/main.css`
- Formulario e CEP: `assets/scripts/modules/contact-form.js`
- Chatbot: `assets/scripts/modules/chat-widget.js`
- Conteudo da pagina: `index.html`

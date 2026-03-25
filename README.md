# Renovo Cabeleireiros & ColorIA

Landing page institucional com formulario de agendamento, galeria interativa, chatbot de apoio e persistencia local de agendamentos em SQLite.

## Estrutura do projeto

```text
.
|-- assets/
|   |-- images/
|   |   `-- renovo-salao.png
|   |-- scripts/
|   |   |-- app.js
|   |   `-- modules/
|   |       |-- chat-widget.js
|   |       |-- contact-form.js
|   |       `-- gallery-carousel.js
|   `-- styles/
|       `-- main.css
|-- data/
|   `-- appointments.db
|-- docs/
|   |-- EXPLICACAO_INDEX.md
|   `-- previews/
|-- server/
|   |-- database.js
|   `-- validation.js
|-- index.html
|-- package.json
|-- server.js
`-- README.md
```

## O que cada parte faz

- `assets/`: interface visual, comportamento do front-end e imagens.
- `server/`: persistencia SQLite e validacao dos dados de agendamento.
- `data/`: banco local gerado automaticamente em tempo de execucao.
- `server.js`: servidor HTTP que entrega a landing page e a API `/api/appointments`.

## Funcionalidades

- Landing page moderna com carrossel e secoes interativas.
- Chatbot que ajuda com pre-agendamento, cor e tendencias.
- Formulario de agendamento com ViaCEP e gravacao em banco.
- API local para salvar e listar agendamentos.
- Banco SQLite sem dependencias externas.

## Como executar

Como o projeto agora grava os agendamentos no banco, abra pela API local em vez de abrir o `index.html` direto.

### Opcao 1

```powershell
node server.js
```

### Opcao 2

```powershell
npm start
```

Depois abra:

```text
http://localhost:3000
```

## Endpoints disponiveis

- `GET /api/health`: status do servidor e caminho do banco.
- `GET /api/appointments`: lista os agendamentos mais recentes.
- `POST /api/appointments`: salva um novo agendamento.

## Observacao

O projeto usa o modulo nativo `node:sqlite` do Node.js. No ambiente atual ele funcionou normalmente para criar e consultar o banco local.
# site-salao-renovo-com-ia

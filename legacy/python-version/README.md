# Renovo Cabeleireiros - versao Python

Esta pasta e uma copia funcional do projeto com a logica principal do servidor refeita em Python.

## O que foi copiado

- `index.html` e `assets/` para manter o front-end igual
- endpoints de API equivalentes ao servidor Node
- persistencia em SQLite
- assistente local, integracao opcional com Gemini e webhook do WhatsApp

## Estrutura

```text
python-version/
|-- app/
|   |-- services/
|   |-- config.py
|   |-- database.py
|   |-- http_utils.py
|   |-- routes.py
|   |-- static_server.py
|   `-- validation.py
|-- assets/
|-- data/
|-- docs/
|-- index.html
|-- main.py
`-- requirements.txt
```

## Como executar

No terminal:

```powershell
cd python-version
python main.py
```

Depois abra:

```text
http://localhost:3000
```

Painel administrativo:

```text
http://localhost:3000/admin.html
```

## Variaveis de ambiente

As mesmas variaveis do projeto Node continuam valendo:

- `PORT`
- `DATABASE_FILE`
- `GEMINI_API_KEY`
- `GEMINI_API_VERSION`
- `GEMINI_MODEL`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_GRAPH_VERSION`
- `WHATSAPP_NOTIFY_TO`
- `WHATSAPP_VERIFY_TOKEN`

## Observacao

Esta versao usa principalmente bibliotecas nativas do Python, entao nao depende de framework externo para subir o servidor.

# Arquitetura

Este projeto foi reorganizado para ficar mais simples de manter por outras pessoas.

## Front-end

- `index.html`: estrutura semantica da landing page, comentada por blocos.
- `admin.html`: painel operacional em aba separada com login por senha.
- `assets/scripts/app.js`: bootstrap unico da pagina.
- `assets/scripts/admin.js`: bootstrap do painel operacional.
- `assets/scripts/services/api-client.js`: concentrador das chamadas HTTP.
- `assets/scripts/modules/contact-form.js`: validacao visual, ViaCEP e envio do formulario.
- `assets/scripts/modules/chat-widget.js`: interacao da interface do chat e consumo da API do assistente.
- `assets/scripts/modules/gallery-carousel.js`: comportamento isolado do carrossel.
- `assets/scripts/modules/admin-panel.js`: autenticacao e listagem interna de agendamentos.

## Back-end

- `server.js`: sobe o servidor HTTP e delega tudo para as rotas.
- `server/routes.js`: roteamento dos endpoints e entrega de arquivos estaticos.
- `server/http.js`: helpers de resposta e leitura de corpo JSON.
- `server/static-server.js`: resolucao segura de arquivos publicos.
- `server/config.js`: leitura de variaveis de ambiente e status de integracoes.
- `server/database.js`: persistencia SQLite.
- `server/security/encryption.js`: criptografia e descriptografia de campos sensiveis.
- `server/validation.js`: saneamento e validacao do payload de agendamento.

## Servicos

- `server/services/appointments.js`: cria agendamentos e dispara notificacao opcional.
- `server/services/admin-auth.js`: autentica o painel operacional e gerencia sessao por cookie.
- `server/services/assistant.js`: orquestra sessoes, Gemini, fallback local e criacao automatica de pre-agendamentos.
- `server/services/fallback-assistant.js`: modo local do chat quando o Gemini nao estiver configurado.
- `server/services/gemini.js`: integracao REST com o Gemini para resposta estruturada em JSON.
- `server/services/whatsapp.js`: envio de mensagens, verificacao de webhook e leitura do payload vindo da Meta.

## Fluxos principais

### Formulario

1. O front monta um payload previsivel.
2. `POST /api/appointments` valida e salva no SQLite.
3. Se o WhatsApp estiver configurado com um numero de notificacao, o backend tenta avisar a equipe.

### Chat do site

1. O widget envia a mensagem para `POST /api/assistant/chat`.
2. O backend usa Gemini quando houver chave.
3. Sem Gemini, o fluxo cai automaticamente no modo local.
4. Quando houver dados suficientes, o pre-agendamento e salvo automaticamente.

### WhatsApp Cloud API

1. A Meta chama `POST /webhooks/whatsapp`.
2. O backend le as mensagens recebidas.
3. Cada mensagem passa pelo mesmo orquestrador do chat do site.
4. A resposta e enviada de volta pelo endpoint `/messages` da Cloud API.

## Decisao importante sobre comentarios

Em vez de comentar literalmente cada linha do codigo, a manutencao ficou melhor com:

- comentarios curtos nos pontos de entrada e modulos
- comentarios por bloco no `index.html`
- separacao clara por responsabilidade

Isso reduz ruido e ajuda mais quem vai continuar o projeto depois.

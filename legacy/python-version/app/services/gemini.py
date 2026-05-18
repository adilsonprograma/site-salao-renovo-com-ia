import json
from urllib import error, request

from app.config import config


RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {
            "type": "string",
            "description": "Resposta curta, calorosa e objetiva em portugues do Brasil.",
        },
        "route": {
            "type": "string",
            "enum": ["booking", "color", "trends", "general"],
            "description": "Categoria principal da resposta.",
        },
        "readyToSchedule": {
            "type": "boolean",
            "description": "Marque true quando houver dados suficientes para registrar o pre-agendamento.",
        },
        "missingFields": {
            "type": "array",
            "description": "Campos ainda ausentes para um pre-agendamento minimamente util.",
            "items": {
                "type": "string",
                "enum": [
                    "nome",
                    "telefone",
                    "servico",
                    "dataPreferencial",
                    "horarioPreferencial",
                    "email",
                    "mensagem",
                ],
            },
        },
        "booking": {
            "type": "object",
            "properties": {
                "nome": {
                    "type": ["string", "null"],
                    "description": "Nome do cliente quando informado.",
                },
                "email": {
                    "type": ["string", "null"],
                    "description": "Email informado pelo cliente, se existir.",
                },
                "telefone": {
                    "type": ["string", "null"],
                    "description": "Telefone ou WhatsApp informado.",
                },
                "servico": {
                    "type": ["string", "null"],
                    "description": "Servico ou combinacao de servicos desejada.",
                },
                "dataPreferencial": {
                    "type": ["string", "null"],
                    "description": "Data, dia da semana ou periodo citado pelo cliente.",
                },
                "horarioPreferencial": {
                    "type": ["string", "null"],
                    "description": "Horario ou janela de atendimento desejada.",
                },
                "mensagem": {
                    "type": ["string", "null"],
                    "description": "Observacoes adicionais relevantes para o agendamento.",
                },
            },
            "required": [
                "nome",
                "email",
                "telefone",
                "servico",
                "dataPreferencial",
                "horarioPreferencial",
                "mensagem",
            ],
        },
    },
    "required": ["reply", "route", "readyToSchedule", "missingFields", "booking"],
}


def is_gemini_enabled():
    return config["gemini"]["enabled"]


def build_prompt(channel, message, metadata, session):
    transcript = "\n".join(
        [
            f"{'Cliente' if entry['role'] == 'user' else 'ColorIA'}: {entry['text']}"
            for entry in session["transcript"][-8:]
        ]
    )

    return "\n".join(
        [
            "Voce e a ColorIA Agenda do Renovo Cabeleireiros, em Russas/CE.",
            "Responda sempre em portugues do Brasil, com tom humano, acolhedor e pratico.",
            "Sua funcao principal e ajudar com agendamento, orientacao inicial de cor e tendencias de corte.",
            "Nunca invente dados de agendamento. Extraia apenas o que estiver explicito na mensagem ou no contexto.",
            "Para agendamento, priorize coletar nome, telefone, servico, data preferencial e horario preferencial.",
            "Email e opcional no WhatsApp e no chat do site.",
            "Quando o cliente pedir agendamento e ja existirem nome, telefone e servico, voce pode marcar readyToSchedule=true.",
            "Se faltarem dados, faca apenas a proxima pergunta mais util.",
            "Se a conversa for sobre cor ou corte, entregue uma orientacao curta e convide para agendar se fizer sentido.",
            "",
            f"Canal: {channel}",
            f"Telefone disponivel no canal: {metadata.get('phone') or 'nao'}",
            f"Nome de perfil disponivel no canal: {metadata.get('profileName') or 'nao'}",
            f"Rascunho atual do agendamento: {json.dumps(session['bookingDraft'], ensure_ascii=False)}",
            f"Ultima intencao conhecida: {session.get('lastRoute') or 'general'}",
            "",
            "Historico recente:",
            transcript or "Sem historico anterior.",
            "",
            f"Mensagem atual do cliente: {message}",
        ]
    )


def normalize_gemini_result(result=None):
    result = result or {}
    booking = result.get("booking") or {}

    reply = str(result.get("reply") or "").strip()
    route = result.get("route") if result.get("route") in {"booking", "color", "trends", "general"} else "general"

    return {
        "booking": {
            "dataPreferencial": booking.get("dataPreferencial") or "",
            "email": booking.get("email") or "",
            "horarioPreferencial": booking.get("horarioPreferencial") or "",
            "mensagem": booking.get("mensagem") or "",
            "nome": booking.get("nome") or "",
            "servico": booking.get("servico") or "",
            "telefone": booking.get("telefone") or "",
        },
        "missingFields": result.get("missingFields")
        if isinstance(result.get("missingFields"), list)
        else [],
        "readyToSchedule": bool(result.get("readyToSchedule")),
        "reply": reply or "Posso te ajudar com agendamento, cor ou tendencias. Me conta o que voce precisa.",
        "route": route,
    }


def generate_gemini_assistant_response(channel, message, metadata, session):
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": build_prompt(channel, message, metadata, session),
                    }
                ],
                "role": "user",
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": RESPONSE_SCHEMA,
            "temperature": 0.35,
        },
    }

    endpoint = (
        f"https://generativelanguage.googleapis.com/{config['gemini']['apiVersion']}/models/"
        f"{config['gemini']['model']}:generateContent"
    )
    http_request = request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": config["gemini"]["apiKey"],
        },
        method="POST",
    )

    try:
        with request.urlopen(http_request, timeout=30) as response:
            response_body = response.read().decode("utf-8")
            response_payload = json.loads(response_body) if response_body else {}
    except error.HTTPError as http_error:
        response_body = http_error.read().decode("utf-8", errors="ignore")

        try:
            response_payload = json.loads(response_body) if response_body else {}
        except json.JSONDecodeError:
            response_payload = {}

        raise RuntimeError(
            response_payload.get("error", {}).get("message") or "Falha ao consultar o Gemini."
        ) from http_error

    candidates = response_payload.get("candidates")
    first_candidate = candidates[0] if isinstance(candidates, list) and candidates else {}
    parts = first_candidate.get("content", {}).get("parts", [])
    response_text = "".join(part.get("text", "") for part in parts).strip()

    if not response_text:
        raise RuntimeError("O Gemini nao retornou conteudo utilizavel.")

    return normalize_gemini_result(json.loads(response_text))

import time

from app.services.appointments import create_appointment
from app.services.fallback_assistant import process_fallback_message
from app.services.gemini import generate_gemini_assistant_response, is_gemini_enabled
from app.services.whatsapp import (
    extract_incoming_whatsapp_messages,
    normalize_phone_number,
    send_whatsapp_text_message,
)


SESSION_TTL_SECONDS = 60 * 60 * 12
sessions = {}


def get_source_from_channel(channel):
    return "whatsapp_cloud" if channel == "whatsapp" else "site_chat"


def create_empty_draft(metadata=None, source="site_chat"):
    metadata = metadata or {}
    return {
        "dataPreferencial": "",
        "email": "",
        "horarioPreferencial": "",
        "mensagem": "",
        "nome": metadata.get("profileName", ""),
        "origemAgendamento": source,
        "servico": "",
        "telefone": metadata.get("phone", ""),
    }


def cleanup_sessions():
    now = time.time()
    expired_keys = [
        key
        for key, session in sessions.items()
        if now - session["updatedAt"] > SESSION_TTL_SECONDS
    ]

    for key in expired_keys:
        sessions.pop(key, None)


def get_session_key(channel, session_id):
    return f"{channel}:{session_id}"


def get_or_create_session(channel, metadata, session_id):
    cleanup_sessions()
    key = get_session_key(channel, session_id)
    existing_session = sessions.get(key)

    if existing_session:
        existing_session["updatedAt"] = time.time()
        existing_session["metadata"] = {
            **existing_session["metadata"],
            **metadata,
        }

        if not existing_session["bookingDraft"]["telefone"] and metadata.get("phone"):
            existing_session["bookingDraft"]["telefone"] = metadata["phone"]

        if not existing_session["bookingDraft"]["nome"] and metadata.get("profileName"):
            existing_session["bookingDraft"]["nome"] = metadata["profileName"]

        return existing_session

    source = get_source_from_channel(channel)
    new_session = {
        "bookingDraft": create_empty_draft(metadata, source),
        "createdAt": time.time(),
        "fallbackState": None,
        "key": key,
        "lastAppointmentId": 0,
        "lastRoute": "general",
        "metadata": {**metadata},
        "transcript": [],
        "updatedAt": time.time(),
    }
    sessions[key] = new_session
    return new_session


def append_transcript(session, role, text):
    session["transcript"].append({"role": role, "text": text})
    session["transcript"] = session["transcript"][-12:]
    session["updatedAt"] = time.time()


def merge_draft(current_draft, incoming_draft=None, metadata=None, source="site_chat"):
    incoming_draft = incoming_draft or {}
    metadata = metadata or {}
    merged = {**current_draft}

    for key, value in incoming_draft.items():
        if isinstance(value, str) and value.strip():
            merged[key] = value

    if not merged["telefone"] and metadata.get("phone"):
        merged["telefone"] = metadata["phone"]

    if not merged["nome"] and metadata.get("profileName"):
        merged["nome"] = metadata["profileName"]

    merged["origemAgendamento"] = source
    merged["telefone"] = normalize_phone_number(merged["telefone"]) or merged["telefone"]
    return merged


def build_assistant_confirmation(appointment):
    return "\n".join(
        [
            f"Seu pre-agendamento #{appointment['id']} foi registrado.",
            f"Servico: {appointment['servico']}.",
            f"Preferencia: {appointment.get('dataPreferencial') or 'data a combinar'} / {appointment.get('horarioPreferencial') or 'horario a combinar'}.",
            "A equipe vai retornar pelo WhatsApp informado.",
        ]
    )


def normalize_text(value):
    text = str(value or "").strip().lower()
    accent_map = {
        "á": "a",
        "à": "a",
        "â": "a",
        "ã": "a",
        "é": "e",
        "ê": "e",
        "í": "i",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ú": "u",
        "ç": "c",
    }
    return "".join(accent_map.get(character, character) for character in text)


def is_fresh_booking_intent(message):
    normalized = normalize_text(message)
    return any(
        term in normalized
        for term in [
            "agendar",
            "agendamento",
            "novo agendamento",
            "outro agendamento",
            "marcar horario",
            "quero agendar",
        ]
    )


def normalize_assistant_reply(result=None):
    result = result or {}
    return {
        "booking": result.get("booking") or {},
        "missingFields": result.get("missingFields")
        if isinstance(result.get("missingFields"), list)
        else [],
        "readyToSchedule": bool(result.get("readyToSchedule")),
        "reply": str(result.get("reply") or "").strip(),
        "route": result.get("route") or "general",
    }


def get_assistant_decision(channel, message, metadata, session):
    source = get_source_from_channel(channel)

    if is_gemini_enabled():
        try:
            return {
                "provider": "gemini",
                **normalize_assistant_reply(
                    generate_gemini_assistant_response(channel, message, metadata, session)
                ),
            }
        except Exception as error_message:  # pragma: no cover - depende da API externa
            print("Falha na integracao com Gemini. Caindo para o modo local.", error_message)

    return {
        "provider": "fallback",
        **normalize_assistant_reply(
            process_fallback_message(
                message,
                metadata=metadata,
                session=session,
                source=source,
            )
        ),
    }


def run_assistant_turn(channel, message, metadata=None, session_id="anonymous"):
    metadata = metadata or {}
    session = get_or_create_session(channel, metadata, session_id)
    source = get_source_from_channel(channel)

    if session["lastAppointmentId"] and is_fresh_booking_intent(message):
        session["lastAppointmentId"] = 0

    append_transcript(session, "user", message)
    decision = get_assistant_decision(channel, message, metadata, session)
    session["lastRoute"] = decision["route"]
    session["bookingDraft"] = merge_draft(session["bookingDraft"], decision["booking"], metadata, source)

    reply = decision["reply"] or "Posso te ajudar com agendamento, cor ou tendencias."
    appointment = None
    notification = None

    if decision["readyToSchedule"] and not session["lastAppointmentId"]:
        creation = create_appointment(session["bookingDraft"])

        if creation["isValid"]:
            appointment = creation["appointment"]
            notification = creation["notification"]
            session["lastAppointmentId"] = appointment["id"]
            session["bookingDraft"] = create_empty_draft(metadata, source)
            session["fallbackState"] = None
            reply = f"{reply}\n\n{build_assistant_confirmation(appointment)}".strip()

    append_transcript(session, "assistant", reply)

    return {
        "appointment": appointment,
        "notification": notification,
        "provider": decision["provider"],
        "reply": reply,
    }


def process_whatsapp_webhook_payload(payload):
    incoming_messages = extract_incoming_whatsapp_messages(payload)
    results = []

    for message in incoming_messages:
        if message["type"] != "text" or not message["text"]:
            unsupported_reply = "Consigo te atender melhor por texto. Me diga o servico que voce quer agendar ou a duvida sobre cor e corte."
            delivery = send_whatsapp_text_message(unsupported_reply, message["waId"])
            results.append(
                {
                    "appointment": None,
                    "delivery": delivery,
                    "incomingMessageId": message["id"],
                    "reply": unsupported_reply,
                }
            )
            continue

        turn = run_assistant_turn(
            "whatsapp",
            message["text"],
            metadata={
                "phone": message["waId"],
                "profileName": message["profileName"],
            },
            session_id=message["waId"],
        )
        delivery = send_whatsapp_text_message(turn["reply"], message["waId"])
        results.append(
            {
                "appointment": turn["appointment"],
                "delivery": delivery,
                "incomingMessageId": message["id"],
                "provider": turn["provider"],
                "reply": turn["reply"],
            }
        )

    return results

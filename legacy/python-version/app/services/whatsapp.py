import json
from urllib import error, request

from app.config import config


def normalize_phone_number(value):
    if not isinstance(value, str):
        return ""

    return "".join(character for character in value if character.isdigit())


def is_whatsapp_enabled():
    return config["whatsapp"]["enabled"]


def build_graph_url(endpoint):
    return (
        f"https://graph.facebook.com/{config['whatsapp']['graphVersion']}/"
        f"{config['whatsapp']['phoneNumberId']}{endpoint}"
    )


def _post_json(url, headers, payload):
    encoded_payload = json.dumps(payload).encode("utf-8")
    http_request = request.Request(
        url,
        data=encoded_payload,
        headers=headers,
        method="POST",
    )

    try:
        with request.urlopen(http_request, timeout=20) as response:
            response_body = response.read().decode("utf-8")
            return json.loads(response_body) if response_body else {}
    except error.HTTPError as http_error:
        response_body = http_error.read().decode("utf-8", errors="ignore")

        try:
            payload = json.loads(response_body) if response_body else {}
        except json.JSONDecodeError:
            payload = {}

        raise RuntimeError(
            payload.get("error", {}).get("message")
            or "Falha ao enviar mensagem pelo WhatsApp Cloud API."
        ) from http_error


def send_whatsapp_text_message(body, to):
    if not is_whatsapp_enabled():
        return {
            "enabled": False,
            "messageId": "",
            "status": "disabled",
        }

    recipient = normalize_phone_number(to)

    if not recipient:
        return {
            "enabled": True,
            "messageId": "",
            "status": "skipped",
        }

    payload = _post_json(
        build_graph_url("/messages"),
        {
            "Authorization": f"Bearer {config['whatsapp']['accessToken']}",
            "Content-Type": "application/json",
        },
        {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "text": {
                "body": body,
                "preview_url": False,
            },
            "to": recipient,
            "type": "text",
        },
    )
    messages = payload.get("messages")
    first_message = messages[0] if isinstance(messages, list) and messages else {}

    return {
        "enabled": True,
        "messageId": first_message.get("id", ""),
        "status": "sent",
    }


def build_appointment_notification(appointment):
    return "\n".join(
        [
            f"Novo agendamento Renovo #{appointment['id']}",
            f"Cliente: {appointment['nome']}",
            f"Servico: {appointment['servico']}",
            f"Data: {appointment.get('dataPreferencial') or 'Nao informada'}",
            f"Horario: {appointment.get('horarioPreferencial') or 'Nao informado'}",
            f"WhatsApp: {appointment['telefone']}",
            f"Origem: {appointment['origemAgendamento']}",
            f"Observacoes: {appointment.get('mensagem') or 'Sem observacoes adicionais.'}",
        ]
    )


def notify_salon_about_appointment(appointment):
    if not is_whatsapp_enabled() or not config["whatsapp"]["notifyTo"]:
        return {
            "enabled": is_whatsapp_enabled(),
            "messageId": "",
            "status": "disabled",
        }

    try:
        return send_whatsapp_text_message(
            build_appointment_notification(appointment),
            config["whatsapp"]["notifyTo"],
        )
    except Exception as error_message:  # pragma: no cover - depende da API externa
        return {
            "enabled": True,
            "error": str(error_message),
            "messageId": "",
            "status": "failed",
        }


def _get_first_value(search_params, key):
    value = search_params.get(key, "")

    if isinstance(value, list):
        return value[0] if value else ""

    return value


def verify_whatsapp_webhook(search_params):
    if not config["whatsapp"]["verifyToken"]:
        return {
            "challenge": "",
            "ok": False,
        }

    mode = _get_first_value(search_params, "hub.mode")
    token = _get_first_value(search_params, "hub.verify_token")
    challenge = _get_first_value(search_params, "hub.challenge")

    return {
        "challenge": challenge or "",
        "ok": mode == "subscribe" and token == config["whatsapp"]["verifyToken"],
    }


def extract_incoming_whatsapp_messages(payload=None):
    payload = payload or {}
    entries = payload.get("entry", [])
    parsed_messages = []

    for entry_item in entries if isinstance(entries, list) else []:
        changes = entry_item.get("changes", [])
        changes_list = changes if isinstance(changes, list) else []

        for change in changes_list:
            value = change.get("value", {})
            contacts = value.get("contacts", [])
            messages = value.get("messages", [])
            contacts_list = contacts if isinstance(contacts, list) else []
            messages_list = messages if isinstance(messages, list) else []

            for message in messages_list:
                matched_contact = next(
                    (
                        contact
                        for contact in contacts_list
                        if contact.get("wa_id") == message.get("from")
                    ),
                    {},
                )

                parsed_messages.append(
                    {
                        "id": message.get("id", ""),
                        "profileName": matched_contact.get("profile", {}).get("name", ""),
                        "text": message.get("text", {}).get("body", ""),
                        "timestamp": message.get("timestamp", ""),
                        "type": message.get("type", ""),
                        "waId": message.get("from", ""),
                    }
                )

    return parsed_messages

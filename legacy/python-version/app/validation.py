import re


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
EMAIL_OPTIONAL_SOURCES = {"site_chat", "whatsapp_cloud", "assistant_api"}


def clean_text(value, max_length=255):
    if not isinstance(value, str):
        return ""

    return " ".join(value.strip().split())[:max_length]


def clean_multiline_text(value, max_length=2000):
    if not isinstance(value, str):
        return ""

    return value.strip()[:max_length]


def is_valid_email(value):
    return bool(EMAIL_RE.match(value))


def is_email_required(source):
    return source not in EMAIL_OPTIONAL_SOURCES


def validate_appointment(payload=None):
    payload = payload or {}

    appointment = {
        "nome": clean_text(payload.get("nome"), 140),
        "email": clean_text(payload.get("email"), 160),
        "telefone": clean_text(payload.get("telefone"), 40),
        "servico": clean_text(payload.get("servico"), 140),
        "dataPreferencial": clean_text(payload.get("dataPreferencial"), 80),
        "horarioPreferencial": clean_text(payload.get("horarioPreferencial"), 80),
        "cep": clean_text(payload.get("cep"), 16),
        "logradouro": clean_text(payload.get("logradouro"), 160),
        "bairro": clean_text(payload.get("bairro"), 120),
        "localidade": clean_text(payload.get("localidade"), 120),
        "assunto": clean_text(payload.get("assunto"), 160),
        "mensagem": clean_multiline_text(payload.get("mensagem"), 2400),
        "origemAgendamento": clean_text(payload.get("origemAgendamento"), 40) or "site_form",
    }

    if not appointment["assunto"]:
        appointment["assunto"] = (
            f"Solicitacao de agendamento - {appointment['servico'] or 'Renovo Cabeleireiros'}"
        )

    if not appointment["mensagem"]:
        appointment["mensagem"] = "Sem observacoes adicionais."

    errors = []

    if not appointment["nome"]:
        errors.append("Nome completo e obrigatorio.")

    if appointment["email"] and not is_valid_email(appointment["email"]):
        errors.append("E-mail invalido.")

    if is_email_required(appointment["origemAgendamento"]) and not appointment["email"]:
        errors.append("E-mail valido e obrigatorio.")

    if not appointment["telefone"]:
        errors.append("Telefone ou WhatsApp e obrigatorio.")

    if not appointment["servico"]:
        errors.append("Servico desejado e obrigatorio.")

    return {
        "appointment": appointment,
        "errors": errors,
        "isValid": len(errors) == 0,
    }

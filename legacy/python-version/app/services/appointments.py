from app.config import config
from app.database import get_appointment_by_id
from app.database import list_appointments as list_saved_appointments
from app.database import save_appointment
from app.services.whatsapp import notify_salon_about_appointment
from app.validation import validate_appointment


def build_default_subject(service):
    return f"Solicitacao de agendamento - {service or config['appName']}"


def build_default_message(appointment):
    return "\n".join(
        [
            f"Nome: {appointment.get('nome') or 'Nao informado'}",
            f"WhatsApp: {appointment.get('telefone') or 'Nao informado'}",
            f"Servico: {appointment.get('servico') or 'Nao informado'}",
            f"Data preferencial: {appointment.get('dataPreferencial') or 'Nao informada'}",
            f"Horario preferencial: {appointment.get('horarioPreferencial') or 'Nao informado'}",
            f"Observacoes: {appointment.get('mensagem') or 'Sem observacoes adicionais.'}",
        ]
    )


def create_appointment(payload):
    validation = validate_appointment(payload)

    if not validation["isValid"]:
        return {
            "errors": validation["errors"],
            "isValid": False,
            "message": "Os dados do agendamento estao incompletos.",
        }

    appointment_input = {
        **validation["appointment"],
        "assunto": validation["appointment"]["assunto"]
        or build_default_subject(validation["appointment"]["servico"]),
        "mensagem": validation["appointment"]["mensagem"]
        or build_default_message(validation["appointment"]),
    }

    appointment = save_appointment(appointment_input)
    notification = notify_salon_about_appointment(appointment)

    return {
        "appointment": appointment,
        "isValid": True,
        "message": "Agendamento salvo com sucesso.",
        "notification": notification,
    }


def list_appointments(limit=25):
    return list_saved_appointments(limit)


def notify_existing_appointment(appointment_id):
    appointment = get_appointment_by_id(appointment_id)

    if not appointment:
        return {
            "appointment": None,
            "message": "Agendamento nao encontrado.",
            "ok": False,
        }

    notification = notify_salon_about_appointment(appointment)

    return {
        "appointment": appointment,
        "message": "Tentativa de reenvio concluida.",
        "notification": notification,
        "ok": True,
    }

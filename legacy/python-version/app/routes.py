from urllib.parse import parse_qs, urlsplit

from app.config import get_integration_status
from app.database import database_file
from app.http_utils import (
    clear_session_cookie,
    read_json_body,
    send_json,
    send_no_content,
    send_text,
    set_session_cookie,
)
from app.services.appointments import (
    create_appointment,
    list_appointments,
    notify_existing_appointment,
)
from app.services.assistant import (
    process_whatsapp_webhook_payload,
    run_assistant_turn,
)
from app.services.auth import (
    get_current_session,
    get_session_from_cookies,
    is_user_logged_in,
    login_user,
    logout_user,
    require_auth,
)
from app.services.whatsapp import verify_whatsapp_webhook
from app.static_server import resolve_static_path, serve_static_file


def handle_appointments_create(handler):
    payload = read_json_body(handler)
    result = create_appointment(payload)

    if not result["isValid"]:
        send_json(
            handler,
            400,
            {
                "errors": result["errors"],
                "message": result["message"],
            },
        )
        return

    send_json(
        handler,
        201,
        {
            "appointment": result["appointment"],
            "message": result["message"],
            "notification": result["notification"],
        },
    )


def handle_assistant_chat(handler):
    payload = read_json_body(handler)
    message = str(payload.get("message", "")).strip()

    if not message:
        send_json(
            handler,
            400,
            {
                "message": "Envie uma mensagem para o assistente.",
            },
        )
        return

    result = run_assistant_turn(
        "website",
        message,
        metadata={
            "phone": payload.get("phone", ""),
            "profileName": payload.get("name", ""),
        },
        session_id=str(payload.get("sessionId", "anonymous")),
    )
    send_json(handler, 200, result)


def handle_admin_notify(handler, appointment_id):
    result = notify_existing_appointment(appointment_id)

    if not result["ok"]:
        send_json(
            handler,
            404,
            {
                "message": result["message"],
            },
        )
        return

    send_json(
        handler,
        200,
        {
            "appointment": result["appointment"],
            "message": result["message"],
            "notification": result["notification"],
        },
    )


def handle_admin_login(handler):
    """Autentica um usuário e cria uma sessão."""
    payload = read_json_body(handler)
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", "")).strip()

    if not username or not password:
        send_json(
            handler,
            400,
            {"message": "Usuário e senha são obrigatórios"},
        )
        return

    result = login_user(username, password)

    if not result["success"]:
        send_json(
            handler,
            401,
            {"message": result["message"]},
        )
        return

    # Definir cookie de sessão
    session_id = result["session_id"]
    cookie_header = set_session_cookie(handler, session_id, max_age=7200)  # 2 horas

    send_json(
        handler,
        200,
        {"message": result["message"]},
        extra_headers={"Set-Cookie": cookie_header},
    )


def handle_admin_logout(handler):
    """Remove a sessão do usuário."""
    session_id = get_session_from_cookies(handler.headers)

    if session_id:
        logout_user(session_id)

    # Limpar cookie
    clear_cookie_header = clear_session_cookie(handler)

    send_json(
        handler,
        200,
        {"message": "Logout realizado com sucesso"},
        extra_headers={"Set-Cookie": clear_cookie_header},
    )


def handle_admin_appointments_list(handler):
    """Lista agendamentos (requer autenticação)."""
    session = require_auth(handler)

    if not session:
        send_json(
            handler,
            401,
            {"message": "Não autenticado. Faça login para continuar."},
        )
        return

    # Obter limite de query params
    request_url = urlsplit(handler.path)
    search_params = parse_qs(request_url.query)
    limit = search_params.get("limit", ["25"])[0]

    send_json(
        handler,
        200,
        {
            "appointments": list_appointments(limit),
            "user": {"username": session["username"]},
        },
    )


def handle_admin_status(handler):
    """Obtém o status da sessão do usuário (requer autenticação)."""
    session = require_auth(handler)

    if not session:
        send_json(
            handler,
            401,
            {"message": "Não autenticado"},
        )
        return

    send_json(
        handler,
        200,
        {
            "authenticated": True,
            "user": {"username": session["username"]},
        },
    )


def route_request(handler):
    request_url = urlsplit(handler.path)
    pathname = request_url.path or "/"
    search_params = parse_qs(request_url.query)
    path_parts = [part for part in pathname.strip("/").split("/") if part]

    if handler.command == "OPTIONS":
        send_no_content(handler)
        return

    if pathname == "/api/health" and handler.command == "GET":
        send_json(
            handler,
            200,
            {
                "databaseFile": database_file,
                "integrations": get_integration_status(),
                "status": "ok",
            },
        )
        return

    if pathname == "/api/integrations" and handler.command == "GET":
        send_json(handler, 200, get_integration_status())
        return

    if pathname == "/api/appointments" and handler.command == "GET":
        send_json(
            handler,
            200,
            {
                "appointments": list_appointments(search_params.get("limit", [""])[0]),
            },
        )
        return

    if pathname == "/api/appointments" and handler.command == "POST":
        handle_appointments_create(handler)
        return

    if pathname == "/api/assistant/chat" and handler.command == "POST":
        handle_assistant_chat(handler)
        return

    if pathname == "/api/admin/login" and handler.command == "POST":
        handle_admin_login(handler)
        return

    if pathname == "/api/admin/logout" and handler.command == "POST":
        handle_admin_logout(handler)
        return

    if pathname == "/api/admin/appointments" and handler.command == "GET":
        handle_admin_appointments_list(handler)
        return

    if pathname == "/api/admin/status" and handler.command == "GET":
        handle_admin_status(handler)
        return

    if (
        len(path_parts) == 5
        and path_parts[0] == "api"
        and path_parts[1] == "admin"
        and path_parts[2] == "appointments"
        and path_parts[4] == "notify"
        and handler.command == "POST"
    ):
        handle_admin_notify(handler, path_parts[3])
        return

    if pathname == "/webhooks/whatsapp" and handler.command == "GET":
        verification = verify_whatsapp_webhook(search_params)

        if not verification["ok"]:
            send_text(handler, 403, "Webhook verification failed.")
            return

        send_text(handler, 200, verification["challenge"])
        return

    if pathname == "/webhooks/whatsapp" and handler.command == "POST":
        try:
            payload = read_json_body(handler)
            process_whatsapp_webhook_payload(payload)
            send_text(handler, 200, "EVENT_RECEIVED")
        except Exception as error_message:
            print("Falha ao processar webhook do WhatsApp:", error_message)
            send_json(
                handler,
                500,
                {
                    "message": "Nao foi possivel processar o webhook do WhatsApp.",
                },
            )
        return

    if handler.command not in {"GET", "HEAD"}:
        send_text(handler, 405, "Metodo nao permitido.")
        return

    file_path = resolve_static_path(pathname)

    if not file_path:
        send_text(handler, 403, "Acesso negado.")
        return

    serve_static_file(file_path, handler)

import json
from urllib.parse import urlsplit


MAX_BODY_SIZE = 1_000_000


def build_cors_headers(handler, pathname=None):
    current_path = pathname or urlsplit(handler.path).path

    if not current_path.startswith("/api/") and not current_path.startswith("/webhooks/"):
        return {}

    return {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Origin": handler.headers.get("Origin") or "*",
    }


def send_bytes(handler, status_code, body, content_type, extra_headers=None):
    headers = build_cors_headers(handler)
    headers["Content-Type"] = content_type
    headers["Content-Length"] = str(len(body))

    if extra_headers:
        headers.update(extra_headers)

    handler.send_response(status_code)

    for name, value in headers.items():
        handler.send_header(name, value)

    handler.end_headers()

    if handler.command != "HEAD" and body:
        handler.wfile.write(body)


def send_json(handler, status_code, payload, extra_headers=None):
    body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    send_bytes(
        handler,
        status_code,
        body,
        "application/json; charset=utf-8",
        extra_headers=extra_headers,
    )


def send_text(handler, status_code, message, extra_headers=None):
    body = str(message).encode("utf-8")
    send_bytes(
        handler,
        status_code,
        body,
        "text/plain; charset=utf-8",
        extra_headers=extra_headers,
    )


def send_no_content(handler):
    send_bytes(handler, 204, b"", "text/plain; charset=utf-8")


def read_request_body(handler):
    content_length_header = handler.headers.get("Content-Length")

    if not content_length_header:
        return b""

    try:
        content_length = int(content_length_header)
    except (TypeError, ValueError) as error:
        raise ValueError("Content-Length invalido.") from error

    if content_length > MAX_BODY_SIZE:
        raise ValueError("Corpo da requisicao muito grande.")

    body = handler.rfile.read(content_length)

    if len(body) > MAX_BODY_SIZE:
        raise ValueError("Corpo da requisicao muito grande.")

    return body


def read_json_body(handler):
    raw_body = read_request_body(handler)

    if not raw_body:
        return {}

    return json.loads(raw_body.decode("utf-8"))


def set_session_cookie(handler, session_id, max_age=None):
    """
    Configura um cookie de sessão na resposta.
    
    Args:
        handler: Handler HTTP
        session_id: ID da sessão
        max_age: Tempo máximo do cookie em segundos (opcional)
    """
    cookie_value = f"admin_session_id={session_id}; Path=/; HttpOnly; SameSite=Strict"
    
    if max_age:
        cookie_value += f"; Max-Age={max_age}"
    
    return cookie_value


def clear_session_cookie(handler):
    """Retorna um header para limpar o cookie de sessão."""
    return "admin_session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; SameSite=Strict"

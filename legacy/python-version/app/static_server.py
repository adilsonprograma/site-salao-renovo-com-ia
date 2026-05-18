import mimetypes
import shutil
from pathlib import Path
from urllib.parse import unquote

from app.http_utils import build_cors_headers


ROOT_DIRECTORY = Path(__file__).resolve().parents[1]
CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
}


def resolve_static_path(pathname):
    normalized_path = "/index.html" if pathname == "/" else pathname
    decoded_path = unquote(normalized_path)
    candidate = (ROOT_DIRECTORY / decoded_path.lstrip("/\\")).resolve()

    try:
        candidate.relative_to(ROOT_DIRECTORY)
    except ValueError:
        return None

    return candidate


def serve_static_file(file_path, handler):
    if not file_path or not file_path.is_file():
        from app.http_utils import send_text

        send_text(handler, 404, "Arquivo nao encontrado.")
        return

    extension = file_path.suffix.lower()
    content_type = CONTENT_TYPES.get(extension) or mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    headers = build_cors_headers(handler)
    headers.update(
        {
            "Cache-Control": "no-cache" if extension == ".html" else "public, max-age=3600",
            "Content-Type": content_type,
            "Content-Length": str(file_path.stat().st_size),
        }
    )

    handler.send_response(200)

    for name, value in headers.items():
        handler.send_header(name, value)

    handler.end_headers()

    if handler.command == "HEAD":
        return

    with file_path.open("rb") as file_stream:
        shutil.copyfileobj(file_stream, handler.wfile)

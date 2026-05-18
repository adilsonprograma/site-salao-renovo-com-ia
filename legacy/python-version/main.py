import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from app.config import config
from app.http_utils import send_json
from app.routes import route_request


class RenovoRequestHandler(BaseHTTPRequestHandler):
    server_version = "RenovoPython/1.0"

    def do_GET(self):
        self._handle_request()

    def do_POST(self):
        self._handle_request()

    def do_OPTIONS(self):
        self._handle_request()

    def do_HEAD(self):
        self._handle_request()

    def _handle_request(self):
        try:
            route_request(self)
        except json.JSONDecodeError as error:
            print("Erro inesperado no servidor:", error)
            send_json(
                self,
                400,
                {
                    "message": "O corpo da requisicao nao esta em JSON valido.",
                },
            )
        except Exception as error:  # pragma: no cover - caminho defensivo
            print("Erro inesperado no servidor:", error)
            send_json(
                self,
                500,
                {
                    "message": "Nao foi possivel concluir a operacao agora.",
                },
            )


def main():
    address = ("", config["port"])
    server = ThreadingHTTPServer(address, RenovoRequestHandler)

    try:
        print(f"Renovo server Python ativo em http://localhost:{config['port']}")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

const http = require("node:http");
const { config } = require("./server/config");
const { routeRequest } = require("./server/routes");

const server = http.createServer((request, response) => {
    routeRequest(request, response).catch((error) => {
        const isJsonError = error instanceof SyntaxError;

        console.error("Erro inesperado no servidor:", error);
        response.writeHead(isJsonError ? 400 : 500, {
            "Content-Type": "application/json; charset=utf-8"
        });
        response.end(
            JSON.stringify({
                message: isJsonError
                    ? "O corpo da requisicao nao esta em JSON valido."
                    : "Nao foi possivel concluir a operacao agora."
            }, null, 2)
        );
    });
});

server.listen(config.port, () => {
    console.log(`Renovo server ativo em http://localhost:${config.port}`);
});

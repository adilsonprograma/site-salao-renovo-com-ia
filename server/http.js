// Reune helpers HTTP para reduzir repeticao nas rotas.
function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, message) {
    response.writeHead(statusCode, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    response.end(message);
}

function sendNoContent(response) {
    response.writeHead(204);
    response.end();
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk;

            if (body.length > 1_000_000) {
                reject(new Error("Corpo da requisicao muito grande."));
                request.destroy();
            }
        });

        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

async function readJsonBody(request) {
    const rawBody = await readRequestBody(request);

    if (!rawBody) {
        return {};
    }

    return JSON.parse(rawBody);
}

module.exports = {
    readJsonBody,
    sendJson,
    sendNoContent,
    sendText
};

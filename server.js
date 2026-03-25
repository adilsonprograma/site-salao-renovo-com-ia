const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { URL } = require("node:url");
const { databaseFile, listAppointments, saveAppointment } = require("./server/database");
const { validateAppointment } = require("./server/validation");

const rootDirectory = process.cwd();
const port = Number(process.env.PORT) || 3000;

const contentTypes = {
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
    ".webp": "image/webp"
};

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

function resolveStaticPath(pathname) {
    const normalizedPath = pathname === "/" ? "/index.html" : pathname;
    const decodedPath = decodeURIComponent(normalizedPath);
    const filePath = path.normalize(path.join(rootDirectory, decodedPath));

    if (!filePath.startsWith(rootDirectory)) {
        return "";
    }

    return filePath;
}

function serveStaticFile(filePath, request, response) {
    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            sendText(response, 404, "Arquivo nao encontrado.");
            return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const contentType = contentTypes[extension] || "application/octet-stream";

        response.writeHead(200, {
            "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
            "Content-Type": contentType
        });

        if (request.method === "HEAD") {
            response.end();
            return;
        }

        fs.createReadStream(filePath).pipe(response);
    });
}

const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    if (requestUrl.pathname === "/api/health" && request.method === "GET") {
        sendJson(response, 200, {
            databaseFile,
            status: "ok"
        });
        return;
    }

    if (requestUrl.pathname === "/api/appointments" && request.method === "GET") {
        sendJson(response, 200, {
            appointments: listAppointments(requestUrl.searchParams.get("limit"))
        });
        return;
    }

    if (requestUrl.pathname === "/api/appointments" && request.method === "POST") {
        try {
            const rawBody = await readRequestBody(request);
            const payload = rawBody ? JSON.parse(rawBody) : {};
            const validation = validateAppointment(payload);

            if (!validation.isValid) {
                sendJson(response, 400, {
                    errors: validation.errors,
                    message: "Os dados do agendamento estao incompletos."
                });
                return;
            }

            const appointment = saveAppointment(validation.appointment);

            sendJson(response, 201, {
                appointment,
                message: "Agendamento salvo com sucesso."
            });
        } catch (error) {
            const isJsonError = error instanceof SyntaxError;

            sendJson(response, isJsonError ? 400 : 500, {
                message: isJsonError
                    ? "O corpo da requisicao nao esta em JSON valido."
                    : "Nao foi possivel salvar o agendamento agora."
            });
        }

        return;
    }

    if (!["GET", "HEAD"].includes(request.method || "")) {
        sendText(response, 405, "Metodo nao permitido.");
        return;
    }

    const filePath = resolveStaticPath(requestUrl.pathname);

    if (!filePath) {
        sendText(response, 403, "Acesso negado.");
        return;
    }

    serveStaticFile(filePath, request, response);
});

server.listen(port, () => {
    console.log(`Renovo server ativo em http://localhost:${port}`);
    console.log(`Banco SQLite em ${databaseFile}`);
});

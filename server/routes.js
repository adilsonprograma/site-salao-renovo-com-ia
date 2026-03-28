const { URL } = require("node:url");
const { databaseFile } = require("./database");
const { getIntegrationStatus } = require("./config");
const { readJsonBody, sendJson, sendNoContent, sendText } = require("./http");
const { resolveStaticPath, serveStaticFile } = require("./static-server");
const { createAppointment, listAppointments } = require("./services/appointments");
const { processWhatsAppWebhookPayload, runAssistantTurn } = require("./services/assistant");
const { verifyWhatsAppWebhook } = require("./services/whatsapp");

function getRequestUrl(request) {
    return new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
}

function applyCorsHeaders(request, response, pathname) {
    if (!pathname.startsWith("/api/") && !pathname.startsWith("/webhooks/")) {
        return;
    }

    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Origin", request.headers.origin || "*");
}

async function handleAppointmentsCreate(request, response) {
    const payload = await readJsonBody(request);
    const result = await createAppointment(payload);

    if (!result.isValid) {
        sendJson(response, 400, {
            errors: result.errors,
            message: result.message
        });
        return;
    }

    sendJson(response, 201, {
        appointment: result.appointment,
        message: result.message,
        notification: result.notification
    });
}

async function handleAssistantChat(request, response) {
    const payload = await readJsonBody(request);
    const message = String(payload.message || "").trim();

    if (!message) {
        sendJson(response, 400, {
            message: "Envie uma mensagem para o assistente."
        });
        return;
    }

    const result = await runAssistantTurn({
        channel: "website",
        message,
        metadata: {
            phone: payload.phone || "",
            profileName: payload.name || ""
        },
        sessionId: String(payload.sessionId || "anonymous")
    });

    sendJson(response, 200, result);
}

async function routeRequest(request, response) {
    const requestUrl = getRequestUrl(request);
    applyCorsHeaders(request, response, requestUrl.pathname);

    if (request.method === "OPTIONS") {
        sendNoContent(response);
        return;
    }

    if (requestUrl.pathname === "/api/health" && request.method === "GET") {
        sendJson(response, 200, {
            databaseFile,
            integrations: getIntegrationStatus(),
            status: "ok"
        });
        return;
    }

    if (requestUrl.pathname === "/api/integrations" && request.method === "GET") {
        sendJson(response, 200, getIntegrationStatus());
        return;
    }

    if (requestUrl.pathname === "/api/appointments" && request.method === "GET") {
        sendJson(response, 200, {
            appointments: listAppointments(requestUrl.searchParams.get("limit"))
        });
        return;
    }

    if (requestUrl.pathname === "/api/appointments" && request.method === "POST") {
        await handleAppointmentsCreate(request, response);
        return;
    }

    if (requestUrl.pathname === "/api/assistant/chat" && request.method === "POST") {
        await handleAssistantChat(request, response);
        return;
    }

    if (requestUrl.pathname === "/webhooks/whatsapp" && request.method === "GET") {
        const verification = verifyWhatsAppWebhook(requestUrl.searchParams);

        if (!verification.ok) {
            sendText(response, 403, "Webhook verification failed.");
            return;
        }

        sendText(response, 200, verification.challenge);
        return;
    }

    if (requestUrl.pathname === "/webhooks/whatsapp" && request.method === "POST") {
        await readJsonBody(request)
            .then(processWhatsAppWebhookPayload)
            .then(() => sendText(response, 200, "EVENT_RECEIVED"))
            .catch((error) => {
                console.error("Falha ao processar webhook do WhatsApp:", error);
                sendJson(response, 500, {
                    message: "Nao foi possivel processar o webhook do WhatsApp."
                });
            });
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
}

module.exports = {
    routeRequest
};

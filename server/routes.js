const { URL } = require("node:url");
const {
    buildExpiredSessionCookie,
    buildSessionCookie,
    getAdminSession,
    loginAdmin,
    logoutAdmin
} = require("./auth");
const { databaseFile } = require("./database");
const { getIntegrationStatus } = require("./config");
const { readJsonBody, sendJson, sendNoContent, sendText } = require("./http");
const { areSensitiveFieldsProtected } = require("./security/encryption");
const { resolveStaticPath, serveStaticFile } = require("./static-server");
<<<<<<< HEAD
const { createAppointment, listAppointments, notifyExistingAppointment } = require("./services/appointments");
=======
const { createAppointment, getAppointments } = require("./services/appointments");
const {
    buildAuthCookie,
    buildClearCookie,
    createSession,
    invalidateSession,
    isAdminAuthenticated,
    isValidPassword
} = require("./services/admin-auth");
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
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
    response.setHeader("Access-Control-Allow-Credentials", "true");
}

function isTruthy(value) {
    return ["1", "sim", "true", "yes"].includes(String(value || "").toLowerCase());
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

async function handleAdminLogin(request, response) {
    const payload = await readJsonBody(request);
<<<<<<< HEAD
    const username = String(payload.username || "").trim();
    const password = String(payload.password || "").trim();

    if (!username || !password) {
        sendJson(response, 400, {
            message: "Usuario e senha sao obrigatorios."
        });
        return;
    }

    const result = loginAdmin(username, password);

    if (!result.success) {
        sendJson(response, 401, {
            message: result.message
=======
    const password = String(payload.password || "");

    if (!isValidPassword(password)) {
        sendJson(response, 401, {
            message: "Senha invalida para o painel operacional."
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
        });
        return;
    }

<<<<<<< HEAD
    sendJson(response, 200, {
        message: result.message
    }, {
        "Set-Cookie": buildSessionCookie(result.session.sessionId)
=======
    const token = createSession();

    sendJson(
        response,
        200,
        {
            authenticated: true,
            message: "Acesso liberado ao painel operacional."
        },
        {
            "Set-Cookie": buildAuthCookie(token)
        }
    );
}

function handleAdminSession(request, response) {
    sendJson(response, 200, {
        authenticated: isAdminAuthenticated(request)
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
    });
}

function handleAdminLogout(request, response) {
<<<<<<< HEAD
    logoutAdmin(request);

    sendJson(response, 200, {
        message: "Logout realizado com sucesso."
    }, {
        "Set-Cookie": buildExpiredSessionCookie()
    });
}

function requireAdminSessionOrReply(request, response) {
    const session = getAdminSession(request);

    if (!session) {
        sendJson(response, 401, {
            message: "Nao autenticado. Faca login para continuar."
        });
        return null;
    }

    return session;
}

function handleAdminStatus(request, response) {
    const session = requireAdminSessionOrReply(request, response);

    if (!session) {
        return;
    }

    sendJson(response, 200, {
        authenticated: true,
        user: {
            username: session.username
        }
    });
}

function handleAdminAppointmentsList(requestUrl, request, response) {
    const session = requireAdminSessionOrReply(request, response);

    if (!session) {
        return;
    }

    sendJson(response, 200, {
        appointments: listAppointments(requestUrl.searchParams.get("limit")),
        user: {
            username: session.username
        }
    });
}

async function handleAdminAppointmentNotify(request, response, appointmentId) {
    const session = requireAdminSessionOrReply(request, response);

    if (!session) {
        return;
    }

    const result = await notifyExistingAppointment(appointmentId);

    if (!result.ok) {
        sendJson(response, 404, {
            message: result.message
        });
        return;
    }

    sendJson(response, 200, {
        appointment: result.appointment,
        message: result.message,
        notification: result.notification
    });
=======
    invalidateSession(request);

    sendJson(
        response,
        200,
        {
            authenticated: false,
            message: "Sessao finalizada com sucesso."
        },
        {
            "Set-Cookie": buildClearCookie()
        }
    );
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
}

async function routeRequest(request, response) {
    const requestUrl = getRequestUrl(request);
    const pathParts = requestUrl.pathname.split("/").filter(Boolean);
    applyCorsHeaders(request, response, requestUrl.pathname);

    if (request.method === "OPTIONS") {
        sendNoContent(response);
        return;
    }

    if (requestUrl.pathname === "/api/health" && request.method === "GET") {
        sendJson(response, 200, {
            databaseFile,
            integrations: getIntegrationStatus(),
            security: {
                dataEncryptionActive: areSensitiveFieldsProtected()
            },
            status: "ok"
        });
        return;
    }

    if (requestUrl.pathname === "/api/integrations" && request.method === "GET") {
        const integrations = getIntegrationStatus();

        sendJson(response, 200, {
            ...integrations,
            security: {
                ...integrations.security,
                dataEncryptionActive: areSensitiveFieldsProtected()
            }
        });
        return;
    }

    if (requestUrl.pathname === "/api/appointments" && request.method === "GET") {
        const limit = requestUrl.searchParams.get("limit");
        const includeSensitive = isTruthy(requestUrl.searchParams.get("sensitive"));
        const canReadSensitiveData = !includeSensitive || isAdminAuthenticated(request);

        if (!canReadSensitiveData) {
            sendJson(response, 401, {
                message: "Sessao admin obrigatoria para acessar dados sensiveis."
            });
            return;
        }

        sendJson(response, 200, {
            appointments: getAppointments({ includeSensitive, limit })
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

    if (requestUrl.pathname === "/api/admin/login" && request.method === "POST") {
        await handleAdminLogin(request, response);
        return;
    }

    if (requestUrl.pathname === "/api/admin/logout" && request.method === "POST") {
        handleAdminLogout(request, response);
        return;
    }

<<<<<<< HEAD
    if (requestUrl.pathname === "/api/admin/status" && request.method === "GET") {
        handleAdminStatus(request, response);
=======
    if (requestUrl.pathname === "/api/admin/session" && request.method === "GET") {
        handleAdminSession(request, response);
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
        return;
    }

    if (requestUrl.pathname === "/api/admin/appointments" && request.method === "GET") {
<<<<<<< HEAD
        handleAdminAppointmentsList(requestUrl, request, response);
        return;
    }

    if (
        pathParts.length === 5
        && pathParts[0] === "api"
        && pathParts[1] === "admin"
        && pathParts[2] === "appointments"
        && pathParts[4] === "notify"
        && request.method === "POST"
    ) {
        await handleAdminAppointmentNotify(request, response, pathParts[3]);
=======
        if (!isAdminAuthenticated(request)) {
            sendJson(response, 401, {
                message: "Entre com a senha do painel para visualizar os agendamentos."
            });
            return;
        }

        sendJson(response, 200, {
            appointments: getAppointments({
                includeSensitive: true,
                limit: requestUrl.searchParams.get("limit")
            })
        });
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
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

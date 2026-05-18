function getApiBaseUrl() {
    if (typeof window === "undefined") {
        return "";
    }

    if (["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port !== "3000") {
        return `http://${window.location.hostname}:3000`;
    }

    return "";
}

function buildRequestUrl(pathname) {
    return `${getApiBaseUrl()}${pathname}`;
}

async function parseResponsePayload(response) {
    if (response.status === 204) {
        return {};
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json().catch(() => ({}));
    }

    const text = await response.text().catch(() => "");
    return text ? { message: text } : {};
}

async function requestJson(pathname, options = {}) {
    let response;

    try {
        response = await fetch(buildRequestUrl(pathname), options);
    } catch (error) {
        throw new Error("Nao consegui alcancar a API. Execute 'node server.js' e abra o projeto em http://localhost:3000.");
    }

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("A rota da API nao foi encontrada. Abra o projeto por http://localhost:3000 ou confirme se o servidor Node esta ativo.");
        }

        throw new Error(payload.message || "Nao foi possivel concluir a requisicao.");
    }

    return payload;
}

function postJson(pathname, payload, options = {}) {
    return requestJson(pathname, {
        method: "POST",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        body: JSON.stringify(payload)
    });
}

export function fetchIntegrations() {
    return requestJson("/api/integrations");
}

export function saveAppointment(payload) {
    return postJson("/api/appointments", payload);
}

export function sendAssistantMessage(payload) {
    return postJson("/api/assistant/chat", payload);
}

export function loginAdmin(payload) {
    return postJson("/api/admin/login", payload, {
        credentials: "include"
    });
}

export function logoutAdmin() {
    return postJson("/api/admin/logout", {}, {
        credentials: "include"
    });
}

export function fetchAdminSession() {
    return requestJson("/api/admin/status", {
        credentials: "include"
    });
}

export function fetchProtectedAppointments(limit = "25") {
    return requestJson(`/api/admin/appointments?limit=${encodeURIComponent(limit)}`, {
        credentials: "include"
    });
}

export function notifyProtectedAppointment(appointmentId) {
    return postJson(`/api/admin/appointments/${encodeURIComponent(String(appointmentId))}/notify`, {}, {
        credentials: "include"
    });
}

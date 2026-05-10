// Encapsula chamadas HTTP para manter os modulos de UI focados em comportamento.
function getApiBaseUrl() {
    if (typeof window === "undefined") {
        return "";
    }

    if (window.location.protocol === "file:") {
        return "http://localhost:3000";
    }

    const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

    // Quando a pagina esta em outro servidor local, sempre apontamos para a API Node HTTP na porta padrao.
    if (localHosts.has(window.location.hostname)) {
        if (window.location.port !== "3000") {
            const localApiUrl = new URL(window.location.origin);
            localApiUrl.port = "3000";
            return localApiUrl.origin;
        }
    }

    return "";
}

async function requestJson(url, options = {}) {
    const requestUrl = `${getApiBaseUrl()}${url}`;
    let response;

    try {
        response = await fetch(requestUrl, {
            credentials: "include",
            ...options
        });
    } catch (error) {
        throw new Error("Nao consegui alcancar a API de agendamento. Execute 'node server.js' e abra o projeto em http://localhost:3000.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("A rota da API nao foi encontrada. Abra o projeto por http://localhost:3000 ou confirme se o servidor Node esta ativo.");
        }

        throw new Error(data.message || "Nao foi possivel concluir a requisicao.");
    }

    return data;
}

export function fetchIntegrations() {
    return requestJson("/api/integrations");
}

export function fetchAppointments({ limit = 20, sensitive = false } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const searchParams = new URLSearchParams({
        limit: String(safeLimit)
    });

    if (sensitive) {
        searchParams.set("sensitive", "1");
    }

    return requestJson(`/api/appointments?${searchParams.toString()}`);
}

export function fetchAdminAppointments({ limit = 20 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    return requestJson(`/api/admin/appointments?limit=${safeLimit}`);
}

export function loginAdmin(password) {
    return requestJson("/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
    });
}

export function logoutAdmin() {
    return requestJson("/api/admin/logout", {
        method: "POST"
    });
}

export function fetchAdminSession() {
    return requestJson("/api/admin/session");
}

export function saveAppointment(payload) {
    return requestJson("/api/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}

export function sendAssistantMessage(payload) {
    return requestJson("/api/assistant/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
}

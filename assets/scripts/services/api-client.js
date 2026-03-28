// Encapsula chamadas HTTP para manter os modulos de UI focados em comportamento.
function getApiBaseUrl() {
    if (typeof window === "undefined") {
        return "";
    }

    // Quando a pagina esta em outro servidor local, sempre apontamos para a API Node HTTP na porta padrao.
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
        if (window.location.port !== "3000") {
            return `http://${window.location.hostname}:3000`;
        }
    }

    return "";
}

async function requestJson(url, options = {}) {
    const requestUrl = `${getApiBaseUrl()}${url}`;
    let response;

    try {
        response = await fetch(requestUrl, options);
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

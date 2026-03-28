const { config } = require("../config");

function normalizePhoneNumber(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.replace(/\D/g, "");
}

function isWhatsAppEnabled() {
    return config.whatsapp.enabled;
}

function buildGraphUrl(endpoint) {
    return `https://graph.facebook.com/${config.whatsapp.graphVersion}/${config.whatsapp.phoneNumberId}${endpoint}`;
}

async function sendWhatsAppTextMessage({ body, to }) {
    if (!isWhatsAppEnabled()) {
        return {
            enabled: false,
            messageId: "",
            status: "disabled"
        };
    }

    const recipient = normalizePhoneNumber(to);

    if (!recipient) {
        return {
            enabled: true,
            messageId: "",
            status: "skipped"
        };
    }

    const response = await fetch(buildGraphUrl("/messages"), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.whatsapp.accessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            text: {
                body,
                preview_url: false
            },
            to: recipient,
            type: "text"
        })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error?.message || "Falha ao enviar mensagem pelo WhatsApp Cloud API.");
    }

    return {
        enabled: true,
        messageId: payload.messages?.[0]?.id || "",
        status: "sent"
    };
}

function buildAppointmentNotification(appointment) {
    return [
        `Novo agendamento Renovo #${appointment.id}`,
        `Cliente: ${appointment.nome}`,
        `Servico: ${appointment.servico}`,
        `Data: ${appointment.dataPreferencial || "Nao informada"}`,
        `Horario: ${appointment.horarioPreferencial || "Nao informado"}`,
        `WhatsApp: ${appointment.telefone}`,
        `Origem: ${appointment.origemAgendamento}`,
        `Observacoes: ${appointment.mensagem || "Sem observacoes adicionais."}`
    ].join("\n");
}

async function notifySalonAboutAppointment(appointment) {
    if (!isWhatsAppEnabled() || !config.whatsapp.notifyTo) {
        return {
            enabled: isWhatsAppEnabled(),
            messageId: "",
            status: "disabled"
        };
    }

    try {
        return await sendWhatsAppTextMessage({
            body: buildAppointmentNotification(appointment),
            to: config.whatsapp.notifyTo
        });
    } catch (error) {
        return {
            enabled: true,
            error: error.message,
            messageId: "",
            status: "failed"
        };
    }
}

function verifyWhatsAppWebhook(searchParams) {
    if (!config.whatsapp.verifyToken) {
        return {
            challenge: "",
            ok: false
        };
    }

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge") || "";

    return {
        challenge,
        ok: mode === "subscribe" && token === config.whatsapp.verifyToken
    };
}

function extractIncomingWhatsAppMessages(payload = {}) {
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    return entries.flatMap((entry) => {
        const changes = Array.isArray(entry.changes) ? entry.changes : [];

        return changes.flatMap((change) => {
            const value = change.value || {};
            const contacts = Array.isArray(value.contacts) ? value.contacts : [];
            const messages = Array.isArray(value.messages) ? value.messages : [];

            return messages.map((message) => {
                const matchedContact = contacts.find((contact) => contact.wa_id === message.from);

                return {
                    id: message.id || "",
                    profileName: matchedContact?.profile?.name || "",
                    text: message.text?.body || "",
                    timestamp: message.timestamp || "",
                    type: message.type || "",
                    waId: message.from || ""
                };
            });
        });
    });
}

module.exports = {
    extractIncomingWhatsAppMessages,
    isWhatsAppEnabled,
    normalizePhoneNumber,
    notifySalonAboutAppointment,
    sendWhatsAppTextMessage,
    verifyWhatsAppWebhook
};

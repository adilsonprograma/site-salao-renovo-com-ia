const { createAppointment } = require("./appointments");
const { processFallbackMessage } = require("./fallback-assistant");
const { generateGeminiAssistantResponse, isGeminiEnabled } = require("./gemini");
const {
    extractIncomingWhatsAppMessages,
    normalizePhoneNumber,
    sendWhatsAppTextMessage
} = require("./whatsapp");

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const sessions = new Map();

function getSourceFromChannel(channel) {
    return channel === "whatsapp" ? "whatsapp_cloud" : "site_chat";
}

function createEmptyDraft(metadata = {}, source = "site_chat") {
    return {
        dataPreferencial: "",
        email: "",
        horarioPreferencial: "",
        mensagem: "",
        nome: metadata.profileName || "",
        origemAgendamento: source,
        servico: "",
        telefone: metadata.phone || ""
    };
}

function cleanupSessions() {
    const now = Date.now();

    sessions.forEach((session, key) => {
        if (now - session.updatedAt > SESSION_TTL_MS) {
            sessions.delete(key);
        }
    });
}

function getSessionKey({ channel, sessionId }) {
    return `${channel}:${sessionId}`;
}

function getOrCreateSession({ channel, metadata, sessionId }) {
    cleanupSessions();

    const key = getSessionKey({ channel, sessionId });
    const existingSession = sessions.get(key);

    if (existingSession) {
        existingSession.updatedAt = Date.now();
        existingSession.metadata = {
            ...existingSession.metadata,
            ...metadata
        };

        if (!existingSession.bookingDraft.telefone && metadata.phone) {
            existingSession.bookingDraft.telefone = metadata.phone;
        }

        if (!existingSession.bookingDraft.nome && metadata.profileName) {
            existingSession.bookingDraft.nome = metadata.profileName;
        }

        return existingSession;
    }

    const source = getSourceFromChannel(channel);
    const newSession = {
        bookingDraft: createEmptyDraft(metadata, source),
        createdAt: Date.now(),
        fallbackState: null,
        key,
        lastAppointmentId: 0,
        lastRoute: "general",
        metadata: {
            ...metadata
        },
        transcript: [],
        updatedAt: Date.now()
    };

    sessions.set(key, newSession);
    return newSession;
}

function appendTranscript(session, role, text) {
    session.transcript.push({ role, text });
    session.transcript = session.transcript.slice(-12);
    session.updatedAt = Date.now();
}

function mergeDraft(currentDraft, incomingDraft = {}, metadata = {}, source) {
    const merged = {
        ...currentDraft,
        ...Object.fromEntries(
            Object.entries(incomingDraft).filter(([, value]) => typeof value === "string" && value.trim())
        )
    };

    if (!merged.telefone && metadata.phone) {
        merged.telefone = metadata.phone;
    }

    if (!merged.nome && metadata.profileName) {
        merged.nome = metadata.profileName;
    }

    merged.origemAgendamento = source;
    merged.telefone = normalizePhoneNumber(merged.telefone) || merged.telefone;

    return merged;
}

function buildAssistantConfirmation(appointment) {
    return [
        `Seu pre-agendamento #${appointment.id} foi registrado.`,
        `Servico: ${appointment.servico}.`,
        `Preferencia: ${appointment.dataPreferencial || "data a combinar"} / ${appointment.horarioPreferencial || "horario a combinar"}.`,
        "A equipe vai retornar pelo WhatsApp informado."
    ].join("\n");
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function isFreshBookingIntent(message) {
    const normalized = normalizeText(message);

    return [
        "agendar",
        "agendamento",
        "novo agendamento",
        "outro agendamento",
        "marcar horario",
        "quero agendar"
    ].some((term) => normalized.includes(term));
}

function normalizeAssistantReply(result) {
    return {
        booking: result.booking || {},
        missingFields: Array.isArray(result.missingFields) ? result.missingFields : [],
        readyToSchedule: Boolean(result.readyToSchedule),
        reply: String(result.reply || "").trim(),
        route: result.route || "general"
    };
}

async function getAssistantDecision({ channel, message, metadata, session }) {
    const source = getSourceFromChannel(channel);

    if (isGeminiEnabled()) {
        try {
            return {
                provider: "gemini",
                ...normalizeAssistantReply(
                    await generateGeminiAssistantResponse({
                        channel,
                        message,
                        metadata,
                        session
                    })
                )
            };
        } catch (error) {
            console.error("Falha na integracao com Gemini. Caindo para o modo local.", error);
        }
    }

    return {
        provider: "fallback",
        ...normalizeAssistantReply(
            processFallbackMessage({
                message,
                metadata,
                session,
                source
            })
        )
    };
}

async function runAssistantTurn({ channel, message, metadata = {}, sessionId }) {
    const session = getOrCreateSession({ channel, metadata, sessionId });
    const source = getSourceFromChannel(channel);

    if (session.lastAppointmentId && isFreshBookingIntent(message)) {
        session.lastAppointmentId = 0;
    }

    appendTranscript(session, "user", message);

    const decision = await getAssistantDecision({
        channel,
        message,
        metadata,
        session
    });

    session.lastRoute = decision.route;
    session.bookingDraft = mergeDraft(session.bookingDraft, decision.booking, metadata, source);

    let reply = decision.reply || "Posso te ajudar com agendamento, cor ou tendencias.";
    let appointment = null;
    let notification = null;

    if (decision.readyToSchedule && !session.lastAppointmentId) {
        const creation = await createAppointment(session.bookingDraft);

        if (creation.isValid) {
            appointment = creation.appointment;
            notification = creation.notification;
            session.lastAppointmentId = appointment.id;
            session.bookingDraft = createEmptyDraft(metadata, source);
            session.fallbackState = null;
            reply = `${reply}\n\n${buildAssistantConfirmation(appointment)}`.trim();
        }
    }

    appendTranscript(session, "assistant", reply);

    return {
        appointment,
        notification,
        provider: decision.provider,
        reply
    };
}

async function processWhatsAppWebhookPayload(payload) {
    const incomingMessages = extractIncomingWhatsAppMessages(payload);
    const results = [];

    for (const message of incomingMessages) {
        if (message.type !== "text" || !message.text) {
            const unsupportedReply = "Consigo te atender melhor por texto. Me diga o servico que voce quer agendar ou a duvida sobre cor e corte.";
            const delivery = await sendWhatsAppTextMessage({
                body: unsupportedReply,
                to: message.waId
            });

            results.push({
                appointment: null,
                delivery,
                incomingMessageId: message.id,
                reply: unsupportedReply
            });

            continue;
        }

        const turn = await runAssistantTurn({
            channel: "whatsapp",
            message: message.text,
            metadata: {
                phone: message.waId,
                profileName: message.profileName
            },
            sessionId: message.waId
        });

        const delivery = await sendWhatsAppTextMessage({
            body: turn.reply,
            to: message.waId
        });

        results.push({
            appointment: turn.appointment,
            delivery,
            incomingMessageId: message.id,
            provider: turn.provider,
            reply: turn.reply
        });
    }

    return results;
}

module.exports = {
    processWhatsAppWebhookPayload,
    runAssistantTurn
};

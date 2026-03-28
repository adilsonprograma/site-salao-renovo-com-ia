// Centraliza todas as variaveis de ambiente para facilitar configuracao e manutencao.
function readEnv(name, fallback = "") {
    const value = process.env[name];

    if (typeof value !== "string") {
        return fallback;
    }

    return value.trim() || fallback;
}

function readNumberEnv(name, fallback) {
    const value = Number(process.env[name]);

    return Number.isFinite(value) && value > 0 ? value : fallback;
}

const geminiApiKey = readEnv("GEMINI_API_KEY");
const whatsappAccessToken = readEnv("WHATSAPP_ACCESS_TOKEN");
const whatsappPhoneNumberId = readEnv("WHATSAPP_PHONE_NUMBER_ID");

const config = {
    appName: "Renovo Cabeleireiros",
    port: readNumberEnv("PORT", 3000),
    gemini: {
        apiKey: geminiApiKey,
        apiVersion: readEnv("GEMINI_API_VERSION", "v1beta"),
        model: readEnv("GEMINI_MODEL", "gemini-2.5-flash"),
        enabled: Boolean(geminiApiKey)
    },
    whatsapp: {
        accessToken: whatsappAccessToken,
        graphVersion: readEnv("WHATSAPP_GRAPH_VERSION", "v23.0"),
        notifyTo: readEnv("WHATSAPP_NOTIFY_TO"),
        phoneNumberId: whatsappPhoneNumberId,
        verifyToken: readEnv("WHATSAPP_VERIFY_TOKEN"),
        enabled: Boolean(whatsappAccessToken && whatsappPhoneNumberId)
    }
};

function getIntegrationStatus() {
    return {
        gemini: {
            configured: config.gemini.enabled,
            model: config.gemini.model
        },
        whatsapp: {
            configured: config.whatsapp.enabled,
            hasAdminRecipient: Boolean(config.whatsapp.notifyTo),
            webhookConfigured: Boolean(config.whatsapp.enabled && config.whatsapp.verifyToken),
            phoneNumberId: config.whatsapp.phoneNumberId || ""
        }
    };
}

module.exports = {
    config,
    getIntegrationStatus
};

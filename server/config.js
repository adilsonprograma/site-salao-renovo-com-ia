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
    admin: {
        panelPassword: readEnv("ADMIN_PANEL_PASSWORD", "0000"),
        sessionTtlHours: readNumberEnv("ADMIN_SESSION_TTL_HOURS", 8)
    },
    security: {
        dataEncryptionKey: readEnv("DATA_ENCRYPTION_KEY"),
        dataEncryptionKeyFile: readEnv("DATA_ENCRYPTION_KEY_FILE"),
        dataEncryptionSalt: readEnv("DATA_ENCRYPTION_SALT", "renovo-coloria")
    },
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
        },
        security: {
            dataEncryptionConfigured: true,
            dataEncryptionKeySource: config.security.dataEncryptionKey
                ? "env"
                : (config.security.dataEncryptionKeyFile ? "custom_file" : "managed_file")
        },
        admin: {
            panelEnabled: true,
            sessionTtlHours: config.admin.sessionTtlHours
        }
    };
}

module.exports = {
    config,
    getIntegrationStatus
};

import os


def read_env(name, fallback=""):
    value = os.getenv(name)
    if not isinstance(value, str):
        return fallback
    return value.strip() or fallback


def read_number_env(name, fallback):
    raw_value = os.getenv(name, "")

    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return fallback

    return value if value > 0 else fallback


gemini_api_key = read_env("GEMINI_API_KEY")
whatsapp_access_token = read_env("WHATSAPP_ACCESS_TOKEN")
whatsapp_phone_number_id = read_env("WHATSAPP_PHONE_NUMBER_ID")

config = {
    "appName": "Renovo Cabeleireiros",
    "port": read_number_env("PORT", 3000),
    "gemini": {
        "apiKey": gemini_api_key,
        "apiVersion": read_env("GEMINI_API_VERSION", "v1beta"),
        "model": read_env("GEMINI_MODEL", "gemini-2.5-flash"),
        "enabled": bool(gemini_api_key),
    },
    "whatsapp": {
        "accessToken": whatsapp_access_token,
        "graphVersion": read_env("WHATSAPP_GRAPH_VERSION", "v23.0"),
        "notifyTo": read_env("WHATSAPP_NOTIFY_TO"),
        "phoneNumberId": whatsapp_phone_number_id,
        "verifyToken": read_env("WHATSAPP_VERIFY_TOKEN"),
        "enabled": bool(whatsapp_access_token and whatsapp_phone_number_id),
    },
}


def get_integration_status():
    return {
        "gemini": {
            "configured": config["gemini"]["enabled"],
            "model": config["gemini"]["model"],
        },
        "whatsapp": {
            "configured": config["whatsapp"]["enabled"],
            "hasAdminRecipient": bool(config["whatsapp"]["notifyTo"]),
            "webhookConfigured": bool(
                config["whatsapp"]["enabled"] and config["whatsapp"]["verifyToken"]
            ),
            "phoneNumberId": config["whatsapp"]["phoneNumberId"] or "",
        },
    }

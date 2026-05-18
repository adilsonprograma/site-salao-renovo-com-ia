const crypto = require("node:crypto");
const { config } = require("./config");

const sessions = new Map();

function hasSessionExpired(session) {
    return Date.now() - session.timestamp > config.admin.sessionDurationMs;
}

function cleanupExpiredSessions() {
    sessions.forEach((session, sessionId) => {
        if (hasSessionExpired(session)) {
            sessions.delete(sessionId);
        }
    });
}

function createSession(username) {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const session = {
        sessionId,
        timestamp: Date.now(),
        token: crypto.randomBytes(16).toString("hex"),
        username
    };

    sessions.set(sessionId, session);
    return session;
}

function parseCookieHeader(cookieHeader = "") {
    return cookieHeader
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .reduce((cookies, item) => {
            const separatorIndex = item.indexOf("=");

            if (separatorIndex === -1) {
                return cookies;
            }

            const key = item.slice(0, separatorIndex).trim();
            const value = item.slice(separatorIndex + 1).trim();

            if (key) {
                cookies[key] = value;
            }

            return cookies;
        }, {});
}

function getSessionIdFromRequest(request) {
    const cookies = parseCookieHeader(request.headers.cookie || "");
    return cookies[config.admin.sessionCookieName] || "";
}

function getAdminSession(request) {
    cleanupExpiredSessions();

    const sessionId = getSessionIdFromRequest(request);

    if (!sessionId) {
        return null;
    }

    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    if (hasSessionExpired(session)) {
        sessions.delete(sessionId);
        return null;
    }

    session.timestamp = Date.now();
    return session;
}

function loginAdmin(username, password) {
    if (username !== config.admin.username || password !== config.admin.password) {
        return {
            message: "Usuario ou senha incorretos.",
            success: false
        };
    }

    const session = createSession(username);

    return {
        message: "Login realizado com sucesso!",
        session,
        success: true
    };
}

function logoutAdmin(request) {
    const sessionId = getSessionIdFromRequest(request);

    if (sessionId) {
        sessions.delete(sessionId);
    }
}

function buildSessionCookie(sessionId) {
    return [
        `${config.admin.sessionCookieName}=${sessionId}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        `Max-Age=${Math.floor(config.admin.sessionDurationMs / 1000)}`
    ].join("; ");
}

function buildExpiredSessionCookie() {
    return [
        `${config.admin.sessionCookieName}=`,
        "Path=/",
        "HttpOnly",
        "SameSite=Strict",
        "Expires=Thu, 01 Jan 1970 00:00:00 UTC"
    ].join("; ");
}

module.exports = {
    buildExpiredSessionCookie,
    buildSessionCookie,
    getAdminSession,
    loginAdmin,
    logoutAdmin
};

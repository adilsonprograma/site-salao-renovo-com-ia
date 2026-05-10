const crypto = require("node:crypto");
const { config } = require("../config");

const SESSION_COOKIE_NAME = "renovo_admin_session";
const sessions = new Map();
const SESSION_TTL_MS = Math.max(1, Number(config.admin.sessionTtlHours) || 8) * 60 * 60 * 1000;

function cleanupExpiredSessions() {
    const now = Date.now();

    sessions.forEach((session, token) => {
        if (session.expiresAt <= now) {
            sessions.delete(token);
        }
    });
}

function parseCookies(rawCookieHeader = "") {
    return String(rawCookieHeader)
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .reduce((accumulator, cookiePart) => {
            const separatorIndex = cookiePart.indexOf("=");

            if (separatorIndex === -1) {
                return accumulator;
            }

            const key = cookiePart.slice(0, separatorIndex).trim();
            const value = cookiePart.slice(separatorIndex + 1).trim();

            accumulator[key] = decodeURIComponent(value);
            return accumulator;
        }, {});
}

function getCookieBaseAttributes() {
    return [
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
    ].join("; ");
}

function buildAuthCookie(token) {
    return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; ${getCookieBaseAttributes()}`;
}

function buildClearCookie() {
    return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function safeCompare(left, right) {
    const leftBuffer = Buffer.from(String(left || ""), "utf-8");
    const rightBuffer = Buffer.from(String(right || ""), "utf-8");

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isValidPassword(password) {
    return safeCompare(password, config.admin.panelPassword);
}

function createSession() {
    cleanupExpiredSessions();

    const token = crypto.randomBytes(24).toString("base64url");
    const now = Date.now();

    sessions.set(token, {
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS
    });

    return token;
}

function getSessionFromRequest(request) {
    cleanupExpiredSessions();

    const cookies = parseCookies(request.headers?.cookie || "");
    const token = cookies[SESSION_COOKIE_NAME];

    if (!token) {
        return null;
    }

    const session = sessions.get(token);

    if (!session) {
        return null;
    }

    if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
    }

    session.expiresAt = Date.now() + SESSION_TTL_MS;
    return {
        token,
        ...session
    };
}

function isAdminAuthenticated(request) {
    return Boolean(getSessionFromRequest(request));
}

function invalidateSession(request) {
    const session = getSessionFromRequest(request);

    if (!session?.token) {
        return false;
    }

    sessions.delete(session.token);
    return true;
}

module.exports = {
    buildAuthCookie,
    buildClearCookie,
    createSession,
    invalidateSession,
    isAdminAuthenticated,
    isValidPassword
};

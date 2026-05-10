const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const ENCRYPTION_PREFIX = "enc:v1";
const GENERATED_KEY_FILE_NAME = ".renovo-data.key";

let cachedKey = null;

function ensureDataDirectory() {
    const dataDirectory = path.join(process.cwd(), "data");
    fs.mkdirSync(dataDirectory, { recursive: true });
    return dataDirectory;
}

function getKeyFilePath() {
    if (config.security.dataEncryptionKeyFile) {
        return path.resolve(config.security.dataEncryptionKeyFile);
    }

    return path.join(ensureDataDirectory(), GENERATED_KEY_FILE_NAME);
}

function createAndPersistKey(filePath) {
    const key = crypto.randomBytes(32);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, key.toString("base64"), { encoding: "utf-8", mode: 0o600 });
    return key;
}

function readPersistedKey(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return createAndPersistKey(filePath);
        }

        const rawValue = fs.readFileSync(filePath, "utf-8").trim();
        const maybeBuffer = Buffer.from(rawValue, "base64");

        if (maybeBuffer.length === 32) {
            return maybeBuffer;
        }

        return crypto
            .createHash("sha256")
            .update(rawValue)
            .digest();
    } catch (error) {
        console.error("Falha ao carregar chave local de criptografia:", error);
        return null;
    }
}

function resolveEncryptionKey() {
    if (cachedKey) {
        return cachedKey;
    }

    if (config.security.dataEncryptionKey) {
        cachedKey = crypto
            .createHash("sha256")
            .update(config.security.dataEncryptionKey + config.security.dataEncryptionSalt)
            .digest();
        return cachedKey;
    }

    cachedKey = readPersistedKey(getKeyFilePath());
    return cachedKey;
}

function isEncryptedValue(value) {
    return typeof value === "string" && value.startsWith(`${ENCRYPTION_PREFIX}:`);
}

function encryptText(value) {
    if (!value) {
        return "";
    }

    const key = resolveEncryptionKey();

    if (!key) {
        return String(value);
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encryptedBuffer = Buffer.concat([cipher.update(String(value), "utf-8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
        ENCRYPTION_PREFIX,
        iv.toString("base64url"),
        authTag.toString("base64url"),
        encryptedBuffer.toString("base64url")
    ].join(":");
}

function decryptText(value) {
    if (!isEncryptedValue(value)) {
        return String(value || "");
    }

    const key = resolveEncryptionKey();

    if (!key) {
        return "[dado protegido]";
    }

    const [, , ivText, authTagText, encryptedText] = value.split(":");

    try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
        decipher.setAuthTag(Buffer.from(authTagText, "base64url"));

        return Buffer.concat([
            decipher.update(Buffer.from(encryptedText, "base64url")),
            decipher.final()
        ]).toString("utf-8");
    } catch (error) {
        console.error("Falha ao descriptografar valor sensivel:", error);
        return "[dado protegido]";
    }
}

function areSensitiveFieldsProtected() {
    return Boolean(resolveEncryptionKey());
}

module.exports = {
    areSensitiveFieldsProtected,
    decryptText,
    encryptText,
    isEncryptedValue
};

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { decryptText, encryptText } = require("./security/encryption");

const dataDirectory = path.join(process.cwd(), "data");
const databaseFile = process.env.DATABASE_FILE
    ? path.resolve(process.env.DATABASE_FILE)
    : path.join(dataDirectory, "appointments.db");
const databaseDirectory = path.dirname(databaseFile);

fs.mkdirSync(dataDirectory, { recursive: true });
fs.mkdirSync(databaseDirectory, { recursive: true });

const database = new DatabaseSync(databaseFile);

database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        preferred_date TEXT,
        preferred_time TEXT,
        cep TEXT,
        street TEXT,
        neighborhood TEXT,
        city_state TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'site_form',
        status TEXT NOT NULL DEFAULT 'novo',
        created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_created_at
    ON appointments (created_at DESC);
`);

const insertAppointmentStatement = database.prepare(`
    INSERT INTO appointments (
        client_name,
        email,
        phone,
        service,
        preferred_date,
        preferred_time,
        cep,
        street,
        neighborhood,
        city_state,
        subject,
        message,
        source,
        status,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listAppointmentsStatement = database.prepare(`
    SELECT
        id,
        client_name AS nome,
        email,
        phone AS telefone,
        service AS servico,
        preferred_date AS dataPreferencial,
        preferred_time AS horarioPreferencial,
        cep,
        street AS logradouro,
        neighborhood AS bairro,
        city_state AS localidade,
        subject AS assunto,
        message AS mensagem,
        source AS origemAgendamento,
        status,
        created_at AS criadoEm
    FROM appointments
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT ?
`);

function saveAppointment(appointment) {
    const createdAt = new Date().toISOString();
    const encryptedAppointment = {
        ...appointment,
        assunto: encryptText(appointment.assunto),
        bairro: encryptText(appointment.bairro),
        cep: encryptText(appointment.cep),
        dataPreferencial: encryptText(appointment.dataPreferencial),
        email: encryptText(appointment.email),
        horarioPreferencial: encryptText(appointment.horarioPreferencial),
        localidade: encryptText(appointment.localidade),
        logradouro: encryptText(appointment.logradouro),
        mensagem: encryptText(appointment.mensagem),
        nome: encryptText(appointment.nome),
        servico: encryptText(appointment.servico),
        telefone: encryptText(appointment.telefone)
    };

    const result = insertAppointmentStatement.run(
        encryptedAppointment.nome,
        encryptedAppointment.email,
        encryptedAppointment.telefone,
        encryptedAppointment.servico,
        encryptedAppointment.dataPreferencial,
        encryptedAppointment.horarioPreferencial,
        encryptedAppointment.cep,
        encryptedAppointment.logradouro,
        encryptedAppointment.bairro,
        encryptedAppointment.localidade,
        encryptedAppointment.assunto,
        encryptedAppointment.mensagem,
        encryptedAppointment.origemAgendamento,
        "novo",
        createdAt
    );

    return {
        id: Number(result.lastInsertRowid),
        ...appointment,
        status: "novo",
        criadoEm: createdAt
    };
}

function decodeAppointmentRow(row) {
    return {
        ...row,
        assunto: decryptText(row.assunto),
        bairro: decryptText(row.bairro),
        cep: decryptText(row.cep),
        dataPreferencial: decryptText(row.dataPreferencial),
        email: decryptText(row.email),
        horarioPreferencial: decryptText(row.horarioPreferencial),
        localidade: decryptText(row.localidade),
        logradouro: decryptText(row.logradouro),
        mensagem: decryptText(row.mensagem),
        nome: decryptText(row.nome),
        servico: decryptText(row.servico),
        telefone: decryptText(row.telefone)
    };
}

function listAppointments(limit = 25) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 100));

    return listAppointmentsStatement
        .all(safeLimit)
        .map((row) => decodeAppointmentRow(row))
        .map((row) => ({
            ...row,
            id: Number(row.id)
        }));
}

module.exports = {
    databaseFile,
    listAppointments,
    saveAppointment
};

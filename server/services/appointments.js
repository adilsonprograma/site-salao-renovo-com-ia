const { config } = require("../config");
const { getAppointmentById, saveAppointment, listAppointments: listAppointmentsFromDatabase } = require("../database");
const { validateAppointment } = require("../validation");
const { notifySalonAboutAppointment } = require("./whatsapp");

function buildDefaultMessage(appointment) {
    return [
        `Nome: ${appointment.nome || "Nao informado"}`,
        `WhatsApp: ${appointment.telefone || "Nao informado"}`,
        `Servico: ${appointment.servico || "Nao informado"}`,
        `Data preferencial: ${appointment.dataPreferencial || "Nao informada"}`,
        `Horario preferencial: ${appointment.horarioPreferencial || "Nao informado"}`,
        `Observacoes: ${appointment.mensagem || "Sem observacoes adicionais."}`
    ].join("\n");
}

async function createAppointment(payload) {
    const validation = validateAppointment(payload);

    if (!validation.isValid) {
        return {
            errors: validation.errors,
            isValid: false,
            message: "Os dados do agendamento estao incompletos."
        };
    }

    const appointmentInput = {
        ...validation.appointment,
        mensagem: validation.appointment.mensagem || buildDefaultMessage(validation.appointment)
    };

    const appointment = saveAppointment(appointmentInput);
    const notification = await notifySalonAboutAppointment(appointment);

    return {
        appointment,
        isValid: true,
        message: "Agendamento salvo com sucesso.",
        notification
    };
}

async function notifyExistingAppointment(appointmentId) {
    const appointment = getAppointmentById(appointmentId);

    if (!appointment) {
        return {
            appointment: null,
            message: "Agendamento nao encontrado.",
            ok: false
        };
    }

    return {
        appointment,
        message: "Tentativa de reenvio concluida.",
        notification: await notifySalonAboutAppointment(appointment),
        ok: true
    };
}

function maskName(name) {
    const normalized = String(name || "").trim();

    if (!normalized) {
        return "";
    }

    const parts = normalized.split(/\s+/);

    if (parts.length === 1) {
        return `${parts[0].slice(0, 1)}***`;
    }

    return `${parts[0]} ${parts[1].slice(0, 1)}.`;
}

function maskPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (digits.length < 4) {
        return "***";
    }

    return `***${digits.slice(-4)}`;
}

function redactAppointment(appointment) {
    return {
        ...appointment,
        mensagem: "[protegido]",
        nome: maskName(appointment.nome),
        telefone: maskPhone(appointment.telefone)
    };
}

function getAppointments({ includeSensitive = false, limit = 25 } = {}) {
    const appointments = listAppointmentsFromDatabase(limit);

    if (includeSensitive) {
        return appointments;
    }

    return appointments.map((appointment) => redactAppointment(appointment));
}

module.exports = {
    createAppointment,
    getAppointments,
    listAppointments: listAppointmentsFromDatabase,
    notifyExistingAppointment
};

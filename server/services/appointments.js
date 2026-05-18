const { config } = require("../config");
<<<<<<< HEAD
const { getAppointmentById, saveAppointment, listAppointments } = require("../database");
=======
const { saveAppointment, listAppointments: listAppointmentsFromDatabase } = require("../database");
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
const { validateAppointment } = require("../validation");
const { notifySalonAboutAppointment } = require("./whatsapp");

function buildDefaultSubject(service) {
    return `Solicitacao de agendamento - ${service || config.appName}`;
}

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
        assunto: validation.appointment.assunto || buildDefaultSubject(validation.appointment.servico),
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

<<<<<<< HEAD
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

module.exports = {
    createAppointment,
    listAppointments,
    notifyExistingAppointment
=======
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

function maskEmail(email) {
    const normalized = String(email || "").trim();

    if (!normalized || !normalized.includes("@")) {
        return "";
    }

    const [localPart, domain] = normalized.split("@");
    const visibleStart = localPart.slice(0, 2);
    return `${visibleStart}***@${domain}`;
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
        bairro: "[protegido]",
        cep: "[protegido]",
        email: maskEmail(appointment.email),
        localidade: "[protegido]",
        logradouro: "[protegido]",
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
    getAppointments
>>>>>>> c6fdef57c6a1eef1dc77f3e22eb77f1e5f0862f7
};

const { config } = require("../config");
const { saveAppointment, listAppointments } = require("../database");
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

module.exports = {
    createAppointment,
    listAppointments
};

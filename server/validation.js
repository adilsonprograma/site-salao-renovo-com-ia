function cleanText(value, maxLength = 255) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanMultilineText(value, maxLength = 2000) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().slice(0, maxLength);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isEmailRequired(source) {
    return !["site_chat", "whatsapp_cloud", "assistant_api"].includes(source);
}

function validateAppointment(payload = {}) {
    const appointment = {
        nome: cleanText(payload.nome, 140),
        email: cleanText(payload.email, 160),
        telefone: cleanText(payload.telefone, 40),
        servico: cleanText(payload.servico, 140),
        dataPreferencial: cleanText(payload.dataPreferencial, 80),
        horarioPreferencial: cleanText(payload.horarioPreferencial, 80),
        cep: cleanText(payload.cep, 16),
        logradouro: cleanText(payload.logradouro, 160),
        bairro: cleanText(payload.bairro, 120),
        localidade: cleanText(payload.localidade, 120),
        assunto: cleanText(payload.assunto, 160),
        mensagem: cleanMultilineText(payload.mensagem, 2400),
        origemAgendamento: cleanText(payload.origemAgendamento, 40) || "site_form"
    };

    if (!appointment.assunto) {
        appointment.assunto = `Solicitacao de agendamento - ${appointment.servico || "Renovo Cabeleireiros"}`;
    }

    if (!appointment.mensagem) {
        appointment.mensagem = "Sem observacoes adicionais.";
    }

    const errors = [];

    if (!appointment.nome) {
        errors.push("Nome completo e obrigatorio.");
    }

    if (appointment.email && !isValidEmail(appointment.email)) {
        errors.push("E-mail invalido.");
    }

    if (isEmailRequired(appointment.origemAgendamento) && !appointment.email) {
        errors.push("E-mail valido e obrigatorio.");
    }

    if (!appointment.telefone) {
        errors.push("Telefone ou WhatsApp e obrigatorio.");
    }

    if (!appointment.servico) {
        errors.push("Servico desejado e obrigatorio.");
    }

    return {
        appointment,
        errors,
        isValid: errors.length === 0
    };
}

module.exports = {
    validateAppointment
};

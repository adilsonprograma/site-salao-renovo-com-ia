// contact-form.js — formulario de agendamento
// Funciona em dois modos:
//   - GitHub Pages (estatico): redireciona para WhatsApp
//   - localhost: salva via API

function setStatus(element, message, isError = false) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.toggle("error", isError);
}

function buildPayload(fields) {
    const service = fields.servico.value.trim();

    return {
        nome: fields.nome.value.trim(),
        telefone: fields.telefone.value.trim(),
        servico: service,
        dataPreferencial: fields.dataPreferencial.value.trim(),
        horarioPreferencial: fields.horarioPreferencial.value.trim(),
        mensagem: fields.mensagem.value.trim() || "Sem observacoes adicionais.",
        origemAgendamento: fields.origemAgendamento.value.trim() || "site_form"
    };
}

function validatePayload(payload, fields) {
    if (!payload.nome) {
        return {
            field: fields.nome,
            message: "Informe o nome completo do cliente."
        };
    }

    if (!payload.telefone) {
        return {
            field: fields.telefone,
            message: "Informe um WhatsApp ou telefone para retorno."
        };
    }

    if (!payload.servico) {
        return {
            field: fields.servico,
            message: "Informe o servico desejado para o agendamento."
        };
    }

    return {
        field: null,
        message: ""
    };
}

function resetFormState(form, fields, formStatus) {
    form.reset();
    fields.origemAgendamento.value = "site_form";
    setStatus(formStatus, "");
}

export function initContactForm() {
    const form = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    if (!form || !formStatus) {
        return;
    }

    const fields = {
        nome: document.getElementById("nome"),
        telefone: document.getElementById("telefone"),
        servico: document.getElementById("servico"),
        dataPreferencial: document.getElementById("dataPreferencial"),
        horarioPreferencial: document.getElementById("horarioPreferencial"),
        mensagem: document.getElementById("mensagem"),
        origemAgendamento: document.getElementById("origemAgendamento")
    };

    const submitButton = form.querySelector(".btn-submit");

    if (Object.values(fields).some((field) => !field) || !submitButton) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = buildPayload(fields);
        const validation = validatePayload(payload, fields);

        if (validation.message) {
            setStatus(formStatus, validation.message, true);
            validation.field?.focus?.();
            return;
        }

        const isLocalServer = window.location.hostname === "localhost"
            || window.location.hostname === "127.0.0.1";

        if (isLocalServer) {
            // Modo com servidor: salvar via API
            try {
                submitButton.disabled = true;
                setStatus(formStatus, "Salvando agendamento no banco...");

                const { saveAppointment } = await import("../services/api-client.js");
                const result = await saveAppointment(payload);
                const notificationText = result.notification?.status === "sent"
                    ? " Notificacao enviada ao WhatsApp configurado."
                    : "";

                resetFormState(form, fields, formStatus);
                setStatus(formStatus, `Agendamento #${result.appointment.id} salvo com sucesso.${notificationText}`);
            } catch (error) {
                console.error("Erro ao salvar agendamento:", error);
                setStatus(formStatus, error.message || "Falha ao salvar o agendamento.", true);
            } finally {
                submitButton.disabled = false;
            }
        } else {
            // Modo estatico (GitHub Pages): montar mensagem WhatsApp
            const linhas = [
                `*Novo agendamento via site*`,
                `Nome: ${payload.nome}`,
                `Telefone: ${payload.telefone}`,
                `Servico: ${payload.servico}`,
                payload.dataPreferencial ? `Data: ${payload.dataPreferencial}` : "",
                payload.horarioPreferencial ? `Horario: ${payload.horarioPreferencial}` : "",
                payload.mensagem && payload.mensagem !== "Sem observacoes adicionais."
                    ? `Obs: ${payload.mensagem}` : "",
            ].filter(Boolean).join("\n");

            const whatsappUrl = `https://wa.me/5588993294936?text=${encodeURIComponent(linhas)}`;
            window.open(whatsappUrl, "_blank");

            resetFormState(form, fields, formStatus);
            setStatus(formStatus, "Redirecionando para o WhatsApp com seus dados... ✅");
        }
    });

    form.addEventListener("reset", () => {
        fields.origemAgendamento.value = "site_form";
        setStatus(formStatus, "");
    });
}


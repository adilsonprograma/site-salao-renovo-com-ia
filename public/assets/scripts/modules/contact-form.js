import { saveAppointment } from "../services/api-client.js";

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setStatus(element, message, isError = false) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.toggle("error", isError);
}

function formatCep(digits) {
    if (digits.length <= 5) {
        return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

function clearAddressFields(fields) {
    fields.logradouro.value = "";
    fields.bairro.value = "";
    fields.localidade.value = "";
}

function buildPayload(fields) {
    const service = fields.servico.value.trim();

    return {
        nome: fields.nome.value.trim(),
        email: fields.email.value.trim(),
        telefone: fields.telefone.value.trim(),
        servico: service,
        dataPreferencial: fields.dataPreferencial.value.trim(),
        horarioPreferencial: fields.horarioPreferencial.value.trim(),
        cep: fields.cep.value.trim(),
        logradouro: fields.logradouro.value.trim(),
        bairro: fields.bairro.value.trim(),
        localidade: fields.localidade.value.trim(),
        assunto: fields.assunto.value.trim() || `Solicitacao de agendamento - ${service || "Renovo Cabeleireiros"}`,
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

    if (!payload.email || !isValidEmail(payload.email)) {
        return {
            field: fields.email,
            message: "Informe um e-mail valido para contato."
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

async function searchAddress(cep, fields, cepStatus) {
    try {
        setStatus(cepStatus, "Buscando endereco...");

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!response.ok) {
            throw new Error(`Falha HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.erro) {
            setStatus(cepStatus, "CEP nao encontrado.", true);
            clearAddressFields(fields);
            return;
        }

        fields.logradouro.value = data.logradouro ?? "";
        fields.bairro.value = data.bairro ?? "";
        fields.localidade.value = [data.localidade ?? "", data.uf ?? ""].filter(Boolean).join(" - ");

        setStatus(cepStatus, "Endereco preenchido automaticamente.");
    } catch (error) {
        console.error("Erro ao consultar CEP:", error);
        setStatus(cepStatus, "Nao foi possivel consultar o CEP agora.", true);
        clearAddressFields(fields);
    }
}

function resetFormState(form, fields, cepStatus, formStatus) {
    form.reset();
    clearAddressFields(fields);
    fields.origemAgendamento.value = "site_form";
    setStatus(cepStatus, "");
    setStatus(formStatus, "");
}

export function initContactForm() {
    const form = document.getElementById("contactForm");
    const cepStatus = document.getElementById("cepStatus");
    const formStatus = document.getElementById("formStatus");

    if (!form || !cepStatus || !formStatus) {
        return;
    }

    const fields = {
        assunto: document.getElementById("assunto"),
        bairro: document.getElementById("bairro"),
        cep: document.getElementById("cep"),
        dataPreferencial: document.getElementById("dataPreferencial"),
        email: document.getElementById("email"),
        horarioPreferencial: document.getElementById("horarioPreferencial"),
        localidade: document.getElementById("localidade"),
        logradouro: document.getElementById("logradouro"),
        mensagem: document.getElementById("mensagem"),
        nome: document.getElementById("nome"),
        origemAgendamento: document.getElementById("origemAgendamento"),
        servico: document.getElementById("servico"),
        telefone: document.getElementById("telefone")
    };

    const submitButton = form.querySelector(".btn-submit");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (window.location.protocol === "file:") {
            setStatus(formStatus, "Para salvar no banco, execute 'npm start' e abra o projeto em http://localhost:3000.", true);
            return;
        }

        const payload = buildPayload(fields);
        const validation = validatePayload(payload, fields);

        if (validation.message) {
            setStatus(formStatus, validation.message, true);
            validation.field?.focus?.();
            return;
        }

        try {
            submitButton.disabled = true;
            setStatus(formStatus, "Salvando agendamento no banco...");

            const result = await saveAppointment(payload);
            const notificationText = result.notification?.status === "sent"
                ? " Notificacao enviada ao WhatsApp configurado."
                : "";

            resetFormState(form, fields, cepStatus, formStatus);
            setStatus(formStatus, `Agendamento #${result.appointment.id} salvo com sucesso.${notificationText}`);
        } catch (error) {
            console.error("Erro ao salvar agendamento:", error);
            setStatus(formStatus, error.message || "Falha ao salvar o agendamento.", true);
        } finally {
            submitButton.disabled = false;
        }
    });

    form.addEventListener("reset", () => {
        clearAddressFields(fields);
        fields.origemAgendamento.value = "site_form";
        setStatus(cepStatus, "");
        setStatus(formStatus, "");
    });

    fields.cep.addEventListener("input", (event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
        event.target.value = formatCep(digits);

        if (digits.length < 8) {
            setStatus(cepStatus, "");
            clearAddressFields(fields);
        }
    });

    fields.cep.addEventListener("blur", (event) => {
        const digits = event.target.value.replace(/\D/g, "");

        if (!digits) {
            setStatus(cepStatus, "");
            clearAddressFields(fields);
            return;
        }

        if (digits.length !== 8) {
            setStatus(cepStatus, "CEP invalido. Digite 8 numeros.", true);
            clearAddressFields(fields);
            return;
        }

        searchAddress(digits, fields, cepStatus);
    });
}

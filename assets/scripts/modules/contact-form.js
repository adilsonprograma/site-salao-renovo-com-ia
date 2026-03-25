function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function initContactForm() {
    const form = document.getElementById("contactForm");
    const cepInput = document.getElementById("cep");
    const cepStatus = document.getElementById("cepStatus");
    const formStatus = document.getElementById("formStatus");
    const nameInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("telefone");
    const serviceInput = document.getElementById("servico");
    const preferredDateInput = document.getElementById("dataPreferencial");
    const preferredTimeInput = document.getElementById("horarioPreferencial");
    const sourceInput = document.getElementById("origemAgendamento");
    const subjectInput = document.getElementById("assunto");
    const messageInput = document.getElementById("mensagem");
    const logradouroInput = document.getElementById("logradouro");
    const bairroInput = document.getElementById("bairro");
    const localidadeInput = document.getElementById("localidade");
    const submitButton = form?.querySelector(".btn-submit");

    if (!form || !cepInput) {
        return;
    }

    const setStatus = (element, message, isError = false) => {
        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.toggle("error", isError);
    };

    const clearAddress = () => {
        if (logradouroInput) {
            logradouroInput.value = "";
        }

        if (bairroInput) {
            bairroInput.value = "";
        }

        if (localidadeInput) {
            localidadeInput.value = "";
        }
    };

    const resetBookingSource = () => {
        if (sourceInput) {
            sourceInput.value = "site_form";
        }
    };

    const setCepStatus = (message, isError = false) => {
        setStatus(cepStatus, message, isError);
    };

    const setFormStatus = (message, isError = false) => {
        setStatus(formStatus, message, isError);
    };

    const formatCep = (digits) => {
        if (digits.length <= 5) {
            return digits;
        }

        return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    };

    const buildPayload = () => {
        const service = serviceInput?.value.trim() ?? "";

        return {
            nome: nameInput?.value.trim() ?? "",
            email: emailInput?.value.trim() ?? "",
            telefone: phoneInput?.value.trim() ?? "",
            servico: service,
            dataPreferencial: preferredDateInput?.value.trim() ?? "",
            horarioPreferencial: preferredTimeInput?.value.trim() ?? "",
            cep: cepInput?.value.trim() ?? "",
            logradouro: logradouroInput?.value.trim() ?? "",
            bairro: bairroInput?.value.trim() ?? "",
            localidade: localidadeInput?.value.trim() ?? "",
            assunto: subjectInput?.value.trim() || `Solicitacao de agendamento - ${service || "Renovo Cabeleireiros"}`,
            mensagem: messageInput?.value.trim() || "Sem observacoes adicionais.",
            origemAgendamento: sourceInput?.value.trim() || "site_form"
        };
    };

    const validatePayload = (payload) => {
        if (!payload.nome) {
            return { message: "Informe o nome completo do cliente.", field: nameInput };
        }

        if (!payload.email || !isValidEmail(payload.email)) {
            return { message: "Informe um e-mail valido para contato.", field: emailInput };
        }

        if (!payload.telefone) {
            return { message: "Informe um WhatsApp ou telefone para retorno.", field: phoneInput };
        }

        if (!payload.servico) {
            return { message: "Informe o servico desejado para o agendamento.", field: serviceInput };
        }

        return { message: "", field: null };
    };

    const searchAddress = async (cep) => {
        try {
            setCepStatus("Buscando endereco...");

            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!response.ok) {
                throw new Error(`Falha HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.erro) {
                setCepStatus("CEP nao encontrado.", true);
                clearAddress();
                return;
            }

            if (logradouroInput) {
                logradouroInput.value = data.logradouro ?? "";
            }

            if (bairroInput) {
                bairroInput.value = data.bairro ?? "";
            }

            if (localidadeInput) {
                const cidade = data.localidade ?? "";
                const uf = data.uf ?? "";
                localidadeInput.value = [cidade, uf].filter(Boolean).join(" - ");
            }

            setCepStatus("Endereco preenchido automaticamente.");
        } catch (error) {
            console.error("Erro ao consultar CEP:", error);
            setCepStatus("Nao foi possivel consultar o CEP agora.", true);
            clearAddress();
        }
    };

    cepInput.addEventListener("input", (event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
        event.target.value = formatCep(digits);

        if (digits.length < 8) {
            setCepStatus("");
            clearAddress();
        }
    });

    cepInput.addEventListener("blur", (event) => {
        const digits = event.target.value.replace(/\D/g, "");

        if (!digits) {
            setCepStatus("");
            clearAddress();
            return;
        }

        if (digits.length !== 8) {
            setCepStatus("CEP invalido. Digite 8 numeros.", true);
            clearAddress();
            return;
        }

        searchAddress(digits);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (window.location.protocol === "file:") {
            setFormStatus("Para salvar no banco, execute 'npm start' e abra o projeto em http://localhost:3000.", true);
            return;
        }

        const payload = buildPayload();
        const validation = validatePayload(payload);

        if (validation.message) {
            setFormStatus(validation.message, true);
            validation.field?.focus?.();
            return;
        }

        try {
            if (submitButton) {
                submitButton.disabled = true;
            }

            setFormStatus("Salvando agendamento no banco...");

            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Nao foi possivel salvar o agendamento.");
            }

            form.reset();
            clearAddress();
            resetBookingSource();
            setCepStatus("");
            setFormStatus(`Agendamento #${result.appointment.id} salvo com sucesso. Em breve entraremos em contato.`);
        } catch (error) {
            console.error("Erro ao salvar agendamento:", error);
            setFormStatus(error.message || "Falha ao salvar o agendamento.", true);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });

    form.addEventListener("reset", () => {
        clearAddress();
        resetBookingSource();
        setCepStatus("");
        setFormStatus("");
    });
}

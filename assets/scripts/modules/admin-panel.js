import {
    fetchAdminAppointments,
    fetchAdminSession,
    loginAdmin,
    logoutAdmin
} from "../services/api-client.js";

function setStatus(element, message, isError = false) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.toggle("error", isError);
}

function formatDateTime(value) {
    if (!value) {
        return "Nao informado";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Nao informado";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(parsedDate);
}

function createInfoItem(label, value) {
    const item = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label}:`;
    item.append(strong, ` ${String(value || "Nao informado")}`);
    return item;
}

function renderAppointments(appointments, listElement) {
    listElement.innerHTML = "";

    appointments.forEach((appointment) => {
        const item = document.createElement("li");
        item.className = "appointment-card";

        const header = document.createElement("div");
        header.className = "appointment-card__header";

        const title = document.createElement("h3");
        title.textContent = `Agendamento #${appointment.id}`;

        const badge = document.createElement("span");
        badge.className = "appointment-card__badge";
        badge.textContent = appointment.status || "novo";

        header.append(title, badge);

        const body = document.createElement("div");
        body.className = "appointment-card__body";
        body.append(
            createInfoItem("Cliente", appointment.nome),
            createInfoItem("Servico", appointment.servico),
            createInfoItem("Data preferencial", appointment.dataPreferencial || "a combinar"),
            createInfoItem("Horario preferencial", appointment.horarioPreferencial || "a combinar"),
            createInfoItem("Telefone", appointment.telefone || "Nao informado"),
            createInfoItem("E-mail", appointment.email || "Nao informado"),
            createInfoItem("Endereco", `${appointment.logradouro || "Nao informado"} - ${appointment.bairro || ""}`.trim()),
            createInfoItem("Cidade/UF", appointment.localidade || "Nao informado"),
            createInfoItem("CEP", appointment.cep || "Nao informado"),
            createInfoItem("Assunto", appointment.assunto || "Nao informado"),
            createInfoItem("Mensagem", appointment.mensagem || "Sem observacoes adicionais."),
            createInfoItem("Origem", appointment.origemAgendamento || "nao informada"),
            createInfoItem("Criado em", formatDateTime(appointment.criadoEm))
        );

        item.append(header, body);
        listElement.appendChild(item);
    });
}

function parseLimit(limitSelect) {
    const selectedLimit = Number(limitSelect?.value);
    return Number.isFinite(selectedLimit) ? selectedLimit : 12;
}

function toggleAuthView({ authenticated, loginArea, panelArea, passwordInput }) {
    loginArea.hidden = authenticated;
    panelArea.hidden = !authenticated;

    if (!authenticated) {
        window.setTimeout(() => passwordInput?.focus(), 0);
    }
}

export function initAdminPanel() {
    const loginForm = document.getElementById("adminLoginForm");
    const passwordInput = document.getElementById("adminPassword");
    const loginStatus = document.getElementById("adminLoginStatus");
    const authStatus = document.getElementById("adminAuthStatus");
    const listStatus = document.getElementById("adminListStatus");
    const appointmentsList = document.getElementById("adminAppointmentsList");
    const refreshButton = document.getElementById("adminRefreshBtn");
    const logoutButton = document.getElementById("adminLogoutBtn");
    const limitSelect = document.getElementById("adminLimit");
    const loginArea = document.getElementById("adminLoginArea");
    const panelArea = document.getElementById("adminPanelArea");

    if (
        !loginForm ||
        !passwordInput ||
        !loginStatus ||
        !authStatus ||
        !listStatus ||
        !appointmentsList ||
        !refreshButton ||
        !logoutButton ||
        !limitSelect ||
        !loginArea ||
        !panelArea
    ) {
        return;
    }

    let loadingList = false;
    let loadingAuth = false;

    const loadAppointments = async () => {
        if (loadingList) {
            return;
        }

        loadingList = true;
        refreshButton.disabled = true;
        setStatus(listStatus, "Carregando agendamentos...");

        try {
            const result = await fetchAdminAppointments({
                limit: parseLimit(limitSelect)
            });
            const appointments = Array.isArray(result.appointments) ? result.appointments : [];

            if (!appointments.length) {
                appointmentsList.innerHTML = "";
                setStatus(listStatus, "Nenhum agendamento encontrado.");
            } else {
                renderAppointments(appointments, appointmentsList);
                setStatus(listStatus, `${appointments.length} agendamento(s) carregado(s).`);
            }
        } catch (error) {
            appointmentsList.innerHTML = "";
            setStatus(listStatus, error.message || "Nao foi possivel carregar os agendamentos.", true);
        } finally {
            refreshButton.disabled = false;
            loadingList = false;
        }
    };

    const checkSession = async () => {
        if (loadingAuth) {
            return;
        }

        loadingAuth = true;
        setStatus(authStatus, "Validando sessao...");

        try {
            const session = await fetchAdminSession();
            const authenticated = Boolean(session.authenticated);

            toggleAuthView({
                authenticated,
                loginArea,
                panelArea,
                passwordInput
            });

            setStatus(
                authStatus,
                authenticated
                    ? "Sessao ativa no painel operacional."
                    : "Acesso protegido. Digite a senha para continuar."
            );

            if (authenticated) {
                loadAppointments();
            } else {
                appointmentsList.innerHTML = "";
            }
        } catch (error) {
            toggleAuthView({
                authenticated: false,
                loginArea,
                panelArea,
                passwordInput
            });
            setStatus(authStatus, error.message || "Nao foi possivel validar a sessao.", true);
        } finally {
            loadingAuth = false;
        }
    };

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const password = passwordInput.value.trim();

        if (!password) {
            setStatus(loginStatus, "Informe a senha para acessar o painel.", true);
            passwordInput.focus();
            return;
        }

        setStatus(loginStatus, "Validando senha...");
        passwordInput.disabled = true;

        try {
            await loginAdmin(password);
            loginForm.reset();
            setStatus(loginStatus, "Acesso liberado.");
            await checkSession();
        } catch (error) {
            setStatus(loginStatus, error.message || "Senha incorreta.", true);
        } finally {
            passwordInput.disabled = false;
            passwordInput.focus();
        }
    });

    refreshButton.addEventListener("click", () => {
        loadAppointments();
    });

    limitSelect.addEventListener("change", () => {
        loadAppointments();
    });

    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            await logoutAdmin();
            setStatus(authStatus, "Sessao finalizada.");
            setStatus(listStatus, "");
            appointmentsList.innerHTML = "";
            toggleAuthView({
                authenticated: false,
                loginArea,
                panelArea,
                passwordInput
            });
        } catch (error) {
            setStatus(authStatus, error.message || "Nao foi possivel finalizar a sessao.", true);
        } finally {
            logoutButton.disabled = false;
        }
    });

    checkSession();
}

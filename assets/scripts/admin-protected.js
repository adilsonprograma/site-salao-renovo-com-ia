import {
    fetchAdminSession,
    fetchIntegrations,
    fetchProtectedAppointments,
    logoutAdmin,
    notifyProtectedAppointment
} from "./services/api-client.js";

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[character]));
}

function formatDate(dateString) {
    if (!dateString) {
        return "Nao informado";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function getCreatedAt(appointment) {
    return appointment.criadoEm || appointment.created_at || appointment.data || "";
}

function buildIntegrationCards(integrations) {
    const cards = [
        {
            icon: "api",
            name: "API Backend",
            status: "ativo",
            text: "Servidor HTTP online e respondendo."
        },
        {
            icon: "smart_toy",
            name: "Gemini AI",
            status: integrations.gemini?.configured ? "ativo" : "verificar",
            text: integrations.gemini?.configured
                ? `Configurado com o modelo ${integrations.gemini.model}.`
                : "Sem chave ativa. O chat usa o modo local."
        },
        {
            icon: "chat",
            name: "WhatsApp Cloud",
            status: integrations.whatsapp?.configured ? "ativo" : "verificar",
            text: integrations.whatsapp?.configured
                ? "Integracao pronta para respostas e notificacoes."
                : "Configure token e phone number id para ativar."
        },
        {
            icon: "storage",
            name: "Banco de dados",
            status: "ativo",
            text: "Persistencia local em SQLite."
        }
    ];

    return cards.map((integration) => `
        <article class="integration-card">
            <span class="material-symbols-outlined integration-icon">${integration.icon}</span>
            <div class="integration-info">
                <h3>${integration.name}</h3>
                <p class="integration-status integration-status--${integration.status}">
                    ${integration.status === "ativo" ? "Ativo" : "Verificar"}
                </p>
                <p>${escapeHtml(integration.text)}</p>
            </div>
        </article>
    `).join("");
}

function buildAppointmentCard(appointment) {
    const appointmentId = escapeHtml(appointment.id);
    const phone = String(appointment.telefone || "");
    const safePhone = escapeHtml(phone);
    const safeName = escapeHtml(appointment.nome || "Sem nome");
    const fields = [
        appointment.email ? `<p><strong>Email:</strong> ${escapeHtml(appointment.email)}</p>` : "",
        phone ? `<p><strong>Telefone:</strong> ${safePhone}</p>` : "",
        appointment.servico ? `<p><strong>Servico:</strong> ${escapeHtml(appointment.servico)}</p>` : "",
        appointment.dataPreferencial ? `<p><strong>Data pref.:</strong> ${escapeHtml(appointment.dataPreferencial)}</p>` : "",
        appointment.horarioPreferencial ? `<p><strong>Horario pref.:</strong> ${escapeHtml(appointment.horarioPreferencial)}</p>` : "",
        appointment.origemAgendamento ? `<p><strong>Origem:</strong> ${escapeHtml(appointment.origemAgendamento)}</p>` : ""
    ].filter(Boolean).join("");

    return `
        <article class="appointment-card">
            <div class="appointment-card__header">
                <div>
                    <h3>${safeName}</h3>
                    <p class="appointment-card__date">${escapeHtml(formatDate(getCreatedAt(appointment)))}</p>
                </div>
                <div class="appointment-card__actions">
                    ${phone ? `
                        <button
                            type="button"
                            class="btn-whatsapp"
                            data-action="contact"
                            data-name="${safeName}"
                            data-phone="${safePhone}"
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">chat</span>
                            Falar com cliente
                        </button>
                    ` : ""}
                    <button
                        type="button"
                        class="btn-whatsapp btn-whatsapp--secondary"
                        data-action="notify"
                        data-id="${appointmentId}"
                    >
                        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
                        Reenviar alerta
                    </button>
                </div>
            </div>
            <div class="appointment-card__content">${fields}</div>
        </article>
    `;
}

async function initAdminPage() {
    let session;

    try {
        session = await fetchAdminSession();
    } catch (error) {
        window.location.href = "login.html";
        return;
    }

    const elements = {
        adminStatus: document.getElementById("adminStatus"),
        appointmentsList: document.getElementById("appointmentsList"),
        appointmentsWithPhone: document.getElementById("appointmentsWithPhone"),
        cancelLogoutBtn: document.getElementById("cancelLogoutBtn"),
        confirmLogoutBtn: document.getElementById("confirmLogoutBtn"),
        integrationList: document.getElementById("integrationList"),
        latestAppointmentDate: document.getElementById("latestAppointmentDate"),
        limitSelect: document.getElementById("limitSelect"),
        logoutButton: document.getElementById("logoutButton"),
        logoutModal: document.getElementById("logoutModal"),
        refreshButton: document.getElementById("refreshButton"),
        totalAppointments: document.getElementById("totalAppointments"),
        userGreeting: document.getElementById("userGreeting")
    };

    const userName = session.user?.username || "admin";
    const { logoutModal } = elements;

    if (elements.userGreeting) {
        elements.userGreeting.textContent = `Bem-vindo, ${userName}!`;
    }

    elements.logoutButton?.addEventListener("click", showLogoutConfirmation);
    elements.cancelLogoutBtn?.addEventListener("click", hideLogoutConfirmation);
    elements.confirmLogoutBtn?.addEventListener("click", handleLogout);
    elements.refreshButton?.addEventListener("click", refreshDashboard);
    elements.limitSelect?.addEventListener("change", refreshDashboard);
    elements.appointmentsList?.addEventListener("click", handleAppointmentAction);
    logoutModal?.addEventListener("click", (event) => {
        if (event.target === logoutModal) {
            hideLogoutConfirmation();
        }
    });

    await refreshDashboard();

    function setStatus(message, type = "success") {
        if (!elements.adminStatus) {
            return;
        }

        elements.adminStatus.textContent = message;
        elements.adminStatus.classList.remove("form-status--error", "form-status--success");
        elements.adminStatus.classList.add("is-visible");

        if (type === "error") {
            elements.adminStatus.classList.add("form-status--error");
        } else {
            elements.adminStatus.classList.add("form-status--success");
        }
    }

    function showLogoutConfirmation() {
        if (!logoutModal) {
            return;
        }

        logoutModal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function hideLogoutConfirmation() {
        if (!logoutModal) {
            return;
        }

        logoutModal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    async function handleLogout() {
        try {
            await logoutAdmin();
        } finally {
            window.location.href = "login.html";
        }
    }

    async function refreshDashboard() {
        const limit = elements.limitSelect?.value || "25";
        setStatus("Carregando painel...");

        try {
            const [appointmentsPayload, integrations] = await Promise.all([
                fetchProtectedAppointments(limit),
                fetchIntegrations()
            ]);

            renderAppointments(appointmentsPayload.appointments || []);
            if (elements.integrationList) {
                elements.integrationList.innerHTML = buildIntegrationCards(integrations);
            }

            setStatus("Painel atualizado com sucesso.");
        } catch (error) {
            console.error("Erro ao carregar painel:", error);
            renderAppointments([]);
            if (elements.integrationList) {
                elements.integrationList.innerHTML = "";
            }
            setStatus(error.message || "Nao foi possivel carregar o painel.", "error");
        }
    }

    function renderAppointments(appointments) {
        const list = Array.isArray(appointments) ? appointments : [];
        const latestAppointment = list[0];

        if (elements.totalAppointments) {
            elements.totalAppointments.textContent = String(list.length);
        }

        if (elements.appointmentsWithPhone) {
            elements.appointmentsWithPhone.textContent = String(list.filter((appointment) => appointment.telefone).length);
        }

        if (elements.latestAppointmentDate) {
            elements.latestAppointmentDate.textContent = latestAppointment
                ? formatDate(getCreatedAt(latestAppointment))
                : "Nenhum registro";
        }

        if (!elements.appointmentsList) {
            return;
        }

        elements.appointmentsList.innerHTML = list.length
            ? list.map(buildAppointmentCard).join("")
            : '<p class="empty-state">Nenhum agendamento encontrado.</p>';
    }

    async function handleAppointmentAction(event) {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        if (button.dataset.action === "contact") {
            const phone = String(button.dataset.phone || "").replace(/\D/g, "");
            const name = button.dataset.name || "cliente";
            const message = `Oi ${name}! Estou entrando em contato pelo painel do Renovo para confirmar seu agendamento.`;

            if (phone) {
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
            }

            return;
        }

        if (button.dataset.action === "notify") {
            const appointmentId = button.dataset.id;

            if (!appointmentId) {
                return;
            }

            const originalMarkup = button.innerHTML;

            button.disabled = true;
            button.textContent = "Reenviando...";

            try {
                const result = await notifyProtectedAppointment(appointmentId);
                const notificationStatus = result.notification?.status === "sent"
                    ? "Alerta reenviado pelo WhatsApp."
                    : "Tentativa concluida, mas a integracao nao confirmou envio.";

                setStatus(notificationStatus);
            } catch (error) {
                console.error("Erro ao reenviar alerta:", error);
                setStatus(error.message || "Falha ao reenviar alerta.", "error");
            } finally {
                button.disabled = false;
                button.innerHTML = originalMarkup;
            }
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminPage);
} else {
    initAdminPage();
}

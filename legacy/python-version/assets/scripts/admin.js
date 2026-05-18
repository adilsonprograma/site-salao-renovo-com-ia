import {
    fetchAppointments,
    fetchIntegrations,
    resendAppointmentNotification
} from "./services/api-client.js";

const totalAppointmentsElement = document.querySelector("#totalAppointments");
const appointmentsWithPhoneElement = document.querySelector("#appointmentsWithPhone");
const latestAppointmentDateElement = document.querySelector("#latestAppointmentDate");
const integrationListElement = document.querySelector("#integrationList");
const appointmentsListElement = document.querySelector("#appointmentsList");
const statusElement = document.querySelector("#adminStatus");
const limitSelectElement = document.querySelector("#limitSelect");
const refreshButtonElement = document.querySelector("#refreshButton");

function setStatus(message, type = "") {
    statusElement.textContent = message;
    statusElement.classList.remove("error");

    if (type === "error") {
        statusElement.classList.add("error");
    }
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
}

function buildWhatsAppUrl(phone, text = "") {
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
        return "";
    }

    const params = new URLSearchParams();

    if (text) {
        params.set("text", text);
    }

    const queryString = params.toString();
    return `https://wa.me/${normalizedPhone}${queryString ? `?${queryString}` : ""}`;
}

function buildAppointmentSummary(appointment) {
    return [
        `Agendamento #${appointment.id}`,
        `Nome: ${appointment.nome || "Nao informado"}`,
        `Servico: ${appointment.servico || "Nao informado"}`,
        `Data preferencial: ${appointment.dataPreferencial || "Nao informada"}`,
        `Horario preferencial: ${appointment.horarioPreferencial || "Nao informado"}`,
        `WhatsApp: ${appointment.telefone || "Nao informado"}`,
        `Observacoes: ${appointment.mensagem || "Sem observacoes adicionais."}`
    ].join("\n");
}

function getIntegrationPill(label, enabled) {
    const variant = enabled ? "pill--ok" : "pill--warn";
    const suffix = enabled ? "OK" : "Pendente";

    return `<span class="pill ${variant}">${label}: ${suffix}</span>`;
}

function renderIntegrations(integrations) {
    const items = [
        {
            title: "WhatsApp Cloud API",
            description: "Responsavel pelo envio automatico para o numero administrativo e pelas respostas do webhook.",
            pills: [
                getIntegrationPill("Configurado", Boolean(integrations.whatsapp?.configured)),
                getIntegrationPill("Numero admin", Boolean(integrations.whatsapp?.hasAdminRecipient)),
                getIntegrationPill("Webhook", Boolean(integrations.whatsapp?.webhookConfigured))
            ]
        },
        {
            title: "Gemini",
            description: "Usado para enriquecer o chat quando a chave estiver presente; sem ele o modo local continua funcionando.",
            pills: [
                getIntegrationPill("Configurado", Boolean(integrations.gemini?.configured)),
                `<span class="pill">${integrations.gemini?.model || "Sem modelo"}</span>`
            ]
        }
    ];

    integrationListElement.innerHTML = items.map((item) => `
        <article class="integration-card">
            <div class="integration-card__header">
                <div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
            <div class="pill-row">${item.pills.join("")}</div>
        </article>
    `).join("");
}

function renderSummary(appointments) {
    totalAppointmentsElement.textContent = String(appointments.length);
    appointmentsWithPhoneElement.textContent = String(
        appointments.filter((appointment) => normalizePhone(appointment.telefone)).length
    );
    latestAppointmentDateElement.textContent = appointments.length
        ? formatDate(appointments[0].criadoEm)
        : "-";
}

function renderEmptyState() {
    appointmentsListElement.innerHTML = `
        <div class="empty-state">
            <h3>Nenhum agendamento encontrado</h3>
            <p>Assim que o formulario ou a ColorIA salvar um pedido, ele aparece aqui.</p>
        </div>
    `;
}

function createActionButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function createActionLink(label, className, href) {
    const link = document.createElement("a");
    link.className = className;
    link.textContent = label;
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    return link;
}

async function handleResendNotification(appointment, button) {
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Enviando...";

    try {
        const result = await resendAppointmentNotification(appointment.id);
        const notification = result.notification || {};

        if (notification.status === "sent") {
            setStatus(`Agendamento #${appointment.id} reenviado para o WhatsApp administrativo.`);
            return;
        }

        if (notification.status === "disabled") {
            setStatus("O WhatsApp administrativo ainda nao esta configurado no backend.", "error");
            return;
        }

        if (notification.status === "failed") {
            setStatus(notification.error || "Falha ao reenviar o agendamento.", "error");
            return;
        }

        setStatus(`Reenvio concluido com status: ${notification.status || "desconhecido"}.`);
    } catch (error) {
        setStatus(error.message, "error");
    } finally {
        button.disabled = false;
        button.textContent = originalLabel;
    }
}

function createAppointmentCard(appointment) {
    const article = document.createElement("article");
    article.className = "appointment-card";

    const phoneUrl = buildWhatsAppUrl(
        appointment.telefone,
        `Oi, ${appointment.nome || "tudo bem"}? Aqui e do Renovo sobre seu agendamento.`
    );

    article.innerHTML = `
        <div class="appointment-card__header">
            <div>
                <p class="section-label">Agendamento #${appointment.id}</p>
                <h3>${appointment.nome || "Cliente sem nome"}</h3>
            </div>
            <div class="pill-row">
                <span class="pill">${appointment.servico || "Servico nao informado"}</span>
                <span class="pill">${appointment.origemAgendamento || "Origem nao informada"}</span>
                <span class="pill">${appointment.status || "novo"}</span>
            </div>
        </div>
        <div class="appointment-layout">
            <div class="appointment-copy">
                <p>${appointment.mensagem || "Sem observacoes adicionais."}</p>
            </div>
            <ul class="appointment-meta">
                <li><strong>WhatsApp:</strong> ${appointment.telefone || "Nao informado"}</li>
                <li><strong>E-mail:</strong> ${appointment.email || "Nao informado"}</li>
                <li><strong>Data preferencial:</strong> ${appointment.dataPreferencial || "Nao informada"}</li>
                <li><strong>Horario preferencial:</strong> ${appointment.horarioPreferencial || "Nao informado"}</li>
                <li><strong>Criado em:</strong> ${formatDate(appointment.criadoEm)}</li>
            </ul>
        </div>
    `;

    const actions = document.createElement("div");
    actions.className = "appointment-actions";

    const resendButton = createActionButton(
        "Reenviar para WhatsApp admin",
        "btn-inline btn-inline--primary",
        () => handleResendNotification(appointment, resendButton)
    );
    actions.appendChild(resendButton);

    if (phoneUrl) {
        actions.appendChild(
            createActionLink(
                "Abrir WhatsApp do cliente",
                "btn-inline btn-inline--ghost",
                phoneUrl
            )
        );
    }

    const copyButton = createActionButton(
        "Copiar resumo",
        "btn-inline btn-inline--ghost",
        async () => {
            try {
                await navigator.clipboard.writeText(buildAppointmentSummary(appointment));
                setStatus(`Resumo do agendamento #${appointment.id} copiado.`);
            } catch (error) {
                setStatus("Nao consegui copiar o resumo automaticamente.", "error");
            }
        }
    );
    actions.appendChild(copyButton);

    article.appendChild(actions);
    return article;
}

function renderAppointments(appointments) {
    appointmentsListElement.innerHTML = "";

    if (!appointments.length) {
        renderEmptyState();
        return;
    }

    const fragment = document.createDocumentFragment();

    appointments.forEach((appointment) => {
        fragment.appendChild(createAppointmentCard(appointment));
    });

    appointmentsListElement.appendChild(fragment);
}

async function loadDashboard() {
    setStatus("Carregando painel...");
    refreshButtonElement.disabled = true;

    try {
        const limit = Number(limitSelectElement.value || 25);
        const [appointmentsResponse, integrations] = await Promise.all([
            fetchAppointments(limit),
            fetchIntegrations()
        ]);
        const appointments = Array.isArray(appointmentsResponse.appointments)
            ? appointmentsResponse.appointments
            : [];

        renderSummary(appointments);
        renderIntegrations(integrations);
        renderAppointments(appointments);
        setStatus(`Painel atualizado com ${appointments.length} agendamento(s).`);
    } catch (error) {
        renderSummary([]);
        renderAppointments([]);
        integrationListElement.innerHTML = "";
        setStatus(error.message, "error");
    } finally {
        refreshButtonElement.disabled = false;
    }
}

refreshButtonElement.addEventListener("click", loadDashboard);
limitSelectElement.addEventListener("change", loadDashboard);

loadDashboard();

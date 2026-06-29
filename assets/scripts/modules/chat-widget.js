/**
 * chat-widget.js
 * Chat ColorIA — funciona 100% offline no GitHub Pages.
 * Fluxo de menu local: agendamento, consultoria de cor, tendencias de corte.
 * Quando rodando com o servidor Node (localhost), tenta usar a API Gemini.
 */

const MENU_PRINCIPAL = [
    "Ola! Sou a ColorIA Agenda do Renovo Cabeleireiros. 💇‍♀️",
    "",
    "Como posso ajudar?",
    "1️⃣ — Agendar um horario",
    "2️⃣ — Consultoria de cor",
    "3️⃣ — Tendencias de corte",
    "",
    "Digite o numero da opcao desejada."
].join("\n");

const RESPOSTAS = {
    "1": [
        "📅 Para agendar, preciso de algumas informacoes:",
        "",
        "• Seu nome completo",
        "• Servico desejado (corte, coloracao, tratamento...)",
        "• Data e horario de preferencia",
        "",
        "Voce tambem pode preencher o formulario de contato na secao abaixo,",
        "ou ligar diretamente: (88) 99329-4936.",
        "",
        "Digite 0 para voltar ao menu."
    ].join("\n"),

    "2": [
        "🎨 Consultoria de cor — aqui vao algumas orientacoes:",
        "",
        "• Morena iluminada: ideal para quem quer clarear com suavidade",
        "• Loiro dourado: funciona bem com subtons quentes",
        "• Cobre/ruivo: tendencia forte, exige manutencao com matizacao",
        "• Neutralizacao: corrige tons amarelados ou alaranjados",
        "",
        "Dica: traga fotos de referencia na consulta presencial!",
        "",
        "Para agendar uma avaliacao, digite 1.",
        "Digite 0 para voltar ao menu."
    ].join("\n"),

    "3": [
        "✂️ Tendencias de corte em alta:",
        "",
        "👩 Feminino:",
        "  • Bob curto assimetrico",
        "  • Longo com camadas suaves (butterfly cut)",
        "  • Franja cortina",
        "",
        "👨 Masculino:",
        "  • Degrade medio com textura no topo",
        "  • Corte social moderno",
        "  • Mullet contemporaneo",
        "",
        "Quer agendar um corte? Digite 1.",
        "Digite 0 para voltar ao menu."
    ].join("\n"),

    "0": null // volta ao menu principal
};

// Detecta se ha servidor backend rodando
function isLocalServer() {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
}

function addMessage(container, text, sender) {
    const bubble = document.createElement("div");
    bubble.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function setChatOpen(chatWidget, triggers, open) {
    chatWidget.classList.toggle("active", open);
    chatWidget.setAttribute("aria-hidden", String(!open));

    triggers.forEach((element) => {
        element?.setAttribute("aria-expanded", String(open));
    });
}

function handleLocalMessage(chatWindow, message) {
    const key = message.trim();

    if (key === "0") {
        addMessage(chatWindow, MENU_PRINCIPAL, "bot");
        return;
    }

    const resposta = RESPOSTAS[key];

    if (resposta) {
        addMessage(chatWindow, resposta, "bot");
        return;
    }

    // Resposta generica para texto livre
    addMessage(chatWindow, [
        "Entendi! Para te atender melhor, escolha uma opcao:",
        "",
        "1️⃣ Agendar horario",
        "2️⃣ Consultoria de cor",
        "3️⃣ Tendencias de corte",
        "",
        "Ou entre em contato pelo WhatsApp: (88) 99329-4936"
    ].join("\n"), "bot");
}

export function initChatWidget() {
    const chatWidget = document.getElementById("chatWidget");
    const chatWindow = document.getElementById("chatWindow");
    const chatSubtitle = chatWidget?.querySelector(".chat-header p");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const fabChat = document.getElementById("fabChat");
    const navChatToggle = document.getElementById("navChatToggle");
    const heroChatToggle = document.getElementById("heroChatToggle");
    const closeChat = document.getElementById("closeChat");
    const triggers = [fabChat, navChatToggle, heroChatToggle];

    if (!chatWidget || !chatWindow || !userInput || !sendBtn) {
        return;
    }

    let isSending = false;
    let lastTrigger = null;
    const useApi = isLocalServer();

    // Mensagem inicial
    chatWindow.innerHTML = "";
    addMessage(chatWindow, MENU_PRINCIPAL, "bot");

    if (chatSubtitle) {
        chatSubtitle.textContent = useApi
            ? "Agendamento com API"
            : "Agendamento e consultoria";
    }

    const handleToggle = (event) => {
        lastTrigger = event?.currentTarget || lastTrigger;
        const shouldOpen = !chatWidget.classList.contains("active");
        setChatOpen(chatWidget, triggers, shouldOpen);

        if (shouldOpen) {
            window.setTimeout(() => userInput.focus(), 0);
        }
    };

    const closeWidget = () => {
        setChatOpen(chatWidget, triggers, false);
        lastTrigger?.focus?.();
    };

    const sendMessage = async () => {
        const message = userInput.value.trim();

        if (!message || isSending) {
            return;
        }

        addMessage(chatWindow, message, "user");
        userInput.value = "";
        isSending = true;

        if (useApi) {
            // Modo com servidor: tenta chamar API
            try {
                const { sendAssistantMessage } = await import("../services/api-client.js");
                const sessionId = window.sessionStorage.getItem("coloria-session-id")
                    || (() => {
                        const id = window.crypto?.randomUUID?.() || `coloria-${Date.now()}`;
                        window.sessionStorage.setItem("coloria-session-id", id);
                        return id;
                    })();

                const result = await sendAssistantMessage({ message, sessionId });
                addMessage(chatWindow, result.reply, "bot");
            } catch (error) {
                console.warn("API indisponivel, usando modo local:", error.message);
                handleLocalMessage(chatWindow, message);
            }
        } else {
            // Modo estatico: respostas locais
            handleLocalMessage(chatWindow, message);
        }

        isSending = false;
        userInput.focus();
    };

    // Event listeners
    triggers.forEach((trigger) => {
        trigger?.addEventListener("click", handleToggle);
    });

    closeChat?.addEventListener("click", closeWidget);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && chatWidget.classList.contains("active")) {
            closeWidget();
        }
    });

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

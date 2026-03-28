import { fetchIntegrations, sendAssistantMessage } from "../services/api-client.js";

const DEFAULT_WELCOME = [
    "Ola! Sou a ColorIA Agenda.",
    "Posso te ajudar com agendamento, cor e tendencias de corte.",
    "Digite sua pergunta para comecarmos."
].join("\n");

function getSessionId() {
    const storageKey = "coloria-session-id";
    const existingId = window.sessionStorage.getItem(storageKey);

    if (existingId) {
        return existingId;
    }

    const newId = window.crypto?.randomUUID?.() || `coloria-${Date.now()}`;
    window.sessionStorage.setItem(storageKey, newId);

    return newId;
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
    const formStatus = document.getElementById("formStatus");
    const triggers = [fabChat, navChatToggle, heroChatToggle];

    if (!chatWidget || !chatWindow || !userInput || !sendBtn) {
        return;
    }

    const sessionId = getSessionId();
    let isSending = false;
    let lastTrigger = null;

    chatWindow.innerHTML = "";
    addMessage(chatWindow, DEFAULT_WELCOME, "bot");

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

        if (window.location.protocol === "file:") {
            addMessage(chatWindow, "Execute 'npm start' e abra o projeto em http://localhost:3000 para usar o chat com API.", "bot");
            return;
        }

        addMessage(chatWindow, message, "user");
        userInput.value = "";
        userInput.disabled = true;
        sendBtn.disabled = true;
        isSending = true;

        try {
            const result = await sendAssistantMessage({
                message,
                sessionId
            });

            addMessage(chatWindow, result.reply, "bot");

            if (result.appointment && formStatus) {
                formStatus.textContent = `O chat registrou o pre-agendamento #${result.appointment.id}. Se quiser, o formulario continua disponivel para um novo pedido.`;
                formStatus.classList.remove("error");
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem para a ColorIA:", error);
            addMessage(chatWindow, error.message || "Nao consegui responder agora. Tente novamente em instantes.", "bot");
        } finally {
            userInput.disabled = false;
            sendBtn.disabled = false;
            isSending = false;
            userInput.focus();
        }
    };

    if (window.location.protocol === "file:") {
        if (chatSubtitle) {
            chatSubtitle.textContent = "Abra em localhost para ativar as APIs";
        }
    } else {
        fetchIntegrations()
            .then((integrations) => {
                if (!chatSubtitle) {
                    return;
                }

                chatSubtitle.textContent = integrations.gemini.configured
                    ? "Agendamento com Gemini"
                    : "Agendamento em modo local";
            })
            .catch((error) => {
                console.error("Nao foi possivel consultar as integracoes:", error);
            });
    }

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

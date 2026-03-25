const MENU_MESSAGE = [
    "Ola! Sou a ColorIA Agenda.",
    "Posso te ajudar com:",
    "1. Pre-agendamento de atendimento",
    "2. Escolha de cor, neutralizacao e tecnica",
    "3. Tendencias de corte masculino e feminino",
    "",
    "Digite 1, 2, 3 ou escreva agendar, cor ou corte."
].join("\n");

const INPUT_PLACEHOLDERS = {
    menu: "Digite 1, 2, 3 ou sua pergunta...",
    bookingName: "Ex: Maria Silva",
    bookingService: "Ex: corte feminino + coloracao",
    bookingDate: "Ex: sexta a tarde ou 05/04",
    bookingTime: "Ex: 14h, tarde ou sabado cedo",
    bookingPhone: "Ex: (88) 99999-9999",
    bookingNotes: "Referencia, observacao ou 'pular'",
    colorCurrent: "Ex: castanho medio com mechas antigas",
    colorGoal: "Ex: morena iluminada fria ou neutralizar amarelo",
    colorHistory: "Ex: cabelo colorido e com progressiva",
    trendProfile: "masculino, feminino ou misto",
    trendMaintenance: "baixa, media ou alta",
    trendVibe: "Ex: clean, moderno, romantico, fashion"
};

const MAINTENANCE_SCALE = {
    baixa: 1,
    media: 2,
    alta: 3
};

const TREND_CATALOG = [
    {
        name: "Soft bob",
        profile: "feminino",
        maintenance: "baixa",
        tags: ["clean", "moderno", "sofisticado", "executivo"],
        description: "bob polido com pontas suaves e acabamento elegante",
        trendPulse: "esta forte em reels e conteudos minimalistas porque entrega presenca sem exigir muita finalizacao",
        bestFor: "quem quer visual chic, pratico e com cara atual"
    },
    {
        name: "Butterfly cut",
        profile: "feminino",
        maintenance: "media",
        tags: ["volume", "movimento", "romantico", "moderno"],
        description: "camadas longas com leveza e franja moldando o rosto",
        trendPulse: "segue muito pedido em TikTok e Instagram por criar movimento sem perder comprimento",
        bestFor: "quem quer cabelo com volume, bouncy e efeito de escova"
    },
    {
        name: "Modern shag suave",
        profile: "feminino",
        maintenance: "media",
        tags: ["fashion", "textura", "moderno", "movimento"],
        description: "shag leve com camadas aereas e moldura de rosto mais romantica",
        trendPulse: "voltou forte em referencias editoriais porque mistura textura com um acabamento mais suave e atual",
        bestFor: "quem quer movimento, volume controlado e visual menos certinho"
    },
    {
        name: "Midi em camadas aereas",
        profile: "feminino",
        maintenance: "baixa",
        tags: ["movimento", "clean", "romantico", "leve"],
        description: "comprimento medio com camadas suaves e caimento leve",
        trendPulse: "aparece bastante em conteudos de beleza que buscam naturalidade e movimento controlado",
        bestFor: "quem quer transicao segura entre longo e curto"
    },
    {
        name: "Franja marcante personalizada",
        profile: "feminino",
        maintenance: "alta",
        tags: ["romantico", "fashion", "volume", "textura"],
        description: "franja ajustada ao rosto, do wispy ao curtain, com impacto maior no visual",
        trendPulse: "esta em alta porque adiciona personalidade rapida ao corte e rende muito conteudo de transformacao nas redes",
        bestFor: "quem gosta de styling e quer destacar olhos e moldura do rosto"
    },
    {
        name: "Crew cut com taper",
        profile: "masculino",
        maintenance: "baixa",
        tags: ["clean", "executivo", "pratico", "moderno"],
        description: "laterais limpas com topo curto e acabamento preciso",
        trendPulse: "continua forte nos perfis de barbearia por ser versatil, masculino e facil de manter",
        bestFor: "quem quer imagem organizada e manutencao rapida"
    },
    {
        name: "Burst fade texturizado",
        profile: "masculino",
        maintenance: "media",
        tags: ["moderno", "textura", "fashion", "marcante"],
        description: "fade em volta da orelha com topo mais vivo e textura aparente",
        trendPulse: "esta em alta em barber feeds e videos curtos porque fotografa muito bem e parece moderno",
        bestFor: "quem quer contraste, definicao e visual de tendencia"
    },
    {
        name: "Soft mullet",
        profile: "masculino",
        maintenance: "media",
        tags: ["fashion", "movimento", "ousado", "textura"],
        description: "mullet mais suave, com nuca trabalhada e topo desconectado",
        trendPulse: "segue em evidenca nas redes por misturar referencia retrô com acabamento atual",
        bestFor: "quem quer diferenciar o visual sem exagerar no corte"
    },
    {
        name: "French crop ou Caesar moderno",
        profile: "masculino",
        maintenance: "baixa",
        tags: ["clean", "textura", "pratico", "casual"],
        description: "frente curta, topo controlado e laterais bem ajustadas",
        trendPulse: "aparece muito em perfis de transformacao por valorizar rosto e ser facil de finalizar",
        bestFor: "quem quer praticidade com leitura atual"
    },
    {
        name: "Curtains com taper baixo",
        profile: "masculino",
        maintenance: "media",
        tags: ["volume", "casual", "moderno", "movimento"],
        description: "franja dividida com topo medio e laterais limpas",
        trendPulse: "volta forte quando a referencia e cabelo com movimento e visual mais jovem",
        bestFor: "quem quer um corte com mais volume e identidade"
    }
];

function createChatContext() {
    return {
        flow: "menu",
        step: "menu",
        booking: {
            name: "",
            service: "",
            date: "",
            time: "",
            phone: "",
            notes: ""
        },
        color: {
            currentBase: "",
            goal: "",
            history: ""
        },
        trends: {
            profile: "",
            maintenance: "",
            vibe: ""
        }
    };
}

function normalizeText(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
}

function formatPersonName(value) {
    return value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function getFirstName(name) {
    return name.split(" ")[0] ?? name;
}

function isSkipText(text) {
    return [
        "pular",
        "skip",
        "sem observacao",
        "sem observacoes",
        "nenhuma",
        "nenhum",
        "nao quero adicionar",
        "nao quero observacao"
    ].includes(text);
}

function getGlobalAction(text) {
    const exactValue = normalizeText(text);

    if ([
        "reiniciar",
        "recomecar",
        "resetar",
        "menu",
        "inicio",
        "voltar ao menu"
    ].includes(exactValue)) {
        return "reset";
    }

    if (["1", "agendar", "agendamento", "agenda"].includes(exactValue)) {
        return "booking";
    }

    if (["2", "cor", "cores", "coloracao", "descoloracao", "ostwald", "oswald"].includes(exactValue)) {
        return "color";
    }

    if (["3", "corte", "cortes", "tendencia", "tendencias", "trend", "trends"].includes(exactValue)) {
        return "trends";
    }

    return "";
}

function getMenuIntent(text) {
    const normalized = normalizeText(text);

    if (includesAny(normalized, ["agendar", "agendamento", "agenda", "marcar horario", "horario"])) {
        return "booking";
    }

    if (includesAny(normalized, ["cor", "cores", "coloracao", "descoloracao", "mechas", "matizar", "ostwald", "oswald"])) {
        return "color";
    }

    if (includesAny(normalized, ["corte", "cortes", "tendencia", "tendencias", "fade", "mullet", "bob", "franja"])) {
        return "trends";
    }

    return "";
}

function detectBaseFamily(text) {
    if (includesAny(text, ["preto", "castanho escuro", "escuro", "3.0", "2.0", "1.0"])) {
        return "escura";
    }

    if (includesAny(text, ["castanho medio", "castanho claro", "5.0", "6.0", "7.0", "loiro escuro"])) {
        return "media";
    }

    if (includesAny(text, ["loiro", "platinado", "clarissimo", "claro", "8.0", "9.0", "10.0"])) {
        return "clara";
    }

    if (includesAny(text, ["ruivo", "cobre", "acobreado", "vermelho"])) {
        return "quente";
    }

    return "indefinida";
}

function getOstwaldGuidance(currentBase, goal) {
    const combined = normalizeText(`${currentBase} ${goal}`);

    if (includesAny(combined, ["amarelo", "amarelado", "dourado demais"])) {
        return "Na estrela de Ostwald, amarelo pede violeta para neutralizacao e acabamento mais frio.";
    }

    if (includesAny(combined, ["laranja", "alaranjado", "acobreado indesejado"])) {
        return "Na estrela de Ostwald, laranja pede azul para segurar o reflexo quente e deixar o loiro mais equilibrado.";
    }

    if (includesAny(combined, ["vermelho", "avermelhado", "vermelho indesejado"])) {
        return "Na estrela de Ostwald, vermelho pede verde para correcao e neutralizacao do reflexo.";
    }

    if (includesAny(combined, ["cobre", "acobreado", "mel", "dourado", "ruivo"]) && !includesAny(combined, ["neutralizar", "matizar"])) {
        return "Pela estrela de Ostwald, aqui a ideia nao e neutralizar e sim reforcar reflexos quentes com deposito de pigmento e brilho.";
    }

    return "A estrela de Ostwald ajuda a equilibrar reflexos com opostos complementares: violeta corrige amarelo, azul corrige laranja e verde corrige vermelho.";
}

function getTechniqueRecommendation(currentBase, goal, history) {
    const current = normalizeText(currentBase);
    const desired = normalizeText(goal);
    const background = normalizeText(history);
    const combined = `${current} ${desired} ${background}`;
    const baseFamily = detectBaseFamily(current);
    const wantsBlonde = includesAny(desired, ["loiro", "loira", "platinado", "clarear"]);
    const wantsNaturalLight = includesAny(desired, ["morena iluminada", "iluminar", "mechas", "bege", "mel", "sun kissed"]);
    const wantsSubtleLight = includesAny(desired, ["delicado", "natural", "suave", "babylights", "fino", "sutil"]);
    const wantsGrayCoverage = includesAny(desired, ["branco", "brancos", "grisalho"]);
    const wantsDarker = includesAny(desired, ["escurecer", "uniformizar", "corrigir mancha", "banho de brilho"]);
    const wantsWarm = includesAny(desired, ["ruivo", "cobre", "acobreado", "vermelho"]);
    const alreadyLightened = includesAny(current, ["descolorido", "mechas", "loiro", "platinado"]);

    if (wantsGrayCoverage) {
        return {
            title: "Coloracao permanente de cobertura",
            detail: "o caminho mais seguro costuma ser base natural misturada com a nuance desejada, priorizando cobertura uniforme e teste de mecha."
        };
    }

    if (includesAny(combined, ["sair do preto", "preto tingido"]) && wantsBlonde) {
        return {
            title: "Limpeza de cor ou descoloracao em etapas",
            detail: "quando ha pigmento escuro artificial, o clareamento pede remocao progressiva. Tinta nao clareia tinta, entao o plano deve ser feito por etapas."
        };
    }

    if (wantsBlonde && baseFamily === "escura") {
        return {
            title: "Descoloracao controlada com reconstrucao entre sessoes",
            detail: "para sair de base escura e chegar em loiros frios ou claros, a subida deve ser gradual, com avaliacao de elasticidade e resistencia."
        };
    }

    if (wantsNaturalLight && wantsSubtleLight) {
        return {
            title: "Babylights ou balayage suave",
            detail: "essas tecnicas iluminam com delicadeza, entregam crescimento mais elegante e pedem menos manutencao que uma descoloracao global."
        };
    }

    if (wantsNaturalLight) {
        return {
            title: "Balayage ou foilyage",
            detail: "balayage funciona melhor para iluminacao mais organica, enquanto foilyage entrega mais contraste e mais abertura de fundo."
        };
    }

    if (alreadyLightened && includesAny(desired, ["neutralizar", "matizar", "frio", "acinzentado", "perolado", "bege"])) {
        return {
            title: "Tonalizacao ou gloss corretivo",
            detail: "se a fibra ja esta clara, a melhor leitura costuma ser matizacao com deposito inteligente de pigmento em vez de mais abertura."
        };
    }

    if (wantsDarker) {
        return {
            title: "Lowlights e banho de brilho",
            detail: "boa opcao para devolver profundidade, corrigir excesso de clareamento e uniformizar reflexos sem carregar o visual."
        };
    }

    if (wantsWarm && baseFamily === "escura") {
        return {
            title: "Pre-iluminacao localizada seguida de tonalizacao quente",
            detail: "tons cobre e ruivo costumam aparecer melhor quando existe abertura previa de fundo, principalmente em bases escuras ou coloridas."
        };
    }

    if (wantsWarm) {
        return {
            title: "Coloracao ou tonalizacao de reflexo quente",
            detail: "o foco aqui e deposito de cor com brilho, ajustando profundidade e reflexo conforme a base atual do fio."
        };
    }

    return {
        title: "Avaliacao presencial e teste de mecha",
        detail: "como o objetivo esta aberto, eu priorizaria uma analise ao vivo para definir profundidade, reflexo e o nivel de abertura seguro para o fio."
    };
}

function getColorWarnings(currentBase, goal, history) {
    const combined = normalizeText(`${currentBase} ${goal} ${history}`);
    const warnings = [];

    if (includesAny(combined, ["preto tingido", "sair do preto"]) && includesAny(combined, ["loiro", "platinado", "clarear"])) {
        warnings.push("Se existe pigmento escuro artificial, a transicao para loiro pede etapas. Tinta nao clareia tinta.");
    }

    if (includesAny(combined, ["progressiva", "alisamento", "relaxamento"])) {
        warnings.push("Quimicas alinhadoras pedem teste de mecha e teste de elasticidade antes de clareamentos fortes.");
    }

    if (includesAny(combined, ["henna", "hena", "metalico"])) {
        warnings.push("Henna e pigmentos metalicos exigem teste de incompatibilidade antes de qualquer descoloracao.");
    }

    if (includesAny(combined, ["emborrachado", "quebrando", "quebrado", "sensibilizado", "elastico"])) {
        warnings.push("Se o fio esta sensibilizado, o plano precisa priorizar tratamento e corte tecnico antes de maior abertura.");
    }

    if (!warnings.length) {
        warnings.push("Mesmo em casos simples, vale manter teste de mecha e leitura de resistencia do fio antes da aplicacao.");
    }

    return warnings;
}

function parseTrendProfile(text) {
    if (includesAny(text, ["misto", "mista", "mistas", "ambos", "sem preferencia"])) {
        return "misto";
    }

    if (includesAny(text, ["masculino", "masculina", "masculinos", "masculinas", "masc", "homem"])) {
        return "masculino";
    }

    if (includesAny(text, ["feminino", "feminina", "femininos", "femininas", "fem", "mulher"])) {
        return "feminino";
    }

    return "";
}

function parseMaintenance(text) {
    if (includesAny(text, ["baixa", "baixo", "pratico", "pratica"])) {
        return "baixa";
    }

    if (includesAny(text, ["media", "medio", "equilibrado", "equilibrada"])) {
        return "media";
    }

    if (includesAny(text, ["alta", "alto", "fashion", "finalizacao diaria"])) {
        return "alta";
    }

    return "";
}

function getTrendRecommendations(profile, maintenance, vibe) {
    const desiredScale = MAINTENANCE_SCALE[maintenance] ?? 2;
    const vibeTokens = normalizeText(vibe).split(/\s+/).filter(Boolean);

    return TREND_CATALOG
        .filter((item) => profile === "misto" || item.profile === profile)
        .map((item) => {
            let score = 6 - Math.abs(desiredScale - MAINTENANCE_SCALE[item.maintenance]);

            vibeTokens.forEach((token) => {
                if (item.tags.includes(token)) {
                    score += 2;
                }
            });

            return { item, score };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map((entry) => entry.item);
}

function buildBookingDraft(booking) {
    return {
        subject: `Pre-agendamento - ${booking.service}`,
        message: [
            `Nome: ${booking.name}`,
            `Servico de interesse: ${booking.service}`,
            `Data preferencial: ${booking.date}`,
            `Horario ou periodo ideal: ${booking.time}`,
            `WhatsApp: ${booking.phone}`,
            `Observacoes: ${booking.notes || "Sem observacoes adicionais."}`
        ].join("\n")
    };
}

export function initChatWidget() {
    const chatWidget = document.getElementById("chatWidget");
    const chatWindow = document.getElementById("chatWindow");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const fabChat = document.getElementById("fabChat");
    const navChatToggle = document.getElementById("navChatToggle");
    const heroChatToggle = document.getElementById("heroChatToggle");
    const closeChat = document.getElementById("closeChat");
    const nameInput = document.getElementById("nome");
    const phoneInput = document.getElementById("telefone");
    const serviceInput = document.getElementById("servico");
    const preferredDateInput = document.getElementById("dataPreferencial");
    const preferredTimeInput = document.getElementById("horarioPreferencial");
    const sourceInput = document.getElementById("origemAgendamento");
    const subjectInput = document.getElementById("assunto");
    const messageInput = document.getElementById("mensagem");
    const formStatus = document.getElementById("formStatus");
    const contactSection = document.getElementById("contato");

    if (!chatWidget || !chatWindow || !userInput || !sendBtn) {
        return;
    }

    let context = createChatContext();
    let lastChatToggle = null;

    const setInputPlaceholder = (placeholder) => {
        userInput.placeholder = placeholder;
    };

    const addMessage = (text, sender) => {
        const bubble = document.createElement("div");
        bubble.classList.add("message", sender === "user" ? "user-message" : "bot-message");
        bubble.textContent = text;
        chatWindow.appendChild(bubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    const seedWelcomeMessage = () => {
        chatWindow.innerHTML = "";
        setInputPlaceholder(INPUT_PLACEHOLDERS.menu);
        addMessage(MENU_MESSAGE, "bot");
    };

    const resetConversation = ({ announce = true } = {}) => {
        context = createChatContext();
        setInputPlaceholder(INPUT_PLACEHOLDERS.menu);

        if (announce) {
            addMessage("Vamos recomecar.\n\n" + MENU_MESSAGE, "bot");
        }
    };

    const isChatOpen = () => chatWidget.classList.contains("active");

    const setChatOpen = (open) => {
        chatWidget.classList.toggle("active", open);
        chatWidget.setAttribute("aria-hidden", String(!open));

        [fabChat, navChatToggle, heroChatToggle].forEach((element) => {
            if (!element) {
                return;
            }

            element.setAttribute("aria-expanded", String(open));
        });

        if (open) {
            window.setTimeout(() => userInput.focus(), 0);
            return;
        }

        lastChatToggle?.focus?.();
    };

    const toggleChat = (event) => {
        if (event?.currentTarget) {
            lastChatToggle = event.currentTarget;
        }

        setChatOpen(!isChatOpen());
    };

    const startBookingFlow = () => {
        context.flow = "booking";
        context.step = "booking-name";
        context.booking = createChatContext().booking;
        setInputPlaceholder(INPUT_PLACEHOLDERS.bookingName);

        return [
            "Perfeito. Vou montar um pre-agendamento para voce.",
            "No final eu deixo o formulario de contato preenchido para revisao.",
            "",
            "Qual e o seu nome?"
        ].join("\n");
    };

    const fillContactFormFromBooking = (booking) => {
        const draft = buildBookingDraft(booking);

        if (nameInput) {
            nameInput.value = booking.name;
        }

        if (phoneInput) {
            phoneInput.value = booking.phone;
        }

        if (serviceInput) {
            serviceInput.value = booking.service;
        }

        if (preferredDateInput) {
            preferredDateInput.value = booking.date;
        }

        if (preferredTimeInput) {
            preferredTimeInput.value = booking.time;
        }

        if (sourceInput) {
            sourceInput.value = "coloria_chat";
        }

        if (subjectInput) {
            subjectInput.value = draft.subject;
        }

        if (messageInput) {
            messageInput.value = draft.message;
        }

        if (formStatus) {
            formStatus.textContent = "Pre-agendamento montado pela ColorIA. Revise e clique em Enviar.";
            formStatus.classList.remove("error");
        }

        contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const finalizeBooking = () => {
        const booking = context.booking;
        const notes = booking.notes || "Sem observacoes adicionais.";

        fillContactFormFromBooking(booking);
        context = createChatContext();
        setInputPlaceholder(INPUT_PLACEHOLDERS.menu);

        return [
            "Resumo do seu pre-agendamento:",
            `- Nome: ${booking.name}`,
            `- Servico: ${booking.service}`,
            `- Data preferencial: ${booking.date}`,
            `- Horario ou periodo: ${booking.time}`,
            `- WhatsApp: ${booking.phone}`,
            `- Observacoes: ${notes}`,
            "",
            "Ja deixei o formulario preenchido para voce revisar e enviar.",
            "Se quiser, agora posso te ajudar com cor ou cortes. Digite 2 ou 3."
        ].join("\n");
    };

    const handleBookingFlow = (rawText) => {
        const text = rawText.trim();
        const normalized = normalizeText(text);

        switch (context.step) {
            case "booking-name":
                context.booking.name = formatPersonName(text);
                context.step = "booking-service";
                setInputPlaceholder(INPUT_PLACEHOLDERS.bookingService);

                return `Prazer, ${getFirstName(context.booking.name)}. Qual servico voce quer agendar? Ex: corte feminino, corte masculino, coloracao, descoloracao ou tratamento.`;

            case "booking-service":
                context.booking.service = text;
                context.step = "booking-date";
                setInputPlaceholder(INPUT_PLACEHOLDERS.bookingDate);

                return "Perfeito. Qual data ou dia da semana voce prefere?";

            case "booking-date":
                context.booking.date = text;
                context.step = "booking-time";
                setInputPlaceholder(INPUT_PLACEHOLDERS.bookingTime);

                return "Qual horario ou periodo funciona melhor para voce? Ex: 14h, manha, tarde ou sabado cedo.";

            case "booking-time":
                context.booking.time = text;
                context.step = "booking-phone";
                setInputPlaceholder(INPUT_PLACEHOLDERS.bookingPhone);

                return "Pode me passar um WhatsApp para retorno?";

            case "booking-phone":
                context.booking.phone = text;
                context.step = "booking-notes";
                setInputPlaceholder(INPUT_PLACEHOLDERS.bookingNotes);

                return "Quer acrescentar alguma observacao? Pode ser referencia de corte, ideia de cor, tecnica desejada ou digitar 'pular'.";

            case "booking-notes":
                context.booking.notes = isSkipText(normalized) ? "" : text;
                return finalizeBooking();

            default:
                return startBookingFlow();
        }
    };

    const startColorFlow = () => {
        context.flow = "color";
        context.step = "color-current";
        context.color = createChatContext().color;
        setInputPlaceholder(INPUT_PLACEHOLDERS.colorCurrent);

        return [
            "Vamos fazer uma leitura tecnica inicial.",
            "Eu vou te orientar com base em neutralizacao pela estrela de Ostwald, coloracao e descoloracao.",
            "",
            "Qual e a sua base atual? Ex: castanho medio com mechas, preto tingido, loiro amarelado."
        ].join("\n");
    };

    const finalizeColorFlow = () => {
        const { currentBase, goal, history } = context.color;
        const technique = getTechniqueRecommendation(currentBase, goal, history);
        const ostwaldGuidance = getOstwaldGuidance(currentBase, goal);
        const warnings = getColorWarnings(currentBase, goal, history);

        context = createChatContext();
        setInputPlaceholder(INPUT_PLACEHOLDERS.menu);

        return [
            "Leitura tecnica inicial:",
            `- Base atual: ${currentBase}`,
            `- Objetivo: ${goal}`,
            `- Historico do fio: ${history}`,
            "",
            "Estrela de Ostwald:",
            `- ${ostwaldGuidance}`,
            "",
            "Tecnica que faz mais sentido agora:",
            `- ${technique.title}: ${technique.detail}`,
            "",
            "Cuidados importantes:",
            ...warnings.map((warning) => `- ${warning}`),
            "",
            "Se quiser transformar essa ideia em pre-agendamento, digite agendar."
        ].join("\n");
    };

    const handleColorFlow = (text) => {
        switch (context.step) {
            case "color-current":
                context.color.currentBase = text.trim();
                context.step = "color-goal";
                setInputPlaceholder(INPUT_PLACEHOLDERS.colorGoal);

                return "Qual resultado voce quer? Ex: morena iluminada fria, neutralizar amarelo, platinado, ruivo cobre ou cobertura de brancos.";

            case "color-goal":
                context.color.goal = text.trim();
                context.step = "color-history";
                setInputPlaceholder(INPUT_PLACEHOLDERS.colorHistory);

                return "Agora me conta o historico do fio. Ele e virgem, colorido, descolorido ou sensibilizado? Tem progressiva, alisamento ou henna?";

            case "color-history":
                context.color.history = text.trim();
                return finalizeColorFlow();

            default:
                return startColorFlow();
        }
    };

    const startTrendFlow = () => {
        context.flow = "trends";
        context.step = "trend-profile";
        context.trends = createChatContext().trends;
        setInputPlaceholder(INPUT_PLACEHOLDERS.trendProfile);

        return [
            "Vamos olhar referencias de corte que estao fortes nas redes e em editoriais recentes.",
            "",
            "Voce quer sugestoes mais masculinas, femininas ou mistas?"
        ].join("\n");
    };

    const finalizeTrendFlow = () => {
        const { profile, maintenance, vibe } = context.trends;
        const recommendations = getTrendRecommendations(profile, maintenance, vibe);
        const profileLabel = profile === "misto" ? "mistas" : `${profile}s`;

        context = createChatContext();
        setInputPlaceholder(INPUT_PLACEHOLDERS.menu);

        return [
            `Pelo que esta forte agora em conteudos de redes sociais e referencias de beleza, eu te mostraria estas opcoes ${profileLabel}:`,
            "",
            ...recommendations.flatMap((item, index) => [
                `${index + 1}. ${item.name}: ${item.description}.`,
                `   Manutencao: ${item.maintenance}. Ideal para: ${item.bestFor}.`,
                `   Por que esta em alta: ${item.trendPulse}.`
            ]),
            "",
            `Melhor ponto de partida para o que voce pediu: ${recommendations[0]?.name ?? "avaliacao presencial"}.`,
            "Se quiser, eu monto um pre-agendamento com essa ideia. Digite agendar."
        ].join("\n");
    };

    const handleTrendFlow = (rawText) => {
        const text = rawText.trim();
        const normalized = normalizeText(text);

        switch (context.step) {
            case "trend-profile": {
                const profile = parseTrendProfile(normalized);

                if (!profile) {
                    return "Me responde com masculino, feminino ou misto para eu filtrar melhor as tendencias.";
                }

                context.trends.profile = profile;
                context.step = "trend-maintenance";
                setInputPlaceholder(INPUT_PLACEHOLDERS.trendMaintenance);

                return "Qual nivel de manutencao voce prefere: baixa, media ou alta?";
            }

            case "trend-maintenance": {
                const maintenance = parseMaintenance(normalized);

                if (!maintenance) {
                    return "Me fala baixa, media ou alta manutencao para eu acertar nas sugestoes.";
                }

                context.trends.maintenance = maintenance;
                context.step = "trend-vibe";
                setInputPlaceholder(INPUT_PLACEHOLDERS.trendVibe);

                return "Que imagem voce quer passar? Ex: clean, moderno, romantico, fashion, executivo, com volume.";
            }

            case "trend-vibe":
                context.trends.vibe = text;
                return finalizeTrendFlow();

            default:
                return startTrendFlow();
        }
    };

    const processInput = (rawText) => {
        const text = rawText.trim();
        const globalAction = getGlobalAction(text);
        const menuIntent = context.flow === "menu" ? getMenuIntent(text) : "";

        if (globalAction === "reset") {
            resetConversation();
            return;
        }

        if (globalAction === "booking") {
            addMessage(startBookingFlow(), "bot");
            return;
        }

        if (globalAction === "color") {
            addMessage(startColorFlow(), "bot");
            return;
        }

        if (globalAction === "trends") {
            addMessage(startTrendFlow(), "bot");
            return;
        }

        if (menuIntent === "booking") {
            addMessage(startBookingFlow(), "bot");
            return;
        }

        if (menuIntent === "color") {
            addMessage(startColorFlow(), "bot");
            return;
        }

        if (menuIntent === "trends") {
            addMessage(startTrendFlow(), "bot");
            return;
        }

        let response = "";

        if (context.flow === "booking") {
            response = handleBookingFlow(text);
        } else if (context.flow === "color") {
            response = handleColorFlow(text);
        } else if (context.flow === "trends") {
            response = handleTrendFlow(text);
        } else {
            response = [
                "Posso te guiar por um destes caminhos:",
                "1. Pre-agendamento",
                "2. Consultoria de cor",
                "3. Tendencias de corte",
                "",
                "Digite 1, 2 ou 3 para continuar."
            ].join("\n");
        }

        window.setTimeout(() => addMessage(response, "bot"), 350);
    };

    const handleSend = () => {
        const text = userInput.value.trim();

        if (!text) {
            return;
        }

        addMessage(text, "user");
        userInput.value = "";
        processInput(text);
    };

    fabChat?.addEventListener("click", toggleChat);
    navChatToggle?.addEventListener("click", toggleChat);
    heroChatToggle?.addEventListener("click", toggleChat);

    closeChat?.addEventListener("click", (event) => {
        if (event?.currentTarget) {
            lastChatToggle = event.currentTarget;
        }

        setChatOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isChatOpen()) {
            setChatOpen(false);
        }
    });

    sendBtn.addEventListener("click", handleSend);
    userInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSend();
        }
    });

    seedWelcomeMessage();
}

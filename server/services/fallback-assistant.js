// Mantem um modo local para o chat continuar util mesmo sem chave do Gemini.
const MENU_MESSAGE = [
    "Ola! Sou a ColorIA Agenda.",
    "Posso te ajudar com:",
    "1. Pre-agendamento de atendimento",
    "2. Escolha de cor, neutralizacao e tecnica",
    "3. Tendencias de corte masculino e feminino",
    "",
    "Digite 1, 2, 3 ou escreva agendar, cor ou corte."
].join("\n");

const MAINTENANCE_SCALE = {
    alta: 3,
    baixa: 1,
    media: 2
};

const TREND_CATALOG = [
    {
        bestFor: "quem quer visual chic, pratico e com cara atual",
        description: "bob polido com pontas suaves e acabamento elegante",
        maintenance: "baixa",
        name: "Soft bob",
        profile: "feminino",
        tags: ["clean", "moderno", "sofisticado", "executivo"],
        trendPulse: "esta forte em reels e conteudos minimalistas porque entrega presenca sem exigir muita finalizacao"
    },
    {
        bestFor: "quem quer cabelo com volume, bouncy e efeito de escova",
        description: "camadas longas com leveza e franja moldando o rosto",
        maintenance: "media",
        name: "Butterfly cut",
        profile: "feminino",
        tags: ["volume", "movimento", "romantico", "moderno"],
        trendPulse: "segue muito pedido em TikTok e Instagram por criar movimento sem perder comprimento"
    },
    {
        bestFor: "quem quer movimento, volume controlado e visual menos certinho",
        description: "shag leve com camadas aereas e moldura de rosto mais romantica",
        maintenance: "media",
        name: "Modern shag suave",
        profile: "feminino",
        tags: ["fashion", "textura", "moderno", "movimento"],
        trendPulse: "voltou forte em referencias editoriais porque mistura textura com um acabamento mais suave e atual"
    },
    {
        bestFor: "quem quer transicao segura entre longo e curto",
        description: "comprimento medio com camadas suaves e caimento leve",
        maintenance: "baixa",
        name: "Midi em camadas aereas",
        profile: "feminino",
        tags: ["movimento", "clean", "romantico", "leve"],
        trendPulse: "aparece bastante em conteudos de beleza que buscam naturalidade e movimento controlado"
    },
    {
        bestFor: "quem gosta de styling e quer destacar olhos e moldura do rosto",
        description: "franja ajustada ao rosto, do wispy ao curtain, com impacto maior no visual",
        maintenance: "alta",
        name: "Franja marcante personalizada",
        profile: "feminino",
        tags: ["romantico", "fashion", "volume", "textura"],
        trendPulse: "esta em alta porque adiciona personalidade rapida ao corte e rende muito conteudo de transformacao nas redes"
    },
    {
        bestFor: "quem quer imagem organizada e manutencao rapida",
        description: "laterais limpas com topo curto e acabamento preciso",
        maintenance: "baixa",
        name: "Crew cut com taper",
        profile: "masculino",
        tags: ["clean", "executivo", "pratico", "moderno"],
        trendPulse: "continua forte nos perfis de barbearia por ser versatil, masculino e facil de manter"
    },
    {
        bestFor: "quem quer contraste, definicao e visual de tendencia",
        description: "fade em volta da orelha com topo mais vivo e textura aparente",
        maintenance: "media",
        name: "Burst fade texturizado",
        profile: "masculino",
        tags: ["moderno", "textura", "fashion", "marcante"],
        trendPulse: "esta em alta em barber feeds e videos curtos porque fotografa muito bem e parece moderno"
    },
    {
        bestFor: "quem quer diferenciar o visual sem exagerar no corte",
        description: "mullet mais suave, com nuca trabalhada e topo desconectado",
        maintenance: "media",
        name: "Soft mullet",
        profile: "masculino",
        tags: ["fashion", "movimento", "ousado", "textura"],
        trendPulse: "segue em evidenca nas redes por misturar referencia retro com acabamento atual"
    },
    {
        bestFor: "quem quer praticidade com leitura atual",
        description: "frente curta, topo controlado e laterais bem ajustadas",
        maintenance: "baixa",
        name: "French crop ou Caesar moderno",
        profile: "masculino",
        tags: ["clean", "textura", "pratico", "casual"],
        trendPulse: "aparece muito em perfis de transformacao por valorizar rosto e ser facil de finalizar"
    },
    {
        bestFor: "quem quer um corte com mais volume e identidade",
        description: "franja dividida com topo medio e laterais limpas",
        maintenance: "media",
        name: "Curtains com taper baixo",
        profile: "masculino",
        tags: ["volume", "casual", "moderno", "movimento"],
        trendPulse: "volta forte quando a referencia e cabelo com movimento e visual mais jovem"
    }
];

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
}

function formatPersonName(value) {
    return String(value || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function createFallbackState(metadata = {}) {
    return {
        booking: {
            date: "",
            email: "",
            name: formatPersonName(metadata.profileName || ""),
            notes: "",
            phone: metadata.phone || "",
            service: "",
            time: ""
        },
        color: {
            currentBase: "",
            goal: "",
            history: ""
        },
        flow: "menu",
        step: "menu",
        trends: {
            maintenance: "",
            profile: "",
            vibe: ""
        }
    };
}

function getGlobalAction(text) {
    const exactValue = normalizeText(text);

    if (["reiniciar", "recomecar", "resetar", "menu", "inicio", "voltar ao menu"].includes(exactValue)) {
        return "reset";
    }

    if (["1", "agendar", "agendamento", "agenda"].includes(exactValue)) {
        return "booking";
    }

    if (["2", "cor", "cores", "coloracao", "descoloracao"].includes(exactValue)) {
        return "color";
    }

    if (["3", "corte", "cortes", "tendencia", "tendencias"].includes(exactValue)) {
        return "trends";
    }

    return "";
}

function getMenuIntent(text) {
    const normalized = normalizeText(text);

    if (includesAny(normalized, ["agendar", "agendamento", "agenda", "marcar horario", "horario"])) {
        return "booking";
    }

    if (includesAny(normalized, ["cor", "cores", "coloracao", "descoloracao", "mechas", "matizar"])) {
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
            detail: "o caminho mais seguro costuma ser base natural misturada com a nuance desejada, priorizando cobertura uniforme e teste de mecha.",
            title: "Coloracao permanente de cobertura"
        };
    }

    if (includesAny(combined, ["sair do preto", "preto tingido"]) && wantsBlonde) {
        return {
            detail: "quando ha pigmento escuro artificial, o clareamento pede remocao progressiva. Tinta nao clareia tinta, entao o plano deve ser feito por etapas.",
            title: "Limpeza de cor ou descoloracao em etapas"
        };
    }

    if (wantsBlonde && baseFamily === "escura") {
        return {
            detail: "para sair de base escura e chegar em loiros frios ou claros, a subida deve ser gradual, com avaliacao de elasticidade e resistencia.",
            title: "Descoloracao controlada com reconstrucao entre sessoes"
        };
    }

    if (wantsNaturalLight && wantsSubtleLight) {
        return {
            detail: "essas tecnicas iluminam com delicadeza, entregam crescimento mais elegante e pedem menos manutencao que uma descoloracao global.",
            title: "Babylights ou balayage suave"
        };
    }

    if (wantsNaturalLight) {
        return {
            detail: "balayage funciona melhor para iluminacao mais organica, enquanto foilyage entrega mais contraste e mais abertura de fundo.",
            title: "Balayage ou foilyage"
        };
    }

    if (alreadyLightened && includesAny(desired, ["neutralizar", "matizar", "frio", "acinzentado", "perolado", "bege"])) {
        return {
            detail: "se a fibra ja esta clara, a melhor leitura costuma ser matizacao com deposito inteligente de pigmento em vez de mais abertura.",
            title: "Tonalizacao ou gloss corretivo"
        };
    }

    if (wantsDarker) {
        return {
            detail: "boa opcao para devolver profundidade, corrigir excesso de clareamento e uniformizar reflexos sem carregar o visual.",
            title: "Lowlights e banho de brilho"
        };
    }

    if (wantsWarm && baseFamily === "escura") {
        return {
            detail: "tons cobre e ruivo costumam aparecer melhor quando existe abertura previa de fundo, principalmente em bases escuras ou coloridas.",
            title: "Pre-iluminacao localizada seguida de tonalizacao quente"
        };
    }

    if (wantsWarm) {
        return {
            detail: "o foco aqui e deposito de cor com brilho, ajustando profundidade e reflexo conforme a base atual do fio.",
            title: "Coloracao ou tonalizacao de reflexo quente"
        };
    }

    return {
        detail: "como o objetivo esta aberto, eu priorizaria uma analise ao vivo para definir profundidade, reflexo e o nivel de abertura seguro para o fio.",
        title: "Avaliacao presencial e teste de mecha"
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

    if (includesAny(combined, ["emborrachado", "quebrando", "sensibilizado", "elastico"])) {
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

    if (includesAny(text, ["masculino", "masculina", "masc", "homem"])) {
        return "masculino";
    }

    if (includesAny(text, ["feminino", "feminina", "fem", "mulher"])) {
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

            return {
                item,
                score
            };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map((entry) => entry.item);
}

function mapBookingToPayload(booking, source) {
    return {
        dataPreferencial: booking.date,
        email: booking.email,
        horarioPreferencial: booking.time,
        mensagem: booking.notes,
        nome: booking.name,
        origemAgendamento: source,
        servico: booking.service,
        telefone: booking.phone
    };
}

function getMissingBookingFields(booking) {
    return ["name", "phone", "service"]
        .filter((field) => !booking[field])
        .map((field) => ({
            name: "nome",
            phone: "telefone",
            service: "servico"
        })[field]);
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

function startBookingFlow(state) {
    state.flow = "booking";
    state.step = state.booking.name ? "booking-service" : "booking-name";

    if (state.step === "booking-service") {
        return "Perfeito. Ja reconheci seu nome. Qual servico voce quer agendar?";
    }

    return "Perfeito. Vou montar seu pre-agendamento. Qual e o seu nome?";
}

function finalizeBooking(state, source) {
    const booking = state.booking;
    const notes = booking.notes || "Sem observacoes adicionais.";

    return {
        booking: mapBookingToPayload(booking, source),
        missingFields: getMissingBookingFields(booking),
        readyToSchedule: getMissingBookingFields(booking).length === 0,
        reply: [
            "Resumo do seu pre-agendamento:",
            `- Nome: ${booking.name}`,
            `- Servico: ${booking.service}`,
            `- Data preferencial: ${booking.date || "Nao informada"}`,
            `- Horario ou periodo: ${booking.time || "Nao informado"}`,
            `- WhatsApp: ${booking.phone}`,
            `- Observacoes: ${notes}`,
            "",
            "Vou deixar esse pedido pronto para registro."
        ].join("\n"),
        route: "booking"
    };
}

function handleBookingFlow(state, rawText, source, metadata) {
    const text = rawText.trim();
    const normalized = normalizeText(text);

    if (!state.booking.phone && metadata.phone) {
        state.booking.phone = metadata.phone;
    }

    switch (state.step) {
        case "booking-name":
            state.booking.name = formatPersonName(text) || state.booking.name;
            state.step = "booking-service";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: `Prazer, ${state.booking.name.split(" ")[0]}. Qual servico voce quer agendar?`,
                route: "booking"
            };

        case "booking-service":
            state.booking.service = text;
            state.step = "booking-date";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Qual data ou dia da semana voce prefere?",
                route: "booking"
            };

        case "booking-date":
            state.booking.date = text;
            state.step = "booking-time";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Qual horario ou periodo funciona melhor para voce?",
                route: "booking"
            };

        case "booking-time":
            state.booking.time = text;

            if (state.booking.phone) {
                state.step = "booking-notes";
                return {
                    booking: mapBookingToPayload(state.booking, source),
                    missingFields: getMissingBookingFields(state.booking),
                    readyToSchedule: false,
                    reply: "Quer acrescentar alguma observacao? Pode digitar a referencia ou escrever 'pular'.",
                    route: "booking"
                };
            }

            state.step = "booking-phone";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Pode me passar um WhatsApp para retorno?",
                route: "booking"
            };

        case "booking-phone":
            state.booking.phone = text;
            state.step = "booking-notes";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Quer acrescentar alguma observacao? Pode digitar a referencia ou escrever 'pular'.",
                route: "booking"
            };

        case "booking-notes":
            state.booking.notes = isSkipText(normalized) ? "" : text;
            return finalizeBooking(state, source);

        default:
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: startBookingFlow(state),
                route: "booking"
            };
    }
}

function startColorFlow(state) {
    state.flow = "color";
    state.step = "color-current";
    return "Vamos fazer uma leitura tecnica inicial. Qual e a sua base atual?";
}

function finalizeColorFlow(state, source) {
    const { currentBase, goal, history } = state.color;
    const technique = getTechniqueRecommendation(currentBase, goal, history);
    const ostwaldGuidance = getOstwaldGuidance(currentBase, goal);
    const warnings = getColorWarnings(currentBase, goal, history);

    return {
        booking: mapBookingToPayload(state.booking, source),
        missingFields: getMissingBookingFields(state.booking),
        readyToSchedule: false,
        reply: [
            "Leitura tecnica inicial:",
            `- Base atual: ${currentBase}`,
            `- Objetivo: ${goal}`,
            `- Historico do fio: ${history}`,
            "",
            `Estrela de Ostwald: ${ostwaldGuidance}`,
            "",
            `Tecnica sugerida: ${technique.title}. ${technique.detail}`,
            "",
            "Cuidados importantes:",
            ...warnings.map((warning) => `- ${warning}`),
            "",
            "Se quiser transformar isso em agendamento, digite agendar."
        ].join("\n"),
        route: "color"
    };
}

function handleColorFlow(state, text, source) {
    switch (state.step) {
        case "color-current":
            state.color.currentBase = text.trim();
            state.step = "color-goal";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Qual resultado voce quer? Ex: morena iluminada fria, neutralizar amarelo ou ruivo cobre.",
                route: "color"
            };

        case "color-goal":
            state.color.goal = text.trim();
            state.step = "color-history";
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Agora me conta o historico do fio. Ele e virgem, colorido, descolorido ou sensibilizado?",
                route: "color"
            };

        case "color-history":
            state.color.history = text.trim();
            return finalizeColorFlow(state, source);

        default:
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: startColorFlow(state),
                route: "color"
            };
    }
}

function startTrendFlow(state) {
    state.flow = "trends";
    state.step = "trend-profile";
    return "Vamos olhar referencias de corte. Voce quer sugestoes masculinas, femininas ou mistas?";
}

function finalizeTrendFlow(state, source) {
    const recommendations = getTrendRecommendations(
        state.trends.profile,
        state.trends.maintenance,
        state.trends.vibe
    );

    return {
        booking: mapBookingToPayload(state.booking, source),
        missingFields: getMissingBookingFields(state.booking),
        readyToSchedule: false,
        reply: [
            "Essas sao as melhores opcoes para o perfil que voce descreveu:",
            "",
            ...recommendations.flatMap((item, index) => [
                `${index + 1}. ${item.name}: ${item.description}.`,
                `   Manutencao: ${item.maintenance}. Ideal para: ${item.bestFor}.`,
                `   Por que esta em alta: ${item.trendPulse}.`
            ]),
            "",
            `Melhor ponto de partida: ${recommendations[0]?.name || "avaliacao presencial"}.`,
            "Se quiser, digite agendar e eu transformo isso em pre-agendamento."
        ].join("\n"),
        route: "trends"
    };
}

function handleTrendFlow(state, rawText, source) {
    const text = rawText.trim();
    const normalized = normalizeText(text);

    switch (state.step) {
        case "trend-profile": {
            const profile = parseTrendProfile(normalized);

            if (!profile) {
                return {
                    booking: mapBookingToPayload(state.booking, source),
                    missingFields: getMissingBookingFields(state.booking),
                    readyToSchedule: false,
                    reply: "Me responde com masculino, feminino ou misto para eu filtrar melhor.",
                    route: "trends"
                };
            }

            state.trends.profile = profile;
            state.step = "trend-maintenance";

            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Qual nivel de manutencao voce prefere: baixa, media ou alta?",
                route: "trends"
            };
        }

        case "trend-maintenance": {
            const maintenance = parseMaintenance(normalized);

            if (!maintenance) {
                return {
                    booking: mapBookingToPayload(state.booking, source),
                    missingFields: getMissingBookingFields(state.booking),
                    readyToSchedule: false,
                    reply: "Me fala baixa, media ou alta manutencao para eu acertar melhor.",
                    route: "trends"
                };
            }

            state.trends.maintenance = maintenance;
            state.step = "trend-vibe";

            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: "Que imagem voce quer passar? Ex: clean, moderno, romantico ou fashion.",
                route: "trends"
            };
        }

        case "trend-vibe":
            state.trends.vibe = text;
            return finalizeTrendFlow(state, source);

        default:
            return {
                booking: mapBookingToPayload(state.booking, source),
                missingFields: getMissingBookingFields(state.booking),
                readyToSchedule: false,
                reply: startTrendFlow(state),
                route: "trends"
            };
    }
}

function processFallbackMessage({ message, metadata = {}, session, source }) {
    const state = session.fallbackState || createFallbackState(metadata);
    const text = String(message || "").trim();
    const globalAction = getGlobalAction(text);
    const menuIntent = state.flow === "menu" ? getMenuIntent(text) : "";

    session.fallbackState = state;

    if (globalAction === "reset") {
        session.fallbackState = createFallbackState(metadata);
        return {
            booking: mapBookingToPayload(session.fallbackState.booking, source),
            missingFields: [],
            readyToSchedule: false,
            reply: `Vamos recomecar.\n\n${MENU_MESSAGE}`,
            route: "general"
        };
    }

    if (globalAction === "booking" || menuIntent === "booking") {
        return {
            booking: mapBookingToPayload(state.booking, source),
            missingFields: getMissingBookingFields(state.booking),
            readyToSchedule: false,
            reply: startBookingFlow(state),
            route: "booking"
        };
    }

    if (globalAction === "color" || menuIntent === "color") {
        return {
            booking: mapBookingToPayload(state.booking, source),
            missingFields: getMissingBookingFields(state.booking),
            readyToSchedule: false,
            reply: startColorFlow(state),
            route: "color"
        };
    }

    if (globalAction === "trends" || menuIntent === "trends") {
        return {
            booking: mapBookingToPayload(state.booking, source),
            missingFields: getMissingBookingFields(state.booking),
            readyToSchedule: false,
            reply: startTrendFlow(state),
            route: "trends"
        };
    }

    if (state.flow === "booking") {
        return handleBookingFlow(state, text, source, metadata);
    }

    if (state.flow === "color") {
        return handleColorFlow(state, text, source);
    }

    if (state.flow === "trends") {
        return handleTrendFlow(state, text, source);
    }

    return {
        booking: mapBookingToPayload(state.booking, source),
        missingFields: [],
        readyToSchedule: false,
        reply: MENU_MESSAGE,
        route: "general"
    };
}

module.exports = {
    createFallbackState,
    processFallbackMessage
};

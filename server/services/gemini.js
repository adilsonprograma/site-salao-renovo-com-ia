const { config } = require("../config");

const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        reply: {
            type: "string",
            description: "Resposta curta, calorosa e objetiva em portugues do Brasil."
        },
        route: {
            type: "string",
            enum: ["booking", "color", "trends", "general"],
            description: "Categoria principal da resposta."
        },
        readyToSchedule: {
            type: "boolean",
            description: "Marque true quando houver dados suficientes para registrar o pre-agendamento."
        },
        missingFields: {
            type: "array",
            description: "Campos ainda ausentes para um pre-agendamento minimamente util.",
            items: {
                type: "string",
                enum: ["nome", "telefone", "servico", "dataPreferencial", "horarioPreferencial", "email", "mensagem"]
            }
        },
        booking: {
            type: "object",
            properties: {
                nome: {
                    type: ["string", "null"],
                    description: "Nome do cliente quando informado."
                },
                email: {
                    type: ["string", "null"],
                    description: "Email informado pelo cliente, se existir."
                },
                telefone: {
                    type: ["string", "null"],
                    description: "Telefone ou WhatsApp informado."
                },
                servico: {
                    type: ["string", "null"],
                    description: "Servico ou combinacao de servicos desejada."
                },
                dataPreferencial: {
                    type: ["string", "null"],
                    description: "Data, dia da semana ou periodo citado pelo cliente."
                },
                horarioPreferencial: {
                    type: ["string", "null"],
                    description: "Horario ou janela de atendimento desejada."
                },
                mensagem: {
                    type: ["string", "null"],
                    description: "Observacoes adicionais relevantes para o agendamento."
                }
            },
            required: [
                "nome",
                "email",
                "telefone",
                "servico",
                "dataPreferencial",
                "horarioPreferencial",
                "mensagem"
            ]
        }
    },
    required: ["reply", "route", "readyToSchedule", "missingFields", "booking"]
};

function isGeminiEnabled() {
    return config.gemini.enabled;
}

function buildPrompt({ channel, message, metadata, session }) {
    const transcript = session.transcript
        .slice(-8)
        .map((entry) => `${entry.role === "user" ? "Cliente" : "ColorIA"}: ${entry.text}`)
        .join("\n");

    return [
        "Voce e a ColorIA Agenda do Renovo Cabeleireiros, em Russas/CE.",
        "Responda sempre em portugues do Brasil, com tom humano, acolhedor e pratico.",
        "Sua funcao principal e ajudar com agendamento, orientacao inicial de cor e tendencias de corte.",
        "Nunca invente dados de agendamento. Extraia apenas o que estiver explicito na mensagem ou no contexto.",
        "Para agendamento, priorize coletar nome, telefone, servico, data preferencial e horario preferencial.",
        "Email e opcional no WhatsApp e no chat do site.",
        "Quando o cliente pedir agendamento e ja existirem nome, telefone e servico, voce pode marcar readyToSchedule=true.",
        "Se faltarem dados, faca apenas a proxima pergunta mais util.",
        "Se a conversa for sobre cor ou corte, entregue uma orientacao curta e convide para agendar se fizer sentido.",
        "",
        `Canal: ${channel}`,
        `Telefone disponivel no canal: ${metadata.phone || "nao"}`,
        `Nome de perfil disponivel no canal: ${metadata.profileName || "nao"}`,
        `Rascunho atual do agendamento: ${JSON.stringify(session.bookingDraft)}`,
        `Ultima intencao conhecida: ${session.lastRoute || "general"}`,
        "",
        "Historico recente:",
        transcript || "Sem historico anterior.",
        "",
        `Mensagem atual do cliente: ${message}`
    ].join("\n");
}

function normalizeGeminiResult(result = {}) {
    return {
        booking: {
            dataPreferencial: result.booking?.dataPreferencial ?? "",
            email: result.booking?.email ?? "",
            horarioPreferencial: result.booking?.horarioPreferencial ?? "",
            mensagem: result.booking?.mensagem ?? "",
            nome: result.booking?.nome ?? "",
            servico: result.booking?.servico ?? "",
            telefone: result.booking?.telefone ?? ""
        },
        missingFields: Array.isArray(result.missingFields) ? result.missingFields : [],
        readyToSchedule: Boolean(result.readyToSchedule),
        reply: typeof result.reply === "string" && result.reply.trim()
            ? result.reply.trim()
            : "Posso te ajudar com agendamento, cor ou tendencias. Me conta o que voce precisa.",
        route: ["booking", "color", "trends", "general"].includes(result.route)
            ? result.route
            : "general"
    };
}

async function generateGeminiAssistantResponse({ channel, message, metadata, session }) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/${config.gemini.apiVersion}/models/${config.gemini.model}:generateContent`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": config.gemini.apiKey
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: buildPrompt({ channel, message, metadata, session })
                            }
                        ],
                        role: "user"
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseJsonSchema: RESPONSE_SCHEMA,
                    temperature: 0.35
                }
            })
        }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload.error?.message || "Falha ao consultar o Gemini.");
    }

    const responseText = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!responseText) {
        throw new Error("O Gemini nao retornou conteudo utilizavel.");
    }

    return normalizeGeminiResult(JSON.parse(responseText));
}

module.exports = {
    generateGeminiAssistantResponse,
    isGeminiEnabled
};

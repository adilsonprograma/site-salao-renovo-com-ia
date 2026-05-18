MENU_MESSAGE = "\n".join(
    [
        "Ola! Sou a ColorIA Agenda.",
        "Posso te ajudar com:",
        "1. Pre-agendamento de atendimento",
        "2. Escolha de cor, neutralizacao e tecnica",
        "3. Tendencias de corte masculino e feminino",
        "",
        "Digite 1, 2, 3 ou escreva agendar, cor ou corte.",
    ]
)

MAINTENANCE_SCALE = {
    "alta": 3,
    "baixa": 1,
    "media": 2,
}

TREND_CATALOG = [
    {
        "bestFor": "quem quer visual chic, pratico e com cara atual",
        "description": "bob polido com pontas suaves e acabamento elegante",
        "maintenance": "baixa",
        "name": "Soft bob",
        "profile": "feminino",
        "tags": ["clean", "moderno", "sofisticado", "executivo"],
        "trendPulse": "esta forte em reels e conteudos minimalistas porque entrega presenca sem exigir muita finalizacao",
    },
    {
        "bestFor": "quem quer cabelo com volume, bouncy e efeito de escova",
        "description": "camadas longas com leveza e franja moldando o rosto",
        "maintenance": "media",
        "name": "Butterfly cut",
        "profile": "feminino",
        "tags": ["volume", "movimento", "romantico", "moderno"],
        "trendPulse": "segue muito pedido em TikTok e Instagram por criar movimento sem perder comprimento",
    },
    {
        "bestFor": "quem quer movimento, volume controlado e visual menos certinho",
        "description": "shag leve com camadas aereas e moldura de rosto mais romantica",
        "maintenance": "media",
        "name": "Modern shag suave",
        "profile": "feminino",
        "tags": ["fashion", "textura", "moderno", "movimento"],
        "trendPulse": "voltou forte em referencias editoriais porque mistura textura com um acabamento mais suave e atual",
    },
    {
        "bestFor": "quem quer transicao segura entre longo e curto",
        "description": "comprimento medio com camadas suaves e caimento leve",
        "maintenance": "baixa",
        "name": "Midi em camadas aereas",
        "profile": "feminino",
        "tags": ["movimento", "clean", "romantico", "leve"],
        "trendPulse": "aparece bastante em conteudos de beleza que buscam naturalidade e movimento controlado",
    },
    {
        "bestFor": "quem gosta de styling e quer destacar olhos e moldura do rosto",
        "description": "franja ajustada ao rosto, do wispy ao curtain, com impacto maior no visual",
        "maintenance": "alta",
        "name": "Franja marcante personalizada",
        "profile": "feminino",
        "tags": ["romantico", "fashion", "volume", "textura"],
        "trendPulse": "esta em alta porque adiciona personalidade rapida ao corte e rende muito conteudo de transformacao nas redes",
    },
    {
        "bestFor": "quem quer imagem organizada e manutencao rapida",
        "description": "laterais limpas com topo curto e acabamento preciso",
        "maintenance": "baixa",
        "name": "Crew cut com taper",
        "profile": "masculino",
        "tags": ["clean", "executivo", "pratico", "moderno"],
        "trendPulse": "continua forte nos perfis de barbearia por ser versatil, masculino e facil de manter",
    },
    {
        "bestFor": "quem quer contraste, definicao e visual de tendencia",
        "description": "fade em volta da orelha com topo mais vivo e textura aparente",
        "maintenance": "media",
        "name": "Burst fade texturizado",
        "profile": "masculino",
        "tags": ["moderno", "textura", "fashion", "marcante"],
        "trendPulse": "esta em alta em barber feeds e videos curtos porque fotografa muito bem e parece moderno",
    },
    {
        "bestFor": "quem quer diferenciar o visual sem exagerar no corte",
        "description": "mullet mais suave, com nuca trabalhada e topo desconectado",
        "maintenance": "media",
        "name": "Soft mullet",
        "profile": "masculino",
        "tags": ["fashion", "movimento", "ousado", "textura"],
        "trendPulse": "segue em evidenca nas redes por misturar referencia retro com acabamento atual",
    },
    {
        "bestFor": "quem quer praticidade com leitura atual",
        "description": "frente curta, topo controlado e laterais bem ajustadas",
        "maintenance": "baixa",
        "name": "French crop ou Caesar moderno",
        "profile": "masculino",
        "tags": ["clean", "textura", "pratico", "casual"],
        "trendPulse": "aparece muito em perfis de transformacao por valorizar rosto e ser facil de finalizar",
    },
    {
        "bestFor": "quem quer um corte com mais volume e identidade",
        "description": "franja dividida com topo medio e laterais limpas",
        "maintenance": "media",
        "name": "Curtains com taper baixo",
        "profile": "masculino",
        "tags": ["volume", "casual", "moderno", "movimento"],
        "trendPulse": "volta forte quando a referencia e cabelo com movimento e visual mais jovem",
    },
]


def normalize_text(value):
    text = str(value or "").strip().lower()
    accent_map = {
        "a": "a",
        "á": "a",
        "à": "a",
        "â": "a",
        "ã": "a",
        "e": "e",
        "é": "e",
        "ê": "e",
        "i": "i",
        "í": "i",
        "o": "o",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "u": "u",
        "ú": "u",
        "c": "c",
        "ç": "c",
    }
    return "".join(accent_map.get(character, character) for character in text)


def includes_any(text, terms):
    return any(term in text for term in terms)


def format_person_name(value):
    words = [word for word in str(value or "").strip().split() if word]
    return " ".join(word[:1].upper() + word[1:].lower() for word in words)


def create_fallback_state(metadata=None):
    metadata = metadata or {}
    return {
        "booking": {
            "date": "",
            "email": "",
            "name": format_person_name(metadata.get("profileName", "")),
            "notes": "",
            "phone": metadata.get("phone", ""),
            "service": "",
            "time": "",
        },
        "color": {
            "currentBase": "",
            "goal": "",
            "history": "",
        },
        "flow": "menu",
        "step": "menu",
        "trends": {
            "maintenance": "",
            "profile": "",
            "vibe": "",
        },
    }


def get_global_action(text):
    exact_value = normalize_text(text)

    if exact_value in {"reiniciar", "recomecar", "resetar", "menu", "inicio", "voltar ao menu"}:
        return "reset"

    if exact_value in {"1", "agendar", "agendamento", "agenda"}:
        return "booking"

    if exact_value in {"2", "cor", "cores", "coloracao", "descoloracao"}:
        return "color"

    if exact_value in {"3", "corte", "cortes", "tendencia", "tendencias"}:
        return "trends"

    return ""


def get_menu_intent(text):
    normalized = normalize_text(text)

    if includes_any(normalized, ["agendar", "agendamento", "agenda", "marcar horario", "horario"]):
        return "booking"

    if includes_any(normalized, ["cor", "cores", "coloracao", "descoloracao", "mechas", "matizar"]):
        return "color"

    if includes_any(normalized, ["corte", "cortes", "tendencia", "tendencias", "fade", "mullet", "bob", "franja"]):
        return "trends"

    return ""


def detect_base_family(text):
    if includes_any(text, ["preto", "castanho escuro", "escuro", "3.0", "2.0", "1.0"]):
        return "escura"

    if includes_any(text, ["castanho medio", "castanho claro", "5.0", "6.0", "7.0", "loiro escuro"]):
        return "media"

    if includes_any(text, ["loiro", "platinado", "clarissimo", "claro", "8.0", "9.0", "10.0"]):
        return "clara"

    if includes_any(text, ["ruivo", "cobre", "acobreado", "vermelho"]):
        return "quente"

    return "indefinida"


def get_ostwald_guidance(current_base, goal):
    combined = normalize_text(f"{current_base} {goal}")

    if includes_any(combined, ["amarelo", "amarelado", "dourado demais"]):
        return "Na estrela de Ostwald, amarelo pede violeta para neutralizacao e acabamento mais frio."

    if includes_any(combined, ["laranja", "alaranjado", "acobreado indesejado"]):
        return "Na estrela de Ostwald, laranja pede azul para segurar o reflexo quente e deixar o loiro mais equilibrado."

    if includes_any(combined, ["vermelho", "avermelhado", "vermelho indesejado"]):
        return "Na estrela de Ostwald, vermelho pede verde para correcao e neutralizacao do reflexo."

    if includes_any(combined, ["cobre", "acobreado", "mel", "dourado", "ruivo"]) and not includes_any(
        combined, ["neutralizar", "matizar"]
    ):
        return "Pela estrela de Ostwald, aqui a ideia nao e neutralizar e sim reforcar reflexos quentes com deposito de pigmento e brilho."

    return "A estrela de Ostwald ajuda a equilibrar reflexos com opostos complementares: violeta corrige amarelo, azul corrige laranja e verde corrige vermelho."


def get_technique_recommendation(current_base, goal, history):
    current = normalize_text(current_base)
    desired = normalize_text(goal)
    background = normalize_text(history)
    combined = f"{current} {desired} {background}"
    base_family = detect_base_family(current)
    wants_blonde = includes_any(desired, ["loiro", "loira", "platinado", "clarear"])
    wants_natural_light = includes_any(desired, ["morena iluminada", "iluminar", "mechas", "bege", "mel", "sun kissed"])
    wants_subtle_light = includes_any(desired, ["delicado", "natural", "suave", "babylights", "fino", "sutil"])
    wants_gray_coverage = includes_any(desired, ["branco", "brancos", "grisalho"])
    wants_darker = includes_any(desired, ["escurecer", "uniformizar", "corrigir mancha", "banho de brilho"])
    wants_warm = includes_any(desired, ["ruivo", "cobre", "acobreado", "vermelho"])
    already_lightened = includes_any(current, ["descolorido", "mechas", "loiro", "platinado"])

    if wants_gray_coverage:
        return {
            "detail": "o caminho mais seguro costuma ser base natural misturada com a nuance desejada, priorizando cobertura uniforme e teste de mecha.",
            "title": "Coloracao permanente de cobertura",
        }

    if includes_any(combined, ["sair do preto", "preto tingido"]) and wants_blonde:
        return {
            "detail": "quando ha pigmento escuro artificial, o clareamento pede remocao progressiva. Tinta nao clareia tinta, entao o plano deve ser feito por etapas.",
            "title": "Limpeza de cor ou descoloracao em etapas",
        }

    if wants_blonde and base_family == "escura":
        return {
            "detail": "para sair de base escura e chegar em loiros frios ou claros, a subida deve ser gradual, com avaliacao de elasticidade e resistencia.",
            "title": "Descoloracao controlada com reconstrucao entre sessoes",
        }

    if wants_natural_light and wants_subtle_light:
        return {
            "detail": "essas tecnicas iluminam com delicadeza, entregam crescimento mais elegante e pedem menos manutencao que uma descoloracao global.",
            "title": "Babylights ou balayage suave",
        }

    if wants_natural_light:
        return {
            "detail": "balayage funciona melhor para iluminacao mais organica, enquanto foilyage entrega mais contraste e mais abertura de fundo.",
            "title": "Balayage ou foilyage",
        }

    if already_lightened and includes_any(
        desired, ["neutralizar", "matizar", "frio", "acinzentado", "perolado", "bege"]
    ):
        return {
            "detail": "se a fibra ja esta clara, a melhor leitura costuma ser matizacao com deposito inteligente de pigmento em vez de mais abertura.",
            "title": "Tonalizacao ou gloss corretivo",
        }

    if wants_darker:
        return {
            "detail": "boa opcao para devolver profundidade, corrigir excesso de clareamento e uniformizar reflexos sem carregar o visual.",
            "title": "Lowlights e banho de brilho",
        }

    if wants_warm and base_family == "escura":
        return {
            "detail": "tons cobre e ruivo costumam aparecer melhor quando existe abertura previa de fundo, principalmente em bases escuras ou coloridas.",
            "title": "Pre-iluminacao localizada seguida de tonalizacao quente",
        }

    if wants_warm:
        return {
            "detail": "o foco aqui e deposito de cor com brilho, ajustando profundidade e reflexo conforme a base atual do fio.",
            "title": "Coloracao ou tonalizacao de reflexo quente",
        }

    return {
        "detail": "como o objetivo esta aberto, eu priorizaria uma analise ao vivo para definir profundidade, reflexo e o nivel de abertura seguro para o fio.",
        "title": "Avaliacao presencial e teste de mecha",
    }


def get_color_warnings(current_base, goal, history):
    combined = normalize_text(f"{current_base} {goal} {history}")
    warnings = []

    if includes_any(combined, ["preto tingido", "sair do preto"]) and includes_any(
        combined, ["loiro", "platinado", "clarear"]
    ):
        warnings.append("Se existe pigmento escuro artificial, a transicao para loiro pede etapas. Tinta nao clareia tinta.")

    if includes_any(combined, ["progressiva", "alisamento", "relaxamento"]):
        warnings.append("Quimicas alinhadoras pedem teste de mecha e teste de elasticidade antes de clareamentos fortes.")

    if includes_any(combined, ["henna", "hena", "metalico"]):
        warnings.append("Henna e pigmentos metalicos exigem teste de incompatibilidade antes de qualquer descoloracao.")

    if includes_any(combined, ["emborrachado", "quebrando", "sensibilizado", "elastico"]):
        warnings.append("Se o fio esta sensibilizado, o plano precisa priorizar tratamento e corte tecnico antes de maior abertura.")

    if not warnings:
        warnings.append("Mesmo em casos simples, vale manter teste de mecha e leitura de resistencia do fio antes da aplicacao.")

    return warnings


def parse_trend_profile(text):
    if includes_any(text, ["misto", "mista", "mistas", "ambos", "sem preferencia"]):
        return "misto"

    if includes_any(text, ["masculino", "masculina", "masc", "homem"]):
        return "masculino"

    if includes_any(text, ["feminino", "feminina", "fem", "mulher"]):
        return "feminino"

    return ""


def parse_maintenance(text):
    if includes_any(text, ["baixa", "baixo", "pratico", "pratica"]):
        return "baixa"

    if includes_any(text, ["media", "medio", "equilibrado", "equilibrada"]):
        return "media"

    if includes_any(text, ["alta", "alto", "fashion", "finalizacao diaria"]):
        return "alta"

    return ""


def get_trend_recommendations(profile, maintenance, vibe):
    desired_scale = MAINTENANCE_SCALE.get(maintenance, 2)
    vibe_tokens = [token for token in normalize_text(vibe).split() if token]
    scored = []

    for item in TREND_CATALOG:
        if profile != "misto" and item["profile"] != profile:
            continue

        score = 6 - abs(desired_scale - MAINTENANCE_SCALE[item["maintenance"]])

        for token in vibe_tokens:
            if token in item["tags"]:
                score += 2

        scored.append({"item": item, "score": score})

    scored.sort(key=lambda entry: entry["score"], reverse=True)
    return [entry["item"] for entry in scored[:3]]


def map_booking_to_payload(booking, source):
    return {
        "dataPreferencial": booking["date"],
        "email": booking["email"],
        "horarioPreferencial": booking["time"],
        "mensagem": booking["notes"],
        "nome": booking["name"],
        "origemAgendamento": source,
        "servico": booking["service"],
        "telefone": booking["phone"],
    }


def get_missing_booking_fields(booking):
    field_map = {
        "name": "nome",
        "phone": "telefone",
        "service": "servico",
    }
    return [field_map[field] for field in ["name", "phone", "service"] if not booking[field]]


def is_skip_text(text):
    return text in {
        "pular",
        "skip",
        "sem observacao",
        "sem observacoes",
        "nenhuma",
        "nenhum",
        "nao quero adicionar",
        "nao quero observacao",
    }


def start_booking_flow(state):
    state["flow"] = "booking"
    state["step"] = "booking-service" if state["booking"]["name"] else "booking-name"

    if state["step"] == "booking-service":
        return "Perfeito. Ja reconheci seu nome. Qual servico voce quer agendar?"

    return "Perfeito. Vou montar seu pre-agendamento. Qual e o seu nome?"


def finalize_booking(state, source):
    booking = state["booking"]
    notes = booking["notes"] or "Sem observacoes adicionais."

    return {
        "booking": map_booking_to_payload(booking, source),
        "missingFields": get_missing_booking_fields(booking),
        "readyToSchedule": len(get_missing_booking_fields(booking)) == 0,
        "reply": "\n".join(
            [
                "Resumo do seu pre-agendamento:",
                f"- Nome: {booking['name']}",
                f"- Servico: {booking['service']}",
                f"- Data preferencial: {booking['date'] or 'Nao informada'}",
                f"- Horario ou periodo: {booking['time'] or 'Nao informado'}",
                f"- WhatsApp: {booking['phone']}",
                f"- Observacoes: {notes}",
                "",
                "Vou deixar esse pedido pronto para registro.",
            ]
        ),
        "route": "booking",
    }


def handle_booking_flow(state, raw_text, source, metadata):
    text = raw_text.strip()
    normalized = normalize_text(text)

    if not state["booking"]["phone"] and metadata.get("phone"):
        state["booking"]["phone"] = metadata["phone"]

    if state["step"] == "booking-name":
        state["booking"]["name"] = format_person_name(text) or state["booking"]["name"]
        state["step"] = "booking-service"
        first_name = (state["booking"]["name"].split() or ["voce"])[0]
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": f"Prazer, {first_name}. Qual servico voce quer agendar?",
            "route": "booking",
        }

    if state["step"] == "booking-service":
        state["booking"]["service"] = text
        state["step"] = "booking-date"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Qual data ou dia da semana voce prefere?",
            "route": "booking",
        }

    if state["step"] == "booking-date":
        state["booking"]["date"] = text
        state["step"] = "booking-time"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Qual horario ou periodo funciona melhor para voce?",
            "route": "booking",
        }

    if state["step"] == "booking-time":
        state["booking"]["time"] = text

        if state["booking"]["phone"]:
            state["step"] = "booking-notes"
            return {
                "booking": map_booking_to_payload(state["booking"], source),
                "missingFields": get_missing_booking_fields(state["booking"]),
                "readyToSchedule": False,
                "reply": "Quer acrescentar alguma observacao? Pode digitar a referencia ou escrever 'pular'.",
                "route": "booking",
            }

        state["step"] = "booking-phone"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Pode me passar um WhatsApp para retorno?",
            "route": "booking",
        }

    if state["step"] == "booking-phone":
        state["booking"]["phone"] = text
        state["step"] = "booking-notes"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Quer acrescentar alguma observacao? Pode digitar a referencia ou escrever 'pular'.",
            "route": "booking",
        }

    if state["step"] == "booking-notes":
        state["booking"]["notes"] = "" if is_skip_text(normalized) else text
        return finalize_booking(state, source)

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": get_missing_booking_fields(state["booking"]),
        "readyToSchedule": False,
        "reply": start_booking_flow(state),
        "route": "booking",
    }


def start_color_flow(state):
    state["flow"] = "color"
    state["step"] = "color-current"
    return "Vamos fazer uma leitura tecnica inicial. Qual e a sua base atual?"


def finalize_color_flow(state, source):
    current_base = state["color"]["currentBase"]
    goal = state["color"]["goal"]
    history = state["color"]["history"]
    technique = get_technique_recommendation(current_base, goal, history)
    ostwald_guidance = get_ostwald_guidance(current_base, goal)
    warnings = get_color_warnings(current_base, goal, history)

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": get_missing_booking_fields(state["booking"]),
        "readyToSchedule": False,
        "reply": "\n".join(
            [
                "Leitura tecnica inicial:",
                f"- Base atual: {current_base}",
                f"- Objetivo: {goal}",
                f"- Historico do fio: {history}",
                "",
                f"Estrela de Ostwald: {ostwald_guidance}",
                "",
                f"Tecnica sugerida: {technique['title']}. {technique['detail']}",
                "",
                "Cuidados importantes:",
                *[f"- {warning}" for warning in warnings],
                "",
                "Se quiser transformar isso em agendamento, digite agendar.",
            ]
        ),
        "route": "color",
    }


def handle_color_flow(state, text, source):
    cleaned_text = text.strip()

    if state["step"] == "color-current":
        state["color"]["currentBase"] = cleaned_text
        state["step"] = "color-goal"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Qual resultado voce quer? Ex: morena iluminada fria, neutralizar amarelo ou ruivo cobre.",
            "route": "color",
        }

    if state["step"] == "color-goal":
        state["color"]["goal"] = cleaned_text
        state["step"] = "color-history"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Agora me conta o historico do fio. Ele e virgem, colorido, descolorido ou sensibilizado?",
            "route": "color",
        }

    if state["step"] == "color-history":
        state["color"]["history"] = cleaned_text
        return finalize_color_flow(state, source)

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": get_missing_booking_fields(state["booking"]),
        "readyToSchedule": False,
        "reply": start_color_flow(state),
        "route": "color",
    }


def start_trend_flow(state):
    state["flow"] = "trends"
    state["step"] = "trend-profile"
    return "Vamos olhar referencias de corte. Voce quer sugestoes masculinas, femininas ou mistas?"


def finalize_trend_flow(state, source):
    recommendations = get_trend_recommendations(
        state["trends"]["profile"],
        state["trends"]["maintenance"],
        state["trends"]["vibe"],
    )
    lines = [
        "Essas sao as melhores opcoes para o perfil que voce descreveu:",
        "",
    ]

    for index, item in enumerate(recommendations, start=1):
        lines.extend(
            [
                f"{index}. {item['name']}: {item['description']}.",
                f"   Manutencao: {item['maintenance']}. Ideal para: {item['bestFor']}.",
                f"   Por que esta em alta: {item['trendPulse']}.",
            ]
        )

    lines.extend(
        [
            "",
            f"Melhor ponto de partida: {(recommendations[0]['name'] if recommendations else 'avaliacao presencial')}.",
            "Se quiser, digite agendar e eu transformo isso em pre-agendamento.",
        ]
    )

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": get_missing_booking_fields(state["booking"]),
        "readyToSchedule": False,
        "reply": "\n".join(lines),
        "route": "trends",
    }


def handle_trend_flow(state, raw_text, source):
    text = raw_text.strip()
    normalized = normalize_text(text)

    if state["step"] == "trend-profile":
        profile = parse_trend_profile(normalized)

        if not profile:
            return {
                "booking": map_booking_to_payload(state["booking"], source),
                "missingFields": get_missing_booking_fields(state["booking"]),
                "readyToSchedule": False,
                "reply": "Me responde com masculino, feminino ou misto para eu filtrar melhor.",
                "route": "trends",
            }

        state["trends"]["profile"] = profile
        state["step"] = "trend-maintenance"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Qual nivel de manutencao voce prefere: baixa, media ou alta?",
            "route": "trends",
        }

    if state["step"] == "trend-maintenance":
        maintenance = parse_maintenance(normalized)

        if not maintenance:
            return {
                "booking": map_booking_to_payload(state["booking"], source),
                "missingFields": get_missing_booking_fields(state["booking"]),
                "readyToSchedule": False,
                "reply": "Me fala baixa, media ou alta manutencao para eu acertar melhor.",
                "route": "trends",
            }

        state["trends"]["maintenance"] = maintenance
        state["step"] = "trend-vibe"
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": "Que imagem voce quer passar? Ex: clean, moderno, romantico ou fashion.",
            "route": "trends",
        }

    if state["step"] == "trend-vibe":
        state["trends"]["vibe"] = text
        return finalize_trend_flow(state, source)

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": get_missing_booking_fields(state["booking"]),
        "readyToSchedule": False,
        "reply": start_trend_flow(state),
        "route": "trends",
    }


def process_fallback_message(message, metadata=None, session=None, source="site_chat"):
    metadata = metadata or {}
    session = session or {}
    state = session.get("fallbackState") or create_fallback_state(metadata)
    text = str(message or "").strip()
    global_action = get_global_action(text)
    menu_intent = get_menu_intent(text) if state["flow"] == "menu" else ""

    session["fallbackState"] = state

    if global_action == "reset":
        session["fallbackState"] = create_fallback_state(metadata)
        return {
            "booking": map_booking_to_payload(session["fallbackState"]["booking"], source),
            "missingFields": [],
            "readyToSchedule": False,
            "reply": f"Vamos recomecar.\n\n{MENU_MESSAGE}",
            "route": "general",
        }

    if global_action == "booking" or menu_intent == "booking":
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": start_booking_flow(state),
            "route": "booking",
        }

    if global_action == "color" or menu_intent == "color":
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": start_color_flow(state),
            "route": "color",
        }

    if global_action == "trends" or menu_intent == "trends":
        return {
            "booking": map_booking_to_payload(state["booking"], source),
            "missingFields": get_missing_booking_fields(state["booking"]),
            "readyToSchedule": False,
            "reply": start_trend_flow(state),
            "route": "trends",
        }

    if state["flow"] == "booking":
        return handle_booking_flow(state, text, source, metadata)

    if state["flow"] == "color":
        return handle_color_flow(state, text, source)

    if state["flow"] == "trends":
        return handle_trend_flow(state, text, source)

    return {
        "booking": map_booking_to_payload(state["booking"], source),
        "missingFields": [],
        "readyToSchedule": False,
        "reply": MENU_MESSAGE,
        "route": "general",
    }

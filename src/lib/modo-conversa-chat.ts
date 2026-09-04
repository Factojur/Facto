/** Papel da barra: Chat conversa; Minuta redige a peça. */
export type PapelInteracaoChat = "chat" | "minuta";

export const PAPEL_INTERACAO_PADRAO: PapelInteracaoChat = "chat";

export const STORAGE_PAPEL_INTERACAO = "facto_chat_papel_interacao";

export function normalizarPapelInteracao(raw: unknown): PapelInteracaoChat {
  return raw === "minuta" ? "minuta" : "chat";
}

export function lerPapelInteracaoStorage(): PapelInteracaoChat {
  if (typeof window === "undefined") return PAPEL_INTERACAO_PADRAO;
  try {
    return normalizarPapelInteracao(
      localStorage.getItem(STORAGE_PAPEL_INTERACAO)
    );
  } catch {
    return PAPEL_INTERACAO_PADRAO;
  }
}

export function salvarPapelInteracaoStorage(papel: PapelInteracaoChat): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PAPEL_INTERACAO, papel);
  } catch {
    /* quota / privado */
  }
}

/** Instantâneo vs Planejado — só no modo Minuta. */
export type ModoConversaChat = "instantaneo" | "planejado";

export const MODO_CONVERSA_PADRAO: ModoConversaChat = "instantaneo";

export const STORAGE_MODO_CONVERSA = "facto_chat_modo_conversa";

export type ConfigModoConversa = {
  modo: ModoConversaChat;
  rotulo: string;
  dica: string;
  maxOutputTokens: number;
  temperature: number;
  instrucoesSistema: string[];
  forcarPlanoAposTurno: boolean;
  debouncePlanoMs: number;
};

export function normalizarModoConversa(raw: unknown): ModoConversaChat {
  return raw === "planejado" ? "planejado" : "instantaneo";
}

export function lerModoConversaStorage(): ModoConversaChat {
  if (typeof window === "undefined") return MODO_CONVERSA_PADRAO;
  try {
    return normalizarModoConversa(
      localStorage.getItem(STORAGE_MODO_CONVERSA)
    );
  } catch {
    return MODO_CONVERSA_PADRAO;
  }
}

export function salvarModoConversaStorage(modo: ModoConversaChat): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_MODO_CONVERSA, modo);
  } catch {
    /* quota / privado */
  }
}

export function configModoConversa(modo: ModoConversaChat): ConfigModoConversa {
  if (modo === "planejado") {
    return {
      modo,
      rotulo: "Planejado",
      dica: "No modo Minuta: refina a estratégia e redige quando o lastro da peça estiver completo.",
      maxOutputTokens: 2400,
      temperature: 0.5,
      instrucoesSistema: [
        "Modo PLANEJADO: resposta reflexiva e estratégica.",
        "2–4 parágrafos fluidos (até 12 frases). Organize teses, riscos e próximos passos.",
        "Relacione com o plano à direita quando fizer sentido.",
        "NÃO redija a petição inteira. A peça só nasce no modo Minuta.",
        "Termine com pergunta útil ou próximo passo quando faltar dado relevante.",
      ],
      forcarPlanoAposTurno: false,
      debouncePlanoMs: 650,
    };
  }

  return {
    modo,
    rotulo: "Instantâneo",
    dica: "No modo Minuta: gera a peça logo após a instrução.",
    maxOutputTokens: 900,
    temperature: 0.35,
    instrucoesSistema: [
      "Modo INSTANTÂNEO: resposta curta e direta.",
      "1–2 parágrafos (até 6 frases). Priorize clareza e velocidade.",
      "Uma pergunta objetiva no fim, se faltar dado crítico.",
      "NÃO redija a petição aqui. A peça só nasce no modo Minuta.",
    ],
    forcarPlanoAposTurno: false,
    debouncePlanoMs: 400,
  };
}

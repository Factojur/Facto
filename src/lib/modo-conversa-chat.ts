/** Papel da barra: Assistente conversa; Peça = área do preview (após Gerar preview). */
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

/** Direto vs Aprofundado — só no modo Peça. */
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
      rotulo: "Aprofundado",
      dica: "No modo Peça: plano e fundamentação mais densos antes do preview.",
      maxOutputTokens: 2400,
      temperature: 0.5,
      instrucoesSistema: [
        "Modo APROFUNDADO: resposta reflexiva e estratégica.",
        "2–4 parágrafos fluidos (até 12 frases). Organize teses, riscos e próximos passos.",
        "Relacione com o plano à direita quando fizer sentido.",
        "NÃO redija a petição inteira. A peça só nasce com Gerar preview (1 crédito).",
        "Se o caso já tiver lastro, diga que pode gerar o preview ou complementar.",
        "Termine com pergunta útil ou próximo passo quando faltar dado relevante.",
      ],
      forcarPlanoAposTurno: false,
      debouncePlanoMs: 650,
    };
  }

  return {
    modo,
    rotulo: "Direto",
    dica: "No modo Peça: caminho mais curto até o preview da peça.",
    maxOutputTokens: 900,
    temperature: 0.35,
    instrucoesSistema: [
      "Modo DIRETO: resposta curta e objetiva.",
      "1–2 parágrafos (até 6 frases). Priorize clareza e velocidade.",
      "Uma pergunta objetiva no fim, se faltar dado crítico.",
      "NÃO redija a petição aqui. A peça só nasce com Gerar preview (1 crédito).",
      "Se o caso já tiver lastro, diga que pode gerar o preview ou complementar.",
    ],
    forcarPlanoAposTurno: false,
    debouncePlanoMs: 400,
  };
}

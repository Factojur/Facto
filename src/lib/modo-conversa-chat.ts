/** Modo da conversa Fase 1 — fluidez (instantâneo) vs estratégia (planejado). */

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
      dica: "Respostas mais reflexivas e plano estratégico atualizado a cada turno.",
      maxOutputTokens: 2400,
      temperature: 0.5,
      instrucoesSistema: [
        "Modo PLANEJADO: resposta reflexiva e estratégica.",
        "2–4 parágrafos fluidos (até 12 frases). Organize teses, riscos e próximos passos.",
        "Relacione com o plano à direita quando fizer sentido.",
        "Termine com pergunta útil ou próximo passo quando faltar dado relevante.",
      ],
      forcarPlanoAposTurno: true,
      debouncePlanoMs: 800,
    };
  }

  return {
    modo,
    rotulo: "Instantâneo",
    dica: "Respostas curtas e rápidas — ideal para tirar dúvidas e iterar no relato.",
    maxOutputTokens: 900,
    temperature: 0.35,
    instrucoesSistema: [
      "Modo INSTANTÂNEO: resposta curta e direta.",
      "1–2 parágrafos (até 6 frases). Priorize clareza e velocidade.",
      "Uma pergunta objetiva no fim, se faltar dado crítico.",
    ],
    forcarPlanoAposTurno: false,
    debouncePlanoMs: 600,
  };
}

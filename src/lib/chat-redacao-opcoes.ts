/**
 * Opções de redação do chat (FACTO) — adesão ao modelo e profundidade.
 * Nomes próprios; não copiam rótulos de terceiros.
 */

export type AdesaoRedacao = "livre" | "fiel" | "recorte";
export type EsforcoRedacao = "agil" | "padrao" | "fundo";

export const CHAT_ADESAO_KEY = "facto:chat-adesao-v1";
export const CHAT_ESFORCO_KEY = "facto:chat-esforco-v1";

export const ROTULO_ADESAO: Record<AdesaoRedacao, string> = {
  livre: "Livre",
  fiel: "Fiel",
  recorte: "Recorte",
};

export const ROTULO_ESFORCO: Record<EsforcoRedacao, string> = {
  agil: "Expressa",
  padrao: "Equilíbrio",
  fundo: "Detalhada",
};

export function normalizarAdesaoRedacao(v: unknown): AdesaoRedacao {
  if (v === "fiel" || v === "recorte" || v === "livre") return v;
  return "livre";
}

export function normalizarEsforcoRedacao(v: unknown): EsforcoRedacao {
  if (v === "agil" || v === "fundo" || v === "padrao") return v;
  return "padrao";
}

export function lerAdesaoRedacaoStorage(): AdesaoRedacao {
  if (typeof window === "undefined") return "livre";
  try {
    return normalizarAdesaoRedacao(localStorage.getItem(CHAT_ADESAO_KEY));
  } catch {
    return "livre";
  }
}

export function salvarAdesaoRedacaoStorage(v: AdesaoRedacao) {
  try {
    localStorage.setItem(CHAT_ADESAO_KEY, v);
  } catch {
    /* ignore */
  }
}

export function lerEsforcoRedacaoStorage(): EsforcoRedacao {
  if (typeof window === "undefined") return "padrao";
  try {
    return normalizarEsforcoRedacao(localStorage.getItem(CHAT_ESFORCO_KEY));
  } catch {
    return "padrao";
  }
}

export function salvarEsforcoRedacaoStorage(v: EsforcoRedacao) {
  try {
    localStorage.setItem(CHAT_ESFORCO_KEY, v);
  } catch {
    /* ignore */
  }
}

/** Instrução ao redator — conteúdo, não clone de UI alheia. */
export function blocoPromptAdesao(
  adesao: AdesaoRedacao,
  temModeloOuEstilo: boolean
): string {
  if (adesao === "fiel") {
    return [
      "<ADERENCIA_FACTO>",
      "Modo FIEL: se houver modelo de peça ou estilo do escritório no prompt, reproduza tom, vocabulário e ordem de tópicos dessa referência.",
      "Não invente seções que o modelo não usa. O caso concreto (AUTOS) preenche o molde — não o contrário.",
      temModeloOuEstilo
        ? "Há modelo/estilo abaixo — trate-o como referência obrigatória de FORMA (não copie fatos, nomes nem valores da amostra)."
        : "Não há modelo anexado neste caso: redija em padrão forense clássico.",
      "</ADERENCIA_FACTO>",
    ].join("\n");
  }
  if (adesao === "recorte") {
    return [
      "<ADERENCIA_FACTO>",
      "Modo RECORTE: se houver modelo/estilo, altere só o necessário (partes, fatos, pedidos, valores, último ato).",
      "Preserve frases e estrutura do modelo quando couberem ao caso. Não reescreva o que já está adequado.",
      temModeloOuEstilo
        ? "Use o modelo/estilo como base e troque somente o que os AUTOS exigirem."
        : "Sem modelo neste caso: redija completo, sem fingir que há um molde a recortar.",
      "</ADERENCIA_FACTO>",
    ].join("\n");
  }
  return [
    "<ADERENCIA_FACTO>",
    "Modo LIVRE: você estrutura a peça pelo caso (autos + lastro FACTO). Modelo/estilo, se houver, é sugestão de tom — não amarra tópicos.",
    "</ADERENCIA_FACTO>",
  ].join("\n");
}

/** Bloco do modelo de peça anexado só neste caso (forma). */
export function blocoModeloPecaCaso(
  modelo: { nome: string; texto: string } | null | undefined
): string {
  const texto = modelo?.texto?.trim() ?? "";
  if (!texto) return "";
  const nome = modelo?.nome?.trim() || "Modelo do advogado";
  return [
    "================================================================================",
    "MODELO DE PEÇA DO ADVOGADO (SÓ ESTE CASO — FORMA)",
    "================================================================================",
    `Arquivo: ${nome}`,
    "Use como referência de ESTRUTURA, tom e ordem de tópicos.",
    "PROIBIDO copiar fatos, nomes, números de processo, valores ou pedidos da amostra — esses vêm dos AUTOS deste caso.",
    "Se conflitar com os autos, prevalecem os AUTOS.",
    "",
    "<MODELO_PECA_CASO>",
    texto.slice(0, 80_000),
    "</MODELO_PECA_CASO>",
  ].join("\n");
}

export function tokensRedacaoPorEsforco(esforco: EsforcoRedacao): number {
  if (esforco === "agil") return 4096;
  if (esforco === "fundo") return 8192;
  return 8192;
}

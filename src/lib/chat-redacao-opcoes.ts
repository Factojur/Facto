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
  fiel: "Guia",
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

/** Instrução ao redator — parâmetro leve; autos e lastro prevalecem. */
export function blocoPromptAdesao(
  adesao: AdesaoRedacao,
  temModeloOuEstilo: boolean
): string {
  if (adesao === "fiel") {
    return [
      "<ADERENCIA_FACTO>",
      "Modo FIEL (leve): se houver modelo de peça ou tom do escritório, use-os só como referência suave de tom e organização.",
      "Liberdade total para estruturar a peça pelos AUTOS e pelo lastro FACTO.",
      "NÃO amarre tópicos ao modelo; NÃO omita tese útil só porque a amostra não a traz.",
      "NÃO copie fatos, nomes nem valores da amostra.",
      temModeloOuEstilo
        ? "Há modelo/estilo abaixo — parâmetro de forma, não molde rígido."
        : "Sem modelo neste caso: redija em padrão forense livre e completo.",
      "</ADERENCIA_FACTO>",
    ].join("\n");
  }
  if (adesao === "recorte") {
    return [
      "<ADERENCIA_FACTO>",
      "Modo RECORTE (leve): se houver modelo/estilo, pode reaproveitar frases úteis de forma — mas troque tudo que os AUTOS exigirem.",
      "Liberdade total no mérito. Autos e lastro prevalecem sobre a amostra.",
      "NÃO copie fatos, nomes nem valores da amostra.",
      temModeloOuEstilo
        ? "Use o modelo como ponto de partida opcional; reescreva o necessário."
        : "Sem modelo neste caso: redija completo, sem fingir que há molde a recortar.",
      "</ADERENCIA_FACTO>",
    ].join("\n");
  }
  return [
    "<ADERENCIA_FACTO>",
    "Modo LIVRE: estruture a peça pelo caso (autos + lastro FACTO). Modelo/estilo, se houver, é só sugestão de tom — não amarra tópicos.",
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
    "MODELO DE PEÇA (PARÂMETRO DE FORMA — OPT-IN)",
    "================================================================================",
    `Arquivo: ${nome}`,
    "Use só como referência suave de tom/organização, se ajudar o caso.",
    "Liberdade total: AUTOS + lastro FACTO prevalecem. NÃO amarre a estrutura ao modelo.",
    "PROIBIDO copiar fatos, nomes, números de processo, valores ou pedidos da amostra.",
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

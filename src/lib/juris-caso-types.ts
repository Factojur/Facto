/**
 * Jurisprudência / súmulas anexadas pelo advogado para o caso concreto.
 * Lastro para citações na peça — sem depender de API externa de juris.
 */

export type TipoFonteJurisCaso = "acordao" | "sumula" | "decisao" | "outro";

export type JurisCasoItem = {
  id: string;
  tipo: TipoFonteJurisCaso;
  /** Rótulo livre (ex.: "TJSP — Apelação 1000…") */
  titulo: string;
  /** Texto colado ou extraído do arquivo (no cliente: rascunho; no servidor: texto final). */
  texto: string;
  /** Nome do arquivo, se veio de upload. */
  nomeArquivo?: string | null;
};

export type JurisCasoPayload = {
  id?: string;
  tipo?: TipoFonteJurisCaso;
  titulo?: string;
  texto?: string;
  nomeArquivo?: string;
  mimeType?: string;
  base64?: string;
};

export const MAX_JURIS_CASO = 5;
export const LIMITE_TEXTO_JURIS_ITEM = 28_000;

export function jurisCasoVazio(
  parcial?: Partial<JurisCasoItem>
): JurisCasoItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `juris-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tipo: "acordao",
    titulo: "",
    texto: "",
    nomeArquivo: null,
    ...parcial,
  };
}

export function jurisCasoTemConteudo(item: JurisCasoItem): boolean {
  return Boolean(item.texto.trim() || item.titulo.trim() || item.nomeArquivo);
}

export function resumoJurisCaso(item: JurisCasoItem): {
  titulo: string;
  detalhe: string;
} {
  const tipoLabel: Record<TipoFonteJurisCaso, string> = {
    acordao: "Acórdão / decisão colegiada",
    sumula: "Súmula",
    decisao: "Decisão monocrática",
    outro: "Outro precedente",
  };
  const titulo =
    item.titulo.trim() ||
    item.nomeArquivo?.trim() ||
    tipoLabel[item.tipo];
  const partes = [
    tipoLabel[item.tipo],
    item.nomeArquivo?.trim() && item.titulo.trim()
      ? item.nomeArquivo.trim()
      : null,
    item.texto.trim()
      ? `${Math.min(item.texto.trim().length, 9999)} caracteres`
      : null,
  ].filter(Boolean);
  return { titulo, detalhe: partes.join(" · ") };
}

export function truncarTextoJuris(texto: string): string {
  const t = texto.trim();
  if (t.length <= LIMITE_TEXTO_JURIS_ITEM) return t;
  return `${t.slice(0, LIMITE_TEXTO_JURIS_ITEM)}\n[...texto truncado...]`;
}

export type BlocoJurisCaso = {
  titulo: string;
  tipo: TipoFonteJurisCaso;
  texto: string;
};

/** Bloco XML/prompt com as fontes do caso. */
export function montarBlocoPromptJurisCaso(
  itens: BlocoJurisCaso[] | null | undefined
): string {
  if (!itens?.length) {
    return [
      "",
      "Não há jurisprudência/súmula anexada pelo advogado para este caso.",
      "Acórdãos com número de processo: só se estiverem na <BASE_DE_CONHECIMENTO>; senão use o marcador de não encontrado.",
    ].join("\n");
  }

  const corpos = itens.map((item, i) => {
    const rotulo = item.titulo.trim() || `Fonte ${i + 1}`;
    return [
      `<FONTE_JURIS n="${i + 1}" tipo="${item.tipo}">`,
      `Título: ${rotulo}`,
      item.texto.trim(),
      `</FONTE_JURIS>`,
    ].join("\n");
  });

  return [
    "",
    "<JURISPRUDENCIA_DO_CASO>",
    "Material enviado pelo advogado para ESTE caso. É lastro privilegiado.",
    "Instruções:",
    "1) Identifique ementa, tese e trechos úteis do voto (quando houver).",
    "2) Cite no padrão forense brasileiro (tribunal, classe/número, relator se constar, ementa ou trecho entre aspas).",
    "3) Integre no DOS FATOS e/ou DO DIREITO onde houver relação com o narrado — não force citação fora de contexto.",
    "4) PROIBIDO inventar número de processo, relator, data ou trecho que não esteja abaixo.",
    "5) Em Markdown, trechos literais: *\"texto citado\"*.",
    "",
    ...corpos,
    "</JURISPRUDENCIA_DO_CASO>",
  ].join("\n");
}

export function contextoVerificacaoJurisCaso(
  itens: BlocoJurisCaso[] | null | undefined
): string {
  if (!itens?.length) return "";
  return itens
    .map(
      (item, i) =>
        `[Juris do caso ${i + 1}] ${item.titulo}\n${item.texto}`
    )
    .join("\n\n---\n\n");
}

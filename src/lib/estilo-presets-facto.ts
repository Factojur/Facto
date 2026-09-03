/** Presets curados FACTO — zero tokens; substituto leve de “skills” MinutaIA. */

export type EstiloPresetFacto = {
  id: string;
  rotulo: string;
  descricao: string;
  resumo: string;
};

export const ESTILO_PRESETS_FACTO: EstiloPresetFacto[] = [
  {
    id: "jec-enxuto",
    rotulo: "JEC enxuto",
    descricao: "Direto, poucos tópicos, pedidos numerados.",
    resumo:
      "Tom enxuto para Juizado: fatos curtos; direito em 2–3 subtópicos; pedidos objetivos e numerados; evitar citações longas; linguagem acessível sem perder técnica.",
  },
  {
    id: "denso-stj",
    rotulo: "Denso (STJ)",
    descricao: "Memorial técnico, mais juris e fundamentação.",
    resumo:
      "Redação densa e técnica: tópicos desenvolvidos; citação de jurisprudência com ementa resumida; transição explícita fato→norma→pedido; tom de tribunal superior.",
  },
  {
    id: "consumidor-cdc",
    rotulo: "Consumidor CDC",
    descricao: "Ênfase em vulnerabilidade e responsabilidade objetiva.",
    resumo:
      "Ênfase CDC: relação de consumo; responsabilidade objetiva quando cabível; dano moral com parâmetros; pedidos de obrigação de fazer e indenização; tom firme e didático.",
  },
  {
    id: "trabalhista-clt",
    rotulo: "Trabalhista CLT",
    descricao: "Verbas, reflexos e pedidos líquidos quando houver.",
    resumo:
      "CLT: narrativa cronológica do vínculo; pedidos por verba (HE, FGTS, rescisórias); mencionar reflexos quando pertinentes; linguagem da Justiça do Trabalho.",
  },
  {
    id: "penal-hc",
    rotulo: "Penal / HC",
    descricao: "Liberatório, liminar, constrangimento ilegal.",
    resumo:
      "Habeas corpus: foco no constrangimento ilegal; pedido liminar destacado; fatos do constrangimento primeiro; linguagem constitucional e processual penal; sem retórica excessiva.",
  },
  {
    id: "inicial-completa",
    rotulo: "Inicial completa",
    descricao: "Estrutura clássica, memorial mais longo.",
    resumo:
      "Petição inicial completa: qualificação já feita; fatos detalhados; direito com subtópicos por instituto; pedidos com valor da causa; fechamento formal; tom forense moderado.",
  },
];

export function presetEstiloPorId(id: string): EstiloPresetFacto | undefined {
  return ESTILO_PRESETS_FACTO.find((p) => p.id === id);
}

const RE_PRESET = /^\[preset:([\w-]+)\]\n\n?/;

export function codificarEstiloComPreset(
  presetId: string,
  resumo: string
): string {
  return `[preset:${presetId}]\n\n${resumo.trim()}`;
}

export function decodificarEstiloPerfil(raw: string | null | undefined): {
  presetId?: string;
  resumo: string;
} {
  const t = String(raw ?? "").trim();
  if (!t) return { resumo: "" };
  const m = t.match(RE_PRESET);
  if (!m?.[1]) return { resumo: t };
  return { presetId: m[1], resumo: t.slice(m[0].length).trim() };
}

/** Texto injetado no prompt (sem metadado de preset). */
export function resumoEstiloParaPrompt(raw: string | null | undefined): string | null {
  const { resumo } = decodificarEstiloPerfil(raw);
  return resumo.trim() || null;
}

export function rotuloEstiloAtivo(
  raw: string | null | undefined,
  optIn: boolean
): string | null {
  if (!optIn) return null;
  const { presetId, resumo } = decodificarEstiloPerfil(raw);
  if (!resumo) return null;
  if (presetId) {
    return presetEstiloPorId(presetId)?.rotulo ?? "Preset FACTO";
  }
  return "Meu escritório";
}

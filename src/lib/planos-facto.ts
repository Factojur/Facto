/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * JEC 79,90/40 · Completo 189,90/100 · Pro 289,90/180 ·
 * Completo Anual 1.819,04/110 · Pro Anual 2.956,98/200 (15% off).
 * Valores legados continuam reconhecidos em planoPorValor (assinantes antigos).
 */

export const PLANO_JEC = {
  id: "jec" as const,
  preco: 79.9,
  pecasPorMes: 40,
  rotuloPreco: "R$ 79,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano JEC",
  beneficios: [
    "Foco total no Juizado Especial Cível",
    "40 minutas/mês — PDF e Word forenses",
    "Equipe FACTO: análise, súmulas da base curada e redação",
    "Timbre e dados do seu perfil na peça",
    "Pacotes extras se a cota do mês acabar",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_MENSAL = {
  id: "mensal" as const,
  preco: 189.9,
  pecasPorMes: 100,
  rotuloPreco: "R$ 189,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo",
  /** ~R$ 1,90 por peça na cota cheia */
  custoPorPecaAprox: "R$ 1,90",
  beneficios: [
    "Todas as áreas liberadas no FACTO",
    "100 minutas/mês (~R$ 1,90 por peça na cota)",
    "Equipe completa: Analista, Pesquisa & súmulas, Redator e Auditor",
    "Base curada de leis e súmulas + fundamentos do seu caso",
    "Formatação forense, PDF/Word e timbre do perfil",
    "Pacotes extras ou upgrade para o Pro se o volume crescer",
    "Leigos (sem OAB): JEC até 20 SM; demais áreas com OAB",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_PRO = {
  id: "pro" as const,
  preco: 289.9,
  pecasPorMes: 180,
  rotuloPreco: "R$ 289,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo Pro",
  beneficios: [
    "Tudo do Plano Completo",
    "180 minutas/mês — ritmo de escritório em alta demanda",
    "Prioridade na fila de geração e pesquisa reforçada",
    "Mesma base curada e equipe FACTO, com mais capacidade",
    "Pacotes extras se ainda precisar de mais peças",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_ANUAL = {
  id: "anual" as const,
  /** 12 × 189,90 × 0,80 = 1.819,04 */
  preco: 1819.04,
  pecasPorMes: 110,
  rotuloPreco: "R$ 1.819,04",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Anual",
  equivalenteMensal: 151.59,
  rotuloEquivalenteMensal: "R$ 151,59",
  /** Economia vs 12× mensal: 2.278,80 − 1.819,04 */
  economiaAno: 459.76,
  rotuloEconomia: "R$ 459,76",
  descontoPercentual: 20,
  beneficios: [
    "Tudo do Completo mensal, com desconto de 20%",
    "110 minutas/mês (+10 vs mensal) o ano inteiro",
    "Equivalente a R$ 151,59/mês — economia de R$ 459,76/ano",
    "Melhor custo por peça do FACTO no Completo",
    "Equipe FACTO + base curada de leis e súmulas",
    "Pacotes extras quando a cota mensal acabar",
  ],
};

export const PLANO_PRO_ANUAL = {
  id: "pro_anual" as const,
  /** 12 × 289,90 × 0,85 = 2.956,98 (15% de desconto) */
  preco: 2956.98,
  pecasPorMes: 200,
  rotuloPreco: "R$ 2.956,98",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Pro Anual",
  equivalenteMensal: 246.415,
  rotuloEquivalenteMensal: "R$ 246,42",
  /** Economia vs 12× Pro mensal: 3.478,80 − 2.956,98 */
  economiaAno: 521.82,
  rotuloEconomia: "R$ 521,82",
  descontoPercentual: 15,
  beneficios: [
    "Tudo do Pro mensal, com 15% de desconto no ano",
    "200 minutas/mês (+20 vs Pro mensal)",
    "Equivalente a R$ 246,42/mês — economia de R$ 521,82/ano",
    "Prioridade na fila e pesquisa reforçada o ano todo",
    "Melhor custo por peça do FACTO no alto volume",
    "Pacotes extras se ainda precisar de mais peças",
  ],
};

/** Assinantes cobrados nos preços anteriores ao Pacote A. */
export const PRECOS_LEADOS = {
  jec: 67.9,
  mensal: 147.9,
  anual: 1419.84,
  /** Pro Anual com 20% (antes do ajuste para 15%). */
  pro_anual: 2783.04,
} as const;

/** Pacotes avulsos (área logada) — compra eventual, não assinatura. */
export const PACOTES_EXTRA = [
  {
    id: "extra-50" as const,
    pecas: 50,
    preco: 49.9,
    rotuloPreco: "R$ 49,90",
    rotulo: "+50 peças",
    descricao: "Ideal para fechar o mês sem mudar de plano.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_50 ?? "").trim(),
  },
  {
    id: "extra-100" as const,
    pecas: 100,
    preco: 89.9,
    rotuloPreco: "R$ 89,90",
    rotulo: "+100 peças",
    descricao: "Melhor custo por peça entre os pacotes extras.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_100 ?? "").trim(),
  },
] as const;

export type PacoteExtraId = (typeof PACOTES_EXTRA)[number]["id"];
export type PacoteExtra = (typeof PACOTES_EXTRA)[number];
export type PlanoId = "jec" | "mensal" | "pro" | "anual" | "pro_anual";

export function pacoteExtraPorId(id: string): PacoteExtra | null {
  return PACOTES_EXTRA.find((p) => p.id === id) ?? null;
}

/** Identifica pacote pelo valor da cobrança (links estáticos / fallback). */
export function pacoteExtraPorValor(
  valor: number | null | undefined
): PacoteExtra | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  for (const p of PACOTES_EXTRA) {
    if (Math.abs(valor - p.preco) < 0.05) return p;
  }
  // Legado
  if (Math.abs(valor - 39.9) < 0.05) return pacoteExtraPorId("extra-50");
  if (Math.abs(valor - 79.9) < 0.05) return pacoteExtraPorId("extra-100");
  return null;
}

/**
 * external_reference do checkout: facto_extra_50_<userId>
 */
export function montarExternalReferenceExtra(
  pacoteId: PacoteExtraId,
  userId: string
): string {
  const sufixo = pacoteId === "extra-50" ? "50" : "100";
  return `facto_extra_${sufixo}_${userId}`;
}

export function parseExternalReferenceExtra(
  ref: string | null | undefined
): {
  pacote: PacoteExtra;
  userId: string | null;
} | null {
  if (!ref) return null;
  const m = ref.trim().match(/^facto_extra_(50|100)_([0-9a-f-]{36})$/i);
  if (!m) {
    const soPacote = ref.trim().match(/^facto_extra_(50|100)$/i);
    if (!soPacote) return null;
    const pacote = pacoteExtraPorId(
      soPacote[1] === "50" ? "extra-50" : "extra-100"
    );
    return pacote ? { pacote, userId: null } : null;
  }
  const pacote = pacoteExtraPorId(m[1] === "50" ? "extra-50" : "extra-100");
  if (!pacote) return null;
  return { pacote, userId: m[2] };
}

/** Inferência por valor (webhook / links MP) — inclui preços legados. */
export function planoPorValor(valor: number | null | undefined): PlanoId | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  if (Math.abs(valor - PLANO_PRO_ANUAL.preco) < 1) return "pro_anual";
  if (Math.abs(valor - PLANO_ANUAL.preco) < 1) return "anual";
  if (Math.abs(valor - PLANO_PRO.preco) < 1) return "pro";
  if (Math.abs(valor - PLANO_MENSAL.preco) < 1) return "mensal";
  if (Math.abs(valor - PLANO_JEC.preco) < 1) return "jec";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.mensal) < 1) return "mensal";
  if (Math.abs(valor - PRECOS_LEADOS.jec) < 1) return "jec";
  return null;
}

export const PRECO_CHEQUE_JEC = PLANO_JEC.preco;
export const PRECO_CHEQUE_MENSAL = PLANO_MENSAL.preco;
export const PRECO_CHEQUE_PRO = PLANO_PRO.preco;
export const PRECO_CHEQUE_ANUAL = PLANO_ANUAL.preco;
export const PRECO_CHEQUE_PRO_ANUAL = PLANO_PRO_ANUAL.preco;

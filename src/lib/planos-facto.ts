/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * JEC 79,90/40 · Completo 189,90/100 · Pro 289,90/180 ·
 * Completo Anual 1.890/110 · Pro Anual 2.990/200.
 * Valores legados continuam reconhecidos em planoPorValor (assinantes antigos).
 *
 * custoPorPecaAprox = preço do ciclo ÷ peças do ciclo (anuais: preço/ano ÷ 12×cota).
 */

export const PLANO_JEC = {
  id: "jec" as const,
  preco: 79.9,
  pecasPorMes: 40,
  rotuloPreco: "R$ 79,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano JEC",
  /** 79,90 ÷ 40 */
  custoPorPecaAprox: "R$ 2,00",
  beneficios: [
    "Foco total no Juizado Especial Cível",
    "40 minutas/mês — ≈ R$ 2,00 por peça na cota",
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
  /** 189,90 ÷ 100 */
  custoPorPecaAprox: "R$ 1,90",
  beneficios: [
    "Todas as áreas liberadas no FACTO",
    "100 minutas/mês — ≈ R$ 1,90 por peça na cota",
    "Equipe completa: Analista, Pesquisa & súmulas, Redator e Auditor",
    "Base curada de leis e súmulas + fundamentos do seu caso",
    "Formatação forense (PDF/Word); revise antes de protocolar",
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
  /** 289,90 ÷ 180 */
  custoPorPecaAprox: "R$ 1,61",
  beneficios: [
    "Tudo do Plano Completo",
    "180 minutas/mês — ≈ R$ 1,61 por peça na cota",
    "Prioridade na fila de geração e pesquisa reforçada",
    "Mesma base curada e equipe FACTO, com mais capacidade",
    "Pacotes extras se ainda precisar de mais peças",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_ANUAL = {
  id: "anual" as const,
  /** Preço redondo comercial (vs 12 × 189,90 = 2.278,80). */
  preco: 1890,
  pecasPorMes: 110,
  rotuloPreco: "R$ 1.890,00",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Anual",
  equivalenteMensal: 157.5,
  rotuloEquivalenteMensal: "R$ 157,50",
  /** Economia vs 12× mensal: 2.278,80 − 1.890,00 */
  economiaAno: 388.8,
  rotuloEconomia: "R$ 388,80",
  /** ~17% vs 12× mensal — preferir comunicar a economia em R$. */
  descontoPercentual: 17,
  /** 1.890 ÷ (110 × 12) */
  custoPorPecaAprox: "R$ 1,43",
  beneficios: [
    "Tudo do Completo mensal, com desconto no anual",
    "110 minutas/mês — ≈ R$ 1,43 por peça na cota anual",
    "Equivalente a R$ 157,50/mês — economia de R$ 388,80/ano",
    "Melhor custo por peça do FACTO no Completo",
    "Equipe FACTO + base curada de leis e súmulas",
    "Pacotes extras quando a cota mensal acabar",
  ],
};

export const PLANO_PRO_ANUAL = {
  id: "pro_anual" as const,
  /** Preço redondo comercial (vs 12 × 289,90 = 3.478,80). */
  preco: 2990,
  pecasPorMes: 200,
  rotuloPreco: "R$ 2.990,00",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Pro Anual",
  equivalenteMensal: 249.16666666666666,
  rotuloEquivalenteMensal: "R$ 249,17",
  /** Economia vs 12× Pro mensal: 3.478,80 − 2.990,00 */
  economiaAno: 488.8,
  rotuloEconomia: "R$ 488,80",
  /** ~14% vs 12× Pro mensal — preferir comunicar a economia em R$. */
  descontoPercentual: 14,
  /** 2.990 ÷ (200 × 12) */
  custoPorPecaAprox: "R$ 1,25",
  beneficios: [
    "Tudo do Pro mensal, com desconto no anual",
    "200 minutas/mês — ≈ R$ 1,25 por peça na cota anual",
    "Equivalente a R$ 249,17/mês — economia de R$ 488,80/ano",
    "Prioridade na fila e pesquisa reforçada o ano todo",
    "Melhor custo por peça do FACTO no alto volume",
    "Pacotes extras se ainda precisar de mais peças",
  ],
};

/** Assinantes cobrados nos preços anteriores ao Pacote A / arredondamento. */
export const PRECOS_LEADOS = {
  jec: 67.9,
  mensal: 147.9,
  anual: 1419.84,
  /** Completo Anual com 20% exato (antes do arredondamento para 1.890). */
  anual_pacote_a: 1819.04,
  /** Pro Anual com 20% (antes do ajuste para 15%). */
  pro_anual: 2783.04,
  /** Pro Anual com 15% exato (antes do arredondamento para 2.990). */
  pro_anual_pacote_a: 2956.98,
} as const;

/** Pacotes avulsos (área logada) — compra eventual, não assinatura. */
export const PACOTES_EXTRA = [
  {
    id: "extra-50" as const,
    pecas: 50,
    preco: 49.9,
    rotuloPreco: "R$ 49,90",
    rotulo: "+50 peças",
    /** 49,90 ÷ 50 */
    custoPorPecaAprox: "R$ 1,00",
    descricao: "Ideal para fechar o mês sem mudar de plano.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_50 ?? "").trim(),
  },
  {
    id: "extra-100" as const,
    pecas: 100,
    preco: 89.9,
    rotuloPreco: "R$ 89,90",
    rotulo: "+100 peças",
    /** 89,90 ÷ 100 */
    custoPorPecaAprox: "R$ 0,90",
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
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual_pacote_a) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual_pacote_a) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.mensal) < 1) return "mensal";
  if (Math.abs(valor - PRECOS_LEADOS.jec) < 1) return "jec";
  return null;
}

/** Rótulo comercial do plano (e-mails / admin). */
export function rotuloPlano(id: PlanoId | null | undefined): string {
  if (id === "jec") return PLANO_JEC.rotulo;
  if (id === "mensal") return PLANO_MENSAL.rotulo;
  if (id === "pro") return PLANO_PRO.rotulo;
  if (id === "anual") return PLANO_ANUAL.rotulo;
  if (id === "pro_anual") return PLANO_PRO_ANUAL.rotulo;
  return "—";
}

/**
 * Infere plano pelo nome/reason do MP (ex.: "Facto - Plano Completo (Mensal)").
 * Essencial quando o valor no MP é de teste (ex.: R$ 0,50) e não bate no catálogo.
 */
export function inferirPlanoPorTexto(
  texto: string | null | undefined
): PlanoId | null {
  if (!texto?.trim()) return null;
  const t = texto.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

  if (/\bpro\b/.test(t) && /anual/.test(t)) return "pro_anual";
  if (/anual/.test(t) && !/\bpro\b/.test(t)) return "anual";
  if (/\bpro\b/.test(t)) return "pro";
  if (/\bjec\b|juizado/.test(t)) return "jec";
  if (/completo|mensal/.test(t)) return "mensal";
  return null;
}

export const PRECO_CHEQUE_JEC = PLANO_JEC.preco;
export const PRECO_CHEQUE_MENSAL = PLANO_MENSAL.preco;
export const PRECO_CHEQUE_PRO = PLANO_PRO.preco;
export const PRECO_CHEQUE_ANUAL = PLANO_ANUAL.preco;
export const PRECO_CHEQUE_PRO_ANUAL = PLANO_PRO_ANUAL.preco;

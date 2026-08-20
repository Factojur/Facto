/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * JEC 79,90/40 · Completo 189,90/100 · Pro 289,90/180 ·
 * Completo Anual 1.890/100 · Pro Anual 2.990/180 ·
 * Escritório S 749,90 / M 1.299,90 · anuais S 7.499 / M 12.999 (10× mensal).
 * Valores legados continuam reconhecidos em planoPorValor (assinantes antigos).
 *
 * custoPorPecaAprox = preço do ciclo ÷ peças do ciclo (anuais: preço/ano ÷ 12×cota).
 */

export const PLANO_JEC = {
  id: "jec" as const,
  preco: 79.9,
  pecasPorMes: 40,
  analisesPorMes: 10,
  rotuloPreco: "R$ 79,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano JEC",
  /** 79,90 ÷ 40 */
  custoPorPecaAprox: "R$ 2,00",
  beneficios: [
    "Para a própria parte no Juizado — sem OAB",
    "40 minutas/mês — ≈ R$ 2,00 por peça na cota",
    "10 análises de processo/mês",
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
  analisesPorMes: 30,
  rotuloPreco: "R$ 189,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo",
  /** 189,90 ÷ 100 */
  custoPorPecaAprox: "R$ 1,90",
  beneficios: [
    "Para advogados (OAB) · todas as áreas no FACTO",
    "100 minutas/mês — ≈ R$ 1,90 por peça na cota",
    "30 análises de processo/mês",
    "Equipe completa: Analista, Pesquisa & súmulas, Redator e Auditor",
    "Base curada de leis e súmulas + fundamentos do seu caso",
    "Formatação forense (PDF/Word); revise antes de protocolar",
    "Pacotes extras ou upgrade para o Pro se o volume crescer",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_PRO = {
  id: "pro" as const,
  preco: 289.9,
  pecasPorMes: 180,
  analisesPorMes: 50,
  rotuloPreco: "R$ 289,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo Pro",
  /** 289,90 ÷ 180 */
  custoPorPecaAprox: "R$ 1,61",
  beneficios: [
    "Para advogados (OAB) · tudo do Plano Completo",
    "180 minutas/mês — ≈ R$ 1,61 por peça na cota",
    "50 análises de processo/mês",
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
  pecasPorMes: 100,
  analisesPorMes: 30,
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
  /** 1.890 ÷ (100 × 12) */
  custoPorPecaAprox: "R$ 1,58",
  beneficios: [
    "Para advogados (OAB) · tudo do Completo mensal, no anual",
    "100 minutas/mês — mesma cota do mensal · ≈ R$ 1,58 por peça",
    "30 análises de processo/mês",
    "Equivalente a R$ 157,50/mês — economia de R$ 388,80/ano",
    "Equipe FACTO + base curada de leis e súmulas",
    "Pacotes extras quando a cota mensal acabar",
  ],
};

export const PLANO_PRO_ANUAL = {
  id: "pro_anual" as const,
  /** Preço redondo comercial (vs 12 × 289,90 = 3.478,80). */
  preco: 2990,
  pecasPorMes: 180,
  analisesPorMes: 50,
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
  /** 2.990 ÷ (180 × 12) */
  custoPorPecaAprox: "R$ 1,38",
  beneficios: [
    "Para advogados (OAB) · tudo do Pro mensal, no anual",
    "180 minutas/mês — mesma cota do mensal · ≈ R$ 1,38 por peça",
    "50 análises de processo/mês",
    "Equivalente a R$ 249,17/mês — economia de R$ 488,80/ano",
    "Prioridade na fila e pesquisa reforçada o ano todo",
    "Pacotes extras se ainda precisar de mais peças",
  ],
};

/** Assinantes cobrados nos preços anteriores ao Pacote A / arredondamento. */
export const PRECOS_LEADOS = {
  jec: 67.9,
  mensal: 147.9,
  anual: 1419.84,
  /** Alias do Completo Anual vigente (1.890) — webhook por valor. */
  anual_1890: 1890,
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
    analises: 0,
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
    analises: 0,
    preco: 89.9,
    rotuloPreco: "R$ 89,90",
    rotulo: "+100 peças",
    /** 89,90 ÷ 100 */
    custoPorPecaAprox: "R$ 0,90",
    descricao: "Melhor custo por peça entre os pacotes extras.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_100 ?? "").trim(),
  },
  {
    id: "extra-analises-10" as const,
    pecas: 0,
    analises: 10,
    preco: 29.9,
    rotuloPreco: "R$ 29,90",
    rotulo: "+10 análises",
    custoPorPecaAprox: "R$ 2,99",
    descricao: "Mais análises de processo neste mês, sem mudar de plano.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_ANALISES_10 ?? "").trim(),
  },
] as const;

export type PacoteExtraId = (typeof PACOTES_EXTRA)[number]["id"];
export type PacoteExtra = (typeof PACOTES_EXTRA)[number];
export type PlanoId =
  | "jec"
  | "mensal"
  | "pro"
  | "anual"
  | "pro_anual"
  | "trial"
  | "escritorio_s"
  | "escritorio_m"
  | "escritorio_s_anual"
  | "escritorio_m_anual";

/** Teste grátis: 1 área · 2 peças · 7 dias · watermark. */
export const PLANO_TRIAL = {
  id: "trial" as const,
  preco: 0,
  pecasPorMes: 2,
  analisesPorMes: 1,
  diasValidade: 7,
  rotuloPreco: "Grátis",
  rotuloPeriodo: "/7 dias",
  rotulo: "Teste grátis",
  custoPorPecaAprox: "—",
  beneficios: [
    "1 área à sua escolha · 2 minutas · 7 dias",
    "Sem OAB no início — informe só ao assinar",
    "Preview completo; export com marca d’água de teste",
    "Sem compromisso — cancele não renovando",
  ],
};

/** Escritório S — 5 assentos, cota em pool, OAB do admin. */
export const PLANO_ESCRITORIO_S = {
  id: "escritorio_s" as const,
  preco: 749.9,
  pecasPorMes: 450,
  analisesPorMes: 80,
  seats: 5,
  rotuloPreco: "R$ 749,90",
  rotuloPeriodo: "/mês",
  rotulo: "Escritório S",
  custoPorPecaAprox: "R$ 1,67",
  beneficios: [
    "5 assentos simultâneos (sócios, estagiários, equipe)",
    "450 minutas/mês em pool do escritório",
    "OAB do administrador ampara a conta; membros sem OAB",
    "Estilo de redação por assento",
    "Todas as áreas (responsável com OAB)",
  ],
};

/** Escritório M — 10 assentos. */
export const PLANO_ESCRITORIO_M = {
  id: "escritorio_m" as const,
  preco: 1299.9,
  pecasPorMes: 900,
  analisesPorMes: 150,
  seats: 10,
  rotuloPreco: "R$ 1.299,90",
  rotuloPeriodo: "/mês",
  rotulo: "Escritório M",
  custoPorPecaAprox: "R$ 1,44",
  beneficios: [
    "10 assentos simultâneos",
    "900 minutas/mês em pool do escritório",
    "OAB do administrador · membros/estagiários sem OAB",
    "Estilo por assento + prioridade na fila",
    "Todas as áreas liberadas ao responsável OAB",
  ],
};

/**
 * Escritório S Anual — equivalente a 10× mensal (2 meses off).
 * 12 × 749,90 = 8.998,80 → 7.499,00.
 */
export const PLANO_ESCRITORIO_S_ANUAL = {
  id: "escritorio_s_anual" as const,
  preco: 7499,
  pecasPorMes: 450,
  analisesPorMes: 80,
  seats: 5,
  rotuloPreco: "R$ 7.499,00",
  rotuloPeriodo: "/ano",
  rotulo: "Escritório S Anual",
  equivalenteMensal: 624.9166666666666,
  rotuloEquivalenteMensal: "R$ 624,92",
  economiaAno: 1499.8,
  rotuloEconomia: "R$ 1.499,80",
  descontoPercentual: 17,
  custoPorPecaAprox: "R$ 1,39",
  beneficios: [
    "Tudo do Escritório S, no anual",
    "5 assentos · 450 minutas/mês em pool",
    "Equivalente a R$ 624,92/mês — economia de R$ 1.499,80/ano",
    "OAB do administrador · membros sem OAB",
    "Checkout sob demanda (assentos + vínculo)",
  ],
};

/**
 * Escritório M Anual — 10× mensal (2 meses off).
 * 12 × 1.299,90 = 15.598,80 → 12.999,00.
 */
export const PLANO_ESCRITORIO_M_ANUAL = {
  id: "escritorio_m_anual" as const,
  preco: 12999,
  pecasPorMes: 900,
  analisesPorMes: 150,
  seats: 10,
  rotuloPreco: "R$ 12.999,00",
  rotuloPeriodo: "/ano",
  rotulo: "Escritório M Anual",
  equivalenteMensal: 1083.25,
  rotuloEquivalenteMensal: "R$ 1.083,25",
  economiaAno: 2599.8,
  rotuloEconomia: "R$ 2.599,80",
  descontoPercentual: 17,
  custoPorPecaAprox: "R$ 1,20",
  beneficios: [
    "Tudo do Escritório M, no anual",
    "10 assentos · 900 minutas/mês em pool",
    "Equivalente a R$ 1.083,25/mês — economia de R$ 2.599,80/ano",
    "Prioridade na fila o ano todo",
    "Checkout sob demanda (assentos + vínculo)",
  ],
};

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

export function ehPacoteAnalises(pacote: PacoteExtra): boolean {
  return (pacote.analises ?? 0) > 0;
}

/**
 * external_reference: facto_extra_50_<userId> | facto_extra_100_<userId> |
 * facto_extra_analises_10_<userId>
 */
export function montarExternalReferenceExtra(
  pacoteId: PacoteExtraId,
  userId: string
): string {
  if (pacoteId === "extra-analises-10") {
    return `facto_extra_analises_10_${userId}`;
  }
  const sufixo = pacoteId === "extra-50" ? "50" : "100";
  return `facto_extra_${sufixo}_${userId}`;
}

function pacoteIdPorSufixoRef(sufixo: string): PacoteExtraId | null {
  if (sufixo === "analises_10") return "extra-analises-10";
  if (sufixo === "50") return "extra-50";
  if (sufixo === "100") return "extra-100";
  return null;
}

export function parseExternalReferenceExtra(
  ref: string | null | undefined
): {
  pacote: PacoteExtra;
  userId: string | null;
} | null {
  if (!ref) return null;
  const m = ref
    .trim()
    .match(/^facto_extra_(analises_10|50|100)_([0-9a-f-]{36})$/i);
  if (!m) {
    const soPacote = ref
      .trim()
      .match(/^facto_extra_(analises_10|50|100)$/i);
    if (!soPacote) return null;
    const id = pacoteIdPorSufixoRef(soPacote[1].toLowerCase());
    const pacote = id ? pacoteExtraPorId(id) : null;
    return pacote ? { pacote, userId: null } : null;
  }
  const id = pacoteIdPorSufixoRef(m[1].toLowerCase());
  const pacote = id ? pacoteExtraPorId(id) : null;
  if (!pacote) return null;
  return { pacote, userId: m[2] };
}

/** Inferência por valor (webhook / links MP) — inclui preços legados. */
export function planoPorValor(valor: number | null | undefined): PlanoId | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  if (Math.abs(valor - PLANO_ESCRITORIO_M_ANUAL.preco) < 1) return "escritorio_m_anual";
  if (Math.abs(valor - PLANO_ESCRITORIO_S_ANUAL.preco) < 1) return "escritorio_s_anual";
  if (Math.abs(valor - PLANO_ESCRITORIO_M.preco) < 1) return "escritorio_m";
  if (Math.abs(valor - PLANO_ESCRITORIO_S.preco) < 1) return "escritorio_s";
  if (Math.abs(valor - PLANO_PRO_ANUAL.preco) < 1) return "pro_anual";
  if (Math.abs(valor - PLANO_ANUAL.preco) < 1) return "anual";
  if (Math.abs(valor - PLANO_PRO.preco) < 1) return "pro";
  if (Math.abs(valor - PLANO_MENSAL.preco) < 1) return "mensal";
  if (Math.abs(valor - PLANO_JEC.preco) < 1) return "jec";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual_pacote_a) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual_1890) < 1) return "anual";
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
  if (id === "trial") return PLANO_TRIAL.rotulo;
  if (id === "escritorio_s") return PLANO_ESCRITORIO_S.rotulo;
  if (id === "escritorio_m") return PLANO_ESCRITORIO_M.rotulo;
  if (id === "escritorio_s_anual") return PLANO_ESCRITORIO_S_ANUAL.rotulo;
  if (id === "escritorio_m_anual") return PLANO_ESCRITORIO_M_ANUAL.rotulo;
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

  if (/\bescritorio\s*m\b/.test(t) && /anual/.test(t)) return "escritorio_m_anual";
  if (/\bescritorio\s*s\b/.test(t) && /anual/.test(t)) return "escritorio_s_anual";
  if (/\bescritorio\s*m\b|escritorio m\b|10 assentos/.test(t)) return "escritorio_m";
  if (/\bescritorio\s*s\b|escritorio s\b|5 assentos/.test(t)) return "escritorio_s";
  if (/\bpro\b/.test(t) && /anual/.test(t)) return "pro_anual";
  if (/anual/.test(t) && !/\bpro\b/.test(t) && !/escritorio/.test(t)) return "anual";
  if (/\bpro\b/.test(t)) return "pro";
  if (/\bjec\b|juizado/.test(t)) return "jec";
  if (/completo|mensal/.test(t)) return "mensal";
  if (/teste gratis|trial/.test(t)) return "trial";
  return null;
}

export const PRECO_CHEQUE_JEC = PLANO_JEC.preco;
export const PRECO_CHEQUE_MENSAL = PLANO_MENSAL.preco;
export const PRECO_CHEQUE_PRO = PLANO_PRO.preco;
export const PRECO_CHEQUE_ANUAL = PLANO_ANUAL.preco;
export const PRECO_CHEQUE_PRO_ANUAL = PLANO_PRO_ANUAL.preco;
export const PRECO_CHEQUE_ESCRITORIO_S = PLANO_ESCRITORIO_S.preco;
export const PRECO_CHEQUE_ESCRITORIO_M = PLANO_ESCRITORIO_M.preco;
export const PRECO_CHEQUE_ESCRITORIO_S_ANUAL = PLANO_ESCRITORIO_S_ANUAL.preco;
export const PRECO_CHEQUE_ESCRITORIO_M_ANUAL = PLANO_ESCRITORIO_M_ANUAL.preco;

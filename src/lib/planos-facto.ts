/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * JEC 79,90/40 · Completo 139,90/100 · Pro 279,90/200 ·
 * Completo Anual 1.399/100 · Pro Anual 2.799/200 ·
 * Escritório S 749,90 / M 1.299,90 · anuais S 7.499 / M 12.999 (10× mensal).
 * Valores legados continuam reconhecidos em planoPorValor (assinantes antigos).
 *
 * Unidade comercial: peças (não créditos / minutas).
 * Entrada do caso não consome cota — só “Gerar peça” = 1 peça.
 * custoPorPecaAprox = preço do ciclo ÷ peças do ciclo (anuais: preço/ano ÷ 12×cota).
 */

import { ESCRITORIO_VENDA_ATIVA } from "@/lib/feature-flags";

export const PLANO_JEC = {
  id: "jec" as const,
  preco: 79.9,
  pecasPorMes: 40,
  /** @deprecated Entrada não consome análise; mantido 0 para compat. */
  analisesPorMes: 0,
  rotuloPreco: "R$ 79,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano JEC",
  /** 79,90 ÷ 40 */
  custoPorPecaAprox: "R$ 2,00",
  beneficios: [
    "Para a própria parte no Juizado — sem OAB",
    "40 peças/mês — ≈ R$ 2,00 por peça na cota",
    "Entrada do caso ilimitada (não consome peça)",
    "Equipe FACTO: análise, súmulas da base curada e redação",
    "Timbre e dados do seu perfil na peça",
    "Pacotes extras se a cota do mês acabar",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_MENSAL = {
  id: "mensal" as const,
  preco: 139.9,
  pecasPorMes: 100,
  analisesPorMes: 0,
  rotuloPreco: "R$ 139,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo",
  /** 139,90 ÷ 100 */
  custoPorPecaAprox: "R$ 1,40",
  beneficios: [
    "Para advogados (OAB) · todas as áreas no FACTO",
    "100 peças/mês — ≈ R$ 1,40 por peça na cota",
    "Entrada do caso ilimitada (não consome peça)",
    "Equipe completa: Analista, Pesquisa & súmulas, Redator e Auditor",
    "Base curada de leis e súmulas + fundamentos do seu caso",
    "Formatação forense (PDF/Word); revise antes de protocolar",
    "Pacotes extras ou upgrade para o Pro se o volume crescer",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_PRO = {
  id: "pro" as const,
  preco: 279.9,
  pecasPorMes: 200,
  analisesPorMes: 0,
  rotuloPreco: "R$ 279,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo Pro",
  /** 279,90 ÷ 200 */
  custoPorPecaAprox: "R$ 1,40",
  beneficios: [
    "Para advogados (OAB) · tudo do Plano Completo",
    "200 peças/mês — ≈ R$ 1,40 por peça na cota",
    "Entrada do caso ilimitada (não consome peça)",
    "Prioridade na fila de geração e pesquisa reforçada",
    "Mesma base curada e equipe FACTO, com mais capacidade",
    "Pacotes extras se ainda precisar de mais peças",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_ANUAL = {
  id: "anual" as const,
  /** 10× mensal (2 meses off): 10 × 139,90. */
  preco: 1399,
  pecasPorMes: 100,
  analisesPorMes: 0,
  rotuloPreco: "R$ 1.399,00",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Anual",
  equivalenteMensal: 116.58333333333333,
  rotuloEquivalenteMensal: "R$ 116,58",
  /** Economia vs 12× mensal: 1.678,80 − 1.399,00 */
  economiaAno: 279.8,
  rotuloEconomia: "R$ 279,80",
  descontoPercentual: 17,
  /** 1.399 ÷ (100 × 12) */
  custoPorPecaAprox: "R$ 1,17",
  beneficios: [
    "Para advogados (OAB) · tudo do Completo mensal, no anual",
    "100 peças/mês — mesma cota do mensal · ≈ R$ 1,17 por peça",
    "Entrada do caso ilimitada (não consome peça)",
    "Equivalente a R$ 116,58/mês — economia de R$ 279,80/ano",
    "Equipe FACTO + base curada de leis e súmulas",
    "Pacotes extras quando a cota mensal acabar",
  ],
};

export const PLANO_PRO_ANUAL = {
  id: "pro_anual" as const,
  /** 10× Pro mensal (2 meses off): 10 × 279,90. */
  preco: 2799,
  pecasPorMes: 200,
  analisesPorMes: 0,
  rotuloPreco: "R$ 2.799,00",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Pro Anual",
  equivalenteMensal: 233.25,
  rotuloEquivalenteMensal: "R$ 233,25",
  /** Economia vs 12× Pro mensal: 3.358,80 − 2.799,00 */
  economiaAno: 559.8,
  rotuloEconomia: "R$ 559,80",
  descontoPercentual: 17,
  /** 2.799 ÷ (200 × 12) */
  custoPorPecaAprox: "R$ 1,17",
  beneficios: [
    "Para advogados (OAB) · tudo do Pro mensal, no anual",
    "200 peças/mês — mesma cota do mensal · ≈ R$ 1,17 por peça",
    "Entrada do caso ilimitada (não consome peça)",
    "Equivalente a R$ 233,25/mês — economia de R$ 559,80/ano",
    "Prioridade na fila e pesquisa reforçada o ano todo",
    "Pacotes extras se ainda precisar de mais peças",
  ],
};

/** Assinantes cobrados nos preços anteriores ao Pacote A / arredondamento. */
export const PRECOS_LEADOS = {
  jec: 67.9,
  mensal: 147.9,
  /** Completo mensal antes do alinhamento a R$ 139,90. */
  mensal_18990: 189.9,
  /** Pro mensal antes do alinhamento a R$ 279,90 / 200 peças. */
  pro_28990: 289.9,
  anual: 1419.84,
  /** Alias do Completo Anual vigente anterior (1.890). */
  anual_1890: 1890,
  /** Completo Anual com 20% exato (antes do arredondamento para 1.890). */
  anual_pacote_a: 1819.04,
  /** Pro Anual com 20% (antes do ajuste para 15%). */
  pro_anual: 2783.04,
  /** Pro Anual com 15% exato (antes do arredondamento para 2.990). */
  pro_anual_pacote_a: 2956.98,
  /** Pro Anual redondo anterior (2.990). */
  pro_anual_2990: 2990,
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
] as const;

/**
 * Pacote de análises descontinuado — só para webhook/legado de compras em voo.
 * Não aparece na UI nem em novos checkouts.
 */
export const PACOTE_EXTRA_ANALISES_LEGADO = {
  id: "extra-analises-10" as const,
  pecas: 0,
  analises: 10,
  preco: 29.9,
  rotuloPreco: "R$ 29,90",
  rotulo: "+10 análises",
  custoPorPecaAprox: "R$ 2,99",
  descricao: "Descontinuado — análises não consomem cota.",
  linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_ANALISES_10 ?? "").trim(),
} as const;

export type PacoteExtraId =
  | (typeof PACOTES_EXTRA)[number]["id"]
  | typeof PACOTE_EXTRA_ANALISES_LEGADO.id;
export type PacoteExtra =
  | (typeof PACOTES_EXTRA)[number]
  | typeof PACOTE_EXTRA_ANALISES_LEGADO;
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
  analisesPorMes: 0,
  diasValidade: 7,
  rotuloPreco: "Grátis",
  rotuloPeriodo: "/7 dias",
  rotulo: "Teste grátis",
  custoPorPecaAprox: "—",
  beneficios: [
    "1 área à sua escolha · 2 peças · 7 dias",
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
  analisesPorMes: 0,
  seats: 5,
  rotuloPreco: "R$ 749,90",
  rotuloPeriodo: "/mês",
  rotulo: "Escritório S",
  custoPorPecaAprox: "R$ 1,67",
  beneficios: [
    "5 assentos simultâneos (sócios, estagiários, equipe)",
    "450 peças/mês em pool do escritório",
    "Entrada do caso ilimitada (não consome peça)",
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
  analisesPorMes: 0,
  seats: 10,
  rotuloPreco: "R$ 1.299,90",
  rotuloPeriodo: "/mês",
  rotulo: "Escritório M",
  custoPorPecaAprox: "R$ 1,44",
  beneficios: [
    "10 assentos simultâneos",
    "900 peças/mês em pool do escritório",
    "Entrada do caso ilimitada (não consome peça)",
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
  analisesPorMes: 0,
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
    "5 assentos · 450 peças/mês em pool",
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
  analisesPorMes: 0,
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
    "10 assentos · 900 peças/mês em pool",
    "Equivalente a R$ 1.083,25/mês — economia de R$ 2.599,80/ano",
    "Prioridade na fila o ano todo",
    "Checkout sob demanda (assentos + vínculo)",
  ],
};

export function pacoteExtraPorId(id: string): PacoteExtra | null {
  const ativo = PACOTES_EXTRA.find((p) => p.id === id);
  if (ativo) return ativo;
  if (id === PACOTE_EXTRA_ANALISES_LEGADO.id) return PACOTE_EXTRA_ANALISES_LEGADO;
  return null;
}

/** Identifica pacote pelo valor da cobrança (links estáticos / fallback). */
export function pacoteExtraPorValor(
  valor: number | null | undefined
): PacoteExtra | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  for (const p of PACOTES_EXTRA) {
    if (Math.abs(valor - p.preco) < 0.05) return p;
  }
  if (Math.abs(valor - PACOTE_EXTRA_ANALISES_LEGADO.preco) < 0.05) {
    return PACOTE_EXTRA_ANALISES_LEGADO;
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
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual_2990) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual_pacote_a) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.pro_anual) < 1) return "pro_anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual_1890) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual_pacote_a) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.anual) < 1) return "anual";
  if (Math.abs(valor - PRECOS_LEADOS.pro_28990) < 1) return "pro";
  if (Math.abs(valor - PRECOS_LEADOS.mensal_18990) < 1) return "mensal";
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

/** Planos assináveis via checkout API (token userId). */
export const PLANOS_CHECKOUT = [
  "jec",
  "mensal",
  "pro",
  "anual",
  "pro_anual",
  "escritorio_s",
  "escritorio_m",
  "escritorio_s_anual",
  "escritorio_m_anual",
] as const;

export type PlanoCheckoutId = (typeof PLANOS_CHECKOUT)[number];

/** Planos vendáveis agora (Escritório oculto até seats + gateway). */
export const PLANOS_CHECKOUT_ATIVOS: readonly PlanoCheckoutId[] =
  ESCRITORIO_VENDA_ATIVA
    ? PLANOS_CHECKOUT
    : (PLANOS_CHECKOUT.filter(
        (id) => !id.startsWith("escritorio_")
      ) as PlanoCheckoutId[]);

export function ehPlanoCheckout(id: string): id is PlanoCheckoutId {
  return (PLANOS_CHECKOUT_ATIVOS as readonly string[]).includes(id);
}

/**
 * external_reference: facto_upgrade_<planoId>_<userId>
 * Ex.: facto_upgrade_mensal_<uuid> | facto_upgrade_escritorio_s_anual_<uuid>
 */
export function montarExternalReferenceUpgrade(
  planoId: PlanoCheckoutId,
  userId: string
): string {
  return `facto_upgrade_${planoId}_${userId}`;
}

export function parseExternalReferenceUpgrade(
  ref: string | null | undefined
): { plano: PlanoCheckoutId; userId: string } | null {
  if (!ref?.trim()) return null;
  const m = ref
    .trim()
    .match(/^facto_upgrade_([a-z0-9_]+)_([0-9a-f-]{36})$/i);
  if (!m) return null;
  const plano = m[1].toLowerCase();
  if (!ehPlanoCheckout(plano)) return null;
  return { plano, userId: m[2] };
}

export function catalogoPlanoCheckout(id: PlanoCheckoutId) {
  switch (id) {
    case "jec":
      return PLANO_JEC;
    case "mensal":
      return PLANO_MENSAL;
    case "pro":
      return PLANO_PRO;
    case "anual":
      return PLANO_ANUAL;
    case "pro_anual":
      return PLANO_PRO_ANUAL;
    case "escritorio_s":
      return PLANO_ESCRITORIO_S;
    case "escritorio_m":
      return PLANO_ESCRITORIO_M;
    case "escritorio_s_anual":
      return PLANO_ESCRITORIO_S_ANUAL;
    case "escritorio_m_anual":
      return PLANO_ESCRITORIO_M_ANUAL;
  }
}

export function frequenciaCheckout(id: PlanoCheckoutId): {
  frequency: number;
  frequency_type: "months";
} {
  if (
    id === "anual" ||
    id === "pro_anual" ||
    id === "escritorio_s_anual" ||
    id === "escritorio_m_anual"
  ) {
    return { frequency: 12, frequency_type: "months" };
  }
  return { frequency: 1, frequency_type: "months" };
}

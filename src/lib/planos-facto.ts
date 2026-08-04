/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * Anual completo = 12 × mensal completo com 20% de desconto.
 */

export const PLANO_JEC = {
  id: "jec" as const,
  preco: 67.9,
  pecasPorMes: 50,
  rotuloPreco: "R$ 67,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano JEC",
  beneficios: [
    "Acesso ao Juizado Especial Cível (minuta, PDF e Word)",
    "50 peças jurídicas por mês",
    "Formatação forense e fundamentação assistida por IA",
    "Timbre e dados do perfil na peça",
    "Pacotes extras de peças quando a cota acabar",
    "Ideal para quem atua só no JEC",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_MENSAL = {
  id: "mensal" as const,
  preco: 147.9,
  pecasPorMes: 240,
  rotuloPreco: "R$ 147,90",
  rotuloPeriodo: "/mês",
  rotulo: "Plano Completo",
  beneficios: [
    "Acesso a todas as áreas liberadas no FACTO",
    "240 peças jurídicas por mês",
    "Formatação forense e fundamentação assistida por IA",
    "Base de conhecimento e jurisprudência do seu escritório",
    "Timbre e dados do perfil na peça",
    "Pacotes extras de peças quando a cota acabar",
    "Leigos: acesso ao JEC com a mesma cota elevada",
    "Cancele quando quiser — sem fidelidade",
  ],
};

export const PLANO_ANUAL = {
  id: "anual" as const,
  /** 12 × 147,90 × 0,80 = 1.419,84 */
  preco: 1419.84,
  pecasPorMes: 300,
  rotuloPreco: "R$ 1.419,84",
  rotuloPeriodo: "/ano",
  rotulo: "Plano Completo Anual",
  /** Equivalente mensal: 1.419,84 ÷ 12 */
  equivalenteMensal: 118.32,
  rotuloEquivalenteMensal: "R$ 118,32",
  /** Economia vs 12× mensal: 1.774,80 − 1.419,84 */
  economiaAno: 354.96,
  rotuloEconomia: "R$ 354,96",
  descontoPercentual: 20,
  beneficios: [
    "Tudo do Plano Completo mensal",
    "300 peças jurídicas por mês (+60 vs mensal)",
    "20% de desconto — equivalente a R$ 118,32/mês",
    "Economia de R$ 354,96 por ano",
    "Formatação forense e fundamentação assistida por IA",
    "Base de conhecimento e jurisprudência do seu escritório",
    "Pacotes extras de peças quando a cota acabar",
    "Melhor custo por peça do FACTO",
  ],
};

/** Pacotes avulsos (área logada) — compra eventual, não assinatura. */
export const PACOTES_EXTRA = [
  {
    id: "extra-50" as const,
    pecas: 50,
    preco: 39.9,
    rotuloPreco: "R$ 39,90",
    rotulo: "+50 peças",
    descricao: "Ideal para fechar o mês sem mudar de plano.",
    /**
     * Opcional: link estático do painel MP.
     * Preferência: checkout dinâmico em /api/pacotes-extras/checkout.
     */
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_50 ?? "").trim(),
  },
  {
    id: "extra-100" as const,
    pecas: 100,
    preco: 79.9,
    rotuloPreco: "R$ 79,90",
    rotulo: "+100 peças",
    descricao: "Melhor custo por peça entre os pacotes extras.",
    linkMp: (process.env.NEXT_PUBLIC_MP_LINK_EXTRA_100 ?? "").trim(),
  },
] as const;

export type PacoteExtraId = (typeof PACOTES_EXTRA)[number]["id"];
export type PacoteExtra = (typeof PACOTES_EXTRA)[number];
export type PlanoId = "jec" | "mensal" | "anual";

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
  return null;
}

/**
 * external_reference do checkout: facto_extra_50_<userId>
 * (só letras, números, _ e - — regra MP).
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

/** Inferência por valor (webhook / links MP). */
export function planoPorValor(valor: number | null | undefined): PlanoId | null {
  if (typeof valor !== "number" || Number.isNaN(valor)) return null;
  if (Math.abs(valor - PLANO_ANUAL.preco) < 1) return "anual";
  if (Math.abs(valor - PLANO_MENSAL.preco) < 1) return "mensal";
  if (Math.abs(valor - PLANO_JEC.preco) < 1) return "jec";
  return null;
}

export const PRECO_CHEQUE_JEC = PLANO_JEC.preco;
export const PRECO_CHEQUE_MENSAL = PLANO_MENSAL.preco;
export const PRECO_CHEQUE_ANUAL = PLANO_ANUAL.preco;

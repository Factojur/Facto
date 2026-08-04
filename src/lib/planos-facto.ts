/**
 * Preços, cotas e benefícios comerciais FACTO (landing + área logada + webhook).
 * Anual = 12 × mensal com 20% de desconto.
 */

export const PLANO_MENSAL = {
  id: "mensal" as const,
  preco: 147.9,
  pecasPorMes: 240,
  rotuloPreco: "R$ 147,90",
  rotuloPeriodo: "/mês",
  beneficios: [
    "Acesso completo ao gerador JEC (minuta, PDF e Word)",
    "240 peças jurídicas por mês",
    "Formatação forense e fundamentação assistida por IA",
    "Base de conhecimento e jurisprudência do seu escritório",
    "Timbre e dados do perfil na peça",
    "Pacotes extras de peças quando a cota acabar",
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
  /** Equivalente mensal: 1.419,84 ÷ 12 */
  equivalenteMensal: 118.32,
  rotuloEquivalenteMensal: "R$ 118,32",
  /** Economia vs 12× mensal: 1.774,80 − 1.419,84 */
  economiaAno: 354.96,
  rotuloEconomia: "R$ 354,96",
  descontoPercentual: 20,
  beneficios: [
    "Tudo do plano mensal",
    "300 peças jurídicas por mês (+60 vs mensal)",
    "20% de desconto — equivalente a R$ 118,32/mês",
    "Economia de R$ 354,96 por ano",
    "Formatação forense e fundamentação assistida por IA",
    "Base de conhecimento e jurisprudência do seu escritório",
    "Pacotes extras de peças quando a cota acabar",
    "Melhor custo por peça do FACTO",
  ],
};

/** Pacotes avulsos (área logada) — margem alinhada ao mensal. */
export const PACOTES_EXTRA = [
  {
    id: "extra-50" as const,
    pecas: 50,
    preco: 39.9,
    rotuloPreco: "R$ 39,90",
    rotulo: "+50 peças",
    descricao: "Ideal para fechar o mês sem mudar de plano.",
    /** Preencher quando criar o link no Mercado Pago */
    linkMp: "" as string,
  },
  {
    id: "extra-100" as const,
    pecas: 100,
    preco: 79.9,
    rotuloPreco: "R$ 79,90",
    rotulo: "+100 peças",
    descricao: "Melhor custo por peça entre os pacotes extras.",
    linkMp: "" as string,
  },
] as const;

export const PRECO_CHEQUE_MENSAL = PLANO_MENSAL.preco;
export const PRECO_CHEQUE_ANUAL = PLANO_ANUAL.preco;

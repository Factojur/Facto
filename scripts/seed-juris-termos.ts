/**
 * Termos de busca para seed de jurisprudência (Jurisprudências.ai).
 * Lote 2: equilíbrio autor × réu + temas que faltaram no lote 1.
 */

/** Lote 1 — temas JEC quentes (genéricos). */
export const TERMOS_JEC_LOTE_1: string[] = [
  "indenização dano moral atraso voo",
  "inexigibilidade débito negativação indevida",
  "obrigação de fazer plano de saúde",
  "dano moral cobrança indevida telefone",
  "rescisão contrato compra venda veículo",
  "dano material e moral falha prestação serviço",
  "tutela urgência corte energia elétrica",
  "CDC vício produto garantia",
  "juros abusivos cartão crédito revisão",
  "golpe pix transferência fraude banco",
  "nome sujo SPC SERASA negativação",
  "atraso entrega imóvel construtora",
  "cancelamento passagem aérea reembolso",
  "honorários advocatícios JEC",
  "prova emprestada juizado especial",
];

/**
 * Lote 2 — consultas inclinadas a resultado (autor ou réu) + cobertura de lacunas.
 * Pares por tema: uma busca pró-autor, outra pró-réu / defesa.
 */
export const TERMOS_JEC_LOTE_2: { lado: "autor" | "reu" | "neutro"; q: string }[] =
  [
    // Atraso de voo
    { lado: "autor", q: "atraso voo dano moral procedência assistência material CDC" },
    { lado: "reu", q: "atraso voo improcedência caso fortuito força maior companhia aérea" },
    // Negativação
    { lado: "autor", q: "negativação indevida dano moral in re ipsa procedência SPC" },
    { lado: "reu", q: "negativação improcedência dívida legítima exercício regular do direito" },
    // Plano de saúde
    { lado: "autor", q: "plano de saúde obrigação de fazer cobertura tratamento procedência" },
    { lado: "reu", q: "plano de saúde improcedência procedimento experimental exclusão contratual" },
    // Telefonia / cobrança
    { lado: "autor", q: "cobrança indevida telefone repetição indébito dano moral procedência" },
    { lado: "reu", q: "cobrança telefone improcedência serviço contratado ausência ilícito" },
    // Veículo (lacuna lote 1)
    { lado: "autor", q: "vício veículo CDC rescisão compra venda procedência" },
    { lado: "reu", q: "compra venda veículo improcedência uso inadequado decadência garantia" },
    // Golpe PIX / banco
    { lado: "autor", q: "golpe pix banco falha segurança Súmula 479 procedência" },
    { lado: "reu", q: "golpe pix culpa exclusiva da vítima improcedência fortuito interno" },
    // Juros / cartão (lacuna lote 1)
    { lado: "autor", q: "juros abusivos cartão crédito revisão contratual CDC procedência" },
    { lado: "reu", q: "juros cartão crédito improcedência taxa média mercado liberdade contratual" },
    // Falha prestação serviço
    { lado: "autor", q: "falha prestação serviço dano moral material procedência CDC" },
    { lado: "reu", q: "falha serviço improcedência mero aborrecimento ausência dano" },
    // Energia elétrica
    { lado: "autor", q: "corte energia elétrica ilegal tutela urgência dano moral procedência" },
    { lado: "reu", q: "corte energia inadimplência regular improcedência" },
    // Vício produto
    { lado: "autor", q: "vício produto garantia legal substituição CDC procedência" },
    { lado: "reu", q: "vício produto improcedência mau uso prazo decadencial" },
    // Construtora / imóvel
    { lado: "autor", q: "atraso entrega imóvel construtora dano moral lucros cessantes procedência" },
    { lado: "reu", q: "atraso obra improcedência caso fortuito atraso justificado" },
    // Passagem aérea
    { lado: "autor", q: "cancelamento passagem aérea reembolso dano moral procedência" },
    { lado: "reu", q: "cancelamento voo improcedência reacomodação assistência adequada" },
  ];

export function termosDoLote(lote: number): string[] {
  if (lote === 2) return TERMOS_JEC_LOTE_2.map((t) => t.q);
  return TERMOS_JEC_LOTE_1;
}

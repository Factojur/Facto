/**
 * Termos de busca para seed de jurisprudência (Jurisprudências.ai).
 * Lotes 1–2: JEC. Lote 3: multiárea, pares autor × réu.
 */

export type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  /** Default: SEED_JURIS_TRIBUNAL / tjsp */
  tribunal?: string;
};

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
export const TERMOS_JEC_LOTE_2: TermoSeed[] = [
  { lado: "autor", q: "atraso voo dano moral procedência assistência material CDC" },
  { lado: "reu", q: "atraso voo improcedência caso fortuito força maior companhia aérea" },
  { lado: "autor", q: "negativação indevida dano moral in re ipsa procedência SPC" },
  { lado: "reu", q: "negativação improcedência dívida legítima exercício regular do direito" },
  { lado: "autor", q: "plano de saúde obrigação de fazer cobertura tratamento procedência" },
  { lado: "reu", q: "plano de saúde improcedência procedimento experimental exclusão contratual" },
  { lado: "autor", q: "cobrança indevida telefone repetição indébito dano moral procedência" },
  { lado: "reu", q: "cobrança telefone improcedência serviço contratado ausência ilícito" },
  { lado: "autor", q: "vício veículo CDC rescisão compra venda procedência" },
  { lado: "reu", q: "compra venda veículo improcedência uso inadequado decadência garantia" },
  { lado: "autor", q: "golpe pix banco falha segurança Súmula 479 procedência" },
  { lado: "reu", q: "golpe pix culpa exclusiva da vítima improcedência fortuito interno" },
  { lado: "autor", q: "juros abusivos cartão crédito revisão contratual CDC procedência" },
  { lado: "reu", q: "juros cartão crédito improcedência taxa média mercado liberdade contratual" },
  { lado: "autor", q: "falha prestação serviço dano moral material procedência CDC" },
  { lado: "reu", q: "falha serviço improcedência mero aborrecimento ausência dano" },
  { lado: "autor", q: "corte energia elétrica ilegal tutela urgência dano moral procedência" },
  { lado: "reu", q: "corte energia inadimplência regular improcedência" },
  { lado: "autor", q: "vício produto garantia legal substituição CDC procedência" },
  { lado: "reu", q: "vício produto improcedência mau uso prazo decadencial" },
  { lado: "autor", q: "atraso entrega imóvel construtora dano moral lucros cessantes procedência" },
  { lado: "reu", q: "atraso obra improcedência caso fortuito atraso justificado" },
  { lado: "autor", q: "cancelamento passagem aérea reembolso dano moral procedência" },
  { lado: "reu", q: "cancelamento voo improcedência reacomodação assistência adequada" },
];

/**
 * Lote 3 — multiárea (além do JEC clássico), pares autor × réu.
 * ~8 áreas × 2 lados; STJ em temas com súmula/orientação federal.
 */
export const TERMOS_MULTIAREA_LOTE_3: TermoSeed[] = [
  // Trabalhista
  {
    lado: "autor",
    q: "horas extras intervalo intrajornada procedência vínculo emprego",
  },
  {
    lado: "reu",
    q: "horas extras improcedência cargo de confiança banco de horas válido",
  },
  // Família
  {
    lado: "autor",
    q: "pensão alimentícia majoração necessidade possibilidade procedência",
  },
  {
    lado: "reu",
    q: "pensão alimentícia improcedência exoneração filho maior capacidade laborativa",
  },
  // Criminal
  {
    lado: "autor",
    q: "furto privilegiado tipicidade material procedência materialidade",
  },
  {
    lado: "reu",
    q: "furto absolvição princípio insignificância atipicidade material",
  },
  // Tributário
  {
    lado: "autor",
    tribunal: "stj",
    q: "repetição indébito tributário correção SELIC procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "execução fiscal improcedência prescrição intercorrente",
  },
  // Administrativo
  {
    lado: "autor",
    q: "concurso público anulação questão direito líquido procedência mandado segurança",
  },
  {
    lado: "reu",
    q: "concurso público improcedência discricionariedade banca examinadora",
  },
  // Consumerista amplo
  {
    lado: "autor",
    q: "superendividamento CDC renegociação dívidas procedência",
  },
  {
    lado: "reu",
    q: "superendividamento improcedência má-fé consumidor dívida consciente",
  },
  // Bancário
  {
    lado: "autor",
    tribunal: "stj",
    q: "Súmula 479 STJ fortuito interno golpe bancário responsabilidade objetiva",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "responsabilidade banco improcedência culpa exclusiva consumidor fortuito externo",
  },
  // Imobiliário
  {
    lado: "autor",
    q: "promessa compra venda imóvel adjudicação compulsória procedência",
  },
  {
    lado: "reu",
    q: "promessa compra venda improcedência rescisão inadimplemento comprador",
  },
];

export function termosDoLote(lote: number): TermoSeed[] {
  if (lote === 3) return TERMOS_MULTIAREA_LOTE_3;
  if (lote === 2) return TERMOS_JEC_LOTE_2;
  return TERMOS_JEC_LOTE_1.map((q) => ({ q, lado: "neutro" as const }));
}

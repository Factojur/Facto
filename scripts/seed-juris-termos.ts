/**
 * Termos de busca para seed de jurisprudência (Jurisprudências.ai).
 * Lotes 1–2: JEC. Lotes 3–6: multiárea inicial.
 * Lotes 7–30: ver seed-juris-termos-lotes-7-30.ts.
 * Lotes 31–56: reforço + recortes — seed-juris-termos-lotes-31-56.ts.
 * Lotes 57–64: lacunas no tribunal certo — seed-juris-termos-lotes-57-64.ts.
 * Lotes 65–80: TJs da API + rito das áreas + retomas vazias — seed-juris-termos-lotes-65-80.ts.
 * Lotes 81–96: TJs rasos + reforço TJSP + CARF — seed-juris-termos-lotes-81-96.ts.
 * Lotes 97–200: 10 TJs × áreas de volume + TST/TRF/CARF/STJ/STF.
 * Lotes 201+: lacunas (constitucional, prev, TST, CARF, retomas) + volume TJs.
 */

import { LOTES_7_A_30, ROTULO_LOTE as ROTULO_7_30 } from "./seed-juris-termos-lotes-7-30";
import {
  LOTES_31_A_56,
  ROTULO_LOTE_31_56,
} from "./seed-juris-termos-lotes-31-56";
import {
  LOTES_57_A_64,
  ROTULO_LOTE_57_64,
} from "./seed-juris-termos-lotes-57-64";
import {
  LOTES_65_A_80,
  ROTULO_LOTE_65_80,
} from "./seed-juris-termos-lotes-65-80";
import {
  LOTES_81_A_96,
  ROTULO_LOTE_81_96,
} from "./seed-juris-termos-lotes-81-96";
import {
  LOTES_97_A_200,
  ROTULO_LOTE_97_200,
} from "./seed-juris-termos-lotes-97-200";
import {
  LOTES_201_A_640,
  ROTULO_LOTE_201_640,
  LOTE_MAX_EXPANDIDO,
} from "./seed-juris-termos-lotes-201-640";

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

/**
 * Lote 4 — multiárea complementar, com foco em temas fora do recorte
 * clássico de juizados.
 */
export const TERMOS_MULTIAREA_LOTE_4: TermoSeed[] = [
  // Previdenciário
  {
    lado: "autor",
    tribunal: "stj",
    q: "aposentadoria por invalidez restabelecimento benefício incapacidade permanente procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "benefício por incapacidade improcedência ausência qualidade de segurado laudo desfavorável",
  },
  // Empresarial / recuperação judicial
  {
    lado: "autor",
    tribunal: "stj",
    q: "recuperação judicial stay period prorrogação essencialidade bens procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "recuperação judicial improcedência crédito extraconcursal não sujeição ao plano",
  },
  // Ambiental
  {
    lado: "autor",
    q: "dano ambiental obrigação de reparar responsabilidade objetiva procedência",
  },
  {
    lado: "reu",
    q: "dano ambiental improcedência ausência nexo causal área degradada",
  },
  // Saúde suplementar
  {
    lado: "autor",
    tribunal: "stj",
    q: "plano de saúde home care cobertura procedimento essencial procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "plano de saúde improcedência tratamento experimental rol ans taxativo mitigado",
  },
  // Administrativo disciplinar
  {
    lado: "autor",
    q: "servidor público processo administrativo disciplinar nulidade cerceamento defesa procedência",
  },
  {
    lado: "reu",
    q: "processo administrativo disciplinar improcedência regularidade contraditório ampla defesa",
  },
  // Responsabilidade médica
  {
    lado: "autor",
    q: "erro médico responsabilidade civil hospital dano moral material procedência",
  },
  {
    lado: "reu",
    q: "erro médico improcedência ausência culpa resultado inerente ao procedimento",
  },
  // Sucessões
  {
    lado: "autor",
    q: "inventário sobrepartilha reconhecimento sonegados procedência",
  },
  {
    lado: "reu",
    q: "inventário improcedência inexistência bens sonegados ausência prova",
  },
  // Arbitragem / contrato empresarial
  {
    lado: "autor",
    tribunal: "stj",
    q: "cláusula compromissória arbitragem extinção processo sem resolução mérito procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "arbitragem improcedência nulidade cláusula compromissória contrato adesão",
  },
];

/**
 * Lote 5 — multiárea: público, civil patrimonial, digital e societário.
 */
export const TERMOS_MULTIAREA_LOTE_5: TermoSeed[] = [
  // Improbidade administrativa
  {
    lado: "autor",
    tribunal: "stj",
    q: "improbidade administrativa lesão ao erário enriquecimento ilícito procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "improbidade administrativa improcedência ausência dolo elemento subjetivo",
  },
  // Licitações
  {
    lado: "autor",
    q: "licitação anulação edital irregularidade mandado de segurança procedência",
  },
  {
    lado: "reu",
    q: "licitação improcedência discricionariedade administração pública edital válido",
  },
  // Desapropriação / urbanístico
  {
    lado: "autor",
    q: "desapropriação indenização justa prévia juros compensatórios procedência",
  },
  {
    lado: "reu",
    q: "desapropriação improcedência área pública ausência direito indenizatório",
  },
  // Locação
  {
    lado: "autor",
    q: "locação despejo falta de pagamento aluguel procedência",
  },
  {
    lado: "reu",
    q: "locação despejo improcedência purgação da mora depósito integral",
  },
  // Usucapião
  {
    lado: "autor",
    q: "usucapião extraordinária posse mansa pacífica animus domini procedência",
  },
  {
    lado: "reu",
    q: "usucapião improcedência posse precária interrupção prazo",
  },
  // LGPD / dados
  {
    lado: "autor",
    tribunal: "stj",
    q: "LGPD vazamento dados pessoais dano moral responsabilidade objetiva procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "LGPD improcedência ausência dano concreto mero aborrecimento vazamento",
  },
  // Societário
  {
    lado: "autor",
    q: "dissolução parcial sociedade apuração haveres sócio retirante procedência",
  },
  {
    lado: "reu",
    q: "dissolução sociedade improcedência ausência justa causa exclusão sócio",
  },
  // Execução / penhora
  {
    lado: "autor",
    tribunal: "stj",
    q: "penhora bem de família impenhorabilidade Súmula 364 STJ procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "penhora bem de família improcedência imóvel de luxo exceção impenhorabilidade",
  },
];

/**
 * Lote 6 — complementar: tributário fino, trabalhista, família, penal
 * econômico, condomínio, PI, execução civil e eleitoral.
 * Pronto para `npm run seed:juris-ai-lote-6` quando a cota liberar.
 */
export const TERMOS_MULTIAREA_LOTE_6: TermoSeed[] = [
  // Tributário fino
  {
    lado: "autor",
    tribunal: "stj",
    q: "ICMS base de cálculo PIS COFINS exclusão Tema 69 STF procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "ICMS exclusão PIS COFINS improcedência crédito presumido ausência prova",
  },
  // Trabalhista complementar
  {
    lado: "autor",
    q: "assédio moral ambiente trabalho dano moral indenização procedência",
  },
  {
    lado: "reu",
    q: "assédio moral improcedência rigor gerencial ausência prova testemunhal",
  },
  // Família — guarda / união estável
  {
    lado: "autor",
    q: "guarda compartilhada melhor interesse da criança procedência",
  },
  {
    lado: "reu",
    q: "guarda compartilhada improcedência alienação parental convivência inviável",
  },
  {
    lado: "autor",
    q: "união estável reconhecimento partilha bens convivência pública procedência",
  },
  {
    lado: "reu",
    q: "união estável improcedência namoro qualificado ausência affectio maritalis",
  },
  // Penal econômico
  {
    lado: "autor",
    tribunal: "stj",
    q: "lavagem de dinheiro tipicidade ocultação dissimulação procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "lavagem de dinheiro absolvição crime antecedente não comprovado atipicidade",
  },
  // Condomínio
  {
    lado: "autor",
    q: "condomínio cobrança taxas ordinárias inadimplência procedência",
  },
  {
    lado: "reu",
    q: "condomínio cobrança improcedência taxa extraordinária sem assembleia",
  },
  // Propriedade intelectual
  {
    lado: "autor",
    tribunal: "stj",
    q: "marca registrada contrafação concorrência desleal indenização procedência",
  },
  {
    lado: "reu",
    tribunal: "stj",
    q: "marca registrada improcedência uso descritivo ausência confusão consumidor",
  },
  // Execução civil
  {
    lado: "autor",
    q: "execução título extrajudicial penhora online SISBAJUD procedência",
  },
  {
    lado: "reu",
    q: "execução título extrajudicial improcedência excesso de execução iliquidez",
  },
];

export function termosDoLote(lote: number): TermoSeed[] {
  if (lote >= 201 && lote <= LOTE_MAX_EXPANDIDO) {
    return LOTES_201_A_640[lote] ?? [];
  }
  if (lote >= 97 && lote <= 200) {
    return LOTES_97_A_200[lote] ?? [];
  }
  if (lote >= 81 && lote <= 96) {
    return LOTES_81_A_96[lote] ?? [];
  }
  if (lote >= 65 && lote <= 80) {
    return LOTES_65_A_80[lote] ?? [];
  }
  if (lote >= 57 && lote <= 64) {
    return LOTES_57_A_64[lote] ?? [];
  }
  if (lote >= 31 && lote <= 56) {
    return LOTES_31_A_56[lote] ?? [];
  }
  if (lote >= 7 && lote <= 30) {
    return LOTES_7_A_30[lote] ?? [];
  }
  if (lote === 6) return TERMOS_MULTIAREA_LOTE_6;
  if (lote === 5) return TERMOS_MULTIAREA_LOTE_5;
  if (lote === 4) return TERMOS_MULTIAREA_LOTE_4;
  if (lote === 3) return TERMOS_MULTIAREA_LOTE_3;
  if (lote === 2) return TERMOS_JEC_LOTE_2;
  return TERMOS_JEC_LOTE_1.map((q) => ({ q, lado: "neutro" as const }));
}

export const ROTULO_LOTE: Record<number, string> = {
  ...ROTULO_7_30,
  ...ROTULO_LOTE_31_56,
  ...ROTULO_LOTE_57_64,
  ...ROTULO_LOTE_65_80,
  ...ROTULO_LOTE_81_96,
  ...ROTULO_LOTE_97_200,
  ...ROTULO_LOTE_201_640,
};

export { LOTES_7_A_30 } from "./seed-juris-termos-lotes-7-30";
export { LOTES_31_A_56 } from "./seed-juris-termos-lotes-31-56";
export { LOTES_57_A_64 } from "./seed-juris-termos-lotes-57-64";
export { LOTES_65_A_80 } from "./seed-juris-termos-lotes-65-80";
export { LOTES_81_A_96 } from "./seed-juris-termos-lotes-81-96";
export { LOTES_97_A_200 } from "./seed-juris-termos-lotes-97-200";
export { LOTES_201_A_640 } from "./seed-juris-termos-lotes-201-640";

export const LOTE_MAX = LOTE_MAX_EXPANDIDO;

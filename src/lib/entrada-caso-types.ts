/** Preenchimento da entrada única — nunca é a peça pronta. */

/** Fallback se ainda enviarmos o arquivo cru (teto da função / OCR). */
export const LIMITE_UPLOAD_ANALISE_BYTES = 3_800_000;

export type PreenchimentoEntradaCaso = {
  especiePeca: string | null;
  tipoAcao: string | null;
  fatos: string | null;
  autoresNomes: string[];
  reusNomes: string[];
  numeroProcesso: string | null;
  foro: string | null;
  cidade: string | null;
  uf: string | null;
  numeroVara: string | null;
  /** Especialidade explícita (Cível, Família…) — null se os autos só dizem "1ª Vara". */
  especialidadeVara: string | null;
  especieDoProcesso: string | null;
  ultimoAto: string | null;
  pedidos: string[];
  pedirJusticaGratuita: boolean | null;
  tutelaUrgencia: boolean | null;
  danosMorais: boolean | null;
  danosMateriais: boolean | null;
  tesesIds: string[];
  camposIncertos: string[];
  resumoConferencia: string;
};

export type FonteLeituraRelato = "texto" | "ocr" | "texto_e_ocr" | "relato";

/** O que a entrada leu — não é a peça. */
export type LeituraRelato = {
  fonte: FonteLeituraRelato;
  charsTotais: number;
  charsEnviados: number;
  truncado: boolean;
  encontrouDecisoes: boolean;
  resumo: string;
  trecho: string;
};

export type ChipConferencia = {
  chave: string;
  rotulo: string;
  preenchido: boolean;
};

export type ConferenciaEntrada = {
  chips: ChipConferencia[];
  vazios: string[];
  resumo: string;
};

/** Mapa de teses da contestação para réplica (heurística local). */
export type ReplicaContestacaoResumo = {
  detectada: boolean;
  confianca: "alta" | "media" | "baixa";
  teses: {
    id: string;
    tipo: "preliminar" | "merito" | "pedido" | "outro";
    rotulo: string;
    trecho: string;
  }[];
  briefing: string;
  sugereEspecieReplica: boolean;
};

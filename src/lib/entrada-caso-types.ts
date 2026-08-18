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

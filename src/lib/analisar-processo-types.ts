/**
 * Tipos do fluxo "Analisar processo" (passos 1–5).
 */

export const ROTULOS_DOC_PROCESSO = [
  "autos_completos",
  "peticao_inicial",
  "contestacao",
  "sentenca",
  "decisao",
  "recurso",
  "outros",
] as const;

export type RotuloDocProcesso = (typeof ROTULOS_DOC_PROCESSO)[number];

export const ROTULO_DOC_LABEL: Record<RotuloDocProcesso, string> = {
  autos_completos: "Autos completos",
  peticao_inicial: "Petição inicial",
  contestacao: "Contestação",
  sentenca: "Sentença",
  decisao: "Decisão / despacho",
  recurso: "Recurso / agravo",
  outros: "Outro documento",
};

/** Fallback se ainda enviarmos o arquivo cru (teto da função na Vercel). */
export const LIMITE_UPLOAD_ANALISE_BYTES = 3_800_000;

export type DocumentoTextoPayload = {
  nome: string;
  texto: string;
  rotulo?: RotuloDocProcesso | string;
};

export type ArquivoProcessoPayload = {
  nome: string;
  mimeType: string;
  base64: string;
  /** Dica do usuário; a IA pode reclassificar. */
  rotulo?: RotuloDocProcesso;
};

export type DocumentoClassificado = {
  nome: string;
  rotulo: RotuloDocProcesso;
  resumo: string;
};

export type FichaProcessual = {
  orgao: string;
  numeroProcesso: string;
  comarca: string;
  partesAutor: string;
  partesReu: string;
  dataDecisao: string;
  dispositivo: string;
  pedidosResumo: string;
  fundamentosResumo: string;
  faseProcessual: string;
  fatosSugeridos: string;
};

export type AnaliseProcessoResultado = {
  documentos: DocumentoClassificado[];
  ficha: FichaProcessual;
  /** Nome forense / espécie sugerida. */
  pecaCandidata: {
    tipoAcao: string;
    especiePeca: string;
    tituloCompleto: string;
    confianca: number;
    justificativa: string;
    tutelaUrgencia: boolean;
    danosMorais: boolean;
    danosMateriais: boolean;
  };
  avisos: string[];
};

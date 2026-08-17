/**
 * JEC-2 — Ciclo processual do caso até o trânsito em julgado.
 * Fases guiam qual espécie gerar e o que já aconteceu no processo.
 */

import type { EspeciePecaJec } from "@/lib/jec-especie-peca";

export type FaseCasoJec =
  | "pre_acao"
  | "inicial"
  | "contestacao"
  | "replica"
  | "tutela"
  | "sentenca"
  | "recurso"
  | "embargos"
  | "cumprimento"
  | "transito";

export type MetaFaseCasoJec = {
  id: FaseCasoJec;
  rotulo: string;
  descricao: string;
  /** Espécie sugerida ao gerar peça nesta fase (null = só análise/registro). */
  especieSugerida: EspeciePecaJec | null;
  /** Ordem na linha do tempo (0…n). */
  ordem: number;
};

/** Sequência canônica do ciclo JEC (autor). Defesa pode pular/inserir conforme o polo. */
export const FASES_CASO_JEC: MetaFaseCasoJec[] = [
  {
    id: "pre_acao",
    rotulo: "Pré-ação / estratégia",
    descricao: "Qualificar o caso, reunir provas e definir a tese antes de ajuizar.",
    especieSugerida: null,
    ordem: 0,
  },
  {
    id: "inicial",
    rotulo: "Petição inicial",
    descricao: "Ajuizamento da demanda no Juizado Especial Cível.",
    especieSugerida: "peticao-inicial",
    ordem: 1,
  },
  {
    id: "contestacao",
    rotulo: "Contestação",
    descricao: "Defesa do réu — preliminares e mérito.",
    especieSugerida: "contestacao",
    ordem: 2,
  },
  {
    id: "replica",
    rotulo: "Réplica",
    descricao: "Impugnação específica à contestação.",
    especieSugerida: "replica",
    ordem: 3,
  },
  {
    id: "tutela",
    rotulo: "Tutela / incidente",
    descricao: "Pedido incidental de tutela ou outra petição interlocutória.",
    especieSugerida: "peticao-inicial",
    ordem: 4,
  },
  {
    id: "sentenca",
    rotulo: "Sentença",
    descricao: "Registro da sentença / resultado do julgamento.",
    especieSugerida: null,
    ordem: 5,
  },
  {
    id: "recurso",
    rotulo: "Recurso",
    descricao: "Recurso inominado, agravo de instrumento ou contrarrazões.",
    especieSugerida: "recurso-inominado",
    ordem: 6,
  },
  {
    id: "embargos",
    rotulo: "Embargos",
    descricao: "Embargos de declaração ou embargos à execução.",
    especieSugerida: "embargos",
    ordem: 7,
  },
  {
    id: "cumprimento",
    rotulo: "Cumprimento / execução",
    descricao: "Cumprimento de sentença ou execução no JEC.",
    especieSugerida: "execucao",
    ordem: 8,
  },
  {
    id: "transito",
    rotulo: "Trânsito em julgado",
    descricao: "Encerramento do ciclo — coisa julgada formal.",
    especieSugerida: null,
    ordem: 9,
  },
];

export type EventoCasoJec = {
  id: string;
  fase: FaseCasoJec;
  criadoEm: string;
  /** Nota livre do advogado (audiência, intimação, resultado…). */
  nota: string;
  /** Espécie da peça gerada/vinculada, se houver. */
  especiePeca?: EspeciePecaJec | string | null;
  /** Título forense da peça. */
  tituloPeca?: string | null;
  /** Trecho ou texto completo da peça (local; pode ser grande). */
  pecaTexto?: string | null;
  /** ID do rascunho local vinculado, se houver. */
  rascunhoId?: string | null;
};

export type CasoJec = {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  titulo: string;
  numeroProcesso: string;
  foro: string;
  /** Polo: autor ou réu — altera dicas da timeline. */
  polo: "autor" | "reu";
  faseAtual: FaseCasoJec;
  resumoFatos: string;
  eventos: EventoCasoJec[];
};

export function metaFase(id: FaseCasoJec): MetaFaseCasoJec {
  return FASES_CASO_JEC.find((f) => f.id === id) ?? FASES_CASO_JEC[0]!;
}

export function faseSeguinte(atual: FaseCasoJec): FaseCasoJec | null {
  const i = FASES_CASO_JEC.findIndex((f) => f.id === atual);
  if (i < 0 || i >= FASES_CASO_JEC.length - 1) return null;
  return FASES_CASO_JEC[i + 1]!.id;
}

export function fasesAte(atual: FaseCasoJec): MetaFaseCasoJec[] {
  const ordem = metaFase(atual).ordem;
  return FASES_CASO_JEC.filter((f) => f.ordem <= ordem);
}

export function casoEncerrado(fase: FaseCasoJec): boolean {
  return fase === "transito";
}

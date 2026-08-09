/**
 * STF — Lote 60 (não vinculantes): Súmulas 591 a 600.
 * Fora do RAG: 599 (cancelada).
 */

import { sumulaStf, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STF_NV_LOTE_60: SumulaLoteItem[] = [
  sumulaStf(
    591,
    "A imunidade ou a isenção tributária do comprador não se estende ao produtor, contribuinte do imposto sobre produtos industrializados."
  ),
  sumulaStf(
    592,
    "Nos crimes falimentares, aplicam-se as causas interruptivas da prescrição, previstas no Código Penal."
  ),
  sumulaStf(
    593,
    "Incide o percentual do Fundo de Garantia do Tempo de Serviço (FGTS) sobre a parcela da remuneração correspondente a horas extraordinárias de trabalho."
  ),
  sumulaStf(
    594,
    "Os direitos de queixa e de representação podem ser exercidos, independentemente, pelo ofendido ou por seu representante legal."
  ),
  sumulaStf(
    595,
    "É inconstitucional a taxa municipal de conservação de estradas de rodagem cuja base de cálculo seja idêntica à do imposto territorial rural."
  ),
  sumulaStf(
    596,
    "As disposições do Decreto 22.626/33 não se aplicam às taxas de juros e aos outros encargos cobrados nas operações realizadas por instituições públicas ou privadas, que integram o sistema financeiro nacional."
  ),
  sumulaStf(
    597,
    "Não cabem embargos infringentes de acórdão que, em mandado de segurança decidiu, por maioria de votos, a apelação."
  ),
  sumulaStf(
    598,
    "Nos embargos de divergência não servem como padrão de discordância os mesmos paradigmas invocados para demonstrá-la mas repelidos como não dissidentes no julgamento do recurso extraordinário."
  ),
  sumulaStf(
    599,
    "São incabíveis embargos de divergência de decisão de turma, em agravo regimental. — CANCELADA.",
    { status: "cancelada" }
  ),
  sumulaStf(
    600,
    "Cabe ação executiva contra o emitente e seus avalistas, ainda que não apresentado o cheque ao sacado no prazo legal, desde que não prescrita a ação cambiária."
  ),
];

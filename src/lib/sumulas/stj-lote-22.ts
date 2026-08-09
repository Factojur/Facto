/**
 * STJ — Lote 22: Súmulas 211 a 220.
 * Canceladas: 212 e 217 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_22: SumulaLoteItem[] = [
  sumulaStj(
    211,
    "Inadmissível recurso especial quanto à questão que, a despeito da oposição de embargos declaratórios, não foi apreciada pelo Tribunal a quo."
  ),
  sumulaStj(
    212,
    "A compensação de créditos tributários não pode ser deferida em ação cautelar ou por medida liminar cautelar ou antecipatória. — CANCELADA pela Primeira Seção em 14/09/2022 (Projeto de Súmula n. 375, DJe 19/09/2022).",
    { status: "cancelada" }
  ),
  sumulaStj(
    213,
    "O mandado de segurança constitui ação adequada para a declaração do direito à compensação tributária."
  ),
  sumulaStj(
    214,
    "O fiador na locação não responde por obrigações resultantes de aditamento ao qual não anuiu."
  ),
  sumulaStj(
    215,
    "A indenização recebida pela adesão a programa de incentivo à demissão voluntária não está sujeita à incidência do imposto de renda."
  ),
  sumulaStj(
    216,
    "A tempestividade de recurso interposto no Superior Tribunal de Justiça é aferida pelo registro no protocolo da secretaria e não pela data da entrega na agência do correio."
  ),
  sumulaStj(
    217,
    "Não cabe agravo de decisão que indefere o pedido de suspensão da execução da liminar, ou da sentença em mandado de segurança. — CANCELADA pela Corte Especial em 23/10/2003 (QO no AgRg na SS 1.204/AM, DJ 10/11/2003, p. 225).",
    { status: "cancelada" }
  ),
  sumulaStj(
    218,
    "Compete à Justiça dos Estados processar e julgar ação de servidor estadual decorrente de direitos e vantagens estatutárias no exercício de cargo em comissão."
  ),
  sumulaStj(
    219,
    "Os créditos decorrentes de serviços prestados à massa falida, inclusive a remuneração do síndico, gozam dos privilégios próprios dos trabalhistas."
  ),
  sumulaStj(
    220,
    "A reincidência não influi no prazo da prescrição da pretensão punitiva."
  ),
];

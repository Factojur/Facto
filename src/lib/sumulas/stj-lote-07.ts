/**
 * STJ — Lote 7: Súmulas 61 a 70.
 * Canceladas: 61 e 68 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_07: SumulaLoteItem[] = [
  sumulaStj(
    61,
    "O seguro de vida cobre o suicídio não premeditado. — CANCELADA pela Segunda Seção em 25/04/2018 (Projeto de Súmula n. 1.154, DJe 07/05/2018).",
    { status: "cancelada" }
  ),
  sumulaStj(
    62,
    "Compete à Justiça Estadual processar e julgar o crime de falsa anotação na carteira de trabalho e previdência social, atribuído a empresa privada."
  ),
  sumulaStj(
    63,
    "São devidos direitos autorais pela retransmissão radiofônica de músicas em estabelecimentos comerciais."
  ),
  sumulaStj(
    64,
    "Não constitui constrangimento ilegal o excesso de prazo na instrução, provocado pela defesa."
  ),
  sumulaStj(
    65,
    "O cancelamento, previsto no art. 29 do Decreto-lei 2.303, de 21.11.86, não alcança os débitos previdenciários."
  ),
  sumulaStj(
    66,
    "Compete à Justiça Federal processar e julgar execução fiscal promovida por Conselho de Fiscalização Profissional."
  ),
  sumulaStj(
    67,
    "Na desapropriação, cabe a atualização monetária, ainda que por mais de uma vez, independente do decurso de prazo superior a um ano entre o cálculo e o efetivo pagamento da indenização."
  ),
  sumulaStj(
    68,
    "A parcela relativa ao ICM inclui-se na base de cálculo do PIS. — CANCELADA pela Primeira Seção em 27/03/2019 (QO nos REsps 1.624.297/RS, 1.629.001/SC e 1.638.772/SC, DJe 03/04/2019).",
    { status: "cancelada" }
  ),
  sumulaStj(
    69,
    "Na desapropriação direta, os juros compensatórios são devidos desde a antecipada imissão na posse e, na desapropriação indireta, a partir da efetiva ocupação do imóvel."
  ),
  sumulaStj(
    70,
    "Os juros moratórios, na desapropriação direta ou indireta, contam-se desde o trânsito em julgado da sentença."
  ),
];

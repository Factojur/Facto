/**
 * STJ — Lote 42: Súmulas 411 a 420.
 * Cancelada(s): 418 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_42: SumulaLoteItem[] = [
  sumulaStj(
    411,
    "É devida a correção monetária ao creditamento do IPI quando há oposição ao seu aproveitamento decorrente de resistência ilegítima do Fisco."
  ),
  sumulaStj(
    412,
    "A ação de repetição de indébito de tarifas de água e esgoto sujeita-se ao prazo prescricional estabelecido no Código Civil."
  ),
  sumulaStj(
    413,
    "O farmacêutico pode acumular a responsabilidade técnica por uma farmácia e uma drogaria ou por duas drogarias."
  ),
  sumulaStj(
    414,
    "A citação por edital na execução fiscal é cabível quando frustradas as demais modalidades."
  ),
  sumulaStj(
    415,
    "O período de suspensão do prazo prescricional é regulado pelo máximo da pena cominada."
  ),
  sumulaStj(
    416,
    "É devida a pensão por morte aos dependentes do segurado que, apesar de ter perdido essa qualidade, preencheu os requisitos legais para a obtenção de aposentadoria até a data do seu óbito."
  ),
  sumulaStj(
    417,
    "Na execução civil, a penhora de dinheiro na ordem de nomeação de bens não tem caráter absoluto."
  ),
  sumulaStj(
    418,
    "É inadmissível o recurso especial interposto antes da publicação do acórdão dos embargos de declaração, sem posterior ratificação. — CANCELADA pela Corte Especial em 01/07/2016 (DJe 03/08/2016).",
    { status: "cancelada" }
  ),
  sumulaStj(
    419,
    "Descabe a prisão civil do depositário judicial infiel."
  ),
  sumulaStj(
    420,
    "Incabível, em embargos de divergência, discutir o valor de indenização por danos morais."
  ),
];

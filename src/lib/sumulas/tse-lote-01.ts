/**
 * TSE — Lote 1: Súmulas 1 a 10.
 * Fonte: Portal TSE — Súmulas do TSE (codigo-eleitoral/sumulas)
 */

import { sumulaTse, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_TSE_LOTE_01: SumulaLoteItem[] = [
  sumulaTse(
    1,
    "Proposta a ação para desconstituir a decisão que rejeitou as contas, anteriormente à impugnação, fica suspensa a inelegibilidade (Lei Complementar n. 64/90, art. 1º, I, g).",
    { status: "cancelada" }
  ),
  sumulaTse(
    2,
    "Assinada e recebida a ficha de filiação partidária até o termo final do prazo fixado em lei, considera-se satisfeita a correspondente condição de elegibilidade, ainda que não tenha fluído, até a mesma data, o tríduo legal de impugnação."
  ),
  sumulaTse(
    3,
    "No processo de registro de candidatos, não tendo o juiz aberto prazo para o suprimento de defeito da instrução do pedido, pode o documento, cuja falta houver motivado o indeferimento, ser juntado com o recurso ordinário."
  ),
  sumulaTse(
    4,
    "Não havendo preferência entre candidatos que pretendam o registro da mesma variação nominal, defere-se o do que primeiro o tenha requerido."
  ),
  sumulaTse(
    5,
    "Serventuário de cartório, celetista, não se inclui na exigência do art. 1º, II, l, da LC n. 64/90."
  ),
  sumulaTse(
    6,
    "São inelegíveis para o cargo de Chefe do Executivo o cônjuge e os parentes, indicados no § 7º do art. 14 da Constituição Federal, do titular do mandato, salvo se este, reelegível, tenha falecido, renunciado ou se afastado definitivamente do cargo até seis meses antes do pleito."
  ),
  sumulaTse(
    7,
    "É inelegível para o cargo de prefeito a irmã da concubina do atual titular do mandato.",
    { status: "cancelada" }
  ),
  sumulaTse(
    8,
    "O vice-prefeito é inelegível para o mesmo cargo.",
    { status: "cancelada" }
  ),
  sumulaTse(
    9,
    "A suspensão de direitos políticos decorrente de condenação criminal transitada em julgado cessa com o cumprimento ou a extinção da pena, independendo de reabilitação ou de prova de reparação dos danos."
  ),
  sumulaTse(
    10,
    "No processo de registro de candidatos, quando a sentença for entregue em cartório antes de três dias contados da conclusão ao juiz, o prazo para o recurso ordinário, salvo intimação pessoal anterior, só se conta do termo final daquele tríduo."
  ),
];

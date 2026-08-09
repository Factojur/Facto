/**
 * STJ — Lote 35: Súmulas 341 a 350.
 * Cancelada(s)/revogada(s): 343 e 348 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_35: SumulaLoteItem[] = [
  sumulaStj(
    341,
    "A frequência a curso de ensino formal é causa de remição de parte do tempo de execução de pena sob regime fechado ou semiaberto."
  ),
  sumulaStj(
    342,
    "No procedimento para aplicação de medida socioeducativa, é nula a desistência de outras provas em face da confissão do adolescente."
  ),
  sumulaStj(
    343,
    "É obrigatória a presença de advogado em todas as fases do processo administrativo disciplinar. — CANCELADA pela Primeira Seção em 28/04/2021 (QO no MS 7.078/DF, Projeto de Súmula n. 700, DJe 03/05/2021).",
    { status: "cancelada" }
  ),
  sumulaStj(
    344,
    "A liquidação por forma diversa da estabelecida na sentença não ofende a coisa julgada."
  ),
  sumulaStj(
    345,
    "São devidos honorários advocatícios pela Fazenda Pública nas execuções individuais de sentença proferida em ações coletivas, ainda que não embargadas."
  ),
  sumulaStj(
    346,
    "É vedada aos militares temporários, para aquisição de estabilidade, a contagem em dobro de férias e licenças não gozadas."
  ),
  sumulaStj(
    347,
    "O conhecimento de recurso de apelação do réu independe de sua prisão."
  ),
  sumulaStj(
    348,
    "Compete ao Superior Tribunal de Justiça decidir os conflitos de competência entre juizado especial federal e juízo federal, ainda que da mesma seção judiciária. — CANCELADA pela Corte Especial em 17/03/2010 (CC 107.635/PR, DJe 23/03/2010).",
    { status: "cancelada" }
  ),
  sumulaStj(
    349,
    "Compete à Justiça Federal ou aos juízes com competência delegada o julgamento das execuções fiscais de contribuições devidas pelo empregador ao FGTS."
  ),
  sumulaStj(
    350,
    "O ICMS não incide sobre o serviço de habilitação de telefone celular."
  ),
];

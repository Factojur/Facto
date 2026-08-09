/**
 * STF — Lote 1 (não vinculantes): Súmulas 1 a 10.
 * Fora do RAG: 2 (superada), 3 (superada), 4 (cancelada), 5 (cancelada).
 */

import { sumulaStf, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STF_NV_LOTE_01: SumulaLoteItem[] = [
  sumulaStf(
    1,
    "É vedada a expulsão de estrangeiro casado com Brasileira, ou que tenha filho Brasileiro, dependente da economia paterna."
  ),
  sumulaStf(
    2,
    "Concede-se liberdade vigiada ao extraditando que estiver preso por prazo superior a sessenta dias. — SUPERADA (sem eficácia pelo HC 47.663/SP; matéria hoje na Lei de Migração).",
    { status: "superada" }
  ),
  sumulaStf(
    3,
    "A imunidade concedida a deputados estaduais é restrita à Justiça do Estado. — SUPERADA (imunidade de deputados estaduais equiparada à federal — CF/1988).",
    { status: "superada" }
  ),
  sumulaStf(
    4,
    "Não perde a imunidade parlamentar o congressista nomeado Ministro de Estado. — CANCELADA.",
    { status: "cancelada" }
  ),
  sumulaStf(
    5,
    "A sanção do projeto supre a falta de iniciativa do Poder Executivo. — CANCELADA (RP 890 — sanção não supre vício de iniciativa).",
    { status: "cancelada" }
  ),
  sumulaStf(
    6,
    "A revogação ou anulação, pelo Poder Executivo, de aposentadoria, ou qualquer outro ato aprovado pelo Tribunal de Contas, não produz efeitos antes de aprovada por aquele Tribunal, ressalvada a competência revisora do Judiciário."
  ),
  sumulaStf(
    7,
    "Sem prejuízo de recurso para o Congresso, não é exequível contrato administrativo a que o Tribunal de Contas houver negado registro."
  ),
  sumulaStf(
    8,
    "Diretor de sociedade de economia mista pode ser destituído no curso do mandato."
  ),
  sumulaStf(
    9,
    "Para o acesso de auditores ao Superior Tribunal Militar, só concorrem os de segunda entrância."
  ),
  sumulaStf(
    10,
    "O tempo de serviço militar conta-se para efeito de disponibilidade e aposentadoria do servidor público estadual."
  ),
];

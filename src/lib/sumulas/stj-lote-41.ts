/**
 * STJ — Lote 41: Súmulas 401 a 410.
 * Cancelada(s): 408 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_41: SumulaLoteItem[] = [
  sumulaStj(
    401,
    "O prazo decadencial da ação rescisória só se inicia quando não for cabível qualquer recurso do último pronunciamento judicial."
  ),
  sumulaStj(
    402,
    "O contrato de seguro por danos pessoais compreende os danos morais, salvo cláusula expressa de exclusão."
  ),
  sumulaStj(
    403,
    "Independe de prova do prejuízo a indenização pela publicação não autorizada de imagem de pessoa com fins econômicos ou comerciais."
  ),
  sumulaStj(
    404,
    "É dispensável o aviso de recebimento (AR) na carta de comunicação ao consumidor sobre a negativação de seu nome em bancos de dados e cadastros."
  ),
  sumulaStj(
    405,
    "A ação de cobrança do seguro obrigatório (DPVAT) prescreve em três anos."
  ),
  sumulaStj(
    406,
    "A Fazenda Pública pode recusar a substituição do bem penhorado por precatório."
  ),
  sumulaStj(
    407,
    "É legítima a cobrança da tarifa de água fixada de acordo com as categorias de usuários e as faixas de consumo."
  ),
  sumulaStj(
    408,
    "Nas ações de desapropriação, os juros compensatórios incidentes após a Medida Provisória n. 1.577, de 11/06/1997, devem ser fixados em 6% ao ano até 13/09/2001 e, a partir de então, em 12% ao ano, na forma da Súmula n. 618 do Supremo Tribunal Federal. — CANCELADA pela Primeira Seção em 28/10/2020 (Pet 12.344/DF, DJe 18/11/2020).",
    { status: "cancelada" }
  ),
  sumulaStj(
    409,
    "Em execução fiscal, a prescrição ocorrida antes da propositura da ação pode ser decretada de ofício (art. 219, § 5º, do CPC)."
  ),
  sumulaStj(
    410,
    "A prévia intimação pessoal do devedor constitui condição necessária para a cobrança de multa pelo descumprimento de obrigação de fazer ou não fazer."
  ),
];

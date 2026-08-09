/**
 * STJ — Lote 23: Súmulas 221 a 230.
 * Canceladas: 222 e 230 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_23: SumulaLoteItem[] = [
  sumulaStj(
    221,
    "São civilmente responsáveis pelo ressarcimento de dano, decorrente de publicação pela imprensa, tanto o autor do escrito quanto o proprietário do veículo de divulgação."
  ),
  sumulaStj(
    222,
    "Compete à Justiça Comum processar e julgar as ações relativas à contribuição sindical prevista no art. 578 da CLT. — CANCELADA pela Primeira Seção em 13/11/2024 (Projeto de Súmula n. 403, DJe 29/11/2024).",
    { status: "cancelada" }
  ),
  sumulaStj(
    223,
    "A certidão de intimação do acórdão recorrido constitui peça obrigatória do instrumento de agravo."
  ),
  sumulaStj(
    224,
    "Excluído do feito o ente federal, cuja presença levara o Juiz Estadual a declinar da competência, deve o Juiz Federal restituir os autos e não suscitar conflito."
  ),
  sumulaStj(
    225,
    "Compete ao Tribunal Regional do Trabalho apreciar recurso contra sentença proferida por órgão de primeiro grau da Justiça Trabalhista, ainda que para declarar-lhe a nulidade em virtude de incompetência."
  ),
  sumulaStj(
    226,
    "O Ministério Público tem legitimidade para recorrer na ação de acidente do trabalho, ainda que o segurado esteja assistido por advogado."
  ),
  sumulaStj(
    227,
    "A pessoa jurídica pode sofrer dano moral."
  ),
  sumulaStj(
    228,
    "É inadmissível o interdito proibitório para a proteção do direito autoral."
  ),
  sumulaStj(
    229,
    "O pedido do pagamento de indenização à seguradora suspende o prazo de prescrição até que o segurado tenha ciência da decisão."
  ),
  sumulaStj(
    230,
    "Compete à Justiça Estadual processar e julgar ação movida por trabalhador avulso portuário, em que se impugna ato do órgão gestor de mão-de-obra de que resulte óbice ao exercício de sua profissão. — CANCELADA pela Segunda Seção em 11/10/2000 (QO no CC 30.513/SP, DJ 09/11/2000, p. 69).",
    { status: "cancelada" }
  ),
];

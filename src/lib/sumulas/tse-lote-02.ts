/**
 * TSE — Lote 2: Súmulas 11 a 20.
 * Fonte: Portal TSE — Súmulas do TSE (codigo-eleitoral/sumulas)
 */

import { sumulaTse, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_TSE_LOTE_02: SumulaLoteItem[] = [
  sumulaTse(
    11,
    "No processo de registro de candidatos, o partido que não o impugnou não tem legitimidade para recorrer da sentença que o deferiu, salvo se se cuidar de matéria constitucional."
  ),
  sumulaTse(
    12,
    "São inelegíveis, no município desmembrado, e ainda não instalado, o cônjuge e os parentes consangüíneos ou afins, até o segundo grau ou por adoção, do prefeito do município-mãe, ou de quem o tenha substituído, dentro dos seis meses anteriores ao pleito, salvo se já titular de mandato eletivo."
  ),
  sumulaTse(
    13,
    "Não é auto-aplicável o § 9º do art. 14 da Constituição, com a redação da Emenda Constitucional de Revisão n. 4/94."
  ),
  sumulaTse(
    14,
    "A duplicidade de que cuida o parágrafo único do artigo 22 da Lei n. 9.096/1995 somente fica caracterizada caso a nova filiação houver ocorrido após a remessa das listas previstas no parágrafo único do artigo 58 da referida lei.",
    { status: "cancelada" }
  ),
  sumulaTse(
    15,
    "O exercício de mandato eletivo não é circunstância capaz, por si só, de comprovar a condição de alfabetizado do candidato."
  ),
  sumulaTse(
    16,
    "A falta de abertura de conta bancária específica não é fundamento suficiente para a rejeição de contas de campanha eleitoral, desde que, por outros meios, se possa demonstrar sua regularidade.",
    { status: "cancelada" }
  ),
  sumulaTse(
    17,
    "Não é admissível a presunção de que o candidato, por ser beneficiário de propaganda eleitoral irregular, tenha prévio conhecimento de sua veiculação.",
    { status: "cancelada" }
  ),
  sumulaTse(
    18,
    "Conquanto investido de poder de polícia, não tem legitimidade o juiz eleitoral para, de ofício, instaurar procedimento com a finalidade de impor multa pela veiculação de propaganda eleitoral em desacordo com a Lei nº 9.504/97."
  ),
  sumulaTse(
    19,
    "O prazo de inelegibilidade decorrente da condenação por abuso do poder econômico ou político tem início no dia da eleição em que este se verificou e finda no dia de igual número no oitavo ano seguinte (art. 22, XIV, da LC n. 64/1990)."
  ),
  sumulaTse(
    20,
    "A prova de filiação partidária daquele cujo nome não constou da lista de filiados de que trata o art. 19 da Lei n. 9.096/1995, pode ser realizada por outros elementos de convicção, salvo quando se tratar de documentos produzidos unilateralmente, destituídos de fé pública."
  ),
];

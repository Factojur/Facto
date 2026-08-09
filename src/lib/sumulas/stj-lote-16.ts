/**
 * STJ — Lote 16: Súmulas 151 a 160.
 * Canceladas: 152 e 157 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_16: SumulaLoteItem[] = [
  sumulaStj(
    151,
    "A competência para o processo e julgamento por crime de contrabando ou descaminho define-se pela prevenção do juízo federal do lugar da apreensão dos bens."
  ),
  sumulaStj(
    152,
    "Na venda pelo segurador, de bens salvados de sinistros, incide o ICMS. — CANCELADA pela Primeira Seção em 13/06/2007 (QO no REsp 73.552/RJ, DJ 25/06/2007, p. 413).",
    { status: "cancelada" }
  ),
  sumulaStj(
    153,
    "A desistência da execução fiscal, após o oferecimento dos embargos, não exime o exequente dos encargos da sucumbência."
  ),
  sumulaStj(
    154,
    "Os optantes pelo FGTS, nos termos da Lei n. 5.958, de 1973, têm direito à taxa progressiva dos juros, na forma do art. 4º da Lei n. 5.107, de 1966."
  ),
  sumulaStj(
    155,
    "O ICMS incide na importação de aeronave, por pessoa física, para uso próprio."
  ),
  sumulaStj(
    156,
    "A prestação de serviço de composição gráfica, personalizada e sob encomenda, ainda que envolva fornecimento de mercadorias, está sujeita, apenas, ao ISS."
  ),
  sumulaStj(
    157,
    "É ilegítima a cobrança de taxa, pelo município, na renovação de licença para localização de estabelecimento comercial ou industrial. — CANCELADA pela Primeira Seção em 24/04/2002 (REsp 261.571/SP, DJ 07/05/2002, p. 204).",
    { status: "cancelada" }
  ),
  sumulaStj(
    158,
    "Não se presta a justificar embargos de divergência o dissídio com acórdão de Turma ou Seção que não mais tenha competência para a matéria neles versada."
  ),
  sumulaStj(
    159,
    "O benefício acidentário, no caso de contribuinte que perceba remuneração variável, deve ser calculado com base na média aritmética dos últimos doze meses de contribuição."
  ),
  sumulaStj(
    160,
    "É defeso, ao município, atualizar o IPTU, mediante decreto, em percentual superior ao índice oficial de correção monetária."
  ),
];

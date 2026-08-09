/**
 * STJ — Lote 36: Súmulas 351 a 360.
 * Cancelada(s)/revogada(s): 357 (não entram no RAG ativo).
 */

import { sumulaStj, type SumulaLoteItem } from "@/lib/sumulas/types";

export const SUMULAS_STJ_LOTE_36: SumulaLoteItem[] = [
  sumulaStj(
    351,
    "A alíquota de contribuição para o Seguro de Acidente do Trabalho (SAT) é aferida pelo grau de risco desenvolvido em cada empresa, individualizada pelo seu CNPJ, ou pelo grau de risco da atividade preponderante quando houver apenas um registro."
  ),
  sumulaStj(
    352,
    "A obtenção ou a renovação do Certificado de Entidade Beneficente de Assistência Social (Cebas) não exime a entidade do cumprimento dos requisitos legais supervenientes."
  ),
  sumulaStj(
    353,
    "As disposições do Código Tributário Nacional não se aplicam às contribuições para o FGTS."
  ),
  sumulaStj(
    354,
    "A invasão do imóvel é causa de suspensão do processo expropriatório para fins de reforma agrária."
  ),
  sumulaStj(
    355,
    "É válida a notificação do ato de exclusão do programa de recuperação fiscal do Refis pelo Diário Oficial ou pela Internet."
  ),
  sumulaStj(
    356,
    "É legítima a cobrança da tarifa básica pelo uso dos serviços de telefonia fixa."
  ),
  sumulaStj(
    357,
    "A pedido do assinante, que responderá pelos custos, é obrigatória, a partir de 1º de janeiro de 2006, a discriminação de pulsos excedentes e ligações de telefone fixo para celular. — REVOGADA pela Primeira Seção em 27/05/2009 (REsp 1.074.799/MG, DJe 22/06/2009).",
    { status: "cancelada" }
  ),
  sumulaStj(
    358,
    "O cancelamento de pensão alimentícia de filho que atingiu a maioridade está sujeito à decisão judicial, mediante contraditório, ainda que nos próprios autos."
  ),
  sumulaStj(
    359,
    "Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor antes de proceder à inscrição."
  ),
  sumulaStj(
    360,
    "O benefício da denúncia espontânea não se aplica aos tributos sujeitos a lançamento por homologação regularmente declarados, mas pagos a destempo."
  ),
];

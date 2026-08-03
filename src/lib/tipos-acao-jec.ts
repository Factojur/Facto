/**
 * Catálogo de peças do formulário JEC (Lei 9.099/95) e sucedâneos.
 *
 * Critério: cobrir o dia a dia do Juizado + peças que o advogado também
 * usa em áreas afins (consumo, bancário, locação etc.). Opções marcadas
 * como excepcionais lembram o FONAJE (ex.: agravo de instrumento, em
 * regra, não cabe no JEC estadual).
 */

export type GrupoTipoAcaoJec = {
  label: string;
  opcoes: readonly string[];
};

export const TIPOS_ACAO_JEC: readonly GrupoTipoAcaoJec[] = [
  {
    label: "Petições iniciais — condenatórias e restituição",
    opcoes: [
      "Petição Inicial — Ação de Cobrança (JEC)",
      "Petição Inicial — Ação de Cobrança de Aluguéis e Encargos (JEC)",
      "Petição Inicial — Ação de Cobrança de Despesas Condominiais (JEC)",
      "Petição Inicial — Ação de Cobrança de Honorários / Prestação de Serviços (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Materiais (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Morais (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)",
      "Petição Inicial — Ação de Indenização por Acidente de Trânsito (JEC)",
      "Petição Inicial — Ação de Indenização por Negativação Indevida (JEC)",
      "Petição Inicial — Ação de Indenização por Vício do Produto ou Serviço (JEC)",
      "Petição Inicial — Ação de Restituição de Quantia Paga / Repetição de Indébito (JEC)",
      "Petição Inicial — Ação de Ressarcimento de Danos em Prédio Urbano ou Rústico (JEC)",
    ],
  },
  {
    label: "Petições iniciais — obrigação e entrega",
    opcoes: [
      "Petição Inicial — Ação de Obrigação de Fazer (JEC)",
      "Petição Inicial — Ação de Obrigação de Não Fazer (JEC)",
      "Petição Inicial — Ação de Obrigação de Entregar Coisa (JEC)",
      "Petição Inicial — Ação de Obrigação de Fazer c/c Indenização (JEC)",
      "Petição Inicial — Ação de Obrigação de Não Fazer c/c Indenização (JEC)",
    ],
  },
  {
    label: "Petições iniciais — declaratórias e constitutivas",
    opcoes: [
      "Petição Inicial — Ação Declaratória de Inexistência / Inexigibilidade de Débito (JEC)",
      "Petição Inicial — Ação Declaratória de Inexistência de Relação Jurídica (JEC)",
      "Petição Inicial — Ação Declaratória (genérica) (JEC)",
      "Petição Inicial — Ação Declaratória de Nulidade de Cláusula / Contrato (JEC)",
      "Petição Inicial — Ação de Anulação de Negócio Jurídico (JEC)",
      "Petição Inicial — Ação de Rescisão Contratual (JEC)",
      "Petição Inicial — Ação de Rescisão Contratual c/c Restituição / Indenização (JEC)",
      "Petição Inicial — Ação Revisional de Contrato (JEC)",
      "Petição Inicial — Ação Revisional de Cláusulas Abusivas (CDC) (JEC)",
      "Petição Inicial — Ação de Consignação em Pagamento (JEC)",
    ],
  },
  {
    label: "Petições iniciais — consumo e serviços (CDC)",
    opcoes: [
      "Petição Inicial — Ação Consumidor — Falha na Prestação de Serviço (JEC)",
      "Petição Inicial — Ação Consumidor — Vício do Produto (JEC)",
      "Petição Inicial — Ação Consumidor — Negativação / Cadastro de Inadimplentes (JEC)",
      "Petição Inicial — Ação Consumidor — Telefonia / Internet / TV (JEC)",
      "Petição Inicial — Ação Consumidor — Energia Elétrica / Água / Gás (JEC)",
      "Petição Inicial — Ação Consumidor — Plano de Saúde / Odontológico (JEC)",
      "Petição Inicial — Ação Consumidor — Bancária / Tarifas / Empréstimo (JEC)",
      "Petição Inicial — Ação Consumidor — Cartão de Crédito (JEC)",
      "Petição Inicial — Ação Consumidor — Seguro (JEC)",
      "Petição Inicial — Ação Consumidor — Transporte Aéreo (JEC)",
      "Petição Inicial — Ação Consumidor — Transporte Terrestre / Rodoviário (JEC)",
      "Petição Inicial — Ação Consumidor — E-commerce / Marketplace (JEC)",
      "Petição Inicial — Ação Consumidor — Turismo / Pacote / Hospedagem (JEC)",
      "Petição Inicial — Ação Consumidor — Educação / Curso (JEC)",
    ],
  },
  {
    label: "Petições iniciais — locação, posse e documentos",
    opcoes: [
      "Petição Inicial — Ação de Despejo para Uso Próprio (JEC)",
      "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)",
      "Petição Inicial — Ação Possessória — Reintegração de Posse (JEC)",
      "Petição Inicial — Ação Possessória — Manutenção de Posse (JEC)",
      "Petição Inicial — Ação Possessória — Interdito Proibitório (JEC)",
      "Petição Inicial — Ação de Exibição de Documentos (JEC)",
      "Petição Inicial — Ação de Prestação de Contas (JEC)",
      "Petição Inicial — Embargos de Terceiro (JEC)",
    ],
  },
  {
    label: "Cumprimento e execução",
    opcoes: [
      "Cumprimento de Sentença (JEC)",
      "Cumprimento Provisório de Sentença (JEC)",
      "Execução de Título Extrajudicial (JEC)",
      "Embargos à Execução (JEC)",
      "Impugnação ao Cumprimento de Sentença (JEC)",
      "Impugnação à Penhora (JEC)",
      "Pedido de Penhora / Constrição (JEC)",
      "Pedido de Penhora Online / SISBAJUD (JEC)",
      "Pedido de Avaliação / Hasta / Adjudicação (JEC)",
      "Pedido de Levantamento de Valores / Alvará (JEC)",
      "Pedido de Extinção da Execução / Cumprimento (JEC)",
    ],
  },
  {
    label: "Defesa e resposta",
    opcoes: [
      "Contestação (JEC)",
      "Contestação c/c Reconvenção (JEC)",
      "Réplica (JEC)",
      "Impugnação à Justiça Gratuita da Parte Contrária (JEC)",
      "Impugnação ao Valor da Causa (JEC)",
      "Exceção de Incompetência (JEC)",
      "Exceção de Impedimento / Suspeição (JEC)",
    ],
  },
  {
    label: "Incidentes, tutelas e petições intermediárias",
    opcoes: [
      "Pedido de Justiça Gratuita (JEC)",
      "Pedido de Tutela de Urgência Autônomo / Incidental (JEC)",
      "Pedido de Tutela de Evidência (JEC)",
      "Pedido de Liminar / Antecipação de Tutela (JEC)",
      "Pedido de Homologação de Acordo (JEC)",
      "Pedido de Desistência da Ação (JEC)",
      "Pedido de Extinção do Processo (JEC)",
      "Pedido de Habilitação / Sucessão Processual (JEC)",
      "Pedido de Substituição / Emenda da Inicial (JEC)",
      "Pedido de Juntada de Documentos (JEC)",
      "Pedido de Intimação / Citação / Diligência (JEC)",
      "Pedido de Redesignação de Audiência (JEC)",
      "Pedido de Produção Antecipada de Provas (JEC)",
      "Alegações Finais / Memoriais (JEC)",
      "Petição Intermediária / Manifestação Genérica (JEC)",
      "Pedido de Vista / Carga dos Autos (JEC)",
      "Esclarecimentos / Cumprimento de Determinação Judicial (JEC)",
    ],
  },
  {
    label: "Recursos (Lei 9.099/95)",
    opcoes: [
      "Embargos de Declaração (JEC)",
      "Embargos de Declaração em Acórdão da Turma Recursal (JEC)",
      "Recurso Inominado (JEC)",
      "Contrarrazões ao Recurso Inominado (JEC)",
      "Pedido de Efeito Suspensivo ao Recurso Inominado (JEC)",
      "Recurso Adesivo ao Recurso Inominado (quando admitido)",
      "Pedido de Uniformização de Interpretação de Lei — PUIL (quando cabível)",
    ],
  },
  {
    label: "Meios excepcionais / sucedâneos (uso criterioso)",
    opcoes: [
      "Recurso Extraordinário (contra acórdão de Turma Recursal)",
      "Agravo em Recurso Extraordinário",
      "Agravo Interno / Regimental (Turma Recursal / órgão colegiado)",
      "Agravo de Instrumento (excepcional — em regra não cabe no JEC; FONAJE)",
      "Mandado de Segurança (sucedâneo — uso excepcional no sistema dos Juizados)",
      "Reclamação (sucedâneo — uso excepcional)",
      "Habeas Corpus / Habeas Data (sucedâneo — hipóteses restritas)",
      "Correição Parcial / Reclamação correcional (quando prevista no tribunal)",
    ],
  },
] as const;

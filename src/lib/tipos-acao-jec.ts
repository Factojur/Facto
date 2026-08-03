/**
 * Tipos de peça manuais no formulário JEC (Lei 9.099/95).
 * Recursos ordinários típicos: Embargos de Declaração e Recurso Inominado.
 * RE e sucedâneos entram como opções excepcionais (uso criteriosamente).
 */

export type GrupoTipoAcaoJec = {
  label: string;
  opcoes: readonly string[];
};

export const TIPOS_ACAO_JEC: readonly GrupoTipoAcaoJec[] = [
  {
    label: "Petições iniciais",
    opcoes: [
      "Petição Inicial — Ação de Cobrança (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Materiais (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Morais (JEC)",
      "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)",
      "Petição Inicial — Ação de Obrigação de Fazer (JEC)",
      "Petição Inicial — Ação de Obrigação de Não Fazer (JEC)",
      "Petição Inicial — Ação de Obrigação de Entregar Coisa (JEC)",
      "Petição Inicial — Ação de Restituição de Quantia Paga / Repetição de Indébito (JEC)",
      "Petição Inicial — Ação Declaratória (JEC)",
      "Petição Inicial — Ação de Rescisão Contratual (JEC)",
      "Petição Inicial — Ação Revisional de Contrato (JEC)",
      "Petição Inicial — Ação de Consignação em Pagamento (JEC)",
      "Petição Inicial — Ação de Exibição de Documentos (JEC)",
      "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)",
      "Petição Inicial — Ação de Cobrança de Aluguéis e Encargos (JEC)",
    ],
  },
  {
    label: "Cumprimento e execução",
    opcoes: [
      "Cumprimento de Sentença (JEC)",
      "Execução de Título Extrajudicial (JEC)",
      "Embargos à Execução (JEC)",
      "Impugnação ao Cumprimento de Sentença (JEC)",
      "Pedido de Penhora / Constrição (JEC)",
    ],
  },
  {
    label: "Defesa e incidentes",
    opcoes: [
      "Contestação (JEC)",
      "Réplica (JEC)",
      "Pedido de Justiça Gratuita (JEC)",
      "Pedido de Tutela de Urgência Autônomo / Incidental (JEC)",
      "Exceção de Incompetência (JEC)",
      "Pedido de Homologação de Acordo (JEC)",
      "Pedido de Desistência da Ação (JEC)",
    ],
  },
  {
    label: "Recursos (Lei 9.099/95)",
    opcoes: [
      "Embargos de Declaração (JEC)",
      "Recurso Inominado (JEC)",
      "Contrarrazões ao Recurso Inominado (JEC)",
      "Pedido de Efeito Suspensivo ao Recurso Inominado (JEC)",
      "Embargos de Declaração em Acórdão da Turma Recursal (JEC)",
    ],
  },
  {
    label: "Meios excepcionais / sucedâneos",
    opcoes: [
      "Recurso Extraordinário (contra acórdão de Turma Recursal)",
      "Mandado de Segurança (sucedâneo — uso excepcional no sistema dos Juizados)",
      "Reclamação (sucedâneo — uso excepcional)",
    ],
  },
] as const;

export const ASSISTENTE_FACTO = "assistente-facto";

export type DecisaoAssistente = {
  tipoAcao: string;
  tutelaUrgencia: boolean;
  justificativa: string;
};

const ACAO_COBRANCA = "Petição Inicial — Ação de Cobrança (JEC)";
const ACAO_INDENIZACAO =
  "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)";
const ACAO_OBRIGACAO_FAZER =
  "Petição Inicial — Ação de Obrigação de Fazer (JEC)";
const ACAO_DESPEJO =
  "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)";
const ACAO_EXECUCAO = "Execução de Título Extrajudicial (JEC)";

function contemAlgum(texto: string, termos: string[]): boolean {
  return termos.some((t) => texto.includes(t));
}

/**
 * Assistente Facto — análise mock do case para definir ação e tutela.
 * Substituir por chamada a modelo de IA na próxima fase.
 */
export function analisarCaseAssistente(input: {
  fatos: string;
  totalArquivos: number;
}): DecisaoAssistente {
  const fatos = input.fatos.toLowerCase();

  let tipoAcao = ACAO_INDENIZACAO;
  let motivoAcao =
    "Os fatos narrados indicam lesão a direito patrimonial ou extrapatrimonial, "
    + "compatível com pedido indenizatório no Juizado Especial Cível.";

  if (
    contemAlgum(fatos, [
      "execução",
      "executivo",
      "título executivo",
      "nota promissória",
      "duplicata",
      "cheque",
    ])
  ) {
    tipoAcao = ACAO_EXECUCAO;
    motivoAcao =
      "Há indícios de título executivo extrajudicial, enquadrando-se em execução no JEC.";
  } else if (
    contemAlgum(fatos, [
      "despejo",
      "locação",
      "locacao",
      "aluguel",
      "inquilino",
      "locador",
      "imóvel locado",
      "imovel locado",
    ])
  ) {
    tipoAcao = ACAO_DESPEJO;
    motivoAcao =
      "A narrativa envolve relação locatícia, sugerindo ação de despejo para fim de locação.";
  } else if (
    contemAlgum(fatos, [
      "cobrança",
      "cobranca",
      "débito",
      "debito",
      "inadimpl",
      "não pagou",
      "nao pagou",
      "devedor",
      "valor devido",
      "saldo devedor",
    ])
  ) {
    tipoAcao = ACAO_COBRANCA;
    motivoAcao =
      "Os fatos descrevem inadimplemento ou débito líquido, indicando ação de cobrança.";
  } else if (
    contemAlgum(fatos, [
      "obrigação de fazer",
      "obrigacao de fazer",
      "entregar",
      "reparar",
      "consertar",
      "substituir",
      "cumprir",
      "prestação",
      "prestacao",
    ])
  ) {
    tipoAcao = ACAO_OBRIGACAO_FAZER;
    motivoAcao =
      "O caso envolve prestação específica a ser cumprida, compatível com obrigação de fazer.";
  } else if (
    contemAlgum(fatos, [
      "dano moral",
      "constrangimento",
      "ofensa",
      "humilhação",
      "humilhacao",
      "indenização",
      "indenizacao",
    ])
  ) {
    tipoAcao = ACAO_INDENIZACAO;
    motivoAcao =
      "Há relato de abalo moral ou material, recomendando ação indenizatória.";
  }

  const tutelaUrgencia = contemAlgum(fatos, [
    "urgente",
    "urgência",
    "urgencia",
    "tutela",
    "liminar",
    "iminente",
    "risco",
    "perigo",
    "immediatez",
    "imediato",
    "bloqueio",
    "corte",
    "interrupção",
    "interrupcao",
    "saúde",
    "saude",
    "emergência",
    "emergencia",
    "inadmissível aguardar",
    "inadmissivel aguardar",
  ]);

  const motivoTutela = tutelaUrgencia
    ? "Identificados indícios de perigo de dano ou risco ao resultado útil do processo (art. 300, CPC)."
    : "Não foram identificados elementos suficientes que exijam medida urgente inaudita altera pars.";

  const justificativa = [
    "=== DECISÃO DO ASSISTENTE FACTO ===",
    "",
    `Ação recomendada: ${tipoAcao}`,
    `Fundamento: ${motivoAcao}`,
    "",
    `Tutela de urgência: ${tutelaUrgencia ? "Recomendada" : "Não recomendada"}`,
    `Fundamento: ${motivoTutela}`,
    "",
    `Documentação analisada: ${input.totalArquivos} arquivo(s) listado(s) + narrativa dos fatos.`,
    "",
    "Observação: Esta análise utiliza regras inteligentes preliminares. Na versão final, "
      + "o Assistente Facto integrará IA generativa para leitura dos anexos e maior precisão.",
  ].join("\n");

  return { tipoAcao, tutelaUrgencia, justificativa };
}

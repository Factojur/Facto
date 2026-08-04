/**
 * Assistente Facto — classificação da ação cabível (regras locais + Gemini).
 */

export const ASSISTENTE_FACTO = "assistente-facto";

export type CumulosAcao = {
  danosMorais: boolean;
  danosMateriais: boolean;
  tutelaUrgencia: boolean;
};

export type DecisaoAssistente = {
  /** Tipo do catálogo JEC (sem cúmulo montado). */
  tipoAcao: string;
  tutelaUrgencia: boolean;
  danosMorais: boolean;
  danosMateriais: boolean;
  justificativa: string;
  /** Título forense com c/c, pronto para a peça. */
  tituloCompleto: string;
  fonte: "gemini" | "regras";
};

const ACAO_COBRANCA = "Petição Inicial — Ação de Cobrança (JEC)";
const ACAO_INDENIZACAO =
  "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)";
const ACAO_INEXIGIBILIDADE =
  "Petição Inicial — Ação Declaratória de Inexistência / Inexigibilidade de Débito (JEC)";
const ACAO_OBRIGACAO_FAZER =
  "Petição Inicial — Ação de Obrigação de Fazer (JEC)";
const ACAO_DESPEJO =
  "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)";
const ACAO_EXECUCAO = "Execução de Título Extrajudicial (JEC)";

function contemAlgum(texto: string, termos: string[]): boolean {
  return termos.some((t) => texto.includes(t));
}

/**
 * Monta o nome da ação com cumulações (c/c), no padrão forense.
 * Ex.: "… Inexigibilidade do Débito c/c Danos Morais, Danos Materiais e Tutela de Urgência (JEC)"
 */
export function montarTituloAcaoCompleto(
  tipoBase: string,
  cumulos: CumulosAcao
): string {
  const baseBruta = tipoBase.trim();
  if (!baseBruta || baseBruta === ASSISTENTE_FACTO) return baseBruta;

  const temJec = /\(JEC\)\s*$/i.test(baseBruta);
  let nucleo = baseBruta.replace(/\s*\(JEC\)\s*$/i, "").trim();

  const partes: string[] = [];
  const nucleoLower = nucleo.toLowerCase();

  if (
    cumulos.danosMorais &&
    !nucleoLower.includes("danos morais") &&
    !nucleoLower.includes("indenização por danos materiais e morais") &&
    !nucleoLower.includes("indenizacao por danos materiais e morais")
  ) {
    partes.push("Danos Morais");
  }
  if (
    cumulos.danosMateriais &&
    !nucleoLower.includes("danos materiais") &&
    !nucleoLower.includes("indenização por danos materiais e morais") &&
    !nucleoLower.includes("indenizacao por danos materiais e morais") &&
    !nucleoLower.includes("restituição") &&
    !nucleoLower.includes("restituicao")
  ) {
    partes.push("Danos Materiais");
  }
  if (cumulos.tutelaUrgencia && !nucleoLower.includes("tutela")) {
    partes.push("Tutela de Urgência");
  }

  if (partes.length === 0) {
    return temJec || baseBruta.toUpperCase().includes("JEC")
      ? baseBruta
      : `${nucleo} (JEC)`;
  }

  // Se já houver c/c no núcleo, acrescenta só o que falta após o existente
  if (/\bc\/c\b/i.test(nucleo)) {
    nucleo = `${nucleo}, ${partes.join(", ")}`;
  } else {
    nucleo = `${nucleo} c/c ${partes.join(", ")}`;
  }

  return `${nucleo} (JEC)`;
}

export function cumulosDeDecisao(d: DecisaoAssistente): CumulosAcao {
  return {
    danosMorais: d.danosMorais,
    danosMateriais: d.danosMateriais,
    tutelaUrgencia: d.tutelaUrgencia,
  };
}

/**
 * Fallback local por palavras-chave (sem Gemini) — usado se a IA falhar.
 */
export function analisarCaseAssistente(input: {
  fatos: string;
  totalArquivos?: number;
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
    ]) &&
    !contemAlgum(fatos, ["golpe", "fraude", "pix", "clonag"])
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
      "inexigib",
      "inexistência de débito",
      "inexistencia de debito",
      "dívida que não reconhece",
      "divida que nao reconhece",
      "cobrança indevida",
      "cobranca indevida",
      "negativação indevida",
      "negativacao indevida",
      "nome sujo indevido",
      "spc",
      "serasa",
    ])
  ) {
    tipoAcao = ACAO_INEXIGIBILIDADE;
    motivoAcao =
      "Os fatos apontam cobrança ou apontamento indevido, cabendo declaração de inexigibilidade/inexistência do débito.";
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

  const danosMorais = contemAlgum(fatos, [
    "dano moral",
    "danos morais",
    "constrangimento",
    "humilhação",
    "humilhacao",
    "abalo",
    "ofensa",
    "angústia",
    "angustia",
    "negativ",
    "spc",
    "serasa",
  ]);

  const danosMateriais = contemAlgum(fatos, [
    "dano material",
    "danos materiais",
    "prejuízo",
    "prejuizo",
    "gasto",
    "despesa",
    "reembolso",
    "restituição",
    "restituicao",
    "valor pago",
    "quantia",
  ]);

  // Se o tipo já é indenização conjunta, marca ambos
  if (tipoAcao === ACAO_INDENIZACAO) {
    // mantém flags detectadas; se nenhuma, assume ambos típicos da ação
    if (!danosMorais && !danosMateriais) {
      // default da ação
    }
  }

  const cumulos: CumulosAcao = {
    danosMorais:
      danosMorais ||
      tipoAcao === ACAO_INDENIZACAO ||
      tipoAcao === ACAO_INEXIGIBILIDADE,
    danosMateriais:
      danosMateriais ||
      tipoAcao === ACAO_INDENIZACAO ||
      (tipoAcao === ACAO_INEXIGIBILIDADE && danosMateriais),
    tutelaUrgencia,
  };

  // Inexigibilidade: danos morais costumam caber; materiais só se narrados
  if (tipoAcao === ACAO_INEXIGIBILIDADE) {
    cumulos.danosMorais = danosMorais || true;
    cumulos.danosMateriais = danosMateriais;
  }

  const motivoTutela = tutelaUrgencia
    ? "Identificados indícios de perigo de dano ou risco ao resultado útil do processo (art. 300, CPC)."
    : "Não foram identificados elementos suficientes que exijam medida urgente inaudita altera pars.";

  const justificativa = [
    motivoAcao,
    motivoTutela,
    cumulos.danosMorais || cumulos.danosMateriais
      ? `Cúmulos sugeridos: ${[
          cumulos.danosMorais ? "danos morais" : null,
          cumulos.danosMateriais ? "danos materiais" : null,
          cumulos.tutelaUrgencia ? "tutela de urgência" : null,
        ]
          .filter(Boolean)
          .join(", ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    tipoAcao,
    tutelaUrgencia: cumulos.tutelaUrgencia,
    danosMorais: cumulos.danosMorais,
    danosMateriais: cumulos.danosMateriais,
    justificativa,
    tituloCompleto: montarTituloAcaoCompleto(tipoAcao, cumulos),
    fonte: "regras",
  };
}

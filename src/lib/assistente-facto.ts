/**
 * Assistente Facto — classificação da ação cabível (regras locais + Gemini).
 * O nome da ação é livre (não há catálogo fixo): a IA ou o usuário definem,
 * e formatamos no padrão forense para a peça.
 */

export const ASSISTENTE_FACTO = "assistente-facto";

export type CumulosAcao = {
  danosMorais: boolean;
  danosMateriais: boolean;
  tutelaUrgencia: boolean;
};

export type DecisaoAssistente = {
  /** Nome da ação (já no padrão forense, com ou sem c/c). */
  tipoAcao: string;
  tutelaUrgencia: boolean;
  danosMorais: boolean;
  danosMateriais: boolean;
  justificativa: string;
  /** Título forense com cúmulos, pronto para a peça. */
  tituloCompleto: string;
  fonte: "gemini" | "regras";
};

export type ModoDefinicaoAcao = "assistente" | "livre";

function contemAlgum(texto: string, termos: string[]): boolean {
  return termos.some((t) => texto.includes(t));
}

/**
 * Normaliza texto livre / saída da IA para o padrão forense do JEC.
 * Ex.: "inexigibilidade de débito" →
 * "Petição Inicial — Ação de Inexigibilidade de Débito (JEC)"
 */
export function formatarNomeAcaoForense(bruto: string): string {
  let t = bruto
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[–—-]+/g, "—")
    .replace(/\s*—\s*/g, " — ");

  if (!t || t === ASSISTENTE_FACTO) return "";

  // Remove (JEC) para reaplicar no fim
  t = t.replace(/\s*\(JEC\)\s*$/i, "").trim();

  const lower = t.toLowerCase();
  const jaTemClasse =
    /^(petição inicial|peticao inicial|execução|execucao|embargos|recurso|contestação|contestacao|pedido de|impugnação|impugnacao|agravo|mandado)/i.test(
      t
    );

  if (!jaTemClasse) {
    if (/^a[cç][aã]o\b/i.test(t)) {
      t = `Petição Inicial — ${t}`;
    } else if (/^(declara[cç][aã]o|obrigação|obrigacao|indeniza|cobran|rescis|revis|anula|despeito|despejo|consigna)/i.test(t)) {
      t = `Petição Inicial — Ação de ${t.replace(/^a[cç][aã]o\s+de\s+/i, "")}`;
    } else if (!/peti[cç][aã]o/i.test(lower)) {
      t = `Petição Inicial — Ação de ${t.replace(/^de\s+/i, "")}`;
    }
  }

  // Capitalização leve das palavras principais (mantém c/c minúsculo)
  t = t
    .split(" ")
    .map((palavra, i) => {
      const p = palavra.trim();
      if (!p) return p;
      if (/^c\/c$/i.test(p)) return "c/c";
      if (/^(de|da|do|das|dos|e|ou|para|com|sem|em|na|no|nas|nos)$/i.test(p) && i > 0) {
        return p.toLowerCase();
      }
      if (p === p.toUpperCase() && p.length > 3 && /[A-ZÁÉÍÓÚ]/.test(p)) {
        // Já veio em CAIXA ALTA — title-case parcial
        return p.charAt(0) + p.slice(1).toLowerCase();
      }
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join(" ")
    .replace(/\bC\/c\b/g, "c/c")
    .replace(/\bJec\b/g, "JEC");

  return `${t} (JEC)`;
}

/**
 * Monta o nome da ação com cumulações (c/c), no padrão forense.
 */
export function montarTituloAcaoCompleto(
  tipoBase: string,
  cumulos: CumulosAcao
): string {
  const formatado = formatarNomeAcaoForense(tipoBase);
  if (!formatado) return "";

  let nucleo = formatado.replace(/\s*\(JEC\)\s*$/i, "").trim();
  const nucleoLower = nucleo.toLowerCase();
  const partes: string[] = [];

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
    !nucleoLower.includes("indenizacao por danos materiais e morais")
  ) {
    partes.push("Danos Materiais");
  }
  if (cumulos.tutelaUrgencia && !nucleoLower.includes("tutela")) {
    partes.push("Tutela de Urgência");
  }

  if (partes.length === 0) return `${nucleo} (JEC)`;

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

  let tipoAcao =
    "Petição Inicial — Ação de Indenização por Danos Materiais e Morais (JEC)";
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
    tipoAcao = "Execução de Título Extrajudicial (JEC)";
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
    ])
  ) {
    tipoAcao =
      "Petição Inicial — Ação de Despejo para Fim de Locação (JEC)";
    motivoAcao =
      "A narrativa envolve relação locatícia, sugerindo ação de despejo para fim de locação.";
  } else if (
    contemAlgum(fatos, [
      "inexigib",
      "inexistência de débito",
      "inexistencia de debito",
      "cobrança indevida",
      "cobranca indevida",
      "negativação indevida",
      "negativacao indevida",
      "spc",
      "serasa",
    ])
  ) {
    tipoAcao =
      "Petição Inicial — Ação Declaratória de Inexistência / Inexigibilidade de Débito (JEC)";
    motivoAcao =
      "Os fatos apontam cobrança ou apontamento indevido, cabendo declaração de inexigibilidade/inexistência do débito.";
  } else if (
    contemAlgum(fatos, [
      "cobrança",
      "cobranca",
      "inadimpl",
      "não pagou",
      "nao pagou",
      "devedor",
      "saldo devedor",
    ])
  ) {
    tipoAcao = "Petição Inicial — Ação de Cobrança (JEC)";
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
    ])
  ) {
    tipoAcao = "Petição Inicial — Ação de Obrigação de Fazer (JEC)";
    motivoAcao =
      "O caso envolve prestação específica a ser cumprida, compatível com obrigação de fazer.";
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
    "bloqueio",
    "corte",
    "interrupção",
    "interrupcao",
    "emergência",
    "emergencia",
  ]);

  const danosMorais = contemAlgum(fatos, [
    "dano moral",
    "danos morais",
    "constrangimento",
    "humilhação",
    "humilhacao",
    "abalo",
    "ofensa",
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
  ]);

  const cumulos: CumulosAcao = {
    danosMorais:
      danosMorais ||
      tipoAcao.toLowerCase().includes("inexigib") ||
      tipoAcao.toLowerCase().includes("indeniza"),
    danosMateriais:
      danosMateriais || tipoAcao.toLowerCase().includes("materiais e morais"),
    tutelaUrgencia,
  };

  if (tipoAcao.toLowerCase().includes("inexigib")) {
    cumulos.danosMorais = danosMorais || true;
    cumulos.danosMateriais = danosMateriais;
  }

  const tipoFormatado = formatarNomeAcaoForense(tipoAcao);
  const justificativa = [
    motivoAcao,
    tutelaUrgencia
      ? "Identificados indícios de urgência (art. 300, CPC)."
      : "Sem elementos claros de tutela de urgência.",
  ].join(" ");

  return {
    tipoAcao: tipoFormatado,
    tutelaUrgencia: cumulos.tutelaUrgencia,
    danosMorais: cumulos.danosMorais,
    danosMateriais: cumulos.danosMateriais,
    justificativa,
    tituloCompleto: montarTituloAcaoCompleto(tipoFormatado, cumulos),
    fonte: "regras",
  };
}

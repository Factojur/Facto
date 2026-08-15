/**
 * Endereçamento forense padrão FACTO.
 * O texto é montado em código — a IA nunca reescreve o cabeçalho.
 *
 * Modelo:
 * EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ___ VARA DO
 * [ÁREA] DO FÓRUM DA COMARCA DE MUNICÍPIO/UF
 */

export type ComarcaInfo = {
  /** Texto livre do foro (usado para extrair município/UF). */
  foro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  /** Nº da vara/juizado; em petição inicial fica em branco (___). */
  numeroJuizado?: string;
  /** Ex.: "0001234-56.2024.8.26.0224" — peças com processo em curso. */
  numeroProcesso?: string;
};

/**
 * Rótulo da área judiciária conforme o módulo do dashboard.
 * Extensível quando novas áreas forem liberadas.
 */
export function rotuloAreaJudiciaria(areaId: string = "jec"): string {
  switch (areaId) {
    case "jec":
      return "JUIZADO ESPECIAL CÍVEL";
    case "jecr":
      return "JUIZADO ESPECIAL CRIMINAL";
    case "trabalhista":
      return "JUSTIÇA DO TRABALHO";
    case "penal":
      return "JUSTIÇA CRIMINAL";
    case "civil":
      return "JUSTIÇA CÍVEL";
    case "familia":
      return "VARA DE FAMÍLIA E SUCESSÕES";
    case "consumidor":
      return "CÍVEL";
    default:
      return "JUÍZO COMPETENTE";
  }
}

/**
 * Tenta extrair município/UF do texto do foro (ex.: "... de Campinas/SP",
 * "... de Campinas - SP") para fechamento e OAB.
 */
export function extrairCidadeUfDoForo(foro: string | null | undefined): {
  cidade: string;
  uf: string;
} {
  const t = String(foro ?? "").trim();
  if (!t) return { cidade: "", uf: "" };

  const m =
    t.match(
      /(?:de|da comarca de)\s+([A-Za-zÀ-ÿ'.\s]+?)\s*[-–/]\s*([A-Za-z]{2})\s*$/i
    ) ??
    t.match(/([A-Za-zÀ-ÿ'.\s]+?)\s*[-–/]\s*([A-Za-z]{2})\s*$/i);

  if (!m) return { cidade: "", uf: "" };
  const cidade = m[1]!.replace(/\s+/g, " ").trim();
  const uf = m[2]!.trim().toUpperCase();
  if (!ufValida(uf) || cidade.length < 2) return { cidade: "", uf: "" };
  return { cidade, uf };
}

type ViaCepResposta = {
  cep: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export function normalizarCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function cepValido(cep: string): boolean {
  return normalizarCep(cep).length === 8;
}

export async function buscarComarcaPorCep(
  cepBruto: string
): Promise<{ cidade: string; uf: string } | null> {
  const cep = normalizarCep(cepBruto);
  if (cep.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) return null;

    const dados = (await resposta.json()) as ViaCepResposta;
    if (dados.erro || !dados.localidade || !dados.uf) return null;

    return { cidade: dados.localidade, uf: dados.uf };
  } catch {
    return null;
  }
}

const UFS_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function ufValida(uf: string): boolean {
  return UFS_VALIDAS.has(uf.trim().toUpperCase());
}

/** Petição inicial (e sucedâneos sem processo) → vara em branco. */
export function ehPeticaoInicial(tipoAcao: string | null | undefined): boolean {
  const t = String(tipoAcao ?? "").toLowerCase();
  if (
    /contesta[cç][aã]o|embargos|recurso|apelac|agravo|impugna[cç][aã]o|r[eé]plica|contrarraz|cumprimento/i.test(
      t
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Endereçamento padrão FACTO (todas as áreas).
 */
export function formatarEnderecamentoPadrao(opcoes: {
  comarca?: ComarcaInfo | null;
  /** Ex.: "JUIZADO ESPECIAL CÍVEL" */
  areaJudiciaria?: string;
  /** Se true (petição inicial), força "___" na vara. */
  varaEmBranco?: boolean;
  /** Módulo do dashboard — define a fórmula da linha. */
  areaId?: string;
}): string {
  const info = opcoes.comarca ?? {};
  const area = (opcoes.areaJudiciaria ?? "JUIZADO ESPECIAL CÍVEL")
    .trim()
    .toUpperCase();

  let cidade = (info.cidade ?? "").trim();
  let uf = (info.uf ?? "").trim().toUpperCase();

  if ((!cidade || !uf) && info.foro?.trim()) {
    const extraido = extrairCidadeUfDoForo(info.foro);
    if (!cidade) cidade = extraido.cidade;
    if (!uf) uf = extraido.uf;
  }

  const comarcaTxt =
    cidade && uf ? `${cidade.toUpperCase()}/${uf}` : "___/__";

  const varaEmBranco =
    opcoes.varaEmBranco !== false &&
    (opcoes.varaEmBranco === true || !info.numeroJuizado?.trim());

  const vara = varaEmBranco
    ? "___"
    : info.numeroJuizado!.trim().replace(/[ªº°]/g, "");

  const areaId = opcoes.areaId ?? "";
  if (areaId === "trabalhista") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ${vara} ` +
      `VARA DO TRABALHO DE ${comarcaTxt}`
    );
  }
  if (areaId === "consumidor" || areaId === "civil") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} ` +
      `VARA CÍVEL DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }

  return (
    `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} VARA ` +
    `DO ${area} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
  );
}

/**
 * Compatível com o JEC — usa o padrão unificado.
 */
export function formatarEnderecamentoJec(info: ComarcaInfo): string {
  return formatarEnderecamentoPadrao({
    comarca: info,
    areaJudiciaria: rotuloAreaJudiciaria("jec"),
    varaEmBranco: true,
  });
}

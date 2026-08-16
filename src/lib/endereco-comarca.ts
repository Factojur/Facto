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
    case "criminal":
      return "JUSTIÇA CRIMINAL";
    case "previdenciario":
      return "JUIZADO ESPECIAL FEDERAL";
    case "tributario":
    case "administrativo":
      return "FAZENDA PÚBLICA";
    case "eleitoral":
      return "JUSTIÇA ELEITORAL";
    case "internacional":
      return "COOPERAÇÃO JURÍDICA / STJ";
    case "civil":
    case "imobiliario":
      return "JUSTIÇA CÍVEL";
    case "familia":
      return "VARA DE FAMÍLIA E SUCESSÕES";
    case "consumidor":
      return "VARA CÍVEL";
    case "digital":
    case "medico":
    case "agrario":
    case "empresarial":
    case "ambiental":
    case "propriedade-intelectual":
      return "JUSTIÇA CÍVEL";
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

/** Peça inaugural (vara em branco). Incidentais = false. */
export function ehPeticaoInicial(tipoAcao: string | null | undefined): boolean {
  const t = String(tipoAcao ?? "").toLowerCase();
  if (
    /contesta[cç][aã]o|defesa|embargos|recurso|apelac|agravo|impugna[cç][aã]o|r[eé]plica|contrarraz|cumprimento|alega[cç][oõ]es finais|resposta [aà] acusa|sentido estrito|inominado|exce[cç][aã]o de pr[eé]/i.test(
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
  /** Espécie (HC e agravo de instrumento vão ao Tribunal, não à vara). */
  especiePeca?: string;
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
  const especie = (opcoes.especiePeca ?? "").toLowerCase();
  if (especie === "habeas-corpus" || especie.includes("habeas")) {
    return `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) PRESIDENTE DO EGRÉGIO TRIBUNAL DE JUSTIÇA DO ESTADO DE ${
      uf || "___"
    }`;
  }
  // Notificação extrajudicial não se endereça a juiz.
  if (
    especie === "notificacao-extrajudicial" ||
    especie.includes("notificacao-extrajudicial") ||
    especie.includes("notificação extrajudicial")
  ) {
    return "NOTIFICAÇÃO EXTRAJUDICIAL";
  }
  // CLT art. 897: agravo de instrumento e agravo de petição vão ao TRT, não ao TJ.
  if (
    areaId === "trabalhista" &&
    (especie === "agravo-instrumento" ||
      especie === "agravo-peticao" ||
      especie.includes("agravo-peticao") ||
      especie.includes("agravo de petição") ||
      especie.includes("agravo de peticao"))
  ) {
    return `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) PRESIDENTE DO EGRÉGIO TRIBUNAL REGIONAL DO TRABALHO${
      uf ? ` (${uf})` : ""
    }`;
  }
  // Agravo no JEF / Justiça Federal → TRF (não TJ estadual).
  if (
    (areaId === "previdenciario" || areaId === "administrativo") &&
    (especie === "agravo-instrumento" ||
      especie.includes("agravo-instrumento") ||
      especie.includes("agravo de instrumento"))
  ) {
    const foro = (info.foro ?? "").toLowerCase();
    if (
      areaId === "previdenciario" ||
      /justi[cç]a federal|\bjf\b|\bjef\b|se[cç][aã]o judici[aá]ria|vara federal/.test(
        foro
      )
    ) {
      return `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) FEDERAL PRESIDENTE DO EGRÉGIO TRIBUNAL REGIONAL FEDERAL`;
    }
  }
  // CPC 1.016: agravo de instrumento cível se dirige ao tribunal estadual.
  if (
    especie === "agravo-instrumento" ||
    especie.includes("agravo-instrumento") ||
    especie.includes("agravo de instrumento")
  ) {
    return `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) PRESIDENTE DO EGRÉGIO TRIBUNAL DE JUSTIÇA DO ESTADO DE ${
      uf || "___"
    }`;
  }
  if (areaId === "trabalhista") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA ${vara} ` +
      `VARA DO TRABALHO DE ${comarcaTxt}`
    );
  }
  if (areaId === "familia") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} ` +
      `VARA DE FAMÍLIA E SUCESSÕES DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "jecr") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} ` +
      `VARA DO JUIZADO ESPECIAL CRIMINAL DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "criminal") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} ` +
      `VARA CRIMINAL DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "previdenciario") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA ${vara} ` +
      `VARA DO JUIZADO ESPECIAL FEDERAL DE ${comarcaTxt}`
    );
  }
  if (areaId === "tributario" || areaId === "administrativo") {
    const foro = (info.foro ?? "").toLowerCase();
    if (
      /justi[cç]a federal|\bjf\b|\bjef\b|se[cç][aã]o judici[aá]ria|vara federal/.test(
        foro
      )
    ) {
      return (
        `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DA ${vara} ` +
        `VARA FEDERAL DE ${comarcaTxt}`
      );
    }
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${vara} ` +
      `VARA DA FAZENDA PÚBLICA DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "eleitoral") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) ELEITORAL DA ${vara} ` +
      `ZONA ELEITORAL DE ${comarcaTxt}`
    );
  }
  if (areaId === "internacional") {
    return `EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO SUPERIOR TRIBUNAL DE JUSTIÇA`;
  }
  if (
    areaId === "consumidor" ||
    areaId === "civil" ||
    areaId === "imobiliario" ||
    areaId === "empresarial" ||
    areaId === "digital" ||
    areaId === "medico" ||
    areaId === "agrario" ||
    areaId === "ambiental" ||
    areaId === "propriedade-intelectual"
  ) {
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

/** Troca a 1ª linha se for endereçamento — a IA não pode reescrever maiúsculas. */
export function substituirEnderecamentoDeterministico(
  peca: string,
  enderecamento: string
): string {
  const alvo = enderecamento.trim();
  if (!alvo) return peca;
  const linhas = peca.split("\n");
  const i = linhas.findIndex((l) =>
    /excelent[ií]ssim/i.test(l.trim())
  );
  if (i < 0) return `${alvo}\n${peca}`;
  linhas[i] = alvo;
  return linhas.join("\n");
}

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
  /**
   * Especialidade explícita nos autos (ex.: "CÍVEL", "DE FAMÍLIA E SUCESSÕES").
   * Ausente = não inventar "Vara Cível"/"Vara de Família".
   */
  especialidadeVara?: string | null;
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
    case "constitucional":
      return "JUÍZO CONSTITUCIONAL";
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

/** Prefixo orgânico que não é nome de município (ex.: "Vara de Itararé"). */
const PREFIXO_NAO_CIDADE =
  /^(fls|tel|cep|foro|comarca|vara|juizado|tribunal|f[oó]rum)\b/i;

/**
 * Remove "Foro/Vara/Comarca de …" se vazou para o campo cidade.
 * Ex.: "VARA DE ITARARÉ" → "ITARARÉ".
 */
export function sanearNomeCidade(cidade: string): string {
  let c = cidade.replace(/\s+/g, " ").trim();
  if (!c) return "";
  c = c
    .replace(
      /^(?:foro|comarca|vara|juizado(?:\s+especial)?|f[oó]rum|tribunal)(?:\s+(?:central|especial))?\s+(?:de\s+|da\s+|do\s+)/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
  if (!c || PREFIXO_NAO_CIDADE.test(c)) return "";
  return c;
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

  const candidatos = [
    // Preferir município após órgão: "1ª Vara de Itararé/SP", "Foro de Itararé - SP"
    t.match(
      /\b(?:\d{1,3}\s*[ªºo°]?\s*)?(?:foro|comarca|vara|f[oó]rum)\s+(?:de\s+|da\s+)([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,2})\s*[-–/]\s*([A-Za-z]{2})\b/i
    ),
    t.match(
      /(?:de|da comarca de)\s+([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})\s*[-–/]\s*([A-Za-z]{2})\b/i
    ),
    t.match(
      /([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})\s*[-–/]\s*([A-Za-z]{2})\s*$/i
    ),
    t.match(
      /\b([A-Za-zÀ-ÿ']{3,}(?:\s+[A-Za-zÀ-ÿ']+){0,3})\s*[\/–-]\s*([A-Za-z]{2})\b/i
    ),
  ];

  for (const m of candidatos) {
    if (!m) continue;
    const cidade = sanearNomeCidade(m[1]!);
    const uf = m[2]!.trim().toUpperCase();
    if (ufValida(uf) && cidade.length >= 2) {
      return { cidade, uf };
    }
  }
  return { cidade: "", uf: "" };
}

export type ComponentesForo = {
  cidade: string;
  uf: string;
  numeroVara: string;
  complementoOrgao: string;
  especialidadeVara: string;
};

/** Vara, anexo, foro e município a partir do texto livre do campo Foro. */
export function extrairComponentesForo(
  foro: string | null | undefined
): ComponentesForo {
  const t = String(foro ?? "").replace(/\s+/g, " ").trim();
  const { cidade, uf } = extrairCidadeUfDoForo(t);
  const vara =
    t.match(/(\d{1,3})\s*[ªºo°]?\s*(?:vara|juizado|zona)/i)?.[1] ?? "";
  const anexo = t.match(/anexo\s+([A-Za-zÀ-ÿ]{3,40})/i)?.[1];
  const especialidade =
    t.match(
      /\d{1,3}\s*[ªºo°]?\s*VARA\s+(DE\s+FAM[IÍ]LIA(?:\s+E\s+SUCESS[OÕ]ES)?|C[IÍ]VEL|CRIMINAL|DA\s+FAZENDA(?:\s+P[UÚ]BLICA)?|DO\s+TRABALHO|FEDERAL)/i
    )?.[1] ?? "";
  const partes: string[] = [];
  if (/foro central/i.test(t)) partes.push("FORO CENTRAL");
  if (anexo) partes.push(`ANEXO ${anexo.trim().toUpperCase()}`);
  return {
    cidade,
    uf,
    numeroVara: vara,
    complementoOrgao: partes.join(" "),
    especialidadeVara: especialidade.replace(/\s+/g, " ").trim().toUpperCase(),
  };
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

function daNVara(vara: string, nomeVara: string): string {
  if (vara === "___") return `DA ___ª ${nomeVara}`;
  if (!vara) return `DA ${nomeVara}`;
  const n = String(vara).replace(/[ªº°]/g, "").trim();
  if (/^VARA$/i.test(nomeVara.trim())) return `DA ${n}ª VARA`;
  return `DA ${n}ª ${nomeVara}`;
}

/**
 * Rótulo da vara no endereçamento.
 * Especialidade explícita nos autos prevalece; com número mas sem especialidade
 * → só "VARA" (não inventar Cível/Família).
 */
export function nomeVaraParaEnderecamento(opcoes: {
  especialidadeVara?: string | null;
  numeroVara?: string | null;
  fallbackModulo: string;
}): string {
  const esp = String(opcoes.especialidadeVara ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  if (esp) {
    return esp.startsWith("VARA") ? esp : `VARA ${esp}`;
  }
  const n = String(opcoes.numeroVara ?? "")
    .replace(/[ªº°]/g, "")
    .trim();
  if (n && n !== "___") return "VARA";
  return opcoes.fallbackModulo;
}

function enderecoJecPrimeiraInstancia(
  vara: string,
  organExtra: string,
  comarcaTxt: string
): string {
  const cargo =
    "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO";
  if (/ANEXO/.test(organExtra)) {
    const anexo = organExtra
      .replace(/\bFORO CENTRAL\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const foro = /\bFORO CENTRAL\b/.test(organExtra)
      ? " DO FORO CENTRAL"
      : "";
    return `${cargo} DO JUIZADO ESPECIAL CÍVEL ${anexo}${foro} DA COMARCA DE ${comarcaTxt}`;
  }
  if (vara && vara !== "___") {
    return `${cargo} DA ${vara} VARA DO JUIZADO ESPECIAL CÍVEL DO FÓRUM DA COMARCA DE ${comarcaTxt}`;
  }
  if (vara === "___") {
    return `${cargo} DA ___ VARA DO JUIZADO ESPECIAL CÍVEL DO FÓRUM DA COMARCA DE ${comarcaTxt}`;
  }
  return `${cargo} DO JUIZADO ESPECIAL CÍVEL DO FÓRUM DA COMARCA DE ${comarcaTxt}`;
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
  const areaId = opcoes.areaId ?? "";
  const especie = (opcoes.especiePeca ?? "").toLowerCase();
  const area = (
    opcoes.areaJudiciaria ??
    (areaId ? rotuloAreaJudiciaria(areaId) : "JUIZADO ESPECIAL CÍVEL")
  )
    .trim()
    .toUpperCase();

  const doForo = extrairComponentesForo(info.foro);
  let cidade =
    sanearNomeCidade((info.cidade ?? "").trim()) ||
    sanearNomeCidade(doForo.cidade);
  let uf = (info.uf ?? "").trim().toUpperCase() || doForo.uf;
  if ((!cidade || !uf) && info.foro) {
    const extra = extrairCidadeUfDoForo(info.foro);
    if (!cidade && extra.cidade) cidade = extra.cidade;
    if (!uf && extra.uf) uf = extra.uf;
  }

  const comarcaTxt =
    cidade && uf ? `${cidade.toUpperCase()}/${uf}` : "___/__";

  const juizado = (info.numeroJuizado ?? "").trim() || doForo.numeroVara;
  const varaEmBranco = opcoes.varaEmBranco === true;
  const vara = varaEmBranco
    ? "___"
    : juizado.replace(/[ªº°]/g, "");
  const organExtra = doForo.complementoOrgao;
  const especialidadeVara =
    (info.especialidadeVara ?? "").trim() ||
    doForo.especialidadeVara ||
    null;

  const rotuloVara = (fallbackModulo: string) =>
    nomeVaraParaEnderecamento({
      especialidadeVara,
      numeroVara: vara,
      fallbackModulo,
    });

  // Controle concentrado e RE → STF
  if (
    areaId === "constitucional" &&
    (especie === "adi" ||
      especie === "adc" ||
      especie === "ado" ||
      especie === "adpf" ||
      especie === "contestacao-adi" ||
      especie === "contestacao-adpf" ||
      especie === "contestacao-adc" ||
      especie === "contestacao-ado" ||
      especie === "recurso-extraordinario" ||
      especie === "agravo-recurso-extraordinario" ||
      especie === "contrarrazoes-recurso-extraordinario" ||
      especie.includes("extraordinario") ||
      especie.includes("extraordinário"))
  ) {
    return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
  }
  if (
    areaId === "constitucional" &&
    (especie === "reclamacao-constitucional" ||
      especie === "contestacao-reclamacao")
  ) {
    const foro = (info.foro ?? "").toLowerCase();
    if (/\bstj\b|superior tribunal de justi[cç]a/.test(foro)) {
      return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPERIOR TRIBUNAL DE JUSTIÇA";
    }
    return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
  }

  // Habeas corpus (não habeas data — competência distinta, 1ª instância ou juízo da autoridade).
  const ehHabeasCorpus =
    especie === "habeas-corpus" ||
    (especie.includes("habeas") && !especie.includes("data"));
  if (ehHabeasCorpus) {
    if (areaId === "constitucional") {
      // HC constitucional pode ser TJ, TRF ou STF — use o foro dos FATOS se indicar STF
      const foro = (info.foro ?? "").toLowerCase();
      if (/\bstf\b|supremo/.test(foro)) {
        return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
      }
      if (/\btrf\b|tribunal regional federal|justi[cç]a federal/.test(foro)) {
        return "EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) FEDERAL PRESIDENTE DO EGRÉGIO TRIBUNAL REGIONAL FEDERAL";
      }
    }
    return `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) PRESIDENTE DO EGRÉGIO TRIBUNAL DE JUSTIÇA DO ESTADO DE ${
      uf || "___"
    }`;
  }

  // Revisão criminal: tribunal que proferiu a condenação (CPP art. 624), não a vara de origem.
  if (especie === "revisao-criminal") {
    const foro = (info.foro ?? "").toLowerCase();
    if (/\btrf\b|tribunal regional federal|justi[cç]a federal/.test(foro)) {
      return "EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) FEDERAL PRESIDENTE DO EGRÉGIO TRIBUNAL REGIONAL FEDERAL";
    }
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
  // ROC (CF arts. 102, II e 105, II): STF ou STJ conforme o foro; default STF no módulo constitucional.
  if (
    areaId === "constitucional" &&
    (especie === "recurso-ordinario-constitucional" ||
      especie === "contrarrazoes-recurso-ordinario")
  ) {
    const foro = (info.foro ?? "").toLowerCase();
    if (/\bstj\b|superior tribunal de justi[cç]a/.test(foro)) {
      return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPERIOR TRIBUNAL DE JUSTIÇA";
    }
    return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
  }

  // Agravo regimental no módulo constitucional: STF, salvo foro que indique STJ.
  if (areaId === "constitucional" && especie === "agravo-regimental") {
    const foro = (info.foro ?? "").toLowerCase();
    if (/\bstj\b|superior tribunal de justi[cç]a/.test(foro)) {
      return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPERIOR TRIBUNAL DE JUSTIÇA";
    }
    return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
  }

  // Juizado: agravo de instrumento não segue o CPC 1.016 (TJ). Endereça a Turma Recursal.
  if (
    areaId === "jec" &&
    (especie === "agravo-instrumento" ||
      especie.includes("agravo-instrumento") ||
      especie.includes("agravo de instrumento"))
  ) {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO PRESIDENTE DA COLENDA ` +
      `TURMA RECURSAL DO JUIZADO ESPECIAL CÍVEL DE ${comarcaTxt}`
    );
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
  if (
    areaId === "jec" ||
    (!areaId && /JUIZADO ESPECIAL C[IÍ]VEL/.test(area))
  ) {
    return enderecoJecPrimeiraInstancia(vara, organExtra, comarcaTxt);
  }
  if (areaId === "trabalhista") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO ` +
      `${daNVara(vara, "VARA DO TRABALHO")} DE ${comarcaTxt}`
    );
  }
  if (areaId === "familia") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, rotuloVara("VARA DE FAMÍLIA E SUCESSÕES"))} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "jecr") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, "VARA DO JUIZADO ESPECIAL CRIMINAL")} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "criminal") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, "VARA CRIMINAL")} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "previdenciario") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL ` +
      `${daNVara(vara, "VARA DO JUIZADO ESPECIAL FEDERAL")} DE ${comarcaTxt}`
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
        `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL ` +
        `${daNVara(vara, "VARA FEDERAL")} DE ${comarcaTxt}`
      );
    }
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, "VARA DA FAZENDA PÚBLICA")} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }
  if (areaId === "eleitoral") {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) ELEITORAL ` +
      `${daNVara(vara, "ZONA ELEITORAL")} DE ${comarcaTxt}`
    );
  }
  // Homologação de sentença estrangeira: competência do STJ (CF art. 105, I, i).
  // Demais peças do módulo (contrato internacional, apelação, cumprimento) seguem a justiça comum.
  if (
    areaId === "internacional" &&
    (especie === "homologacao" || especie.includes("homologa"))
  ) {
    return `EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO SUPERIOR TRIBUNAL DE JUSTIÇA`;
  }
  if (areaId === "constitucional") {
    const foro = (info.foro ?? "").toLowerCase();
    if (/\bstf\b|supremo/.test(foro)) {
      return "EXCELENTÍSSIMO(A) SENHOR(A) MINISTRO(A) PRESIDENTE DO COLENDO SUPREMO TRIBUNAL FEDERAL";
    }
    if (
      /justi[cç]a federal|\bjf\b|\btrf\b|se[cç][aã]o judici[aá]ria|vara federal/.test(
        foro
      )
    ) {
      return (
        `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL ` +
        `${daNVara(vara, "VARA FEDERAL")} DE ${comarcaTxt}`
      );
    }
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, "VARA")} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
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
    areaId === "propriedade-intelectual" ||
    areaId === "internacional"
  ) {
    return (
      `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
      `${daNVara(vara, rotuloVara("VARA CÍVEL"))} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
    );
  }

  return (
    `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO ` +
    `${daNVara(vara, rotuloVara("VARA"))} DO ${area} DO FÓRUM DA COMARCA DE ${comarcaTxt}`
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
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const i = linhas.findIndex((l) => /excelent[ií]ssim/i.test(l.trim()));
  if (i < 0) return `${alvo}\n${peca}`;

  let j = i + 1;
  while (j < linhas.length) {
    const t = linhas[j]!.trim();
    if (!t) {
      j++;
      continue;
    }
    if (/excelent[ií]ssim/i.test(t)) {
      j++;
      continue;
    }
    if (
      /^(?:DA COMARCA|DO FORO|DA VARA|VARA|JU[IÍ]ZO|COMARCA|FORO|JUIZADO|TURMA)/i.test(
        t
      )
    ) {
      j++;
      continue;
    }
    break;
  }

  return [...linhas.slice(0, i), alvo, ...linhas.slice(j)].join("\n");
}

/** Força o nome da ação determinístico (espécie/rito da área) após redação IA. */
export function substituirNomePecaDeterministico(
  peca: string,
  nomePeca: string
): string {
  const alvo = nomePeca.trim().toUpperCase();
  if (!alvo) return peca;
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  let substituiu = false;

  for (let i = 0; i < linhas.length; i++) {
    const t = linhas[i]!.trim();
    if (!t) continue;
    if (
      /^(?:A[CÇ][AÃ]O|PETI[CÇ][AÃ]O|MANDADO|RECURSO|EMBARGOS|CONTESTA[CÇ][AÃ]O|APELA[CÇ][AÃ]O|RECLAMA[CÇ][AÃ]O)\b/i.test(
        t
      ) &&
      t.toUpperCase() !== alvo
    ) {
      linhas[i] = alvo;
      substituiu = true;
      break;
    }
  }

  if (substituiu) return linhas.join("\n");

  for (let i = 0; i < linhas.length; i++) {
    if (!/\bpropor a presente\b/i.test(linhas[i] ?? "")) continue;
    for (let j = i + 1; j < Math.min(i + 8, linhas.length); j++) {
      const t = linhas[j]!.trim();
      if (!t || /^\[\[ESPACO/i.test(t)) continue;
      if (t.toUpperCase() !== alvo) {
        linhas[j] = alvo;
      }
      break;
    }
    break;
  }

  return linhas.join("\n");
}

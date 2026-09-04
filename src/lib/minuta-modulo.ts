/**
 * Contrato da dashboard de minuta (todas as áreas).
 * O JEC é referência de desenvolvimento (formulário de laboratório); em produção
 * o chat usa `moduloDaArea(areaId)` + espécies/prompts da área escolhida — cada
 * rito tem `AreaModuloConfig`, tabelas de espécie e kits próprios.
 */

/** Porta do cliente = assistente (rotas /dashboard/<area> só redirecionam). */
export const HREF_CHAT_ASSISTENTE = "/dashboard#assistente-workspace";

export type GuiaMinuta = "identificacao" | "fatos" | "pedidos";

/** Três etapas do formulário — iguais em todas as áreas. */
export const GUIAS_MINUTA: { id: GuiaMinuta; label: string }[] = [
  { id: "identificacao", label: "Identificação" },
  { id: "fatos", label: "Fatos e fundamentos" },
  { id: "pedidos", label: "Pedidos" },
];

/** Timbre e botão Gerar só na última etapa. */
export const GUIA_GERAR_PECA: GuiaMinuta = "pedidos";

export const LOADING_STAGES_GERACAO = [
  "Analista Facto: lendo o dossiê…",
  "Triagem: montando plano de tópicos…",
  "Pesquisa & súmulas: buscando fundamentos…",
  "Estrategista: definindo a tese…",
  "Redator forense: escrevendo a peça…",
  "Auditor: conferindo a minuta…",
] as const;

export const LOADING_STAGES_TRIAGEM = [
  "Analista Facto: lendo o dossiê…",
  "Triagem: plano de tópicos e teses…",
] as const;

/**
 * O que a área deve especializar. Não basta `available` no catálogo.
 */
export type AreaModuloConfig = {
  id: string;
  tituloDashboard: string;
  leiResumo: string;
  /** Sempre o assistente; rotas /dashboard/<area> só redirecionam. */
  href: string;
  hrefCasos?: string;
  idsPeticaoInicial: readonly string[];
  copyCabecalho: string;
  fundamentoQualificacao: string;
  rotuloPoloAtivo: string;
  rotuloPoloPassivo: string;
  /** Rótulo legado (smoke/lastro); sidebar não usa mais “Gerar peça X”. */
  rotuloNav: string;
};

export const MODULO_JEC: AreaModuloConfig = {
  id: "jec",
  tituloDashboard: "Juizado Especial Cível",
  leiResumo: "Lei nº 9.099/95",
  href: HREF_CHAT_ASSISTENTE,
  hrefCasos: "/dashboard/jec/casos",
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Peças para o Juizado Especial Cível (Lei nº 9.099/95). Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na Lei nº 9.099/95",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área JEC",
};

export const MODULO_CIVIL: AreaModuloConfig = {
  id: "civil",
  tituloDashboard: "Direito Civil (justiça comum)",
  leiResumo: "Código Civil · CPC",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
  copyCabecalho:
    "Peças cíveis na justiça comum (Código Civil e CPC): cobrança, indenização, obrigações. Não use para Juizado (9.099) nem para relação de consumo (módulo Consumidor). Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Civil e no CPC",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área Civil",
};

export const MODULO_CONSUMIDOR: AreaModuloConfig = {
  id: "consumidor",
  tituloDashboard: "Direito do Consumidor (justiça comum)",
  leiResumo: "CDC · CPC",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial", "execucao-titulo"],
  copyCabecalho:
    "Peças consumeristas na justiça comum (CDC e CPC). Não use este módulo para o Juizado — lá o rito é a Lei 9.099/95. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no CDC e no CPC",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área Consumidor",
};

export const MODULO_TRABALHISTA: AreaModuloConfig = {
  id: "trabalhista",
  tituloDashboard: "Justiça do Trabalho",
  leiResumo: "CLT · rito trabalhista",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["reclamacao", "execucao-titulo"],
  copyCabecalho:
    "Peças na Justiça do Trabalho (CLT): reclamação, defesa, recurso ordinário. Não use CPC de justiça comum nem Lei 9.099. Polos: reclamante e reclamado. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na CLT e na legislação processual trabalhista",
  rotuloPoloAtivo: "reclamante",
  rotuloPoloPassivo: "reclamado",
  rotuloNav: "Área Trabalhista",
};

export const MODULO_FAMILIA: AreaModuloConfig = {
  id: "familia",
  tituloDashboard: "Família e Sucessões",
  leiResumo: "CC · CPC · rito de família",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial", "inventario"],
  copyCabecalho:
    "Peças de família e sucessões (Código Civil e CPC): divórcio, guarda, alimentos, inventário. Tramitação em segredo de justiça (art. 189 do CPC) quando couber. Não use Juizado nem CLT. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Civil, no CPC e na legislação de família",
  rotuloPoloAtivo: "requerente",
  rotuloPoloPassivo: "requerido",
  rotuloNav: "Área Família",
};

export const MODULO_IMOBILIARIO: AreaModuloConfig = {
  id: "imobiliario",
  tituloDashboard: "Direito Imobiliário",
  leiResumo: "Lei 8.245 · CC · condomínio",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: [
    "peticao-inicial",
    "despejo",
    "usucapiao",
    "consignacao",
    "condominio",
  ],
  copyCabecalho:
    "Peças imobiliárias na justiça comum: despejo (Lei 8.245/91), usucapião, consignação de aluguéis e cotas de condomínio. Não use para cobrança cível genérica (Civil) nem para Juizado. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na legislação imobiliária, no Código Civil e no CPC",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área Imobiliário",
};

export const MODULO_JECR: AreaModuloConfig = {
  id: "jecr",
  tituloDashboard: "Juizado Especial Criminal",
  leiResumo: "Lei nº 9.099/95 (JECRIM)",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: [
    "queixa-crime",
    "composicao-civil",
    "transacao-penal",
  ],
  copyCabecalho:
    "Peças no Juizado Especial Criminal (Lei 9.099/95, arts. 60 a 92): queixa-crime, composição civil, transação penal, defesa e recurso inominado. Não use para o JEC cível nem para o rito penal comum (CPP). Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na Lei nº 9.099/95 (rito criminal)",
  rotuloPoloAtivo: "querelante",
  rotuloPoloPassivo: "acusado / querelado",
  rotuloNav: "Área JECRIM",
};

export const MODULO_CRIMINAL: AreaModuloConfig = {
  id: "criminal",
  tituloDashboard: "Direito Penal (rito comum)",
  leiResumo: "CP · CPP",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["habeas-corpus", "revisao-criminal"],
  copyCabecalho:
    "Peças na Justiça Penal comum (CP e CPP): habeas corpus, resposta à acusação, alegações finais, apelação criminal. Não use JECRIM (9.099) nem contestação cível. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Penal e no Código de Processo Penal",
  rotuloPoloAtivo: "paciente / impetrante",
  rotuloPoloPassivo: "acusado",
  rotuloNav: "Área Penal",
};

export const MODULO_PREVIDENCIARIO: AreaModuloConfig = {
  id: "previdenciario",
  tituloDashboard: "Direito Previdenciário",
  leiResumo: "Lei 8.213/91 · JEF",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Peças previdenciárias (Lei 8.213/91): concessão, restabelecimento e revisão contra o INSS no JEF ou na Vara Federal. Não invente NB nem RMI. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na legislação previdenciária",
  rotuloPoloAtivo: "segurado / autor",
  rotuloPoloPassivo: "INSS",
  rotuloNav: "Área Previdenciário",
};

export const MODULO_TRIBUTARIO: AreaModuloConfig = {
  id: "tributario",
  tituloDashboard: "Direito Tributário",
  leiResumo: "CTN · Lei 6.830/80",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial", "mandado-seguranca"],
  copyCabecalho:
    "Peças tributárias: embargos à execução fiscal (LEF), exceção de pré-executividade, anulatória, repetição e mandado de segurança. Não confunda com execução cível. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no CTN e na legislação tributária",
  rotuloPoloAtivo: "contribuinte / executado",
  rotuloPoloPassivo: "Fazenda Pública",
  rotuloNav: "Área Tributário",
};

export const MODULO_ADMINISTRATIVO: AreaModuloConfig = {
  id: "administrativo",
  tituloDashboard: "Direito Administrativo",
  leiResumo: "Lei 12.016/09 · CPC",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["mandado-seguranca", "peticao-inicial"],
  copyCabecalho:
    "Peças de Direito Administrativo e Fazenda Pública: mandado de segurança (120 dias), anulação de ato, licitação. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no direito administrativo e na Lei 12.016/09",
  rotuloPoloAtivo: "impetrante / autor",
  rotuloPoloPassivo: "autoridade coatora / ente público",
  rotuloNav: "Área Administrativo",
};

export const MODULO_EMPRESARIAL: AreaModuloConfig = {
  id: "empresarial",
  tituloDashboard: "Direito Empresarial",
  leiResumo: "CC · Lei 6.404/76",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial", "notificacao-extrajudicial"],
  copyCabecalho:
    "Peças empresariais: notificação extrajudicial, dissolução, obrigações societárias. Distinga notificação de ação. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no direito de empresa e no CPC",
  rotuloPoloAtivo: "autor / sócio",
  rotuloPoloPassivo: "réu / sociedade",
  rotuloNav: "Área Empresarial",
};

export const MODULO_DIGITAL: AreaModuloConfig = {
  id: "digital",
  tituloDashboard: "Direito Digital e LGPD",
  leiResumo: "LGPD · CPC",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Peças de Direito Digital e LGPD. Crimes digitais: use o módulo Penal. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na LGPD e no CPC",
  rotuloPoloAtivo: "titular / autor",
  rotuloPoloPassivo: "controlador / réu",
  rotuloNav: "Área Digital",
};

export const MODULO_AMBIENTAL: AreaModuloConfig = {
  id: "ambiental",
  tituloDashboard: "Direito Ambiental",
  leiResumo: "Lei 6.938/81 · ACP",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["acp-ambiental", "peticao-inicial"],
  copyCabecalho:
    "Peças ambientais: ACP, defesa de auto de infração, obrigação de fazer. Não invente licença nem auto. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na legislação ambiental",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu / poluidor",
  rotuloNav: "Área Ambiental",
};

export const MODULO_PI: AreaModuloConfig = {
  id: "propriedade-intelectual",
  tituloDashboard: "Propriedade Intelectual",
  leiResumo: "LPI · LDA",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["abstencao-marca", "peticao-inicial"],
  copyCabecalho:
    "Peças de marcas, patentes e direitos autorais. Não invente registro no INPI. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na LPI e na LDA",
  rotuloPoloAtivo: "titular / autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área PI",
};

export const MODULO_INTERNACIONAL: AreaModuloConfig = {
  id: "internacional",
  tituloDashboard: "Direito Internacional",
  leiResumo: "STJ · CPC · LINDB",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["homologacao", "peticao-inicial"],
  copyCabecalho:
    "Homologação de sentença estrangeira (STJ) e contencioso contratual internacional. Não invente tratado nem sentença. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no direito internacional privado e no CPC",
  rotuloPoloAtivo: "requerente / autor",
  rotuloPoloPassivo: "requerido / réu",
  rotuloNav: "Área Internacional",
};

export const MODULO_MEDICO: AreaModuloConfig = {
  id: "medico",
  tituloDashboard: "Direito Médico e da Saúde",
  leiResumo: "CC · CDC · conselhos",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Erro médico e demandas da saúde. Distinga responsabilidade civil de cobertura de plano (CDC). Não invente prontuário. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Código Civil e, quando couber, no CDC",
  rotuloPoloAtivo: "paciente / autor",
  rotuloPoloPassivo: "profissional / hospital / operadora",
  rotuloNav: "Área Médico",
};

export const MODULO_AGRARIO: AreaModuloConfig = {
  id: "agrario",
  tituloDashboard: "Direito Agrário",
  leiResumo: "Estatuto da Terra · CC",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["peticao-inicial"],
  copyCabecalho:
    "Contratos agrários, crédito rural e regularização. Não invente matrícula rural. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "no Estatuto da Terra e no Código Civil",
  rotuloPoloAtivo: "autor",
  rotuloPoloPassivo: "réu",
  rotuloNav: "Área Agrário",
};

export const MODULO_ELEITORAL: AreaModuloConfig = {
  id: "eleitoral",
  tituloDashboard: "Direito Eleitoral",
  leiResumo: "Código Eleitoral · Lei 9.504/97",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: ["representacao", "aije", "registro-candidatura"],
  copyCabecalho:
    "Representação, AIJE, registro de candidatura e defesa na Justiça Eleitoral. A base FACTO não indexa TRE/TSE — não invente julgado. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na legislação eleitoral",
  rotuloPoloAtivo: "representante / autor",
  rotuloPoloPassivo: "representado / réu",
  rotuloNav: "Área Eleitoral",
};

export const MODULO_CONSTITUCIONAL: AreaModuloConfig = {
  id: "constitucional",
  tituloDashboard: "Direito Constitucional",
  leiResumo: "CF/88 · Leis 9.868 · 9.882 · 12.016",
  href: HREF_CHAT_ASSISTENTE,
  idsPeticaoInicial: [
    "mandado-seguranca",
    "habeas-corpus",
    "habeas-data",
    "mandado-injuncao",
    "acao-popular",
    "reclamacao-constitucional",
    "adpf",
    "adi",
    "adc",
    "ado",
  ],
  copyCabecalho:
    "Remédios constitucionais (ativo e passivo), RE, reclamação e controle concentrado (CF/88). Distinga do Administrativo e do Penal. Revise sempre antes de protocolar.",
  fundamentoQualificacao: "na Constituição Federal e nas leis dos remédios constitucionais",
  rotuloPoloAtivo: "impetrante / recorrente / autor",
  rotuloPoloPassivo: "autoridade / recorrido / réu",
  rotuloNav: "Área Constitucional",
};

export type AreaIdMinuta =
  | "jec"
  | "consumidor"
  | "civil"
  | "trabalhista"
  | "familia"
  | "imobiliario"
  | "jecr"
  | "criminal"
  | "previdenciario"
  | "tributario"
  | "administrativo"
  | "empresarial"
  | "digital"
  | "ambiental"
  | "propriedade-intelectual"
  | "internacional"
  | "medico"
  | "agrario"
  | "eleitoral"
  | "constitucional";

const MODULOS: Record<string, AreaModuloConfig> = {
  jec: MODULO_JEC,
  consumidor: MODULO_CONSUMIDOR,
  civil: MODULO_CIVIL,
  trabalhista: MODULO_TRABALHISTA,
  familia: MODULO_FAMILIA,
  imobiliario: MODULO_IMOBILIARIO,
  jecr: MODULO_JECR,
  criminal: MODULO_CRIMINAL,
  previdenciario: MODULO_PREVIDENCIARIO,
  tributario: MODULO_TRIBUTARIO,
  administrativo: MODULO_ADMINISTRATIVO,
  empresarial: MODULO_EMPRESARIAL,
  digital: MODULO_DIGITAL,
  ambiental: MODULO_AMBIENTAL,
  "propriedade-intelectual": MODULO_PI,
  internacional: MODULO_INTERNACIONAL,
  medico: MODULO_MEDICO,
  agrario: MODULO_AGRARIO,
  eleitoral: MODULO_ELEITORAL,
  constitucional: MODULO_CONSTITUCIONAL,
};

const IDS_MINUTA = new Set(Object.keys(MODULOS));

export function normalizarAreaIdMinuta(raw?: string | null): AreaIdMinuta {
  const id = String(raw ?? "").trim();
  if (IDS_MINUTA.has(id) && id !== "jec") return id as AreaIdMinuta;
  return "jec";
}

export function areaIdFromPathname(pathname: string): AreaIdMinuta {
  const partes = pathname.split("/").filter(Boolean);
  const i = partes.indexOf("dashboard");
  if (i < 0) return "jec";
  const prox = partes[i + 1];
  if (prox === "chat") return "jec";
  if (prox === "preview") return normalizarAreaIdMinuta(partes[i + 2]);
  return normalizarAreaIdMinuta(prox);
}

export function moduloDaArea(areaId: string): AreaModuloConfig {
  return MODULOS[areaId] ?? MODULO_JEC;
}

export function hrefMinutaSeExistir(areaId: string): string | undefined {
  return MODULOS[areaId]?.href;
}

/** MLE (levantamento de depósito) não cabe em Penal, JECRIM, Eleitoral nem Constitucional. */
export function areaMostraMle(areaId: string): boolean {
  return (
    areaId !== "criminal" &&
    areaId !== "jecr" &&
    areaId !== "eleitoral" &&
    areaId !== "constitucional"
  );
}

/** Justiça gratuita cabe em qualquer juízo; some só em notificação pura se um dia existir módulo extra. */
export function areaMostraJusticaGratuita(_areaId: string): boolean {
  return true;
}

export function placeholderForoDaArea(areaId: string): string {
  switch (areaId) {
    case "trabalhista":
      return "Ex.: 2ª Vara do Trabalho de Campinas/SP";
    case "familia":
      return "Ex.: Vara de Família e Sucessões de Campinas/SP";
    case "jecr":
      return "Ex.: Juizado Especial Criminal de Campinas/SP";
    case "criminal":
      return "Ex.: 1ª Vara Criminal de Campinas/SP";
    case "previdenciario":
      return "Ex.: JEF / Vara Federal de Campinas/SP";
    case "tributario":
    case "administrativo":
      return "Ex.: Vara da Fazenda Pública de Campinas/SP";
    case "eleitoral":
      return "Ex.: 12ª Zona Eleitoral de Campinas/SP";
    case "constitucional":
      return "Ex.: STF / STJ / Vara Federal de Campinas/SP";
    case "internacional":
      return "Ex.: STJ — homologação de sentença estrangeira";
    case "jec":
      return "Ex.: Juizado Especial Cível de Guarulhos/SP";
    default:
      return "Ex.: Vara Cível de Campinas/SP";
  }
}

export function foroLegadoDaArea(
  areaId: string,
  cidade: string,
  uf: string,
  numeroVara?: string
): string {
  const local = `${cidade}${uf ? `/${uf}` : ""}`;
  const n = numeroVara?.trim();
  switch (areaId) {
    case "trabalhista":
      return n ? `${n}ª Vara do Trabalho de ${local}` : `Vara do Trabalho de ${local}`;
    case "familia":
      return n
        ? `${n}ª Vara de Família e Sucessões de ${local}`
        : `Vara de Família e Sucessões de ${local}`;
    case "jecr":
      return n
        ? `${n}ª Vara do Juizado Especial Criminal de ${local}`
        : `Juizado Especial Criminal de ${local}`;
    case "criminal":
      return n ? `${n}ª Vara Criminal de ${local}` : `Vara Criminal de ${local}`;
    case "previdenciario":
      return n
        ? `${n}ª Vara do JEF de ${local}`
        : `Juizado Especial Federal de ${local}`;
    case "tributario":
    case "administrativo":
      return n
        ? `${n}ª Vara da Fazenda Pública de ${local}`
        : `Vara da Fazenda Pública de ${local}`;
    case "constitucional":
      return n
        ? `${n}ª Vara / juízo constitucional de ${local}`
        : `Juízo constitucional competente em ${local}`;
    case "internacional":
      return "Superior Tribunal de Justiça — homologação / cooperação jurídica";
    case "eleitoral":
      return n ? `${n}ª Zona Eleitoral de ${local}` : `Zona Eleitoral de ${local}`;
    case "jec":
      return n
        ? `${n}ª Vara do Juizado Especial Cível de ${local}`
        : `Juizado Especial Cível de ${local}`;
    default:
      return n ? `${n}ª Vara Cível de ${local}` : `Vara Cível de ${local}`;
  }
}

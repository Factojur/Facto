/**
 * Detecção e injeção da inversão do ônus da prova (subtópico de DO DIREITO).
 */

export type AvaliacaoInversaoOnus = {
  cabivel: boolean;
  confianca: "alta" | "media" | "baixa";
  subtitulo: string;
  paragrafo: string;
  basesLegais: string[];
  motivo: string;
};

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function contem(texto: string, termos: string[]): boolean {
  const t = norm(texto);
  return termos.some((termo) => t.includes(norm(termo)));
}

const TERMOS_CONSUMO = [
  "consumidor",
  "fornecedor",
  "cdc",
  "código de defesa do consumidor",
  "relação de consumo",
  "relacao de consumo",
  "vício",
  "vicio",
  "defeito",
  "produto",
  "serviço",
  "servico",
  "operadora",
  "telefonia",
  "plano de saúde",
  "plano de saude",
  "seguro",
  "e-commerce",
  "marketplace",
  "voo",
  "passagem",
  "hotel",
  "reserva",
];

const TERMOS_HIPOSSUF_TECNICA = [
  "banco",
  "instituição financeira",
  "instituicao financeira",
  "fintech",
  "cartão",
  "cartao",
  "conta corrente",
  "pix",
  "transferência",
  "transferencia",
  "log",
  "sistema interno",
  "extrato",
  "operadora",
  "hospital",
  "laboratório",
  "laboratorio",
  "clínica",
  "clinica",
  "golpe",
  "fraude",
  "clonagem",
  "estelionato",
];

const AREAS_CONSUMO = new Set([
  "consumidor",
  "jec",
  "digital",
]);

const ESPECIES_SEM_INVERSAO = new Set([
  "embargos",
  "agravo",
  "recurso",
  "apelacao",
  "apelação",
  "execucao",
  "execução",
  "cumprimento",
]);

function paragrafoCdc(params: {
  hipossuficiencia: "tecnica" | "geral";
  contexto?: string;
}): string {
  const base =
    params.hipossuficiencia === "tecnica"
      ? "Diante da hipossuficiência técnica da parte autora frente à requerida — detentora dos registros, sistemas e documentação interna —"
      : "Tratando-se de relação de consumo e verificada a hipossuficiência do consumidor frente ao fornecedor,";

  return (
    `${base} impõe-se a inversão do ônus da prova, nos termos do art. 6º, VIII, do Código de Defesa do Consumidor, ` +
    "com fundamento subsidiário no art. 373, §1º, do Código de Processo Civil, a fim de que a parte requerida " +
    "demonstre a regularidade da prestação, a inexistência de falha ou fato impeditivo do direito alegado, " +
    "especialmente quanto aos elementos probatórios sob sua guarda exclusiva ou de acesso privilegiado."
  );
}

function paragrafoAmbiental(): string {
  return (
    "Em demandas de responsabilidade por degradação ambiental, a jurisprudência do Superior Tribunal de Justiça " +
    "admite a inversão do ônus da prova (Súmula 618/STJ), cabendo ao réu demonstrar a licitude do empreendimento " +
    "e a inexistência de nexo causal, quando presentes verossimilhança e hipossuficiência técnica do autor."
  );
}

function paragrafoTrabalhista(): string {
  return (
    "No processo do trabalho, o empregador detém a documentação essencial da relação (controles de jornada, " +
    "recibos, registros internos). Diante da dificuldade de produção probatória pelo empregado e da posição " +
    "de guarda dos meios de prova pela reclamada, impõe-se inverter o ônus quanto aos fatos impeditivos, " +
    "modificativos ou extintivos do direito postulado, nos termos do art. 818, §1º, da CLT, c/c art. 373, §1º, do CPC."
  );
}

/**
 * Avalia se cabe subtópico “Da inversão do ônus da prova” em DO DIREITO.
 */
export function avaliarInversaoOnusProva(params: {
  areaId: string;
  fatos: string;
  tipoAcao: string;
  especiePeca?: string | null;
  poloAdvocacia?: "ativo" | "passivo" | null;
}): AvaliacaoInversaoOnus | null {
  const fatos = params.fatos.trim();
  const tipo = params.tipoAcao.trim();
  if (fatos.length < 20 && tipo.length < 8) return null;

  const blob = `${fatos}\n${tipo}`;
  const area = params.areaId || "jec";
  const especie = (params.especiePeca ?? "").toLowerCase();

  if (ESPECIES_SEM_INVERSAO.has(especie)) return null;
  if (params.poloAdvocacia === "passivo") return null;

  const relacaoConsumo =
    AREAS_CONSUMO.has(area) ||
    contem(blob, TERMOS_CONSUMO) ||
    contem(blob, TERMOS_HIPOSSUF_TECNICA);

  const hipossufTecnica = contem(blob, TERMOS_HIPOSSUF_TECNICA);
  const ambiental =
    area === "ambiental" ||
    contem(blob, ["degradação ambiental", "degradacao ambiental", "dano ambiental", "licença ambiental"]);
  const trabalhista =
    area === "trabalhista" ||
    contem(blob, ["reclamante", "reclamada", "empregador", "empregado", "clt", "verbas rescisórias", "horas extras"]);

  if (ambiental) {
    return {
      cabivel: true,
      confianca: "alta",
      subtitulo: "Da inversão do ônus da prova",
      paragrafo: paragrafoAmbiental(),
      basesLegais: ["Súmula 618/STJ", "Art. 373, §1º, CPC"],
      motivo: "Ação ambiental — súmula e hipossuficiência técnica.",
    };
  }

  if (trabalhista && contem(blob, ["horas extras", "jornada", "registro", "holerite", "ctps", "verbas"])) {
    return {
      cabivel: true,
      confianca: "media",
      subtitulo: "Da inversão do ônus da prova",
      paragrafo: paragrafoTrabalhista(),
      basesLegais: ["Art. 818, §1º, CLT", "Art. 373, §1º, CPC"],
      motivo: "Trabalhista — documentação sob guarda do empregador.",
    };
  }

  if (relacaoConsumo) {
    const confianca: AvaliacaoInversaoOnus["confianca"] =
      hipossufTecnica && contem(blob, TERMOS_CONSUMO)
        ? "alta"
        : hipossufTecnica || area === "consumidor"
          ? "media"
          : "baixa";

    if (confianca === "baixa" && area !== "consumidor") {
      return null;
    }

    return {
      cabivel: true,
      confianca,
      subtitulo: "Da inversão do ônus da prova",
      paragrafo: paragrafoCdc({
        hipossuficiencia: hipossufTecnica ? "tecnica" : "geral",
      }),
      basesLegais: ["Art. 6º, VIII, CDC", "Art. 373, §1º, CPC"],
      motivo: hipossufTecnica
        ? "Relação de consumo com hipossuficiência técnica."
        : "Relação de consumo — art. 6º, VIII, CDC.",
    };
  }

  return null;
}

export function blocoInstrucaoInversaoOnus(
  av: AvaliacaoInversaoOnus | null
): string {
  if (!av?.cabivel) return "";
  return [
    "",
    "INVERSÃO DO ÔNUS DA PROVA (DETERMINÍSTICO — subtópico em DO DIREITO, NÃO em DAS PROVAS):",
    `Inclua obrigatoriamente o subtópico em negrito: **${av.subtitulo}**`,
    "Parágrafo a desenvolver (adapte aos fatos, sem inventar):",
    av.paragrafo,
    `Bases: ${av.basesLegais.join("; ")}.`,
    `Confiança do sistema: ${av.confianca} (${av.motivo}).`,
  ].join("\n");
}

/** Garante subtópico na peça se a IA omitiu. */
export function injetarInversaoOnusProva(
  peca: string,
  av: AvaliacaoInversaoOnus | null
): string {
  if (!av?.cabivel) return peca;
  if (/invers[aã]o\s+do\s+[ôo]nus\s+da\s+prova/i.test(peca)) return peca;

  let texto = peca.replace(/\r\n/g, "\n");
  const bloco = `**${av.subtitulo}**\n${av.paragrafo}`;

  if (/Ante o conjunto normativo/i.test(texto)) {
    return texto.replace(
      /(\n)(Ante o conjunto normativo)/i,
      `\n${bloco}\n\n$2`
    );
  }

  if (/\n[IVXLCDM]+\s*[-—–.]\s*DO VALOR DA CAUSA/i.test(texto)) {
    return texto.replace(
      /\n([IVXLCDM]+\s*[-—–.]\s*DO VALOR DA CAUSA)/i,
      `\n${bloco}\n\n$1`
    );
  }

  if (/\n[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS/i.test(texto)) {
    return texto.replace(
      /\n([IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS)/i,
      `\n${bloco}\n\n$1`
    );
  }

  return `${texto.trim()}\n\n${bloco}`;
}

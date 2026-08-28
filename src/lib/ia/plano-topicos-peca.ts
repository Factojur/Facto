/**
 * Plano de tópicos da triagem estratégica — títulos obrigatórios para o Redator.
 */

export type TopicoPlanejado = {
  romano: string;
  titulo: string;
  subtitulos: string[];
};

const RE_SECAO_PLANO =
  /(?:^|\n)\s*(?:\d+\.\s*)?PLANO\s+DE\s+T[ÓO]PICOS[^\n]*\n([\s\S]*?)(?=\n\s*\d+\.\s|\n\s*PEDIDOS\s+ESSENCIAIS|\n\s*RISCOS|\n\s*S[ÚU]MULAS|\n\s*VALORES|\Z)/i;

const RE_TOPICO_ROMANO =
  /^(?:([IVXLC]+)\s*[\.\)\-–—]?\s*)?(.+)$/i;

const RE_SUBTOPICO = /^([a-z])\)\s*(.+)$/i;

/** Extrai o plano de tópicos do texto da triagem estratégica. */
export function extrairPlanoTopicos(textoEstrategia: string): TopicoPlanejado[] {
  const bruto = textoEstrategia.trim();
  if (!bruto) return [];

  const secao = bruto.match(RE_SECAO_PLANO)?.[1] ?? bruto;
  const linhas = secao
    .split("\n")
    .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
    .filter((l) => l.length > 2);

  const topicos: TopicoPlanejado[] = [];
  let atual: TopicoPlanejado | null = null;

  for (const linha of linhas) {
    const sub = linha.match(RE_SUBTOPICO);
    if (sub && atual) {
      atual.subtitulos.push(sub[2].trim());
      continue;
    }

    const romMatch = linha.match(/^([IVXLC]+)\s*[\.\)\-–—]\s*(.+)$/i);
    if (romMatch) {
      if (atual) topicos.push(atual);
      atual = {
        romano: romMatch[1].toUpperCase(),
        titulo: romMatch[2].trim(),
        subtitulos: [],
      };
      continue;
    }

    const tituloMaiusculo =
      linha.length >= 6 &&
      linha === linha.toUpperCase() &&
      /[A-ZÁÉÍÓÚÃÕÇ]/.test(linha) &&
      !linha.startsWith("PLANO");
    if (tituloMaiusculo) {
      if (atual) topicos.push(atual);
      const rom = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][
        topicos.length
      ];
      atual = { romano: rom, titulo: linha, subtitulos: [] };
      continue;
    }

    const gen = linha.match(RE_TOPICO_ROMANO);
    if (gen?.[1] && gen[2] && gen[2].length >= 4) {
      if (atual) topicos.push(atual);
      atual = {
        romano: gen[1].toUpperCase(),
        titulo: gen[2].trim(),
        subtitulos: [],
      };
    }
  }

  if (atual) topicos.push(atual);
  return topicos.slice(0, 12);
}

export function topicosComoLista(topicos: TopicoPlanejado[]): string[] {
  return topicos.map((t) => {
    const base = `${t.romano}. ${t.titulo}`;
    if (!t.subtitulos.length) return base;
    return `${base} → ${t.subtitulos.map((s) => `(${s})`).join(", ")}`;
  });
}

/** Bloco injetado no prompt do Redator — títulos da triagem são obrigatórios. */
export function blocoPlanoTopicosParaRedator(
  topicos: TopicoPlanejado[],
  estruturaEspecie?: string | null
): string {
  if (!topicos.length) return "";

  const linhas = [
    "<PLANO_DE_TOPICOS_OBRIGATORIO>",
    "A triagem estratégica definiu os títulos abaixo. O Redator DEVE usá-los como tópicos romanos",
    "e subtítulos a)/b)/c) da peça — adaptando redação ao caso, sem trocar por títulos genéricos.",
    "Pode acrescentar subtópicos em DO DIREITO se a tese exigir; não remova nem renomeie os romanos.",
    "",
  ];

  for (const t of topicos) {
    linhas.push(`${t.romano}. ${t.titulo}`);
    for (const sub of t.subtitulos) {
      linhas.push(`   → subtópico: ${sub}`);
    }
  }

  if (estruturaEspecie?.trim()) {
    linhas.push(
      "",
      "Esqueleto forense da espécie (alinhar numeração romana; títulos do plano prevalecem):",
      estruturaEspecie.trim().slice(0, 1200)
    );
  }

  linhas.push("</PLANO_DE_TOPICOS_OBRIGATORIO>");
  return linhas.join("\n");
}

/** Reforça a estratégia com o plano de tópicos e pedidos para o Redator. */
export function enriquecerEstrategiaComPlano(params: {
  estrategia: string;
  topicos: TopicoPlanejado[];
  pedidosEssenciais?: string[];
  estruturaEspecie?: string | null;
  coberturaTeses?: string | null;
}): string {
  const blocoTopicos = blocoPlanoTopicosParaRedator(
    params.topicos,
    params.estruturaEspecie
  );
  const pedidos = (params.pedidosEssenciais ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 10);

  const partes = [blocoTopicos, params.coberturaTeses?.trim()].filter(Boolean);

  if (pedidos.length) {
    partes.push(
      [
        "<PEDIDOS_ESSENCIAIS_DA_TRIAGEM>",
        "Incorpore em DOS PEDIDOS (ou equivalente), com redação forense e objetiva:",
        ...pedidos.map((p, i) => `${String.fromCharCode(97 + i)}) ${p}`),
        "</PEDIDOS_ESSENCIAIS_DA_TRIAGEM>",
      ].join("\n")
    );
  }

  if (!partes.length) return params.estrategia.trim();
  return `${partes.join("\n\n")}\n\n${params.estrategia.trim()}`;
}

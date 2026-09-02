/**
 * Plano de tópicos da triagem estratégica — títulos obrigatórios para o Redator.
 */

export type TipoLastroTopico =
  | "relato"
  | "anexo"
  | "tese"
  | "juris"
  | "rito"
  | "lei"
  | "pedido";

export type LastroTopicoItem = {
  tipo: TipoLastroTopico;
  ref: string;
};

export type TopicoPlanejado = {
  romano: string;
  titulo: string;
  subtitulos: string[];
  /** Encaixe ao caso (fato + consequência jurídica). */
  encaixe?: string;
  /** Fontes estruturadas — camada B (LASTRO: na triagem) + complemento local. */
  lastro?: LastroTopicoItem[];
};

const RE_LASTRO_LINHA = /^lastro\s*:\s*(.+)$/i;
const RE_ENCAIXE_LINHA = /^encaixe\s*:\s*(.+)$/i;

function inferirTipoLastro(token: string): TipoLastroTopico {
  const t = token.toLowerCase().trim();
  if (/^fls?\.?\s*\d/i.test(t) || t.includes("anexo") || t.includes("folha")) {
    return "anexo";
  }
  if (t === "relato" || t.includes("narrativa") || t.includes("fatos do")) {
    return "relato";
  }
  if (
    t.includes("juris") ||
    /tjsp|stj|stf|tj[a-z]{2}/i.test(t) ||
    t.includes("acordao") ||
    t.includes("acórdão") ||
    t.includes("sumula") ||
    t.includes("súmula")
  ) {
    return "juris";
  }
  if (/art\.|lei\s|cdc|cpc|cf|clt|§/i.test(t)) {
    return "lei";
  }
  if (t.startsWith("pedido")) {
    return "pedido";
  }
  if (t.startsWith("tese") || t.length >= 8) {
    return "tese";
  }
  return "rito";
}

/** Parseia linha LASTRO: relato | fls. 12 | tese X | juris Y */
export function parseLastroLinha(linha: string): LastroTopicoItem[] {
  const m = linha.trim().match(RE_LASTRO_LINHA);
  if (!m?.[1]) return [];
  return m[1]
    .split(/[|]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .map((ref) => ({
      tipo: inferirTipoLastro(ref),
      ref,
    }));
}

function mesclarLastro(
  atual: LastroTopicoItem[] | undefined,
  novos: LastroTopicoItem[]
): LastroTopicoItem[] {
  const vistos = new Set<string>();
  const out: LastroTopicoItem[] = [];
  for (const item of [...(atual ?? []), ...novos]) {
    const k = `${item.tipo}:${item.ref.toLowerCase()}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    out.push(item);
  }
  return out;
}

function processarLinhaAuxiliar(
  linha: string,
  atual: TopicoPlanejado | null
): boolean {
  if (!atual) return false;

  const enc = linha.match(RE_ENCAIXE_LINHA);
  if (enc?.[1]) {
    atual.encaixe = enc[1].trim();
    return true;
  }

  const lastro = parseLastroLinha(linha);
  if (lastro.length) {
    atual.lastro = mesclarLastro(atual.lastro, lastro);
    return true;
  }

  return false;
}

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
    if (processarLinhaAuxiliar(linha, atual)) continue;

    const sub = linha.match(RE_SUBTOPICO);
    if (sub && atual) {
      const textoSub = sub[2].trim();
      const encInline = textoSub.match(/^encaixe\s*:\s*(.+)$/i);
      if (encInline?.[1]) {
        atual.encaixe = encInline[1].trim();
      } else {
        atual.subtitulos.push(textoSub);
      }
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
      !linha.startsWith("PLANO") &&
      !/^\d+\.\s/.test(linha) &&
      !/^lastro\s*:/i.test(linha) &&
      !/^encaixe\s*:/i.test(linha);
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

/**
 * Normalização de parágrafos para peças forenses.
 * Corrige colagens com quebra de linha “suave” (Word/PDF) e divide
 * blocos longos em parágrafos retóricos legíveis.
 */

const TITULO_SECAO =
  /^([IVXLCDM]+)\s*[-—–.]\s+|^(DOS?\s+FATOS|DO\s+DIREITO|DOS?\s+PEDIDOS)/i;

function terminaFrase(texto: string): boolean {
  return /[.!?;:…]["»”']?\s*$/.test(texto.trim());
}

function pareceContinuacao(linha: string): boolean {
  const t = linha.trim();
  if (!t) return false;
  if (TITULO_SECAO.test(t)) return false;
  // Continua se começa minúscula, número, aspas ou conectivo típico
  return /^[a-záàâãéêíóôõúüç"'«(-\d]/.test(t);
}

function ehLinhaEstruturalPeca(linha: string): boolean {
  const t = linha.trim();
  if (!t) return false;
  if (/^\[\[ESPACO[_0-9A-Z|À-Ü\s.-]+\]\]$/i.test(t)) return true;
  if (/^([IVXLCDM]+)\s*[-—–.]\s+\S/i.test(t)) return true;
  if (/^[a-z]\)\s+\S/i.test(t)) return true;
  if (/^(Nestes termos|Termos em que),?\s*$/i.test(t)) return true;
  if (/^(pede deferimento|Pede deferimento|Pede e espera deferimento)\.?\s*$/i.test(t)) {
    return true;
  }
  if (/^em face de\b/i.test(t)) return true;
  if (/^OAB\//i.test(t) || /^Advogado$/i.test(t)) return true;
  return false;
}

/**
 * Junta linhas quebradas no meio da frase (quebra visual de editor)
 * e preserva parágrafo em linha em branco.
 * Nunca cola marcadores de espaçamento, tópicos, "em face de" ou fechamento.
 */
export function juntarQuebrasDeLinhaSuaves(texto: string): string {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  const paragrafos: string[] = [];
  let atual = "";

  for (const bruta of linhas) {
    const linha = bruta.replace(/\s+/g, " ").trim();
    if (!linha) {
      if (atual) {
        paragrafos.push(atual);
        atual = "";
      }
      continue;
    }

    if (ehLinhaEstruturalPeca(linha)) {
      if (atual) {
        paragrafos.push(atual);
        atual = "";
      }
      paragrafos.push(linha);
      continue;
    }

    if (atual && ehLinhaEstruturalPeca(atual)) {
      paragrafos.push(atual);
      atual = linha;
      continue;
    }

    if (!atual) {
      atual = linha;
      continue;
    }

    if (!terminaFrase(atual) && pareceContinuacao(linha)) {
      atual = `${atual} ${linha}`;
      continue;
    }

    // Hífen de continuação no fim da linha
    if (/[A-Za-zÀ-ÿ]-$/.test(atual) && /^[a-záàâãéêíóôõúüç]/.test(linha)) {
      atual = `${atual.slice(0, -1)}${linha}`;
      continue;
    }

    paragrafos.push(atual);
    atual = linha;
  }

  if (atual) paragrafos.push(atual);
  return paragrafos.join("\n\n");
}

/**
 * Divide texto muito longo em parágrafos de ~2–3 períodos,
 * típico da redação forense (clareza e respiração visual).
 */
export function dividirEmParagrafosRetoricos(
  texto: string,
  maxCaracteres = 780
): string[] {
  const limpo = texto.replace(/\s+/g, " ").trim();
  if (!limpo) return [];
  if (limpo.length <= maxCaracteres) return [limpo];

  const sentencas = limpo
    .split(/(?<=[.!?…])\s+(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ"«])/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentencas.length <= 1) return [limpo];

  const out: string[] = [];
  let buf = "";
  let count = 0;

  for (const s of sentencas) {
    const proximo = buf ? `${buf} ${s}` : s;
    if (buf && (proximo.length > maxCaracteres || count >= 3)) {
      out.push(buf);
      buf = s;
      count = 1;
    } else {
      buf = proximo;
      count += 1;
    }
  }
  if (buf) out.push(buf);
  return out;
}

/**
 * Prepara o texto dos fatos: frases seguidas viram parágrafos de 2–3 períodos
 * (justificado só aparece quando o bloco ocupa a largura da linha).
 */
export function normalizarTextoFatos(texto: string): string {
  return fundirFrasesEmParagrafos(texto);
}

function pareceCitacaoJurisLinha(t: string): boolean {
  if (/\[\[JURIS\]\]/i.test(t)) return true;
  const temTribunal = /\b(STJ|STF|TJ[A-Z]{2}|TRF\s*\d*|TST|TSE)\b/.test(t);
  const temClasse = /\b(REsp|AgRg|AgInt|ARE|HC|MS|EMENTA|Acórd[aã]o)\b/i.test(t);
  return temTribunal && temClasse;
}

function fundirFrasesEmParagrafos(texto: string): string {
  const unido = juntarQuebrasDeLinhaSuaves(texto);
  const linhas = unido
    .split(/\n/)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const out: string[] = [];
  let buf: string[] = [];
  const flush = () => {
    if (buf.length === 0) return;
    out.push(...dividirEmParagrafosRetoricos(buf.join(" ")));
    buf = [];
  };

  for (const linha of linhas) {
    if (
      ehLinhaEstruturalPeca(linha) ||
      pareceCitacaoJurisLinha(linha) ||
      linha.startsWith("- ")
    ) {
      flush();
      out.push(linha);
      continue;
    }
    buf.push(linha);
  }
  flush();
  return out.join("\n");
}

const RE_ROMANO_ITENS =
  /^[IVXLCDM]+\s*[-—–.]\s*(?:DOS?\s+PEDIDOS|DAS\s+PROVAS)\b/i;
const RE_ROMANO_QUALQUER = /^[IVXLCDM]+\s*[-—–.]\s+\S/i;
const RE_FECHO =
  /^(Nestes termos|Termos em que|Pede e espera deferimento|Pede deferimento)/i;

/**
 * Dentro de I - DOS FATOS, II - DO DIREITO, valor da causa etc.:
 * junta frases que a IA quebrou em linhas (cada uma termina com ponto)
 * para o justificado ocupar a largura da folha.
 * Não mexe em endereçamento, qualificação, pedidos, provas nem fechamento.
 */
export function normalizarCorpoDosTopicos(peca: string): string {
  const linhas = peca.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let modo: "pre" | "corpo" | "itens" = "pre";
  let buf: string[] = [];

  const flush = () => {
    if (buf.length === 0) return;
    out.push(...dividirEmParagrafosRetoricos(buf.join(" ")));
    buf = [];
  };

  for (const raw of linhas) {
    const t = raw.replace(/\s+/g, " ").trim();
    if (!t) continue;

    if (/^\[\[ESPACO/i.test(t)) {
      flush();
      out.push(t);
      continue;
    }

    if (RE_ROMANO_ITENS.test(t)) {
      flush();
      modo = "itens";
      out.push(t);
      continue;
    }

    if (RE_ROMANO_QUALQUER.test(t)) {
      flush();
      modo = "corpo";
      out.push(t);
      continue;
    }

    if (RE_FECHO.test(t) || /^OAB\//i.test(t) || /^Advogado$/i.test(t)) {
      flush();
      modo = "pre";
      out.push(t);
      continue;
    }

    if (modo !== "corpo") {
      out.push(t);
      continue;
    }

    if (
      ehLinhaEstruturalPeca(t) ||
      pareceCitacaoJurisLinha(t) ||
      t.startsWith("- ")
    ) {
      flush();
      out.push(t);
      continue;
    }

    buf.push(t);
  }
  flush();
  return out.join("\n");
}

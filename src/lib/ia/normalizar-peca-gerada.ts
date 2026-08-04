/**
 * Pós-processamento da peça gerada pela IA:
 * - estrutura/espaçamento rígidos (tópicos romanos + subtópicos a)/b))
 * - sem separadores --- / _ / ***
 * - 6 quebras após endereçamento; \\n\\n após nome da ação antes de "em face de"
 * - normalização leve da linha OAB/[UF] [Número]
 */

import { MARCADOR_ESPACO_ENDEREÇAMENTO } from "@/lib/formatacao-forense";
import {
  juntarQuebrasDeLinhaSuaves,
  normalizarTextoFatos,
} from "@/lib/peca-paragrafos";

const PADRAO_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+DE\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+)/i;

function ehLinhaEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

function ehTopicoPrincipal(t: string): boolean {
  return /^([IVXLCDM]+)\s*[-—–.]\s+\S/i.test(t.trim());
}

function ehSubtopico(t: string): boolean {
  return /^[a-z]\)\s+\S/i.test(t.trim());
}

function ehSeparadorDecorativo(t: string): boolean {
  const s = t.trim();
  if (!s) return true;
  if (/^[-—–_*•=]{2,}$/.test(s)) return true;
  if (s === "*" || s === "-" || s === "—" || s === "_") return true;
  return false;
}

function ehTituloSecao(t: string): boolean {
  return ehTopicoPrincipal(t) || ehSubtopico(t);
}

function ehNomeAcaoStandalone(t: string): boolean {
  const limpo = t.replace(/\s+/g, " ").trim();
  if (limpo.length < 8 || limpo.length > 160) return false;
  if (ehTituloSecao(limpo) || ehLinhaEnderecamento(limpo)) return false;
  const maiusculas =
    limpo === limpo.toUpperCase() || PADRAO_NOME_ACAO.test(limpo);
  return maiusculas && PADRAO_NOME_ACAO.test(limpo);
}

function ehInicioQualificacao(t: string): boolean {
  return (
    /\bvem,?\s/i.test(t) ||
    /\bpropor a presente\b/i.test(t) ||
    /\binscrit[oa]\s+no\s+CPF\b/i.test(t) ||
    /\bportador\(a\)\s+do\s+RG\b/i.test(t) ||
    /^\[[^\]]*(NOME|AUTOR)/i.test(t)
  );
}

function ehInicioQualificacaoReu(t: string): boolean {
  return /^\s*em face de\b/i.test(t);
}

function ehMarcadorEspaco(t: string): boolean {
  return (
    t.trim() === MARCADOR_ESPACO_ENDEREÇAMENTO ||
    t.trim() === "[[ESPACO_10_LINHAS_APOS_ENDEREÇAMENTO]]"
  );
}

/**
 * Remove o nome da ação que a IA coloca logo abaixo do endereçamento.
 * Mantém o que aparece após "propor a presente" (entre as qualificações).
 */
export function removerTituloAcaoAposEnderecamento(texto: string): string {
  const linhas = texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim());

  const saida: string[] = [];
  let viuEnderecamento = false;
  let entrouQualificacao = false;

  for (const raw of linhas) {
    if (!raw) {
      if (saida.length > 0 && saida[saida.length - 1] !== "") {
        saida.push("");
      }
      continue;
    }

    if (ehSeparadorDecorativo(raw)) {
      continue;
    }

    if (ehMarcadorEspaco(raw)) {
      saida.push(MARCADOR_ESPACO_ENDEREÇAMENTO);
      continue;
    }

    if (ehLinhaEnderecamento(raw)) {
      viuEnderecamento = true;
      saida.push(raw);
      continue;
    }

    if (!entrouQualificacao && ehInicioQualificacao(raw)) {
      entrouQualificacao = true;
      saida.push(raw);
      continue;
    }

    if (
      viuEnderecamento &&
      !entrouQualificacao &&
      ehNomeAcaoStandalone(raw)
    ) {
      continue;
    }

    if (
      saida.length > 0 &&
      ehNomeAcaoStandalone(raw) &&
      ehNomeAcaoStandalone(saida[saida.length - 1]!)
    ) {
      continue;
    }

    saida.push(raw);
  }

  return saida.join("\n");
}

/**
 * Normaliza títulos e aplica espaçamento rígido:
 * - \\n entre parágrafos do mesmo tópico/subtópico
 * - \\n\\n só antes de tópico romano, subtópico a)/b)/c), nome da ação ou "em face de"
 */
function aplicarEspacamentoRigido(texto: string): string {
  let t = texto.replace(/\r\n/g, "\n").trim();

  t = t.replace(/^#{1,6}\s+/gm, "");

  // Normaliza "I — DOS FATOS" / "I. DOS FATOS" → "I - DOS FATOS"
  t = t.replace(
    /^([IVXLCDM]+)\s*[.\-–—:]\s+/gim,
    (_m, romanos: string) => `${String(romanos).toUpperCase()} - `
  );

  // Une "I -" sozinho + resto na linha seguinte
  t = t.replace(
    /^([IVXLCDM]+ -)\n+(.+)$/gim,
    (_m, titulo: string, resto: string) => `${titulo} ${resto}`
  );

  const linhas = t
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l && !ehSeparadorDecorativo(l));

  if (linhas.length === 0) return "";

  const saida: string[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]!;
    if (i === 0) {
      saida.push(linha);
      continue;
    }

    const precisaEspacoDuplo =
      ehTopicoPrincipal(linha) ||
      ehSubtopico(linha) ||
      ehNomeAcaoStandalone(linha);
    // "em face de" NÃO recebe só \\n\\n — o marcador de 6 quebras é inserido depois.

    saida.push(precisaEspacoDuplo ? `\n${linha}` : linha);
  }

  return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function deduplicarLinhasConsecutivas(texto: string): string {
  const linhas = texto.split("\n");
  const saida: string[] = [];
  let anteriorNorm = "";

  for (const linha of linhas) {
    if (!linha.trim()) {
      if (saida.length > 0 && saida[saida.length - 1] !== "") {
        saida.push("");
      }
      continue;
    }

    const norm = linha
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (norm && norm === anteriorNorm) continue;

    if (
      anteriorNorm.length > 80 &&
      norm.length > 80 &&
      (norm.includes(anteriorNorm) || anteriorNorm.includes(norm))
    ) {
      if (norm.length > anteriorNorm.length && saida.length > 0) {
        for (let i = saida.length - 1; i >= 0; i--) {
          if (saida[i]!.trim()) {
            saida[i] = linha;
            break;
          }
        }
        anteriorNorm = norm;
      }
      continue;
    }

    saida.push(linha);
    anteriorNorm = norm;
  }

  return saida.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Insere o marcador de 6 quebras entre o último bloco de endereçamento
 * e o início da qualificação do Autor.
 */
export function inserirEspacoAposEnderecamento(texto: string): string {
  const linhas = texto.split("\n").filter((l) => !ehMarcadorEspaco(l));

  const saida: string[] = [];
  let inseriu = false;

  for (let i = 0; i < linhas.length; i++) {
    const b = linhas[i]!;
    const proximo = linhas.slice(i + 1).find((l) => l.trim());

    saida.push(b);

    if (
      !inseriu &&
      b.trim() &&
      ehLinhaEnderecamento(b) &&
      proximo &&
      !ehLinhaEnderecamento(proximo)
    ) {
      while (saida.length > 0 && saida[saida.length - 1] === "") {
        saida.pop();
      }
      saida.push(MARCADOR_ESPACO_ENDEREÇAMENTO);
      inseriu = true;
      while (i + 1 < linhas.length && !linhas[i + 1]!.trim()) {
        i++;
      }
    }
  }

  return saida.join("\n");
}

/**
 * Garante 6 quebras (mesmo marcador forense) entre o nome da ação e "em face de...".
 */
export function inserirEspacoAposNomeAcao(texto: string): string {
  const linhas = texto.split("\n");
  const saida: string[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const b = linhas[i]!;
    saida.push(b);

    if (!b.trim() || ehMarcadorEspaco(b) || !ehNomeAcaoStandalone(b.trim())) {
      continue;
    }

    let j = i + 1;
    while (
      j < linhas.length &&
      (!linhas[j]!.trim() || ehMarcadorEspaco(linhas[j]!))
    ) {
      j++;
    }

    const proximo = linhas[j];
    if (proximo && ehInicioQualificacaoReu(proximo)) {
      saida.push(MARCADOR_ESPACO_ENDEREÇAMENTO);
      while (
        i + 1 < linhas.length &&
        (!linhas[i + 1]!.trim() || ehMarcadorEspaco(linhas[i + 1]!))
      ) {
        i++;
      }
    }
  }

  return saida.join("\n");
}

/** Normaliza "OAB/SP123456" → "OAB/SP 147099". */
function normalizarLinhaOab(texto: string): string {
  return texto.replace(
    /^OAB\/\s*([A-Za-z]{2})\s*[-/]?\s*(\d[\d.]*\d|\d+)\s*$/gim,
    (_m, uf: string, numero: string) =>
      `OAB/${String(uf).toUpperCase()} ${numero.replace(/\./g, "")}`
  );
}

/** Fecha a peça no formato rígido de assinatura FACTO. */
function normalizarFechamentoAssinatura(texto: string): string {
  return texto
    .replace(/^Pede deferimento\.?\s*$/gim, "Pede e espera deferimento.")
    .replace(/^Nome:\s*/gim, "")
    .replace(/^OAB:\s*(?=OAB\/)/gim, "")
    .replace(/^OAB:\s*([A-Za-z]{2})\s*[-/]?\s*/gim, "OAB/$1 ");
}

/** Detecta fundamentação genérica típica do template antigo de reserva. */
export function pecaTemFundamentacaoGenerica(texto: string): boolean {
  return (
    /plausibilidade do direito invocado/i.test(texto) ||
    /necessidade de\s+interven[cç][aã]o do Poder Judici[aá]rio para restabelecer/i.test(
      texto
    ) ||
    (/privilegiando a oralidade/i.test(texto) &&
      /simplicidade, informalidade, economia processual/i.test(texto) &&
      !/art\.\s*14 do CDC/i.test(texto) &&
      !/S[uú]mula\s*479/i.test(texto))
  );
}

/** Remove linhas/trechos de separador --- gerados pela IA. */
function removerSeparadoresMarkdown(texto: string): string {
  return texto
    .replace(/^---$/gm, "")
    .replace(/---/g, "")
    .replace(/^\*{3,}$/gm, "")
    .replace(/^_{3,}$/gm, "");
}

/** Reaplica divisão retórica só em DOS FATOS (1 linha = 1 parágrafo). */
function normalizarSecaoFatos(texto: string): string {
  return texto.replace(
    /I\s*[-—–]\s*DOS FATOS\n+[\s\S]*?(?=\n+II\s*[-—–]\s*DO DIREITO)/i,
    (match) => {
      const corpo = match.replace(/^I\s*[-—–]\s*DOS FATOS\n+/i, "");
      return `I - DOS FATOS\n${normalizarTextoFatos(corpo)}`;
    }
  );
}

/** Pipeline completo aplicado à saída da IA antes de HTML/PDF/Word. */
export function normalizarPecaGerada(texto: string): string {
  let t = removerSeparadoresMarkdown(texto);
  t = juntarQuebrasDeLinhaSuaves(t);
  t = aplicarEspacamentoRigido(t);
  t = removerTituloAcaoAposEnderecamento(t);
  t = deduplicarLinhasConsecutivas(t);
  t = inserirEspacoAposEnderecamento(t);
  t = inserirEspacoAposNomeAcao(t);
  t = normalizarSecaoFatos(t);
  t = normalizarLinhaOab(t);
  t = normalizarFechamentoAssinatura(t);
  // Segunda passagem: a IA às vezes reinsere --- em títulos/tópicos
  t = removerSeparadoresMarkdown(t);
  return t.trim();
}

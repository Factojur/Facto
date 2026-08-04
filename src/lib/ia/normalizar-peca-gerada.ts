/**
 * Pós-processamento da peça gerada pela IA:
 * - estrutura/espaçamento rígidos (tópicos romanos + subtópicos a)/b))
 * - sem separadores --- / _ / ***
 * - 6 linhas após endereçamento; 1 linha após nome da ação; fechamento FACTO
 */

import {
  MARCADOR_ESPACO_1,
  MARCADOR_ESPACO_2,
  MARCADOR_ESPACO_6,
  parseMarcadorEspaco,
} from "@/lib/formatacao-forense";
import {
  juntarQuebrasDeLinhaSuaves,
  normalizarTextoFatos,
} from "@/lib/peca-paragrafos";
import { normalizarParagrafosDoDireito } from "@/lib/ia/mesclar-peca-hibrida";

const PADRAO_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA)/i;

function ehLinhaEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

function ehMarcadorEspaco(t: string): boolean {
  return parseMarcadorEspaco(t) !== null;
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
  const limpo = t
    .replace(/^\*\*/, "")
    .replace(/\*\*$/, "")
    .replace(/\s+/g, " ")
    .trim();
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

/** Remove "PETIÇÃO INICIAL —" do nome da ação (a peça já é a petição). */
function limparPrefixoPeticaoInicialNoNome(texto: string): string {
  return texto
    .split("\n")
    .map((linha) => {
      const t = linha.trim();
      if (!ehNomeAcaoStandalone(t) && !PADRAO_NOME_ACAO.test(t)) return linha;
      const limpo = t
        .replace(/^PETI[CÇ][AÃ]O\s+INICIAL\s*[—–\-:]?\s*/i, "")
        .trim();
      return limpo || linha;
    })
    .join("\n");
}

/**
 * Separa "II - DO DIREITO a) …" e "a) Título Corpo…" em linhas distintas.
 */
function separarTitulosESubtopicos(texto: string): string {
  const linhas = texto.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const raw of linhas) {
    let linha = raw.trim();
    if (!linha) {
      out.push("");
      continue;
    }

    // II - DO DIREITO a) Da tese…
    const coladoRomano =
      /^([IVXLCDM]+)\s*[-—–.]\s+(DO DIREITO)\s+([a-z]\))\s+(.+)$/i.exec(linha);
    if (coladoRomano) {
      out.push(
        `${coladoRomano[1]!.toUpperCase()} - ${coladoRomano[2]!.toUpperCase()}`
      );
      linha = `${coladoRomano[3]} ${coladoRomano[4]}`.trim();
    }

    // a) Título. Corpo…  OU  a) Da tese A presente…
    const sub = /^([a-z]\))\s+(.+)$/i.exec(linha);
    if (sub) {
      const letra = sub[1]!.toLowerCase();
      const resto = sub[2]!
        .replace(/^\*\*/, "")
        .replace(/\*\*$/, "")
        .trim();
      const splitPonto = /^(.{8,90}?)\.\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ].+)$/u.exec(resto);
      if (splitPonto) {
        out.push(`${letra} ${splitPonto[1]!.trim()}.`);
        out.push(splitPonto[2]!.trim());
        continue;
      }
      const splitTitulo =
        /^(Da|Do|Dos|Das)\s+(.{3,70}?)(?=\s+(A|O|Os|As|Ante|Presente|Trata|Imp[oõ]e|Resta|No|Na|Nos|Nas|Em|Com|Sob|Diante|Ora|Assim|Outrossim|Destarte|In|Há|Ha)\s)/iu.exec(
          resto
        );
      if (splitTitulo && resto.length > (splitTitulo[0]?.length ?? 0) + 20) {
        const titulo = `${splitTitulo[1]} ${splitTitulo[2]}`.trim();
        const corpo = resto.slice(titulo.length).trim();
        out.push(`${letra} ${titulo}`);
        if (corpo) out.push(corpo);
        continue;
      }
      out.push(`${letra} ${resto}`);
      continue;
    }

    out.push(linha);
  }

  return out.join("\n");
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
      saida.push(
        raw.trim().startsWith("[[ESPACO") ? raw.trim() : MARCADOR_ESPACO_6
      );
      continue;
    }

    // Marcador colado com texto (ex.: "[[ESPACO_1_LINHA]] em face de…")
    const marcadorColado = /^(\[\[ESPACO[^\]]+\]\])\s+(.+)$/i.exec(raw);
    if (marcadorColado) {
      saida.push(marcadorColado[1]!);
      const resto = marcadorColado[2]!.trim();
      if (resto) {
        if (!entrouQualificacao && ehInicioQualificacao(resto)) {
          entrouQualificacao = true;
        }
        saida.push(resto);
      }
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
 * - \\n\\n só antes de tópico romano, subtópico a)/b)/c), nome da ação
 */
function aplicarEspacamentoRigido(texto: string): string {
  let t = texto.replace(/\r\n/g, "\n").trim();

  t = t.replace(/^#{1,6}\s+/gm, "");

  t = t.replace(
    /^([IVXLCDM]+)\s*[.\-–—:]\s+/gim,
    (_m, romanos: string) => `${String(romanos).toUpperCase()} - `
  );

  // Une "I -" sozinho + resto na linha seguinte (mas NÃO se o resto for a)/b))
  t = t.replace(
    /^([IVXLCDM]+ -)\n+((?![a-z]\))\S.+)$/gim,
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
      saida.push(MARCADOR_ESPACO_6);
      inseriu = true;
      while (i + 1 < linhas.length && !linhas[i + 1]!.trim()) {
        i++;
      }
    }
  }

  return saida.join("\n");
}

/**
 * Garante 1 linha (marcador) entre o nome da ação e "em face de...".
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
      saida.push(MARCADOR_ESPACO_1);
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

/**
 * Fecha a peça no formato rígido:
 * Nestes termos, / pede deferimento. / (2 linhas) / data / (2 linhas) / assinatura
 */
function normalizarFechamentoAssinatura(texto: string): string {
  let t = texto
    .replace(/^Termos em que,?\s*$/gim, "Nestes termos,")
    .replace(/^Pede e espera deferimento\.?\s*$/gim, "pede deferimento.")
    .replace(/^Pede deferimento\.?\s*$/gim, "pede deferimento.")
    .replace(/^Nome:\s*/gim, "")
    .replace(/^OAB:\s*(?=OAB\/)/gim, "")
    .replace(/^OAB:\s*([A-Za-z]{2})\s*[-/]?\s*/gim, "OAB/$1 ");

  t = t.replace(
    /^(Nestes termos,)\s+(pede deferimento\.?)\s*$/gim,
    `$1\n$2`
  );

  const linhas = t.split("\n");
  const saida: string[] = [];
  let viuPede = false;

  for (let i = 0; i < linhas.length; i++) {
    const l = linhas[i]!;
    const trim = l.trim();

    if (/^pede deferimento\.?$/i.test(trim)) {
      saida.push("pede deferimento.");
      while (
        i + 1 < linhas.length &&
        (!linhas[i + 1]!.trim() || ehMarcadorEspaco(linhas[i + 1]!))
      ) {
        i++;
      }
      saida.push(MARCADOR_ESPACO_2);
      viuPede = true;
      continue;
    }

    if (viuPede && /^[A-Za-zÀ-ÿ' .]+\/\s*[A-Z]{2},\s+\d/i.test(trim)) {
      saida.push(trim);
      while (
        i + 1 < linhas.length &&
        (!linhas[i + 1]!.trim() || ehMarcadorEspaco(linhas[i + 1]!))
      ) {
        i++;
      }
      saida.push(MARCADOR_ESPACO_2);
      viuPede = false;
      continue;
    }

    saida.push(l);
  }

  return saida.join("\n");
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

/** Garante negrito Markdown só no título a)/b)/c) (não no corpo). */
function negritarSubtitulosDireito(texto: string): string {
  return texto
    .split("\n")
    .map((l) => {
      const t = l.trim();
      const m = /^(?:\*\*)?([a-z]\))\s+(.+?)(?:\*\*)?$/i.exec(t);
      if (!m) return l;
      const corpo = m[2]!.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
      if (corpo.length > 120) return l;
      return `**${m[1]!.toLowerCase()} ${corpo}**`;
    })
    .join("\n");
}

/** Pipeline completo aplicado à saída da IA antes de HTML/PDF/Word. */
export function normalizarPecaGerada(texto: string): string {
  let t = removerSeparadoresMarkdown(texto);
  t = juntarQuebrasDeLinhaSuaves(t);
  t = separarTitulosESubtopicos(t);
  t = limparPrefixoPeticaoInicialNoNome(t);
  t = aplicarEspacamentoRigido(t);
  t = removerTituloAcaoAposEnderecamento(t);
  t = deduplicarLinhasConsecutivas(t);
  t = inserirEspacoAposEnderecamento(t);
  t = inserirEspacoAposNomeAcao(t);
  t = normalizarSecaoFatos(t);
  t = normalizarParagrafosDoDireito(t);
  t = negritarSubtitulosDireito(t);
  t = normalizarLinhaOab(t);
  t = normalizarFechamentoAssinatura(t);
  t = removerSeparadoresMarkdown(t);
  return t.trim();
}

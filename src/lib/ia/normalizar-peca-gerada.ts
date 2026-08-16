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
  normalizarCorpoDosTopicos,
  normalizarTextoFatos,
} from "@/lib/peca-paragrafos";
import {
  aplicarItalicoTermosEstrangeiros,
  normalizarBlocosJuris,
} from "@/lib/tipografia-peca";
import { normalizarParagrafosDoDireito } from "@/lib/ia/mesclar-peca-hibrida";

const PADRAO_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA)/i;

function ehLinhaEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

/** Grafias que o Flash-Lite inventa com frequência. */
function corrigirOrtografiaForense(texto: string): string {
  return texto
    .replace(/\baplicaju[cć]i-se\b/gi, "aplica-se")
    .replace(/\bpatagar\b/gi, "patamar")
    .replace(/\binsubistente\b/gi, "não informado")
    .replace(/\[Inserir[^\]]*\]/gi, "…");
}

/** `"In casu"*` / `In casu*` → padrão *"in casu"*. */
function consertarLatinMarkdownOrfao(texto: string): string {
  return texto
    .replace(/\\+"/g, '"')
    // ***"termo"* / **"termo"* / *"termo"* → *"termo"*
    .replace(
      /\*{1,5}\s*"\s*((?:in casu|caput|in re ipsa|fumus boni iuris|periculum in mora)[^"]{0,40})\s*"\s*\*/gi,
      '*"$1"*'
    )
    .replace(/"([A-Za-zÀ-ÿ][^"\n]{1,60})"\*(?!\*)/g, '*"$1"*')
    .replace(/(?<!\*)\b([Ii]n casu)\*(?!\*)/g, '*"$1"*')
    .replace(/(?<!\*)\bIn casu\b(?!\*)/g, '*"in casu"*');
}

function limparDigitosEmoji(texto: string): string {
  return texto.replace(/(\d)[\uFE0F\u20E3]+/g, "$1");
}

function forcarCaixaEnderecamento(texto: string): string {
  const linhas = texto.split("\n");
  const i = linhas.findIndex((l) => ehLinhaEnderecamento(l.trim()));
  if (i < 0) return texto;
  linhas[i] = linhas[i]!.trim().toUpperCase();
  return linhas.join("\n");
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
    // Remove * soltos que a IA cola no início (*c) …*)
    linha = linha.replace(/^\*+/, "").replace(/\*+$/, "").trim();
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

/**
 * Garante 1 linha (marcador) entre "propor a presente" e o nome da ação.
 */
export function inserirEspacoAntesNomeAcao(texto: string): string {
  const linhas = texto.split("\n");
  const saida: string[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const b = linhas[i]!;
    saida.push(b);

    if (!/\bpropor a presente\.?\s*$/i.test(b.trim()) &&
      !/\bà presença de Vossa Excelência\.?\s*$/i.test(b.trim())) {
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
    if (proximo && ehNomeAcaoStandalone(proximo.trim())) {
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

/**
 * Garante 1 linha em branco entre o fim de um subtítulo a)/b)/c) e o próximo
 * (não entre o título romano e o primeiro subtítulo).
 */
export function inserirEspacoEntreSubtopicos(texto: string): string {
  const linhas = texto.split("\n");
  const saida: string[] = [];
  let aposTituloRomano = false;

  for (let i = 0; i < linhas.length; i++) {
    const raw = linhas[i]!;
    const t = raw.trim();

    if (!t) {
      saida.push(raw);
      continue;
    }

    if (ehTopicoPrincipal(t)) {
      saida.push(raw);
      aposTituloRomano = true;
      continue;
    }

    if (ehSubtopico(t)) {
      if (!aposTituloRomano) {
        while (
          saida.length > 0 &&
          (!saida[saida.length - 1]!.trim() ||
            ehMarcadorEspaco(saida[saida.length - 1]!))
        ) {
          saida.pop();
        }
        saida.push(MARCADOR_ESPACO_1);
      }
      saida.push(raw);
      aposTituloRomano = false;
      continue;
    }

    if (ehMarcadorEspaco(t)) {
      saida.push(raw);
      continue;
    }

    aposTituloRomano = false;
    saida.push(raw);
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
 * (1 linha) Nestes termos, / pede deferimento. / (1 linha) / data / (1 linha) / nome / OAB
 */
function normalizarFechamentoAssinatura(texto: string): string {
  let t = texto
    .replace(/^Termos em que,?\s*$/gim, "Nestes termos,")
    .replace(/^Pede e espera deferimento\.?\s*$/gim, "pede deferimento.")
    .replace(/^Pede deferimento\.?\s*$/gim, "pede deferimento.")
    .replace(/^Nome:\s*/gim, "")
    .replace(/^OAB:\s*(?=OAB\/)/gim, "")
    .replace(/^OAB:\s*([A-Za-z]{2})\s*[-/]?\s*/gim, "OAB/$1 ")

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

    if (!trim) {
      saida.push(l);
      continue;
    }

    // Sem linha isolada "Advogado" entre nome e OAB
    if (/^Advogado$/i.test(trim)) {
      continue;
    }

    if (/^Nestes termos,?$/i.test(trim)) {
      while (
        saida.length > 0 &&
        (!saida[saida.length - 1]!.trim() ||
          ehMarcadorEspaco(saida[saida.length - 1]!))
      ) {
        saida.pop();
      }
      saida.push(MARCADOR_ESPACO_1);
      saida.push("Nestes termos,");
      continue;
    }

    if (/^pede deferimento\.?$/i.test(trim)) {
      saida.push("pede deferimento.");
      while (
        i + 1 < linhas.length &&
        (!linhas[i + 1]!.trim() || ehMarcadorEspaco(linhas[i + 1]!))
      ) {
        i++;
      }
      saida.push(MARCADOR_ESPACO_1);
      viuPede = true;
      continue;
    }

    const ehLinhaData =
      /^[A-Za-zÀ-ÿ'\[\] .]+(?:\/|\s*-\s*)[A-Z]{2},?\s+\d/i.test(trim) ||
      /\bde\s+(?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+\d{4}\.?$/i.test(
        trim
      );

    if (viuPede && ehLinhaData) {
      saida.push(trim);
      while (
        i + 1 < linhas.length &&
        (!linhas[i + 1]!.trim() || ehMarcadorEspaco(linhas[i + 1]!))
      ) {
        i++;
      }
      saida.push(MARCADOR_ESPACO_1);
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

/**
 * Normaliza subtítulos a)/b)/c) fora de DOS PEDIDOS.
 * Negrito vem da tipografia (classe subtopico / forceBold), não de ** na linha
 * inteira — assim *"latim"* no meio do título não quebra o Markdown.
 */
function limparCorpoSubtitulo(corpo: string): string {
  let c = corpo.trim();

  // **corpo inteiro**
  if (c.startsWith("**") && c.endsWith("**") && !c.slice(2, -2).includes("**")) {
    c = c.slice(2, -2).trim();
  }

  // *corpo inteiro* (IA italicizou o subtítulo) — preserva *"termo"* isolado
  if (
    c.startsWith("*") &&
    c.endsWith("*") &&
    !c.startsWith("**") &&
    !/^\*"[^"]+"\*$/.test(c)
  ) {
    c = c.slice(1, -1).trim();
  }

  // Marcadores de fechamento órfãos: ... "termo"** ou ...texto**
  if (c.endsWith("**") && !c.startsWith("**")) {
    c = c.slice(0, -2).trim();
  }

  // Aspas + * órfão sem abertura: "termo"* → "termo" (preserva *"termo"*)
  c = c.replace(/(^|[^*])"([^"]+)"\*(?!\*)/g, '$1"$2"');

  return c.trim();
}


/**
 * Em DAS PROVAS E ANEXOS: a)/b)/c) → 1)/2)/3) (peso normal via tipografia).
 * Não altera DOS PEDIDOS nem DO DIREITO.
 */
function numerarItensDasProvas(texto: string): string {
  const linhas = texto.split("\n");
  let emProvas = false;
  let n = 0;

  return linhas
    .map((l) => {
      const t = l.trim();
      if (/^[IVXLCDM]+\s*[-—–.]\s+DAS PROVAS\b/i.test(t)) {
        emProvas = true;
        n = 0;
        return l;
      }
      if (/^[IVXLCDM]+\s*[-—–.]\s+\S/i.test(t)) {
        emProvas = false;
        return l;
      }
      if (/^(Nestes termos|Termos em que)/i.test(t)) {
        emProvas = false;
        return l;
      }
      if (!emProvas) return l;

      const mLetra = /^(?:\*{1,2})?([a-z]\))\s+(.+)$/i.exec(t);
      const mNum = /^(?:\*{1,2})?(\d+\))\s+(.+)$/i.exec(t);
      if (!mLetra && !mNum) return l;

      const corpo = limparCorpoSubtitulo((mLetra ?? mNum)![2]!);
      if (corpo.length > 200) return l;
      n += 1;
      return `${n}) ${corpo}`;
    })
    .join("\n");
}

function negritarSubtitulosDireito(texto: string): string {
  return texto
    .split("\n")
    .map((l) => {
      const t = l.trim();
      // Aceita *c)...*, **c)...**, *c)...** etc. da IA
      const m = /^(?:\*{1,2})?([a-z]\))\s+(.+)$/i.exec(t);
      if (!m) return l;
      const corpo = limparCorpoSubtitulo(m[2]!);
      if (corpo.length > 120) return l;

      // Sem ** na linha: negrito via tipografia; itálico só em *"termo"*
      return `${m[1]!.toLowerCase()} ${corpo}`;
    })
    .join("\n");
}

/** Pipeline completo aplicado à saída da IA antes de HTML/PDF/Word. */
export function normalizarPecaGerada(texto: string): string {
  let t = corrigirOrtografiaForense(texto);
  t = limparDigitosEmoji(t);
  t = consertarLatinMarkdownOrfao(t);
  t = removerSeparadoresMarkdown(t);
  t = forcarCaixaEnderecamento(t);
  t = normalizarBlocosJuris(t);
  t = juntarQuebrasDeLinhaSuaves(t);
  t = separarTitulosESubtopicos(t);
  t = limparPrefixoPeticaoInicialNoNome(t);
  t = aplicarEspacamentoRigido(t);
  t = removerTituloAcaoAposEnderecamento(t);
  t = deduplicarLinhasConsecutivas(t);
  t = inserirEspacoAposEnderecamento(t);
  t = inserirEspacoAntesNomeAcao(t);
  t = inserirEspacoAposNomeAcao(t);
  t = numerarItensDasProvas(t);
  t = inserirEspacoEntreSubtopicos(t);
  t = normalizarSecaoFatos(t);
  t = normalizarParagrafosDoDireito(t);
  t = normalizarCorpoDosTopicos(t);
  t = negritarSubtitulosDireito(t);
  t = aplicarItalicoTermosEstrangeiros(t);
  t = normalizarLinhaOab(t);
  t = normalizarFechamentoAssinatura(t);
  t = removerSeparadoresMarkdown(t);
  return t.trim();
}

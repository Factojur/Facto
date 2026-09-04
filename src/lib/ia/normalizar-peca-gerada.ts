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
  pareceEmentaOuSumulaLiteral,
} from "@/lib/tipografia-peca";
import { normalizarParagrafosDoDireito } from "@/lib/ia/mesclar-peca-hibrida";

const PADRAO_NOME_ACAO =
  /^(?:PETI[CÇ][AÃ]O\s+INICIAL\s*[—–-]?\s*)?(?:A[CÇ][AÃ]O\s+|EXECU[CÇ][AÃ]O\s+|EMBARGOS\s+|RECURSO\s+|CONTESTA|AGRAVO\s+|CUMPRIMENTO\s+|R[EÉ]PLICA|RECLAMA[CÇ]|MANIFESTA)/i;

function ehLinhaEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

/** Grafias que o Flash-Lite inventa com frequência. */
function corrigirOrtografiaForense(texto: string): string {
  return texto
    .replace(/\baplicaju[cć]i-se\b/gi, "aplica-se")
    .replace(/\bpatagar\b/gi, "patamar")
    .replace(/\binsubistente\b/gi, "não informado")
    .replace(/\bVALORDA\b/g, "VALOR DA")
    .replace(/\bDO VALORDA\b/gi, "DO VALOR DA")
    .replace(/\bINDENIZÁVELE\b/gi, "INDENIZÁVEL E")
    .replace(/\bOBJETIVAE\b/gi, "OBJETIVA E")
    .replace(/\bPROVASE\b/gi, "PROVAS E")
    .replace(/\bEXCELENTENT[IÍ]SSIM[OA]\b/gi, "EXCELENTÍSSIMO")
    .replace(/\bEXCELCELENT[IÍ]SSIM[OA]\b/gi, "EXCELENTÍSSIMO")
    .replace(/\bVARADO\b/gi, "VARA DO")
    // NÃO remover [[JURIS]] — ementas travadas no preview dependem do marcador.
    .replace(/\[Inserir[^\]]*\]/gi, "…");
}

/** art. 22 do CPC trocado pela IA em tema de continuidade/fornecimento → CDC. */
function corrigirArt22Continuidade(texto: string): string {
  return texto.replace(
    /\b(Art\.\s*22\s+do\s+)CPC\b/gi,
    (match, prefix, offset, full) => {
      const ctx = full
        .slice(Math.max(0, offset - 150), offset + 150)
        .toLowerCase();
      if (
        /continuidade|fornecimento|consumidor|servi[cç]o essencial|cdc|concession/.test(
          ctx
        )
      ) {
        return `${prefix}CDC`;
      }
      return match;
    }
  );
}

/**
 * Envolve ementas/súmulas coladas sem [[JURIS]] para tipografia de citação.
 * Interpretação narrativa (sem prefixo Jurisprudência/Súmula + tribunal) permanece parágrafo.
 */
function envolverCitacoesSoltas(texto: string): string {
  const linhas = texto.split("\n");
  const out: string[] = [];
  for (const bruta of linhas) {
    const t = bruta.trim();
    if (!t) {
      out.push(bruta);
      continue;
    }
    if (/^\[\[JURIS\]\]/i.test(t) || /\[\[\/JURIS\]\]/i.test(t)) {
      out.push(bruta);
      continue;
    }
    const pareceCitacao =
      (/^S[uú]mula(?:\s+Vinculante)?\s*(?:n[oº°.]?\s*)?\d+/i.test(t) &&
        t.length >= 40) ||
      (/\b(EMENTA|CASO EM EXAME|QUESTÃO EM DISCUSSÃO)\b/i.test(t) &&
        /\b(STJ|STF|TJ[A-Z]{2}|TRF|TST|TSE)\b/.test(t) &&
        t.length >= 120) ||
      (pareceEmentaOuSumulaLiteral(t) &&
        t.length >= 80 &&
        !/^A\s+jurisprud[eê]ncia\b/i.test(t));
    if (pareceCitacao) {
      out.push(`[[JURIS]]${t}[[/JURIS]]`);
    } else {
      out.push(bruta);
    }
  }
  return out.join("\n");
}

/** `"In casu"*` / `In casu*` / `*"**"in casu"*"*` → padrão *"in casu"*. */
function consertarLatinMarkdownOrfao(texto: string): string {
  return texto
    .replace(/\\+"/g, '"')
    // Lixo típico: *"**"in casu"*"* / *""in casu""*
    .replace(
      /\*+"?\*+"((?:in casu|caput|in re ipsa|fumus boni iuris|periculum in mora)[^"*]{0,40})"\*+"?\*/gi,
      '*"$1"*'
    )
    // ***"termo"* / **"termo"* / *"termo"* → *"termo"*
    .replace(
      /\*{1,5}\s*"\s*((?:in casu|caput|in re ipsa|fumus boni iuris|periculum in mora)[^"]{0,40})\s*"\s*\*/gi,
      '*"$1"*'
    )
    .replace(/"([A-Za-zÀ-ÿ][^"\n]{1,60})"\*(?!\*)/g, '*"$1"*')
    .replace(/(?<!\*)\b([Ii]n casu)\*(?!\*)/g, '*"$1"*')
    .replace(/(?<!\*)\bIn casu\b(?!\*)/g, '*"in casu"*');
}

/**
 * Asteriscos órfãos no meio da frase (ex.: "sentença recorrida** no capítulo").
 * Preserva **pares** e *"itálico"*.
 */
function limparAsteriscosMarkdownOrfaos(texto: string): string {
  return texto
    .split("\n")
    .map((linha) => {
      let l = linha;
      // **sem fechamento no fim da palavra
      l = l.replace(/(\w)\*\*(?!\*)(?=\s|$|[.,;:)\]])/g, "$1");
      // **órfão no início sem par na mesma linha
      if ((l.match(/\*\*/g) ?? []).length % 2 === 1) {
        l = l.replace(/\*\*/, "");
      }
      // *órfão simples (ímpar), sem *"…"*
      const semItalicoCitacao = l.replace(/\*"[^"]*"\*/g, "§ITAL§");
      if (
        (semItalicoCitacao.match(/(?<!\*)\*(?!\*)/g) ?? []).length % 2 === 1
      ) {
        l = l.replace(/(?<!\*)\*(?!\*)/, "");
      }
      return l;
    })
    .join("\n");
}

/** Remove cercas ```markdown / ``` da peça (vazamento do modelo). */
function removerCercasMarkdown(texto: string): string {
  return texto
    .replace(/^```(?:markdown|md|text)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

/**
 * Junta título romano partido em duas linhas:
 * "III - DO MÉRITO" + "RECURSAL: DA …" → uma linha.
 */
function colarContinuacaoTituloRomano(texto: string): string {
  const linhas = texto.split("\n");
  const out: string[] = [];
  for (let i = 0; i < linhas.length; i++) {
    const cur = linhas[i]!.trim();
    let j = i + 1;
    while (j < linhas.length && !linhas[j]!.trim()) j++;
    const next = linhas[j]?.trim() ?? "";
    const continuaTitulo =
      Boolean(next) &&
      !ehMarcadorEspaco(next) &&
      !/^[IVXLCDM]+\s*[-—–.]/i.test(next) &&
      !/^[a-z]\)\s+/i.test(next) &&
      !/^\d+\)\s+/i.test(next) &&
      !/^\[\[/.test(next) &&
      !/^(Nestes termos|Termos em que|pede deferimento)/i.test(next) &&
      (/^(?:RECURSAL|RECURSAIS|PRELIMINAR|M[EÉ]RITO|RAZ[OÕ]ES)\b/i.test(next) ||
        (next === next.toUpperCase() &&
          next.length >= 8 &&
          next.length <= 120 &&
          !/\.\s/.test(next)));

    if (/^[IVXLCDM]+\s*[-—–.]\s+\S/i.test(cur) && continuaTitulo) {
      out.push(`${cur} ${next}`.replace(/\s+/g, " ").trim());
      i = j;
      continue;
    }
    out.push(linhas[i]!);
  }
  return out.join("\n");
}

/** Localidade do fechamento: "Vara de Itararé/SP" → "Itararé/SP". */
function sanearLinhaLocalidadeData(texto: string): string {
  return texto
    .split("\n")
    .map((l) => {
      const m =
        /^((?:foro|comarca|vara|juizado|f[oó]rum)(?:\s+de|\s+da|\s+do)?\s+)([A-Za-zÀ-ÿ'][^,/]{1,40})\s*([\/–-]\s*[A-Za-z]{2})\s*,\s*(.+)$/i.exec(
          l.trim()
        );
      if (!m) return l;
      return `${m[2]!.trim()}${m[3]!.replace(/\s+/g, "")}, ${m[4]!.trim()}`;
    })
    .join("\n");
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

const ORDEM_ROMANOS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
] as const;

/** Renumera tópicos romanos quando a IA repete o mesmo algarismo (ex.: dois III). */
function renumerarTopicosRomanosDuplicados(texto: string): string {
  const linhas = texto.split("\n");
  const indices: number[] = [];
  const romanos: string[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const m = /^([IVXLCDM]+)\s*[-—–.]\s+\S/i.exec(linhas[i]!.trim());
    if (!m) continue;
    indices.push(i);
    romanos.push(m[1]!.toUpperCase());
  }

  if (indices.length < 2) return texto;

  const vistos = new Set<string>();
  let temDuplicata = false;
  for (const r of romanos) {
    if (vistos.has(r)) {
      temDuplicata = true;
      break;
    }
    vistos.add(r);
  }
  if (!temDuplicata) return texto;

  for (let j = 0; j < indices.length; j++) {
    const i = indices[j]!;
    const novo = ORDEM_ROMANOS[j] ?? String(j + 1);
    linhas[i] = linhas[i]!.replace(/^(\s*)([IVXLCDM]+)(\s*[-—–.])/i, `$1${novo}$3`);
  }

  return linhas.join("\n");
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
 * Também quebra romanos colados: "I - DOS FATOS II - DO DIREITO".
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

    // I - DOS FATOS II - DO DIREITO III - DOS PEDIDOS (tudo na mesma linha)
    const romanosColados = [
      ...linha.matchAll(
        /\b([IVXLCDM]+)\s*[-—–.]\s+(?=(?:DO|DA|DAS|DOS|PRELIMINAR|M[EÉ]RITO|RAZ[OÕ]ES|CABIMENTO|PEDIDO|HABEAS|NULIDADE|JUSTI[CÇ]A)\b)/gi
      ),
    ];
    if (romanosColados.length >= 2) {
      const primeiro = romanosColados[0]!.index ?? 0;
      if (primeiro > 0) {
        const prefixo = linha.slice(0, primeiro).trim();
        if (prefixo) out.push(prefixo);
      }
      for (let i = 0; i < romanosColados.length; i++) {
        const start = romanosColados[i]!.index ?? 0;
        const end =
          i + 1 < romanosColados.length
            ? (romanosColados[i + 1]!.index ?? linha.length)
            : linha.length;
        const chunk = linha.slice(start, end).trim();
        if (!chunk) continue;
        const normalizado = chunk.replace(
          /^([IVXLCDM]+)\s*[-—–.]\s+/i,
          (_m, r: string) => `${String(r).toUpperCase()} - `
        );
        out.push(normalizado);
      }
      continue;
    }

    // I - DOS FATOS DO DIREITO / I - DOS FATOS E DO MÉRITO E DO DIREITO
    const fatosDireitoColados =
      /^([IVXLCDM]+)\s*[-—–.]\s+(DOS FATOS)\s+(?:E\s+)?(?:DO M[EÉ]RITO\s+(?:E\s+)?)?(DO DIREITO)\s*$/i.exec(
        linha
      );
    if (fatosDireitoColados) {
      out.push(
        `${fatosDireitoColados[1]!.toUpperCase()} - ${fatosDireitoColados[2]!.toUpperCase()}`
      );
      out.push(`II - ${fatosDireitoColados[3]!.toUpperCase()}`);
      continue;
    }

    // II - DO DIREITO a) Da tese…  (e variantes DOS FATOS / DO MÉRITO)
    const coladoRomano =
      /^([IVXLCDM]+)\s*[-—–.]\s+(DOS FATOS|DO DIREITO|DO M[EÉ]RITO|DAS PROVAS|DOS PEDIDOS)\s+([a-z]\))\s+(.+)$/i.exec(
        linha
      );
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

    // Prefixo (qualificação / "em face de…") colado no primeiro romano
    const romanoComPrefixo =
      /^(.+?)\s+([IVXLCDM]+)\s*[-—–.]\s+(DOS FATOS|DO DIREITO|DO M[EÉ]RITO|DAS PROVAS|DOS PEDIDOS|DAS PRELIMINARES)\b(.*)$/i.exec(
        linha
      );
    if (
      romanoComPrefixo &&
      romanoComPrefixo[1]!.trim().length >= 12 &&
      !/^[IVXLCDM]+\s*[-—–.]/i.test(romanoComPrefixo[1]!.trim())
    ) {
      const restoAposSecao = romanoComPrefixo[4]!.trim();
      // Não partir títulos compostos: "DAS PROVAS E ANEXOS"
      if (!restoAposSecao || !/^(E|OU)\b/i.test(restoAposSecao)) {
        out.push(romanoComPrefixo[1]!.trim());
        out.push(
          `${romanoComPrefixo[2]!.toUpperCase()} - ${romanoComPrefixo[3]!.toUpperCase()}`
        );
        if (restoAposSecao) out.push(restoAposSecao);
        continue;
      }
    }

    // Corpo colado no título: I - DOS FATOS O autor… (não "DAS PROVAS E ANEXOS")
    const tituloComCorpo =
      /^([IVXLCDM]+)\s*[-—–.]\s+(DOS FATOS|DO DIREITO|DO M[EÉ]RITO|DAS PROVAS|DOS PEDIDOS|DAS PRELIMINARES)\s+(.+)$/i.exec(
        linha
      );
    if (
      tituloComCorpo &&
      !/^[a-z]\)/i.test(tituloComCorpo[3]!.trim()) &&
      !/^(E|OU)\b/i.test(tituloComCorpo[3]!.trim())
    ) {
      out.push(
        `${tituloComCorpo[1]!.toUpperCase()} - ${tituloComCorpo[2]!.toUpperCase()}`
      );
      out.push(tituloComCorpo[3]!.trim());
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
 * Se a IA omitiu a fórmula de encerramento, acrescenta só Nestes termos / pede deferimento.
 * Não inventa localidade, nome nem OAB (vêm do perfil / da própria IA).
 */
function garantirFormulaFechamento(texto: string): string {
  const t = texto.trim();
  if (t.length < 400) return t;
  if (
    /Nestes termos|Termos em que|pede deferimento|Pede e espera deferimento/i.test(
      t
    )
  ) {
    return t;
  }
  if (
    !/DOS PEDIDOS|DO REQUERIMENTO|Ante o exposto|Diante do exposto|Requer(?:-se)?(?:\s+a)?\s+Vossa Excel/i.test(
      t
    )
  ) {
    return t;
  }
  return `${t}\n${MARCADOR_ESPACO_1}\nNestes termos,\npede deferimento.`;
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
  let t = removerCercasMarkdown(texto);
  t = corrigirOrtografiaForense(t);
  t = corrigirArt22Continuidade(t);
  t = limparDigitosEmoji(t);
  t = consertarLatinMarkdownOrfao(t);
  t = limparAsteriscosMarkdownOrfaos(t);
  t = removerSeparadoresMarkdown(t);
  t = forcarCaixaEnderecamento(t);
  t = envolverCitacoesSoltas(t);
  t = normalizarBlocosJuris(t);
  t = juntarQuebrasDeLinhaSuaves(t);
  t = separarTitulosESubtopicos(t);
  t = limparPrefixoPeticaoInicialNoNome(t);
  t = aplicarEspacamentoRigido(t);
  t = renumerarTopicosRomanosDuplicados(t);
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
  t = colarContinuacaoTituloRomano(t);
  t = aplicarItalicoTermosEstrangeiros(t);
  t = limparAsteriscosMarkdownOrfaos(t);
  t = normalizarLinhaOab(t);
  t = garantirFormulaFechamento(t);
  t = normalizarFechamentoAssinatura(t);
  t = sanearLinhaLocalidadeData(t);
  t = removerSeparadoresMarkdown(t);
  return t.trim();
}

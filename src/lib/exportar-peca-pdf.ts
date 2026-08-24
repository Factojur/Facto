/**
 * PDF forense com texto selecionável (jsPDF):
 * margens 3/2 cm, Times 12, entrelinha 1,5;
 * citação de jurisprudência: Times 10, recuo 4 cm, justificado;
 * negrito/itálico via Markdown (** / *).
 */

import {
  FORMATACAO_FORENSE,
  alturaLinhasMm,
} from "@/lib/formatacao-forense";
import {
  classificarPeca,
  parseMarkdownRuns,
  textoSemMarkdown,
  type RunMarkdown,
} from "@/lib/tipografia-peca";

type JsPdfDoc = {
  setFont: (face: string, style?: string) => void;
  setFontSize: (size: number) => void;
  getTextWidth: (text: string) => number;
  splitTextToSize: (text: string, width: number) => string[];
  text: (
    text: string | string[],
    x: number,
    y: number,
    opts?: { align?: string }
  ) => void;
  addPage: () => void;
  output: (type: "blob" | "arraybuffer") => Blob | ArrayBuffer;
  save: (filename: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

type TokenPdf = {
  text: string;
  bold: boolean;
  italic: boolean;
  width: number;
  espaco: boolean;
};

function estiloFonte(run: RunMarkdown): string {
  if (run.bold && run.italic) return "bolditalic";
  if (run.bold) return "bold";
  if (run.italic) return "italic";
  return "normal";
}

function tokensDeRuns(
  doc: JsPdfDoc,
  texto: string,
  forceBold?: boolean,
  forceItalic?: boolean
): TokenPdf[] {
  const runs = parseMarkdownRuns(texto).map((r) => ({
    ...r,
    bold: Boolean(forceBold || r.bold),
    italic: Boolean(forceItalic || r.italic),
  }));
  const tokens: TokenPdf[] = [];
  for (const run of runs) {
    doc.setFont("times", estiloFonte(run));
    const partes = run.text.split(/(\s+)/);
    for (const parte of partes) {
      if (!parte) continue;
      const espaco = /^\s+$/.test(parte);
      tokens.push({
        text: parte,
        bold: run.bold,
        italic: run.italic,
        width: doc.getTextWidth(parte),
        espaco,
      });
    }
  }
  return tokens;
}

/**
 * Desenha parágrafo com runs Markdown, recuo só na 1ª linha.
 * Com `justify`, distribui espaço entre palavras nas linhas cheias
 * (última linha fica à esquerda — padrão tipográfico).
 */
function desenharParagrafoRuns(
  doc: JsPdfDoc,
  texto: string,
  opts: {
    x: number;
    y: number;
    maxWidth: number;
    lineH: number;
    fontSize: number;
    firstLineIndentMm: number;
    forceBold?: boolean;
    forceItalic?: boolean;
    justify?: boolean;
  }
): number {
  doc.setFontSize(opts.fontSize);
  const tokens = tokensDeRuns(doc, texto, opts.forceBold, opts.forceItalic);
  if (tokens.length === 0) return opts.y + opts.lineH;

  type Linha = { tokens: TokenPdf[]; indent: number };
  const linhas: Linha[] = [];
  let linhaAtual: TokenPdf[] = [];
  let larguraAtual = 0;
  let naPrimeira = true;
  let indentAtual = opts.firstLineIndentMm;

  const larguraUtil = () => opts.maxWidth - indentAtual;

  const flush = () => {
    while (linhaAtual.length > 0 && linhaAtual[0]!.espaco) {
      linhaAtual.shift();
    }
    while (
      linhaAtual.length > 0 &&
      linhaAtual[linhaAtual.length - 1]!.espaco
    ) {
      linhaAtual.pop();
    }
    if (linhaAtual.length > 0) {
      linhas.push({ tokens: linhaAtual, indent: indentAtual });
    }
    linhaAtual = [];
    larguraAtual = 0;
    naPrimeira = false;
    indentAtual = 0;
  };

  for (const token of tokens) {
    if (
      !token.espaco &&
      linhaAtual.length > 0 &&
      larguraAtual + token.width > larguraUtil() + 0.01
    ) {
      flush();
    }
    if (token.espaco && linhaAtual.length === 0) continue;
    linhaAtual.push(token);
    larguraAtual += token.width;
  }
  flush();

  let y = opts.y;
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]!;
    const ultima = i === linhas.length - 1;
    const xBase = opts.x + linha.indent;
    const palavras = linha.tokens.filter((t) => !t.espaco);
    const gaps = linha.tokens.filter((t) => t.espaco);
    const larguraPalavras = palavras.reduce((s, t) => s + t.width, 0);
    const util = opts.maxWidth - linha.indent;
    const justificar =
      Boolean(opts.justify) &&
      !ultima &&
      palavras.length > 1 &&
      gaps.length > 0;

    if (justificar) {
      const sobra = Math.max(0, util - larguraPalavras);
      const extraPorGap = sobra / gaps.length;
      let x = xBase;
      for (const token of linha.tokens) {
        doc.setFont("times", estiloFonte(token));
        if (token.espaco) {
          x += token.width + extraPorGap;
          continue;
        }
        doc.text(token.text, x, y);
        x += token.width;
      }
    } else {
      let x = xBase;
      for (const token of linha.tokens) {
        doc.setFont("times", estiloFonte(token));
        doc.text(token.text, x, y);
        x += token.width;
      }
    }
    y += opts.lineH;
  }

  return y;
}

/** Mesma lógica do DOCX: epígrafe começa na linha 2 (3+ itens) ou 4 (só processo). */
function desenharBlocoEpigrafe6(
  doc: JsPdfDoc,
  opts: {
    epigrafe?: string[];
    processo?: string;
    marginLeft: number;
    y: number;
    novaPaginaSePreciso: (h: number) => void;
  }
): number {
  const hLinha = alturaLinhasMm(1);
  const extra =
    opts.epigrafe && opts.epigrafe.length > 0
      ? opts.epigrafe
      : opts.processo
        ? [opts.processo]
        : [];
  const inicio = extra.length >= 3 ? 2 : 4;
  let y = opts.y;
  for (let i = 1; i <= 6; i++) {
    opts.novaPaginaSePreciso(hLinha);
    const idx = i - inicio;
    if (idx >= 0 && idx < extra.length) {
      doc.setFont("times", "normal");
      doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);
      doc.text(extra[idx]!, opts.marginLeft, y);
    }
    y += hLinha;
  }
  return y;
}

async function criarDoc(pecaTexto: string): Promise<JsPdfDoc> {
  const mod = (await import("jspdf")) as unknown as {
    jsPDF: new (opts: Record<string, unknown>) => JsPdfDoc;
    default?: { jsPDF: new (opts: Record<string, unknown>) => JsPdfDoc };
  };
  const JsPDF = mod.jsPDF ?? mod.default?.jsPDF;
  if (!JsPDF) {
    throw new Error("Biblioteca jsPDF indisponível neste navegador.");
  }

  const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginLeft = FORMATACAO_FORENSE.margemEsquerdaCm * 10;
  const marginRight = FORMATACAO_FORENSE.margemDireitaCm * 10;
  const marginTop = FORMATACAO_FORENSE.margemSuperiorCm * 10;
  const marginBottom = FORMATACAO_FORENSE.margemInferiorCm * 10;
  const maxWidth = pageW - marginLeft - marginRight;
  const indent = FORMATACAO_FORENSE.recuoPrimeiraLinhaCm * 10;
  const indentJuris = FORMATACAO_FORENSE.recuoCitacaoCm * 10;
  const lineH = 6.35; // 12pt * 1,5
  const lineHCitacao = (FORMATACAO_FORENSE.tamanhoCitacaoPt / 12) * 6.35;
  let y = marginTop;

  const blocos = classificarPeca(pecaTexto);
  if (blocos.length === 0) {
    throw new Error("A peça está vazia — nada para exportar em PDF.");
  }

  function novaPaginaSePreciso(altura: number) {
    if (y + altura > pageH - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  for (const b of blocos) {
    if (b.tipo === "marcador" && b.marcador) {
      const m = b.marcador;
      if (m.linhas === 6) {
        y = desenharBlocoEpigrafe6(doc, {
          epigrafe: m.epigrafe,
          processo: m.processo,
          marginLeft,
          y,
          novaPaginaSePreciso,
        });
      } else {
        const h = alturaLinhasMm(m.linhas);
        novaPaginaSePreciso(h);
        y += h;
      }
      continue;
    }

    if (b.tipo === "enderecamento" || b.tipo === "nome-acao") {
      const limpo = textoSemMarkdown(b.texto);
      doc.setFont("times", "bold");
      doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);
      const lines = doc.splitTextToSize(limpo, maxWidth);
      novaPaginaSePreciso(lines.length * lineH);
      for (const line of lines) {
        doc.text(line, pageW / 2, y, { align: "center" });
        y += lineH;
      }
      continue;
    }

    if (b.tipo === "fechamento") {
      const limpo = textoSemMarkdown(b.texto);
      doc.setFont("times", "normal");
      doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);
      const lines = doc.splitTextToSize(limpo, maxWidth);
      novaPaginaSePreciso(lines.length * lineH);
      for (const line of lines) {
        doc.text(line, pageW / 2, y, { align: "center" });
        y += lineH;
      }
      continue;
    }

    if (b.tipo === "secao-titulo") {
      y += lineH;
      novaPaginaSePreciso(lineH);
      y = desenharParagrafoRuns(doc, b.texto, {
        x: marginLeft,
        y,
        maxWidth,
        lineH,
        fontSize: FORMATACAO_FORENSE.tamanhoPt,
        firstLineIndentMm: 0,
        forceBold: true,
        justify: false,
      });
      continue;
    }

    if (b.tipo === "subtopico") {
      novaPaginaSePreciso(lineH);
      y = desenharParagrafoRuns(doc, b.texto, {
        x: marginLeft,
        y,
        maxWidth,
        lineH,
        fontSize: FORMATACAO_FORENSE.tamanhoPt,
        firstLineIndentMm: indent,
        forceBold: true,
        justify: false,
      });
      continue;
    }

    if (b.tipo === "item-pedido") {
      novaPaginaSePreciso(lineH);
      y = desenharParagrafoRuns(doc, b.texto, {
        x: marginLeft,
        y,
        maxWidth,
        lineH,
        fontSize: FORMATACAO_FORENSE.tamanhoPt,
        firstLineIndentMm: indent,
        forceBold: false,
        justify: true,
      });
      continue;
    }

    if (b.tipo === "citacao-juris") {
      const larguraJuris = maxWidth - indentJuris;
      novaPaginaSePreciso(lineHCitacao * 2);
      y = desenharParagrafoRuns(doc, b.texto, {
        x: marginLeft + indentJuris,
        y,
        maxWidth: larguraJuris,
        lineH: lineHCitacao,
        fontSize: FORMATACAO_FORENSE.tamanhoCitacaoPt,
        firstLineIndentMm: 0,
        justify: true,
      });
      continue;
    }

    if (b.tipo === "prova-item") {
      novaPaginaSePreciso(lineH);
      y = desenharParagrafoRuns(doc, b.texto, {
        x: marginLeft + 8,
        y,
        maxWidth: maxWidth - 8,
        lineH,
        fontSize: FORMATACAO_FORENSE.tamanhoPt,
        firstLineIndentMm: 0,
        justify: true,
      });
      continue;
    }

    // Corpo + abertura (já qualificado): justificado + recuo 1ª linha 2 cm
    novaPaginaSePreciso(lineH);
    y = desenharParagrafoRuns(doc, b.texto, {
      x: marginLeft,
      y,
      maxWidth,
      lineH,
      fontSize: FORMATACAO_FORENSE.tamanhoPt,
      firstLineIndentMm: indent,
      justify: true,
    });
  }

  return doc;
}

export async function gerarPecaPdfBlob(pecaTexto: string): Promise<Blob> {
  const doc = await criarDoc(pecaTexto);
  return doc.output("blob") as Blob;
}

/** Buffer para scripts Node (testes diários / export em disco). */
export async function gerarPecaPdfBuffer(pecaTexto: string): Promise<Buffer> {
  const doc = await criarDoc(pecaTexto);
  const ab = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(ab);
}

export async function baixarPecaPdf(
  pecaTexto: string,
  nomeArquivo = "peca-facto.pdf"
): Promise<Blob> {
  const blob = await gerarPecaPdfBlob(pecaTexto);
  void nomeArquivo;
  return blob;
}

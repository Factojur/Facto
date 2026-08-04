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
  output: (type: "blob") => Blob;
  save: (filename: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

function estiloFonte(run: RunMarkdown): string {
  if (run.bold && run.italic) return "bolditalic";
  if (run.bold) return "bold";
  if (run.italic) return "italic";
  return "normal";
}

/**
 * Desenha parágrafo com runs Markdown, com recuo só na 1ª linha.
 * Retorna o novo Y (abaixo da última linha).
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
  }
): number {
  const runs = parseMarkdownRuns(texto).map((r) => ({
    ...r,
    bold: opts.forceBold || r.bold,
    italic: opts.forceItalic || r.italic,
  }));

  let y = opts.y;
  let x = opts.x + opts.firstLineIndentMm;
  let naPrimeiraLinha = true;
  const limite = opts.x + opts.maxWidth;

  doc.setFontSize(opts.fontSize);

  for (const run of runs) {
    doc.setFont("times", estiloFonte(run));
    const palavras = run.text.split(/(\s+)/);
    for (const palavra of palavras) {
      if (!palavra) continue;
      const w = doc.getTextWidth(palavra);
      if (x + w > limite + 0.01 && !/^\s+$/.test(palavra)) {
        y += opts.lineH;
        x = opts.x;
        naPrimeiraLinha = false;
      }
      if (/^\s+$/.test(palavra) && x === opts.x && !naPrimeiraLinha) {
        continue; // não inicia linha com espaço
      }
      doc.text(palavra, x, y);
      x += w;
    }
  }

  return y + opts.lineH;
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
      if (m.linhas === 6 && m.processo) {
        const hLinha = alturaLinhasMm(1);
        for (let i = 1; i <= 6; i++) {
          novaPaginaSePreciso(hLinha);
          if (i === 4) {
            doc.setFont("times", "normal");
            doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);
            doc.text(m.processo, marginLeft, y);
          }
          y += hLinha;
        }
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
      });
      continue;
    }

    // Corpo justificado (aprox. via wrap) + recuo 1ª linha 2 cm
    novaPaginaSePreciso(lineH);
    y = desenharParagrafoRuns(doc, b.texto, {
      x: marginLeft,
      y,
      maxWidth,
      lineH,
      fontSize: FORMATACAO_FORENSE.tamanhoPt,
      firstLineIndentMm: indent,
    });
  }

  return doc;
}

export async function gerarPecaPdfBlob(pecaTexto: string): Promise<Blob> {
  const doc = await criarDoc(pecaTexto);
  return doc.output("blob");
}

export async function baixarPecaPdf(
  pecaTexto: string,
  nomeArquivo = "peca-facto.pdf"
): Promise<Blob> {
  const blob = await gerarPecaPdfBlob(pecaTexto);
  void nomeArquivo;
  return blob;
}

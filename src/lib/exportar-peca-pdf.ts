/**
 * PDF forense com texto selecionável (jsPDF):
 * margens 3/2 cm, Times 12, entrelinha ~1,5, ~10 linhas após endereçamento.
 */

import {
  FORMATACAO_FORENSE,
  alturaLinhasMm,
  ehMarcadorEspacoEnderecamento,
} from "@/lib/formatacao-forense";

type JsPdfDoc = {
  setFont: (face: string, style?: string) => void;
  setFontSize: (size: number) => void;
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

function ehEnderecamento(t: string): boolean {
  return /^(EXCELENT[IÍ]SSIMO|DA COMARCA|JU[IÍ]ZO\s+DA)/i.test(t);
}

function ehTituloSecao(t: string): boolean {
  return /^([IVXLCDM]+)\s*—\s+/i.test(t);
}

function ehFechamento(t: string): boolean {
  return (
    /^(Termos em que|Pede deferimento|OAB\/)/i.test(t) ||
    /^[A-Za-zÀ-ÿ' ]+ - [A-Z]{2},\s+\d/i.test(t)
  );
}

function ehNomeAcao(t: string): boolean {
  return (
    /(?:A[CÇ][AÃ]O|EXECU[CÇ][AÃ]O|EMBARGOS|RECURSO|PETI[CÇ][AÃ]O)/i.test(t) &&
    t.length < 160 &&
    (t === t.toUpperCase() || t.length < 120)
  );
}

function ehLista(t: string): boolean {
  return /^([a-z]\)|- |\d+\.\d*)\s+/i.test(t);
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
  const lineH = 6.35; // ~12pt * 1.5
  let y = marginTop;

  const paragrafos = pecaTexto
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (paragrafos.length === 0) {
    throw new Error("A peça está vazia — nada para exportar em PDF.");
  }

  function novaPaginaSePreciso(altura: number) {
    if (y + altura > pageH - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  for (const p of paragrafos) {
    if (ehMarcadorEspacoEnderecamento(p)) {
      const h = alturaLinhasMm(FORMATACAO_FORENSE.linhasAposEnderecamento);
      novaPaginaSePreciso(h);
      y += h;
      continue;
    }

    const centro = ehEnderecamento(p) || ehFechamento(p) || ehNomeAcao(p);
    const titulo = ehTituloSecao(p);
    const lista = ehLista(p);

    // PDF: remove marcação ** (negrito pleno no jsPDF exigiria runs complexos)
    const textoLimpo = p.replace(/\*\*(.+?)\*\*/g, "$1");

    doc.setFont("times", centro || titulo ? "bold" : "normal");
    doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);

    const largura = centro
      ? maxWidth
      : lista
        ? maxWidth - 8
        : maxWidth - (titulo ? 0 : indent);
    const lines = doc.splitTextToSize(textoLimpo, Math.max(largura, 40));
    const blockH = lines.length * lineH + (titulo ? 4 : 2);

    novaPaginaSePreciso(blockH);

    if (centro) {
      for (const line of lines) {
        doc.text(line, pageW / 2, y, { align: "center" });
        y += lineH;
      }
      y += 2;
      continue;
    }

    if (titulo) {
      y += 3;
      doc.text(lines, marginLeft, y);
      y += lines.length * lineH + 3;
      continue;
    }

    if (lista) {
      doc.setFont("times", "normal");
      doc.text(lines, marginLeft + 8, y);
      y += lines.length * lineH + 2;
      continue;
    }

    doc.setFont("times", "normal");
    if (lines.length > 0) {
      doc.text(lines[0]!, marginLeft + indent, y);
      y += lineH;
      if (lines.length > 1) {
        doc.text(lines.slice(1), marginLeft, y);
        y += (lines.length - 1) * lineH;
      }
    }
    y += 3;
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
  // Mantém compatibilidade: quem quiser só o blob usa gerarPecaPdfBlob.
  void nomeArquivo;
  return blob;
}

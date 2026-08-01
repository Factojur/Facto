/**
 * Exporta a peça para PDF com texto selecionável (jsPDF), sem html2canvas.
 * Evita páginas em branco, texto “fantasma” duplicado e PDFs enormes só
 * com imagem — problemas frequentes ao rasterizar o HTML da peça.
 */

type JsPdfDoc = {
  setFont: (face: string, style?: string) => void;
  setFontSize: (size: number) => void;
  splitTextToSize: (text: string, width: number) => string[];
  text: (text: string | string[], x: number, y: number, opts?: { align?: string; maxWidth?: number }) => void;
  addPage: () => void;
  save: (filename: string) => void;
  getNumberOfPages: () => number;
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
    t === t.toUpperCase() &&
    t.length < 160 &&
    /(?:A[CÇ][AÃ]O|EXECU[CÇ][AÃ]O|EMBARGOS|RECURSO|PETI[CÇ][AÃ]O)/i.test(t)
  );
}

function ehLista(t: string): boolean {
  return /^([a-z]\)|- |\d+\.\d*)\s+/i.test(t);
}

export async function baixarPecaPdf(
  pecaTexto: string,
  nomeArquivo = "peca-facto.pdf"
): Promise<void> {
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
  const marginLeft = 30;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 20;
  const maxWidth = pageW - marginLeft - marginRight;
  const indent = 15;
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
    const centro = ehEnderecamento(p) || ehFechamento(p) || ehNomeAcao(p);
    const titulo = ehTituloSecao(p);
    const lista = ehLista(p);

    doc.setFont("times", centro || titulo || ehNomeAcao(p) ? "bold" : "normal");
    doc.setFontSize(titulo || ehNomeAcao(p) ? 12 : 12);

    const largura = centro ? maxWidth : lista ? maxWidth - 8 : maxWidth - indent;
    const lines = doc.splitTextToSize(p, Math.max(largura, 40));
    const lineH = 6;
    const blockH = lines.length * lineH + (titulo ? 4 : 2);

    novaPaginaSePreciso(blockH);

    if (centro) {
      for (const line of lines) {
        doc.text(line, pageW / 2, y, { align: "center" });
        y += lineH;
      }
      y += 3;
      continue;
    }

    if (titulo) {
      y += 2;
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

    // Parágrafo justificado aproximado: primeira linha com recuo
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

  doc.save(nomeArquivo);
}

/**
 * PDF forense com texto selecionável (jsPDF):
 * margens 3/2 cm, Times 12, entrelinha ~1,5, 6 quebras após endereçamento.
 */

import {
  FORMATACAO_FORENSE,
  alturaLinhasMm,
  dividirBlocosPeca,
  parseMarcadorEspaco,
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
  return /^([IVXLCDM]+)\s*[-—–]\s+/i.test(t);
}

function ehInicioFechamento(t: string): boolean {
  return /^(Nestes termos|Termos em que|Pede e espera deferimento|Pede deferimento|pede deferimento)/i.test(
    t
  );
}

function ehFechamento(t: string): boolean {
  return (
    ehInicioFechamento(t) ||
    /^OAB\//i.test(t) ||
    /^Advogado$/i.test(t) ||
    /^[A-Za-zÀ-ÿ' .]+[/-]\s*[A-Z]{2},\s+\d/i.test(t)
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
  return /^(?:\*\*)?([a-z]\)|- |\d+\.\d*)\s+/i.test(t);
}

function ehSubtituloNegrito(t: string): boolean {
  return (
    /^(?:\*\*)?[a-z]\)\s+/i.test(t.trim()) &&
    t.replace(/\*\*/g, "").trim().length < 120
  );
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

  const paragrafos = dividirBlocosPeca(pecaTexto);

  if (paragrafos.length === 0) {
    throw new Error("A peça está vazia — nada para exportar em PDF.");
  }

  function novaPaginaSePreciso(altura: number) {
    if (y + altura > pageH - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  }

  let emFechamento = false;

  for (const p of paragrafos) {
    const marcador = parseMarcadorEspaco(p);
    if (marcador) {
      if (marcador.linhas === 6 && marcador.processo) {
        const hLinha = alturaLinhasMm(1);
        for (let i = 1; i <= 6; i++) {
          novaPaginaSePreciso(hLinha);
          if (i === 4) {
            doc.setFont("times", "normal");
            doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);
            doc.text(marcador.processo, marginLeft, y);
          }
          y += hLinha;
        }
      } else {
        const h = alturaLinhasMm(marcador.linhas);
        novaPaginaSePreciso(h);
        y += h;
      }
      continue;
    }

    if (ehInicioFechamento(p)) {
      emFechamento = true;
    }

    const centro =
      ehEnderecamento(p) || ehNomeAcao(p) || emFechamento || ehFechamento(p);
    const titulo = ehTituloSecao(p);
    const lista = ehLista(p);

    // PDF: remove marcação ** e * (negrito/itálico pleno exigiria runs complexos)
    const textoLimpo = p
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*([^*]+?)\*/g, "$1");

    doc.setFont("times", centro || titulo ? "bold" : "normal");
    doc.setFontSize(FORMATACAO_FORENSE.tamanhoPt);

    const largura = centro
      ? maxWidth
      : lista
        ? maxWidth - 8
        : maxWidth - (titulo ? 0 : indent);
    const lines = doc.splitTextToSize(textoLimpo, Math.max(largura, 40));
    const blockH = lines.length * lineH + (titulo || lista ? 2 : 0);

    novaPaginaSePreciso(blockH + 1);

    if (centro) {
      // Endereçamento e nome da ação em negrito; assinatura em peso normal
      doc.setFont(
        "times",
        ehNomeAcao(p) || ehEnderecamento(p) ? "bold" : "normal"
      );
      for (const line of lines) {
        doc.text(line, pageW / 2, y, { align: "center" });
        y += lineH;
      }
      continue;
    }

    if (titulo) {
      // Um entrelinha antes do tópico romano; sem gap extra após
      y += lineH;
      doc.text(lines, marginLeft, y);
      y += lines.length * lineH;
      continue;
    }

    if (lista) {
      doc.setFont("times", ehSubtituloNegrito(p) ? "bold" : "normal");
      doc.text(lines, marginLeft + 8, y);
      y += lines.length * lineH;
      continue;
    }

    // Corpo: recuo 1ª linha; só entrelinha 1,5 (sem espaço extra entre parágrafos)
    doc.setFont("times", "normal");
    if (lines.length > 0) {
      doc.text(lines[0]!, marginLeft + indent, y);
      y += lineH;
      if (lines.length > 1) {
        doc.text(lines.slice(1), marginLeft, y);
        y += (lines.length - 1) * lineH;
      }
    }
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

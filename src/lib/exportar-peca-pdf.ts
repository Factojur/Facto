/**
 * Exporta a peça para PDF no browser via html2pdf.js.
 * Usa o HTML timbrado (não o nó da tela) para evitar CSS do layout
 * interferir no html2canvas — causa comum de falha silenciosa.
 */

type Html2PdfChain = {
  set: (options: Record<string, unknown>) => Html2PdfChain;
  from: (element: HTMLElement) => Html2PdfChain;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfChain;

function sanitizarHtmlParaCanvas(html: string): string {
  // Alguns ambientes do html2canvas falham com emoji / símbolos fora do BMP.
  return html
    .replace(/\uFE0F/g, "")
    .replace(/⚠️/g, "[ATENCAO]")
    .replace(/[^\u0000-\uFFFF]/g, "");
}

export async function baixarPecaPdf(
  pecaHtml: string,
  nomeArquivo = "peca-facto.pdf"
): Promise<void> {
  const mod = (await import("html2pdf.js")) as unknown as {
    default?: Html2PdfFactory;
  } & Html2PdfFactory;
  const html2pdf: Html2PdfFactory =
    typeof mod.default === "function" ? mod.default : mod;
  if (typeof html2pdf !== "function") {
    throw new Error("Biblioteca html2pdf.js indisponível neste navegador.");
  }

  const container = document.createElement("div");
  container.setAttribute("data-facto-pdf-export", "1");
  container.style.cssText =
    "position:fixed;left:-10000px;top:0;width:190mm;background:#fff;color:#000;";
  container.innerHTML = sanitizarHtmlParaCanvas(pecaHtml);
  document.body.appendChild(container);

  const artigo =
    (container.querySelector(".documento-juridico") as HTMLElement | null) ??
    container;

  try {
    await html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: nomeArquivo,
        image: { type: "jpeg", quality: 0.96 },
        pagebreak: { mode: ["css", "legacy"] },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(artigo)
      .save();
  } finally {
    container.remove();
  }
}

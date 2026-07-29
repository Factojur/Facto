export async function baixarPecaPdf(
  elemento: HTMLElement,
  nomeArquivo = "peca-facto.pdf"
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  const clone = elemento.cloneNode(true) as HTMLElement;
  clone.style.maxWidth = "21cm";
  clone.style.padding = "0";
  clone.style.background = "#fff";

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "21cm";
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: [30, 20, 20, 30],
        filename: nomeArquivo,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

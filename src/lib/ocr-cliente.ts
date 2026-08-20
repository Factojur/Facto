/**
 * OCR leve no navegador (Tesseract.js) — sem custo de API.
 * Usado em imagens e na 1ª página de PDF escaneado.
 */

const MAX_IMAGEM_OCR_BYTES = 8 * 1024 * 1024;
const MIN_CHARS_OCR_UTIL = 25;

function ehImagem(file: File): boolean {
  const m = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  return (
    m.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|bmp|tif?f)$/.test(n)
  );
}

function ehPdf(file: File): boolean {
  return (
    file.type.toLowerCase().includes("pdf") ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

async function carregarTesseract() {
  const Tesseract = await import("tesseract.js");
  return Tesseract;
}

/** OCR de arquivo de imagem (JPEG, PNG, etc.). */
export async function ocrImagemArquivo(file: File): Promise<string> {
  if (!ehImagem(file)) return "";
  if (file.size > MAX_IMAGEM_OCR_BYTES) return "";

  const Tesseract = await carregarTesseract();
  const { data } = await Tesseract.recognize(file, "por", {
    logger: () => {},
  });
  return String(data.text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Renderiza a 1ª página do PDF em canvas e aplica OCR. */
export async function ocrPrimeiraPaginaPdf(file: File): Promise<string> {
  if (!ehPdf(file)) return "";
  if (file.size > MAX_IMAGEM_OCR_BYTES * 2) return "";

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  if (doc.numPages < 1) return "";

  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png")
  );
  if (!blob) return "";

  const Tesseract = await carregarTesseract();
  const { data } = await Tesseract.recognize(blob, "por", {
    logger: () => {},
  });
  return String(data.text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function textoOcrUtil(texto: string): boolean {
  return texto.trim().length >= MIN_CHARS_OCR_UTIL;
}

export { MIN_CHARS_OCR_UTIL };

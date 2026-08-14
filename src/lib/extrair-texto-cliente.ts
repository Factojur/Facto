/**
 * Extrai texto de PDF/DOCX no navegador para não enviar o arquivo
 * inteiro à API (teto ~4,5 MB da Vercel).
 */

export const LIMITE_ARQUIVO_LOCAL_BYTES = 40 * 1024 * 1024;
export const MIN_CHARS_TEXTO_UTIL = 40;

function mimeDoNome(nome: string, mime: string): "pdf" | "docx" | null {
  const m = mime.toLowerCase();
  const n = nome.toLowerCase();
  if (
    m.includes("wordprocessingml") ||
    n.endsWith(".docx")
  ) {
    return "docx";
  }
  if (m.includes("pdf") || n.endsWith(".pdf")) return "pdf";
  return null;
}

async function textoDePdf(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const partes: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const linha = content.items
      .map((it) => ("str" in it ? String(it.str) : ""))
      .join(" ");
    if (linha.trim()) partes.push(linha);
  }
  return partes.join("\n\n").trim();
}

async function textoDeDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const r = await mammoth.extractRawText({ arrayBuffer: buffer });
  return String(r.value ?? "").trim();
}

export async function extrairTextoArquivoLocal(file: File): Promise<string> {
  const tipo = mimeDoNome(file.name, file.type);
  if (!tipo) {
    throw new Error(`Formato não suportado (${file.name}). Use PDF ou DOCX.`);
  }
  const buffer = await file.arrayBuffer();
  if (tipo === "docx") return textoDeDocx(buffer);
  return textoDePdf(buffer);
}

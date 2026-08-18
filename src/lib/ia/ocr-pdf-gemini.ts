/**
 * OCR de PDF/imagem via Gemini (Flash), só quando o PDF não tem texto selecionável.
 * Sem Google Search. Não gera peça.
 */

import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
  type AnexoGemini,
} from "@/lib/ia/gemini-client";

const MIN_CHARS = 40;

export async function ocrComGemini(params: {
  nome: string;
  mimeType: string;
  dataBase64: string;
}): Promise<string | null> {
  if (!geminiConfigurado()) return null;
  const mime = params.mimeType.trim() || "application/pdf";
  if (!mime.includes("pdf") && !mime.startsWith("image/")) return null;

  const anexo: AnexoGemini = {
    mimeType: mime.includes("pdf") ? "application/pdf" : mime,
    dataBase64: params.dataBase64,
  };

  const res = await gerarTextoComGemini({
    systemPrompt:
      "Você transcreve documentos jurídicos em português. Devolva só o texto corrido, sem markdown e sem comentário. Se a imagem for ilegível, devolva vazio.",
    userPrompt: `Transcreva o conteúdo de “${params.nome}”.`,
    modelos: MODELOS_TRIAGEM,
    temperature: 0.1,
    maxOutputTokens: 8192,
    anexos: [anexo],
  });

  if (!res.ok) return null;
  const texto = res.texto.trim();
  return texto.length >= MIN_CHARS ? texto : null;
}

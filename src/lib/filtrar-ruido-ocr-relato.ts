/**
 * Remove ruído típico de OCR/PDF (e-mail Outlook, URLs, marcadores de página)
 * do relato antes de triagem/redação/UI — 0 tokens.
 */

const BLOCOS_LIXO = [
  /^-{3,}\s*Mensagem original\s*-{3,}[\s\S]*?(?=\n\n[A-ZÀ-Ú]|\n-{3,}|\nEXCELENT|$)/gim,
  /^(?:De|From|Para|To|Assunto|Subject|Enviado|Sent):\s.+$/gim,
  /\[cid:[^\]]+\]/gi,
  /\bPágina\s+\d+\s+de\s+\d+\b/gi,
  /\bPage\s+\d+\s+of\s+\d+\b/gi,
  /\bfatos na reda[cç][aã]o definitiva\b/gi,
  /\bpr[eé]-?visualiza[cç][aã]o forense\b/gi,
  /\bscaffold\b/gi,
  /\bEste documento [eé] apenas uma pr[eé]via\b/gi,
  // Cabeçalho de extrator: "--- arquivo.pdf --- página N ---"
  /^-{2,}\s*[^\n]*\.pdf[^\n]*-{2,}[^\n]*$/gim,
  /https?:\/\/outlook\.office\.com\/[^\s]+/gi,
  /https?:\/\/[^\s]*office\.com\/[^\s]+/gi,
  /\bAAQkA[A-Za-z0-9+/=_-]{20,}/g,
];

/** Linhas que são quase só metadado de scanner/e-mail. */
function linhaLixo(linha: string): boolean {
  const t = linha.trim();
  if (!t) return false;
  // URL sozinha (curta ou longa — Outlook gera URLs enormes)
  if (/^https?:\/\//i.test(t)) return true;
  if (/https?:\/\/\S{40,}/i.test(t) && t.length > 80) return true;
  if (/^(?:De|From|Para|To|Cc|Cco|Bcc|Assunto|Subject|Enviado|Sent)\s*:/i.test(t))
    return true;
  if (/^\[?cid:/i.test(t)) return true;
  if (/^_{5,}$/.test(t) || /^-{5,}$/.test(t) || /^={5,}$/.test(t)) return true;
  if (/^Página\s+\d+/i.test(t)) return true;
  if (/outlook\.office|mail\.google|webmail|safelinks\.protection/i.test(t))
    return true;
  if (/---\s*página\s+\d+\s*---/i.test(t)) return true;
  if (/\.pdf\s*-{2,}/i.test(t)) return true;
  if (/^---\s*.+\.pdf/i.test(t)) return true;
  if (/Email\s*-\s*.+\s*-\s*Outlook/i.test(t)) return true;
  if (/@tjsp\.jus\.br|@mackenzie|@outlook|@gmail|@hotmail/i.test(t) && t.length < 280)
    return true;
  if (/pr[eé]-?visualiza[cç][aã]o:\s*esta se[cç][aã]o/i.test(t)) return true;
  if (/reda[cç][aã]o definitiva/i.test(t) && /narrados em ordem/i.test(t))
    return true;
  // Tokens base64 / ids de mensagem
  if (/^[A-Za-z0-9+/=_-]{48,}$/.test(t)) return true;
  if (/\bAAQkA[A-Za-z0-9+/=_-]{12,}/.test(t)) return true;
  // Linha quase só pontuação/hex
  if (t.length > 40 && !/[a-záàâãéêíóôõúç]{4,}/i.test(t)) return true;
  return false;
}

/**
 * Limpa relato/OCR para a IA e o painel trabalharem só com fatos úteis.
 * Não inventa conteúdo; só remove lixo óbvio.
 */
export function filtrarRuidoOcrRelato(texto: string): string {
  let t = texto.replace(/\r\n/g, "\n");
  for (const re of BLOCOS_LIXO) {
    t = t.replace(re, "\n");
  }
  const linhas = t.split("\n").filter((l) => !linhaLixo(l));
  return linhas
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Resumo curto para UI (plano) — nunca despeja cabeçalho de e-mail/OCR.
 */
export function resumoFatosParaPainel(
  texto: string,
  maxChars = 280
): string {
  const limpo = filtrarRuidoOcrRelato(texto);
  if (!limpo || limpo.length < 40) return "";
  const compacto = limpo.replace(/\s+/g, " ").trim();
  if (compacto.length <= maxChars) return compacto;
  return `${compacto.slice(0, maxChars).trim()}…`;
}

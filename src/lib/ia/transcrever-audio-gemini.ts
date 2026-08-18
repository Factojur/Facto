/**
 * Transcreve áudio curto (relato do caso) via Gemini Flash-Lite.
 * Não grava arquivo. Não gera peça. Não preenche as abas.
 */

import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import { mimeAudioPermitido } from "@/lib/transcrever-audio";

export async function transcreverAudioComGemini(params: {
  mimeType: string;
  dataBase64: string;
}): Promise<{ ok: true; texto: string } | { ok: false; erro: string }> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "Transcrição indisponível neste ambiente.",
    };
  }
  const mime = mimeAudioPermitido(params.mimeType);
  if (!mime) {
    return { ok: false, erro: "Formato de áudio não suportado." };
  }
  const dataBase64 = params.dataBase64.replace(/^data:[^;]+;base64,/, "");
  if (!dataBase64) {
    return { ok: false, erro: "Áudio vazio." };
  }

  const res = await gerarTextoComGemini({
    systemPrompt:
      "Você transcreve áudio falado em português do Brasil, no contexto de um relato jurídico (advogado ou parte). Devolva SÓ a transcrição corrida, em prosa, sem markdown, sem título e sem comentário. Preserve nomes, datas, valores e números como ouviu. Não invente fatos. Não resuma. Se o áudio for inaudível, devolva vazio.",
    userPrompt: "Transcreva o áudio a seguir.",
    modelos: MODELOS_TRIAGEM,
    temperature: 0.1,
    maxOutputTokens: 4096,
    anexos: [{ mimeType: mime, dataBase64 }],
  });

  if (!res.ok) {
    return { ok: false, erro: res.erro };
  }
  const texto = res.texto.trim();
  if (!texto) {
    return {
      ok: false,
      erro: "Não deu para entender o áudio. Fale de novo, mais perto do microfone.",
    };
  }
  return { ok: true, texto };
}

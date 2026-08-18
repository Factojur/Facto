/**
 * Ajuste pontual da minuta já gerada. Não é compositor.
 * Proibido: mudar endereçamento, inventar julgado, encurtar a peça inteira.
 */

import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

export const AJUSTES_POR_GERACAO = 2;

export async function ajustarTrechoPeca(params: {
  peca: string;
  pedido: string;
}): Promise<{ ok: true; peca: string } | { ok: false; erro: string }> {
  const peca = params.peca.trim();
  const pedido = params.pedido.trim();
  if (peca.length < 200) {
    return { ok: false, erro: "Não há minuta para ajustar." };
  }
  if (pedido.length < 8) {
    return { ok: false, erro: "Descreva o ajuste (mín. 8 caracteres)." };
  }
  if (!geminiConfigurado()) {
    return { ok: false, erro: "IA indisponível para ajuste." };
  }

  const res = await gerarTextoComGemini({
    systemPrompt: [
      "Você edita uma minuta forense já pronta.",
      "Devolva a peça COMPLETA (não um trecho).",
      "Altere SÓ o que o pedido pedir.",
      "PROIBIDO: mudar endereçamento; inventar número de processo, REsp ou relator; apagar seções; resumir a peça; modo curto.",
      "Se o pedido pedir julgado novo, ignore e mantenha as citações que já existem.",
      "Sem markdown de cerca, sem comentário — só o texto da peça.",
    ].join(" "),
    userPrompt: [
      "<PEDIDO_DE_AJUSTE>",
      pedido.slice(0, 2000),
      "</PEDIDO_DE_AJUSTE>",
      "",
      "<PECA>",
      peca.slice(0, 60_000),
      "</PECA>",
    ].join("\n"),
    modelos: MODELOS_TRIAGEM,
    temperature: 0.2,
    maxOutputTokens: 8192,
  });

  if (!res.ok) return { ok: false, erro: res.erro };
  const texto = res.texto.trim();
  if (texto.length < Math.min(400, peca.length * 0.5)) {
    return {
      ok: false,
      erro: "O ajuste veio truncado. A minuta original foi mantida.",
    };
  }
  return { ok: true, peca: texto };
}

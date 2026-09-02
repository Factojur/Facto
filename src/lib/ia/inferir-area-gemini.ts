/**
 * Interpretação de área + espécie (Flash-Lite) — alinhado ao MinutaIA.
 * Heurística local fica como pista; a IA decide o remédio do caso.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import { rotuloAreaChat } from "@/lib/chat-minuta";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

export type ResultadoInferenciaCasoIa = {
  areaId: AreaIdMinuta;
  especiePeca: string | null;
  motivo: string;
  modelo: string;
};

function extrairJson(texto: string): Record<string, unknown> | null {
  const limpo = texto
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const p = JSON.parse(limpo);
    if (p && typeof p === "object" && !Array.isArray(p)) return p as Record<string, unknown>;
  } catch {
    const i = limpo.indexOf("{");
    const f = limpo.lastIndexOf("}");
    if (i >= 0 && f > i) {
      try {
        const p = JSON.parse(limpo.slice(i, f + 1));
        if (p && typeof p === "object") return p as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** @deprecated preferir inferirCasoComGemini — mantido para chamadas só de área. */
export async function inferirAreaComGemini(input: {
  relato: string;
  candidatas: AreaIdMinuta[];
}): Promise<{ areaId: AreaIdMinuta; motivo: string; modelo: string } | null> {
  const r = await inferirCasoComGemini(input);
  if (!r) return null;
  return { areaId: r.areaId, motivo: r.motivo, modelo: r.modelo };
}

export async function inferirCasoComGemini(input: {
  relato: string;
  candidatas: AreaIdMinuta[];
  pistaLocal?: { areaId?: string; especiePeca?: string | null } | null;
}): Promise<ResultadoInferenciaCasoIa | null> {
  if (!geminiConfigurado() || input.candidatas.length === 0) return null;

  const relato = input.relato.trim().slice(0, 14_000);
  const opcoes = input.candidatas
    .map((id) => `- ${id}: ${rotuloAreaChat(id)}`)
    .join("\n");
  const pista = input.pistaLocal
    ? `\nPista local (não vincule; use só se coincidir com a boa técnica): área=${input.pistaLocal.areaId ?? "?"} espécie=${input.pistaLocal.especiePeca ?? "?"}`
    : "";

  const system = `Você é advogado sênior brasileiro. Classifique o caso para redigir a peça cabível AGORA.

Regras:
- Interprete o caso concreto (último ato, polo, incidente já aberto). Não force fórmulas.
- Cumprimento/execução JÁ instaurado + decisão interlocutória do juiz → em regra AGRAVO DE INSTRUMENTO (art. 1.015, parágrafo único, CPC), NÃO reabrir o incidente e NÃO usar mandado de segurança se há recurso próprio.
- Mandado de segurança só se cabível (ato coator sem recurso adequado, ou pedido explícito de MS).
- Habeas corpus → área criminal.
- Responda APENAS JSON:
{"areaId":"...","especiePeca":"slug-kebab","motivo":"uma frase curta em português"}
- areaId deve ser exatamente um dos ids listados.
- especiePeca exemplos: agravo-instrumento, mandado-seguranca, habeas-corpus, peticao-inicial, contestacao, reclamacao, embargos-declaracao, resposta-acusacao, replica, cumprimento-sentenca. Use null se incerto.`;

  const user = `Áreas possíveis:\n${opcoes}${pista}\n\nRelato/autos (trecho):\n${relato}`;

  const r = await gerarTextoComGemini({
    systemPrompt: system,
    userPrompt: user,
    modelos: MODELOS_TRIAGEM,
    maxOutputTokens: 180,
    temperature: 0.15,
  });

  if (!r.ok) return null;
  const json = extrairJson(r.texto);
  const areaId = String(json?.areaId ?? "").trim() as AreaIdMinuta;
  if (!input.candidatas.includes(areaId)) return null;
  const especieRaw = json?.especiePeca;
  const especiePeca =
    especieRaw == null || especieRaw === ""
      ? null
      : String(especieRaw)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .slice(0, 64) || null;
  const motivo = String(json?.motivo ?? "Interpretação assistida.")
    .trim()
    .slice(0, 220);
  return { areaId, especiePeca, motivo, modelo: r.modelo };
}

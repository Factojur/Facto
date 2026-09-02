/**
 * Classificação de área (Flash-Lite) — só casos ambíguos após regex local.
 */

import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import { rotuloAreaChat } from "@/lib/chat-minuta";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";

export type ResultadoInferenciaAreaIa = {
  areaId: AreaIdMinuta;
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

export async function inferirAreaComGemini(input: {
  relato: string;
  candidatas: AreaIdMinuta[];
}): Promise<ResultadoInferenciaAreaIa | null> {
  if (!geminiConfigurado() || input.candidatas.length === 0) return null;

  const relato = input.relato.trim().slice(0, 12_000);
  const opcoes = input.candidatas
    .map((id) => `- ${id}: ${rotuloAreaChat(id)}`)
    .join("\n");

  const system = `Você classifica a área jurídica de um caso brasileiro para redação de peça.
Responda APENAS JSON: {"areaId":"...","motivo":"uma frase curta em português"}
areaId deve ser exatamente um dos ids listados.`;

  const user = `Áreas possíveis:\n${opcoes}\n\nRelato/autos (trecho):\n${relato}`;

  const r = await gerarTextoComGemini({
    systemPrompt: system,
    userPrompt: user,
    modelos: MODELOS_TRIAGEM,
    maxOutputTokens: 120,
    temperature: 0.1,
  });

  if (!r.ok) return null;
  const json = extrairJson(r.texto);
  const areaId = String(json?.areaId ?? "").trim() as AreaIdMinuta;
  if (!input.candidatas.includes(areaId)) return null;
  const motivo = String(json?.motivo ?? "Classificação assistida.").trim().slice(0, 200);
  return { areaId, motivo, modelo: r.modelo };
}

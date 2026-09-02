import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import {
  CHAT_MINUTA_AREAS_FASE1,
  chatMinutaAreaHabilitada,
  type InferenciaAreaChat,
} from "@/lib/chat-minuta";
import { inferirCasoComGemini } from "@/lib/ia/inferir-area-gemini";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";

export const maxDuration = 30;

/**
 * POST — interpretação de área + espécie (Flash-Lite).
 * Não consome cota de peça. Heurística local é só pista opcional.
 */
export async function POST(request: Request) {
  const gate = await exigirAcessoAreaMinuta("jec");
  if (!gate.ok) return gate.response;

  if (!geminiConfigurado()) {
    return Response.json({ erro: "Gemini indisponível" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    relato?: string;
    candidatas?: string[];
    pistaLocal?: { areaId?: string; especiePeca?: string | null } | null;
  } | null;

  const relato = String(body?.relato ?? "").trim();
  if (relato.length < 40) {
    return Response.json({ erro: "Relato curto demais." }, { status: 400 });
  }

  const candidatas = (body?.candidatas ?? CHAT_MINUTA_AREAS_FASE1)
    .map((id) => id.trim())
    .filter((id): id is AreaIdMinuta =>
      chatMinutaAreaHabilitada(id as AreaIdMinuta)
    )
    .slice(0, 8);

  if (candidatas.length === 0) {
    return Response.json({ erro: "Sem candidatas válidas." }, { status: 400 });
  }

  const resultado = await inferirCasoComGemini({
    relato,
    candidatas,
    pistaLocal: body?.pistaLocal ?? null,
  });
  if (!resultado) {
    return Response.json({ erro: "Falha na classificação." }, { status: 502 });
  }

  const inferencia: InferenciaAreaChat = {
    areaId: resultado.areaId,
    confianca: "alta",
    alternativas: candidatas.filter((c) => c !== resultado.areaId).slice(0, 3),
  };

  return Response.json({
    inferencia,
    especiePeca: resultado.especiePeca,
    motivo: resultado.motivo,
    modelo: resultado.modelo,
  });
}

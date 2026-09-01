import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import type { EstadoCasoChat, MensagemChat } from "@/lib/chat-minuta";
import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import {
  geminiConfigurado,
  MODELOS_TRIAGEM,
  streamTextoGeminiNdjson,
} from "@/lib/ia/gemini-client";
import { montarPromptsConversaStream } from "@/lib/ia/chat-conversa-assistente";
import { normalizarModoConversa } from "@/lib/modo-conversa-chat";

export const maxDuration = 60;

/**
 * POST /api/chat-conversa/stream — resposta em NDJSON (streaming).
 * Linhas: `{ t: "delta" }` · `{ done: true, modelo }` · `{ error: "..." }`
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    mensagem?: string;
    estado?: EstadoCasoChat;
    triagem?: PreviewTriagemData | null;
    mensagens?: MensagemChat[];
    avisoExtra?: string | null;
    modo?: string;
  } | null;

  const areaId = body?.estado?.areaId;
  const gate = await exigirAcessoAreaMinuta(areaId);
  if (!gate.ok) return gate.response;

  const mensagem = String(body?.mensagem ?? "").trim();
  if (mensagem.length < 2) {
    return new Response(
      `${JSON.stringify({ error: "Mensagem muito curta." })}\n`,
      { status: 400, headers: { "Content-Type": "application/x-ndjson" } }
    );
  }

  if (!geminiConfigurado()) {
    return new Response(
      `${JSON.stringify({ error: "Gemini indisponível — use fallback local." })}\n`,
      { status: 503, headers: { "Content-Type": "application/x-ndjson" } }
    );
  }

  const estado = body?.estado;
  if (!estado) {
    return new Response(`${JSON.stringify({ error: "Estado ausente." })}\n`, {
      status: 400,
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }

  const { system, user, maxOutputTokens, temperature } = montarPromptsConversaStream({
    mensagem,
    estado,
    triagem: body?.triagem ?? null,
    mensagens: Array.isArray(body?.mensagens) ? body!.mensagens! : [],
    avisoExtra: body?.avisoExtra ?? null,
    modo: normalizarModoConversa(body?.modo),
  });

  const stream = streamTextoGeminiNdjson({
    systemPrompt: system,
    userPrompt: user,
    modelos: MODELOS_TRIAGEM,
    maxOutputTokens,
    temperature,
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

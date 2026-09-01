import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import type { EstadoCasoChat, MensagemChat } from "@/lib/chat-minuta";
import {
  aplicarPatchEstadoRefinar,
  refinarPlanoComGemini,
} from "@/lib/ia/chat-refinar-plano";
import { mensagemErroIaParaCliente } from "@/lib/erro-ia-cliente";

export const maxDuration = 25;

/**
 * POST /api/chat-refinar-plano — turno conversacional (Flash-Lite).
 * Não debita cota de peça; custo marginal ~centavos por turno.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      mensagem?: string;
      estado?: EstadoCasoChat;
      triagem?: PreviewTriagemData | null;
      mensagens?: MensagemChat[];
    } | null;

    const areaId = body?.estado?.areaId;
    const gate = await exigirAcessoAreaMinuta(areaId);
    if (!gate.ok) return gate.response;

    const mensagem = String(body?.mensagem ?? "").trim();
    if (mensagem.length < 3) {
      return NextResponse.json(
        { error: "Mensagem muito curta.", codigo: "MSG_CURTA" },
        { status: 400 }
      );
    }

    const estado = body?.estado;
    if (!estado?.fatos?.trim()) {
      return NextResponse.json(
        { error: "Organize o caso antes de refinar.", codigo: "SEM_CASO" },
        { status: 400 }
      );
    }

    const mensagens = Array.isArray(body?.mensagens) ? body.mensagens : [];
    const triagem = body?.triagem ?? null;

    const resultado = await refinarPlanoComGemini({
      mensagem,
      estado,
      triagem,
      mensagens,
    });

    if (!resultado) {
      return NextResponse.json(
        {
          ok: false,
          fallback: true,
          error: mensagemErroIaParaCliente("IA indisponível para este turno."),
        },
        { status: 503 }
      );
    }

    let estadoAtualizado: EstadoCasoChat | undefined;
    if (resultado.patchEstado) {
      estadoAtualizado = aplicarPatchEstadoRefinar(estado, resultado.patchEstado);
    }

    return NextResponse.json({
      ok: true,
      resposta: resultado.resposta,
      perguntaProativa: resultado.perguntaProativa ?? null,
      estado: estadoAtualizado,
      modelo: resultado.modelo,
    });
  } catch (erro) {
    console.error("[chat-refinar-plano]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? mensagemErroIaParaCliente(erro.message)
            : "Falha ao refinar o plano.",
      },
      { status: 500 }
    );
  }
}

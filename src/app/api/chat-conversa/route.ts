import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";
import type { EstadoCasoChat, MensagemChat } from "@/lib/chat-minuta";
import {
  aplicarPatchEstadoRefinar,
  conversarAssistenteFase1,
} from "@/lib/ia/chat-conversa-assistente";
import { mensagemErroIaParaCliente } from "@/lib/erro-ia-cliente";

export const maxDuration = 30;

/**
 * POST /api/chat-conversa — turno Fase 1 (conversa fluida, sem cota de peça).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      mensagem?: string;
      estado?: EstadoCasoChat;
      estadoAnterior?: EstadoCasoChat;
      triagem?: PreviewTriagemData | null;
      mensagens?: MensagemChat[];
      primeiroRelato?: boolean;
      avisoExtra?: string | null;
    } | null;

    const areaId = body?.estado?.areaId;
    const gate = await exigirAcessoAreaMinuta(areaId);
    if (!gate.ok) return gate.response;

    const mensagem = String(body?.mensagem ?? "").trim();
    if (mensagem.length < 2) {
      return NextResponse.json(
        { error: "Mensagem muito curta.", codigo: "MSG_CURTA" },
        { status: 400 }
      );
    }

    const estado = body?.estado;
    if (!estado?.fatos?.trim() && mensagem.length < 20) {
      return NextResponse.json({
        ok: true,
        resposta:
          "Conte um pouco mais sobre o caso — fatos, partes, o que você precisa na peça. Pode colar texto ou anexar PDF.",
        modelo: "local",
      });
    }

    const estadoAnterior = body?.estadoAnterior ?? estado!;
    const mensagens = Array.isArray(body?.mensagens) ? body!.mensagens! : [];
    const triagem = body?.triagem ?? null;

    const resultado = await conversarAssistenteFase1({
      mensagem,
      estado: estado!,
      estadoAnterior,
      triagem,
      mensagens,
      primeiroRelato: Boolean(body?.primeiroRelato),
      avisoExtra: body?.avisoExtra ?? null,
    });

    let estadoAtualizado: EstadoCasoChat | undefined;
    if (resultado.patchEstado) {
      estadoAtualizado = aplicarPatchEstadoRefinar(estado!, resultado.patchEstado);
    }

    return NextResponse.json({
      ok: true,
      resposta: resultado.resposta,
      perguntaProativa: resultado.perguntaProativa ?? null,
      estado: estadoAtualizado,
      modelo: resultado.modelo,
    });
  } catch (erro) {
    console.error("[chat-conversa]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? mensagemErroIaParaCliente(erro.message)
            : "Falha na conversa.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { transcreverAudioComGemini } from "@/lib/ia/transcrever-audio-gemini";
import {
  LIMITE_AUDIO_TRANSCRICAO_BYTES,
  mimeAudioPermitido,
} from "@/lib/transcrever-audio";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { dentroDoLimite } from "@/lib/rate-limit-memoria";

export const maxDuration = 60;

const TRANSCRICOES_POR_HORA = 8;

/**
 * POST /api/transcrever-audio — voz → texto no campo.
 * Não consome cota de análise nem de peça. Não grava o áudio.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      mimeType?: string;
      base64?: string;
      areaId?: string;
    } | null;

    const acesso = await exigirAcessoAreaMinuta(body?.areaId);
    if (!acesso.ok) return acesso.response;

    if (
      !dentroDoLimite({
        chave: `transcrever:${acesso.user.id}`,
        max: TRANSCRICOES_POR_HORA,
        janelaMs: 60 * 60 * 1000,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "Limite de transcrições nesta hora. Digite o relato ou tente mais tarde.",
        },
        { status: 429 }
      );
    }

    const mime = mimeAudioPermitido(String(body?.mimeType ?? ""));
    const b64 = String(body?.base64 ?? "").replace(/^data:[^;]+;base64,/, "");
    if (!mime || !b64) {
      return NextResponse.json(
        { error: "Envie o áudio gravado no microfone." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(b64, "base64");
    if (bytes.length < 800) {
      return NextResponse.json(
        {
          error:
            "O áudio chegou vazio ao servidor. Confira o microfone padrão do sistema e tente de novo.",
        },
        { status: 400 }
      );
    }
    if (bytes.length > LIMITE_AUDIO_TRANSCRICAO_BYTES) {
      return NextResponse.json(
        { error: "Áudio grande demais. Fale em até cerca de 5 minutos." },
        { status: 400 }
      );
    }

    const resultado = await transcreverAudioComGemini({
      mimeType: mime,
      dataBase64: b64,
    });
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.erro }, { status: 400 });
    }
    return NextResponse.json({ texto: resultado.texto });
  } catch (erro) {
    console.error("[transcrever-audio]", erro);
    return NextResponse.json(
      { error: "Não foi possível transcrever. Tente de novo." },
      { status: 500 }
    );
  }
}

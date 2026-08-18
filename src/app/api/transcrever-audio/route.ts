import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcreverAudioComGemini } from "@/lib/ia/transcrever-audio-gemini";
import {
  LIMITE_AUDIO_TRANSCRICAO_BYTES,
  mimeAudioPermitido,
} from "@/lib/transcrever-audio";

export const maxDuration = 45;

/**
 * POST /api/transcrever-audio — voz → texto no campo.
 * Não consome cota de análise nem de peça. Não grava o áudio.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      mimeType?: string;
      base64?: string;
    } | null;

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
        { error: "A gravação ficou curta demais. Fale de novo." },
        { status: 400 }
      );
    }
    if (bytes.length > LIMITE_AUDIO_TRANSCRICAO_BYTES) {
      return NextResponse.json(
        { error: "Áudio grande demais. Fale em até cerca de 3 minutos." },
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

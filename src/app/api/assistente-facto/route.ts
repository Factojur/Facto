import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analisarCaseComGemini } from "@/lib/ia/analisar-assistente-gemini";
import { normalizarAreaIdMinuta } from "@/lib/minuta-modulo";

export const maxDuration = 30;

/**
 * POST /api/assistente-facto — classifica ação + cúmulos via Gemini.
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
      fatos?: string;
      areaId?: string;
    } | null;

    const fatos = String(body?.fatos ?? "").trim();
    const areaId = normalizarAreaIdMinuta(body?.areaId);
    if (fatos.length < 40) {
      return NextResponse.json(
        {
          error:
            "Descreva os fatos com mais detalhes (mín. ~40 caracteres) antes de analisar.",
          codigo: "FATOS_INSUFICIENTES",
        },
        { status: 400 }
      );
    }

    const decisao = await analisarCaseComGemini({ fatos, areaId });

    return NextResponse.json({ decisao });
  } catch (erro) {
    console.error("[assistente-facto]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao analisar o caso com o Assistente Facto.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { analisarCaseComGemini } from "@/lib/ia/analisar-assistente-gemini";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";

export const maxDuration = 30;

/**
 * POST /api/assistente-facto — classifica ação + cúmulos via Gemini.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      fatos?: string;
      areaId?: string;
    } | null;

    const gate = await exigirAcessoAreaMinuta(body?.areaId);
    if (!gate.ok) return gate.response;

    const fatos = String(body?.fatos ?? "").trim();
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

    const decisao = await analisarCaseComGemini({ fatos, areaId: gate.areaId });

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

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { preencherEntradaCaso } from "@/lib/ia/preencher-entrada-caso";
import { ocrComGemini } from "@/lib/ia/ocr-pdf-gemini";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import { normalizarAreaIdMinuta } from "@/lib/minuta-modulo";
import {
  obterResumoCotaUsuario,
  registrarUmaAnalise,
} from "@/lib/cota-pecas-server";
import {
  extrairTextoDeArquivo,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import { LIMITE_UPLOAD_ANALISE_BYTES } from "@/lib/entrada-caso-types";

export const maxDuration = 60;

type ArquivoIn = {
  nome?: string;
  mimeType?: string;
  base64?: string;
};

/**
 * POST /api/entrada-caso — preenche as 3 abas. Não gera peça.
 * Consome 1 análise (não cota de peça).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      relato?: string;
      areaId?: string;
      arquivos?: ArquivoIn[];
    } | null;

    const areaId = normalizarAreaIdMinuta(body?.areaId);
    const partes: string[] = [];
    const relatoDigitado = String(body?.relato ?? "").trim();
    if (relatoDigitado) partes.push(relatoDigitado);

    const arquivos = Array.isArray(body?.arquivos) ? body.arquivos : [];
    let total = 0;
    for (const arq of arquivos.slice(0, 4)) {
      const nome = String(arq.nome ?? "documento").slice(0, 180);
      const mime = String(arq.mimeType ?? "application/pdf");
      const b64 = String(arq.base64 ?? "").replace(/^data:[^;]+;base64,/, "");
      if (!b64) continue;
      const buffer = Buffer.from(b64, "base64");
      total += buffer.length;
      if (total > LIMITE_UPLOAD_ANALISE_BYTES) {
        return NextResponse.json(
          {
            error:
              "Os arquivos somam mais de ~3,5 MB. Envie um PDF mais leve ou cole o texto.",
            codigo: "ARQUIVO_GRANDE",
          },
          { status: 400 }
        );
      }
      let texto = "";
      if (mime in TIPOS_ARQUIVO_ACEITOS) {
        texto = (await extrairTextoDeArquivo(buffer, mime)).trim();
      }
      if (texto.length < 40) {
        const ocr = await ocrComGemini({
          nome,
          mimeType: mime,
          dataBase64: b64,
        });
        texto = ocr?.trim() ?? "";
      }
      if (texto.length >= 40) {
        partes.push(`--- ${nome} ---\n${texto}`);
      }
    }

    const relato = partes.join("\n\n").trim();
    if (relato.length < 40) {
      return NextResponse.json(
        {
          error:
            "Cole o caso (mín. ~40 caracteres) ou envie um PDF/DOCX com texto ou imagem nítida.",
          codigo: "RELATO_INSUFICIENTE",
        },
        { status: 400 }
      );
    }

    const cotaAntes = await obterResumoCotaUsuario({
      userId: user.id,
      email: user.email,
    });
    if (cotaAntes.trackingAtivo && cotaAntes.esgotadaAnalises) {
      return NextResponse.json(
        {
          error: `Limite mensal de análises atingido (${cotaAntes.limiteAnalisesTotal}/mês). A entrada única usa 1 análise, não a cota de peça.`,
          codigo: "LIMITE_ANALISES",
        },
        { status: 429 }
      );
    }

    const preenchimento = await preencherEntradaCaso({ relato, areaId });
    const teses = detectarTesesCanonicas(
      areaId,
      [preenchimento.fatos, relato].filter(Boolean).join("\n"),
      preenchimento.tesesIds
    );
    preenchimento.tesesIds = teses.map((t) => t.id);

    const registro = await registrarUmaAnalise({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      preenchimento,
      teses: teses.map((t) => ({
        id: t.id,
        rotulo: t.rotulo,
        artigos: t.artigos,
      })),
      analisesNoCiclo: registro.ok ? registro.analises : registro.analises,
      avisoCota: registro.ok
        ? undefined
        : "Limite de análises atingido após esta solicitação.",
    });
  } catch (erro) {
    console.error("[entrada-caso]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao preencher o caso.",
      },
      { status: 500 }
    );
  }
}

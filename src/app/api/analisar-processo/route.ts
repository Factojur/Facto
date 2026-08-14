import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import type { ArquivoProcessoPayload } from "@/lib/analisar-processo-types";
import { analisarProcessoComGemini } from "@/lib/ia/analisar-processo-gemini";
import {
  obterResumoCotaUsuario,
  registrarUmaAnalise,
} from "@/lib/cota-pecas-server";

export const maxDuration = 90;

const MAX_ARQUIVOS = 6;

/**
 * POST /api/analisar-processo
 * Passos 1–5: extrai textos, classifica, ficha + peça candidata.
 * Não consome cota de peça; registra métrica de análises.
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
      arquivos?: ArquivoProcessoPayload[];
    } | null;

    const arquivos = Array.isArray(body?.arquivos) ? body!.arquivos : [];
    if (arquivos.length === 0) {
      return NextResponse.json(
        {
          error: "Envie ao menos um PDF ou DOCX (autos ou peças selecionadas).",
          codigo: "SEM_ARQUIVOS",
        },
        { status: 400 }
      );
    }
    if (arquivos.length > MAX_ARQUIVOS) {
      return NextResponse.json(
        {
          error: `No máximo ${MAX_ARQUIVOS} arquivos por análise.`,
          codigo: "LIMITE_ARQUIVOS",
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
          error: `Limite mensal de análises atingido (${cotaAntes.limiteAnalisesTotal}/mês). Compre o pacote +10 análises ou aguarde o próximo ciclo. Não consome cota de peça.`,
          codigo: "LIMITE_ANALISES",
          analises: cotaAntes.analisesUsadas,
          limite: cotaAntes.limiteAnalisesTotal,
        },
        { status: 429 }
      );
    }

    const docsTexto: {
      nome: string;
      rotuloHint?: string;
      texto: string;
    }[] = [];

    for (const arq of arquivos) {
      const nome = String(arq.nome ?? "documento").slice(0, 180);
      const mime = String(arq.mimeType ?? "");
      if (!(mime in TIPOS_ARQUIVO_ACEITOS)) {
        return NextResponse.json(
          {
            error: `Formato não suportado (${nome}). Use PDF ou DOCX.`,
            codigo: "MIME_INVALIDO",
          },
          { status: 400 }
        );
      }
      const b64 = String(arq.base64 ?? "").replace(/^data:[^;]+;base64,/, "");
      if (!b64) {
        return NextResponse.json(
          { error: `Arquivo vazio: ${nome}`, codigo: "ARQUIVO_VAZIO" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(b64, "base64");
      if (buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
        return NextResponse.json(
          {
            error: `${nome} ultrapassa 8 MB.`,
            codigo: "ARQUIVO_GRANDE",
          },
          { status: 400 }
        );
      }
      const texto = await extrairTextoDeArquivo(buffer, mime);
      if (texto.trim().length < 40) {
        return NextResponse.json(
          {
            error: `Não foi possível extrair texto útil de “${nome}” (PDF escaneado sem OCR?).`,
            codigo: "TEXTO_INSUFICIENTE",
          },
          { status: 400 }
        );
      }
      docsTexto.push({
        nome,
        rotuloHint: arq.rotulo,
        texto,
      });
    }

    const analise = await analisarProcessoComGemini(docsTexto);

    const registro = await registrarUmaAnalise({
      userId: user.id,
      email: user.email,
    });
    if (!registro.ok) {
      // Análise ok, mas bateu limite na corrida — ainda devolve resultado
      return NextResponse.json({
        analise,
        analisesNoCiclo: registro.analises,
        aviso: "Limite mensal de análises atingido após esta solicitação.",
      });
    }

    return NextResponse.json({
      analise,
      analisesNoCiclo: registro.analises,
    });
  } catch (erro) {
    console.error("[analisar-processo]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao analisar o processo.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { regenerarSecaoDoDireito } from "@/lib/ia/regenerar-direito-peca";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import {
  anotarJurisprudenciasSemLastro,
  verificarCitacoes,
} from "@/lib/ia/verificacao-citacoes";
import { anexarAuditoria } from "@/lib/ia/auditor-peca";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import { mensagemErroIaParaCliente } from "@/lib/erro-ia-cliente";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import { buscarLastroPorTopicos } from "@/lib/ia/rag-por-topico";
import { expandirQueryLastro } from "@/lib/expansao-query-lastro";

export const maxDuration = 45;

const MAX_REGENERACOES = 2;

/**
 * POST /api/regenerar-direito — reescreve só DO DIREITO. Não consome cota de peça.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      peca?: string;
      estrategiaJuridica?: string;
      topicos?: TopicoPlanejado[];
      cobertura?: ItemCoberturaTese[];
      fatos?: string;
      areaId?: string;
      especie?: string;
      tipoAcao?: string;
      tesesIds?: string[];
      poloAdvocacia?: "ativo" | "passivo" | null;
      contextoVerificacao?: string;
      regeneracoesJaFeitas?: number;
      auditor?: {
        areaId?: string;
        especie?: string | null;
        tipoAcao?: string | null;
        fatos?: string | null;
        numeroProcesso?: string | null;
        pecaInaugural?: boolean;
        pedirJusticaGratuita?: boolean;
        temMle?: boolean;
        comReconvencao?: boolean;
        pedidosUsuario?: string[] | null;
      };
    } | null;

    const areaId = body?.auditor?.areaId ?? body?.areaId ?? "jec";
    const gate = await exigirAcessoAreaMinuta(areaId);
    if (!gate.ok) return gate.response;

    const feitos = Math.max(0, Number(body?.regeneracoesJaFeitas) || 0);
    if (feitos >= MAX_REGENERACOES) {
      return NextResponse.json(
        {
          error: `Limite de ${MAX_REGENERACOES} regenerações do direito nesta minuta.`,
          codigo: "LIMITE_REGENERACAO",
        },
        { status: 429 }
      );
    }

    if (!geminiConfigurado()) {
      return NextResponse.json(
        { error: "Serviço de IA indisponível." },
        { status: 503 }
      );
    }

    const peca = String(body?.peca ?? "").trim();
    const estrategia = String(body?.estrategiaJuridica ?? "").trim();
    const fatos = String(body?.fatos ?? body?.auditor?.fatos ?? "").trim();
    const topicos = Array.isArray(body?.topicos) ? body.topicos : [];
    const cobertura = Array.isArray(body?.cobertura) ? body.cobertura : [];

    if (peca.length < 200 || estrategia.length < 40 || fatos.length < 20) {
      return NextResponse.json(
        { error: "Peça, estratégia e fatos são obrigatórios." },
        { status: 400 }
      );
    }

    const teses = detectarTesesCanonicas(
      areaId,
      fatos,
      Array.isArray(body?.tesesIds)
        ? body.tesesIds.map((id) => String(id)).filter(Boolean)
        : []
    );

    const enriquecerQuery = (aid: string, q: string, f?: string | null) =>
      [q, expandirQueryLastro(aid, q, f ?? undefined).blocoSemantico]
        .filter(Boolean)
        .join(" ");

    let itens = await buscarConhecimentoRelacionado(
      body?.tipoAcao ?? body?.auditor?.tipoAcao ?? "",
      8,
      fatos,
      areaId,
      {
        polo: body?.poloAdvocacia ?? undefined,
        especie: body?.especie ?? body?.auditor?.especie ?? undefined,
      }
    );

    if (topicos.length > 0) {
      itens = await buscarLastroPorTopicos({
        areaId,
        fatos,
        topicos,
        base: itens,
        opcoesLastro: {
          polo: body?.poloAdvocacia ?? undefined,
          especie: body?.especie ?? body?.auditor?.especie ?? undefined,
        },
        enriquecerQuery,
        maxPorConsulta: 3,
        maxTotal: 14,
      });
    }

    const resultado = await regenerarSecaoDoDireito({
      pecaAtual: peca,
      estrategiaJuridica: estrategia,
      topicos,
      cobertura,
      teses,
      itensConhecimento: itens,
      areaId,
      especie: String(body?.especie ?? body?.auditor?.especie ?? "peticao-inicial"),
      fatos,
    });

    if (!resultado.ok) {
      return NextResponse.json(
        { error: mensagemErroIaParaCliente(resultado.erro) },
        { status: 400 }
      );
    }

    const pecaNorm = normalizarPecaGerada(resultado.peca);
    const contexto =
      String(body?.contextoVerificacao ?? "").trim() ||
      itens.map((i) => `${i.titulo}\n${i.texto}`).join("\n\n");
    const citacoes = contexto
      ? verificarCitacoes(pecaNorm, contexto)
      : [];
    const pecaComLastro = contexto
      ? anotarJurisprudenciasSemLastro(pecaNorm, citacoes)
      : pecaNorm;
    const { pecaHtml } = gerarDocumentoTimbrado(pecaComLastro);
    const auditado = anexarAuditoria(
      {
        peca: pecaComLastro,
        pecaHtml,
        citacoes,
      },
      {
        ...(body?.auditor ?? {}),
        areaId,
        topicosPlanejados: topicos,
      }
    );

    return NextResponse.json({
      peca: auditado.peca,
      pecaHtml,
      citacoes,
      auditoria: auditado.auditoria,
      equipeEtapas: auditado.equipeEtapas,
      modelo: resultado.modelo,
      regeneracoesRestantes: MAX_REGENERACOES - feitos - 1,
    });
  } catch (erro) {
    console.error("[regenerar-direito]", erro);
    return NextResponse.json(
      { error: "Falha ao regenerar o direito." },
      { status: 500 }
    );
  }
}

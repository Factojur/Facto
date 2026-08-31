import { NextResponse } from "next/server";
import {
  AJUSTES_POR_GERACAO,
  ajustarTrechoPeca,
  limiteAjustesPorPlano,
} from "@/lib/ia/ajustar-trecho-peca";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { anotarJurisprudenciasSemLastro, verificarCitacoes } from "@/lib/ia/verificacao-citacoes";
import { anexarAuditoria } from "@/lib/ia/auditor-peca";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { mensagemErroIaParaCliente } from "@/lib/erro-ia-cliente";

export const maxDuration = 45;

/**
 * POST /api/ajustar-peca — ajustes por geração conforme plano (controle no cliente).
 * Não consome cota de peça.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      peca?: string;
      pedido?: string;
      trecho?: string;
      contextoVerificacao?: string;
      ajustesJaFeitos?: number;
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

    const gate = await exigirAcessoAreaMinuta(body?.auditor?.areaId ?? "jec");
    if (!gate.ok) return gate.response;

    const feitos = Math.max(0, Number(body?.ajustesJaFeitos) || 0);
    const limite = limiteAjustesPorPlano(
      gate.acesso.plano,
      gate.acesso.leigo
    );
    if (feitos >= limite) {
      return NextResponse.json(
        {
          error: `Limite de ${limite} ajustes nesta minuta. Gere de novo se precisar de mais.`,
          codigo: "LIMITE_AJUSTES",
        },
        { status: 429 }
      );
    }

    const resultado = await ajustarTrechoPeca({
      peca: String(body?.peca ?? ""),
      pedido: String(body?.pedido ?? ""),
      trecho: String(body?.trecho ?? ""),
    });
    if (!resultado.ok) {
      return NextResponse.json(
        { error: mensagemErroIaParaCliente(resultado.erro) },
        { status: 400 }
      );
    }

    const peca = normalizarPecaGerada(resultado.peca);
    const contexto = String(body?.contextoVerificacao ?? "");
    const citacoes = contexto
      ? verificarCitacoes(peca, contexto)
      : [];
    const pecaComLastro = contexto
      ? anotarJurisprudenciasSemLastro(peca, citacoes)
      : peca;
    const { pecaHtml } = gerarDocumentoTimbrado(pecaComLastro);
    const auditado = anexarAuditoria(
      {
        peca: pecaComLastro,
        pecaHtml,
        citacoes,
      },
      body?.auditor ?? {}
    );

    return NextResponse.json({
      peca: auditado.peca,
      pecaHtml,
      citacoes,
      auditoria: auditado.auditoria,
      equipeEtapas: auditado.equipeEtapas,
      ajustesRestantes: AJUSTES_POR_GERACAO - feitos - 1,
    });
  } catch (erro) {
    console.error("[ajustar-peca]", erro);
    return NextResponse.json(
      { error: "Falha ao ajustar a minuta." },
      { status: 500 }
    );
  }
}

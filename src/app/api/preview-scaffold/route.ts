import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import {
  gerarPecaJec,
  type GerarPecaJecInput,
} from "@/lib/gerar-peca-jec";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import {
  aplicarFlagReconvencao,
  inferirEspecieDaArea,
} from "@/lib/peca-especie-area";
import { extrairCidadeUfDoForo, ufValida } from "@/lib/endereco-comarca";
import {
  mensagemPoloObrigatorioGeracao,
  resolverPoloGeracao,
} from "@/lib/polo-advocacia";
import { opcoesLastroFromPayload } from "@/lib/chat-minuta";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";
import type { ReplicaContestacaoResumo } from "@/lib/entrada-caso-types";

export const maxDuration = 45;

type PreviewScaffoldBody = GerarPecaJecInput & {
  areaId?: string;
  replicaContestacao?: ReplicaContestacaoResumo | null;
  jurisDoCaso?: JurisCasoPayload[] | null;
  tribunaisPreferidos?: string[];
};

/**
 * POST /api/preview-scaffold — peça forense na forma (scaffold), sem redação IA. Não consome cota.
 */
export async function POST(request: Request) {
  try {
    let body: PreviewScaffoldBody;
    try {
      body = (await request.json()) as PreviewScaffoldBody;
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    if (!body.tipoAcao?.trim() || !body.fatos?.trim()) {
      return NextResponse.json(
        { error: "Tipo de ação e fatos são obrigatórios." },
        { status: 400 }
      );
    }

    const gate = await exigirAcessoAreaMinuta(body.areaId);
    if (!gate.ok) return gate.response;
    const { user, areaId } = gate;

    const especiePayload = String(body.especiePeca ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const especie = aplicarFlagReconvencao(
      areaId,
      especiePayload ||
        inferirEspecieDaArea(
          areaId,
          body.tipoAcao,
          body.fatos,
          body.especiePeca
        ),
      body.comReconvencao
    );
    mensagemPoloObrigatorioGeracao(areaId, especie, body.poloAdvocacia);
    const poloRag =
      resolverPoloGeracao(areaId, especie, body.poloAdvocacia) ?? "ativo";

    const ufComarca =
      body.comarca?.uf?.trim() ||
      (body.comarca?.foro
        ? extrairCidadeUfDoForo(body.comarca.foro).uf
        : "");
    if (ufComarca && !ufValida(ufComarca)) {
      return NextResponse.json(
        { error: "UF da comarca inválida." },
        { status: 400 }
      );
    }

    const oabBruta = user.user_metadata?.oab_numero as string | undefined;
    const oabFormatada = formatarOabAssinatura(
      oabBruta,
      ufComarca || undefined
    );

    const opcoesLastro = opcoesLastroFromPayload({
      areaId,
      tipoAcao: body.tipoAcao,
      fatos: body.fatos,
      especiePeca: especie,
      poloAdvocacia: poloRag,
      tribunaisPreferidos: body.tribunaisPreferidos,
      comarca: body.comarca,
    });

    const baseConhecimento = await buscarConhecimentoRelacionado(
      body.tipoAcao,
      6,
      body.fatos,
      areaId,
      opcoesLastro
    );

    const scaffold = gerarPecaJec({
      ...body,
      areaId,
      especiePeca: especie,
      baseConhecimento,
      autorNome: user.user_metadata?.nome_completo as string | undefined,
      autorOab: oabFormatada,
      escritorio: body.escritorio,
      modoPreview: true,
    });

    return NextResponse.json({
      ok: true,
      modo: "scaffold",
      areaId,
      especiePeca: especie,
      tipoAcao: body.tipoAcao,
      peca: scaffold.peca,
      pecaHtml: scaffold.pecaHtml,
      valorCausaResumo: scaffold.valorCausaResumo ?? null,
      avisoPreview:
        "Pré-visualização forense: endereçamento, estrutura e pedidos já estão na forma final. A fundamentação completa será redigida ao confirmar (consome 1 peça).",
      baseConhecimentoUtilizada: scaffold.baseConhecimentoUtilizada ?? [],
    });
  } catch (erro) {
    console.error("[preview-scaffold]", erro);
    return NextResponse.json(
      { error: "Falha ao montar a pré-visualização." },
      { status: 500 }
    );
  }
}

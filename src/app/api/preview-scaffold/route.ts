import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import { extrairDadosOcr } from "@/lib/extrair-dados-ocr";
import {
  autoresAPartirDosNomes,
  reusAPartirDosNomes,
} from "@/lib/partes-ja-qualificadas";
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
import { montarScaffoldDocumentFirst } from "@/lib/scaffold-document-first";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";
import type { ReplicaContestacaoResumo } from "@/lib/entrada-caso-types";
import type { GerarPecaJecInput } from "@/lib/gerar-peca-jec";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import type { EscritorioConfig } from "@/lib/escritorio-types";

export const maxDuration = 45;

type PreviewScaffoldBody = GerarPecaJecInput & {
  areaId?: string;
  replicaContestacao?: ReplicaContestacaoResumo | null;
  jurisDoCaso?: JurisCasoPayload[] | null;
  tribunaisPreferidos?: string[];
  /** Plano da triagem — preview document-first (não usa esqueleto JEC). */
  topicos?: TopicoPlanejado[] | null;
  escritorio?: EscritorioConfig;
};

/**
 * POST /api/preview-scaffold — forma forense document-first (0 cota).
 * Chat: OCR + tópicos do plano. Não passa mais por gerarPecaJec (template antigo).
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

    // Chat MinutaIA: espécie do payload/IA prevalece — sem re-inferir pelo kit.
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

    const dadosOcr = extrairDadosOcr(body.fatos);

    const comarcaEnriquecida = {
      ...body.comarca,
      foro: body.comarca?.foro?.trim() || dadosOcr.foro || body.comarca?.foro,
      uf: body.comarca?.uf?.trim() || dadosOcr.uf || body.comarca?.uf,
      numeroProcesso:
        body.comarca?.numeroProcesso?.trim() ||
        dadosOcr.numeroProcesso ||
        body.comarca?.numeroProcesso,
      numeroJuizado:
        body.comarca?.numeroJuizado?.trim() ||
        dadosOcr.vara ||
        body.comarca?.numeroJuizado,
    };

    const autoresEnriquecidos = body.autores?.length
      ? body.autores
      : autoresAPartirDosNomes(dadosOcr.autores.join("; "));
    const reusEnriquecidos = body.reus?.length
      ? body.reus
      : reusAPartirDosNomes(dadosOcr.reus.join("; "));

    const ufComarca =
      comarcaEnriquecida.uf?.trim() ||
      (comarcaEnriquecida.foro
        ? extrairCidadeUfDoForo(comarcaEnriquecida.foro).uf
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
      comarca: comarcaEnriquecida,
    });

    const baseConhecimento = await buscarConhecimentoRelacionado(
      body.tipoAcao,
      6,
      body.fatos,
      areaId,
      opcoesLastro
    );

    const scaffold = montarScaffoldDocumentFirst({
      fatos: body.fatos,
      areaId,
      especiePeca: especie,
      tipoAcao: body.tipoAcao,
      comarca: comarcaEnriquecida,
      autores: autoresEnriquecidos,
      reus: reusEnriquecidos,
      topicos: body.topicos ?? null,
      poloAdvocacia: body.poloAdvocacia ?? null,
      escritorio: body.escritorio,
      autorNome: user.user_metadata?.nome_completo as string | undefined,
      autorOab: oabFormatada,
    });

    return NextResponse.json({
      ok: true,
      modo: "scaffold-document-first",
      areaId,
      especiePeca: especie,
      tipoAcao: body.tipoAcao,
      peca: scaffold.peca,
      pecaHtml: scaffold.pecaHtml,
      valorCausaResumo: null,
      dadosOcrExtraidos: {
        numeroProcesso: dadosOcr.numeroProcesso,
        foro: dadosOcr.foro,
        uf: dadosOcr.uf,
        autores: dadosOcr.autores,
        reus: dadosOcr.reus,
        tipoAcaoInferido: dadosOcr.tipoAcaoInferido,
        ultimoAto: dadosOcr.ultimoAto,
        valorCausa: dadosOcr.valorCausa,
      },
      avisoPreview: null,
      baseConhecimentoUtilizada: baseConhecimento ?? [],
    });
  } catch (erro) {
    console.error("[preview-scaffold]", erro);
    return NextResponse.json(
      { error: "Falha ao montar a pré-visualização." },
      { status: 500 }
    );
  }
}

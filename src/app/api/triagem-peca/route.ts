import { NextResponse } from "next/server";
import {
  buscarConhecimentoRelacionado,
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { montarBriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import {
  aplicarFlagReconvencao,
  inferirEspecieDaArea,
} from "@/lib/peca-especie-area";
import { normalizarAreaIdMinuta } from "@/lib/minuta-modulo";
import {
  mensagemPoloObrigatorioGeracao,
  resolverPoloGeracao,
} from "@/lib/polo-advocacia";
import { blocoPecaCabivelPrompt, resolverVinculosPeca } from "@/lib/ia/skins-facto";
import {
  executarTriagemCaso,
  montarContextoTriagem,
} from "@/lib/ia/triagem-caso-peca";
import { erroGeracaoIaTransitivo } from "@/lib/ia/gemini-client";
import { montarPlanoFallbackTriagem } from "@/lib/ia/plano-fallback-local";
import { opcoesLastroFromPayload } from "@/lib/chat-minuta";
import type { GerarPecaJecInput } from "@/lib/gerar-peca-jec";
import type { JurisCasoPayload } from "@/lib/juris-caso-types";
import {
  MAX_JURIS_CASO,
  truncarTextoJuris,
  type BlocoJurisCaso,
  type TipoFonteJurisCaso,
} from "@/lib/juris-caso-types";
import { extrairCidadeUfDoForo } from "@/lib/endereco-comarca";
import type { ReplicaContestacaoResumo } from "@/lib/entrada-caso-types";
import { resolverBriefingReplicaParaGeracao } from "@/lib/replica-contestacao";

export const maxDuration = 45;

type TriagemBody = GerarPecaJecInput & {
  areaId?: string;
  tesesIds?: string[];
  pedidosUsuario?: string[];
  resumoEntrada?: string | null;
  leituraRelato?: string | null;
  ultimoAto?: string | null;
  leiMunicipal?: {
    nome?: string;
    mimeType?: string;
    base64?: string;
    texto?: string;
  } | null;
  jurisDoCaso?: JurisCasoPayload[] | null;
  replicaContestacao?: ReplicaContestacaoResumo | null;
  tribunaisPreferidos?: string[];
};

const LIMITE_TEXTO_LEI = 40_000;

function tipoJurisOuPadrao(tipo?: string): TipoFonteJurisCaso {
  if (
    tipo === "acordao" ||
    tipo === "sumula" ||
    tipo === "decisao" ||
    tipo === "outro"
  ) {
    return tipo;
  }
  return "acordao";
}

async function extrairLeiMunicipal(
  lei?: TriagemBody["leiMunicipal"]
): Promise<{ nome: string; texto: string } | null> {
  if (!lei) return null;
  const textoColado = lei.texto?.trim();
  if (textoColado) {
    return {
      nome: lei.nome?.trim() || "Lei municipal (texto colado)",
      texto:
        textoColado.length > LIMITE_TEXTO_LEI
          ? `${textoColado.slice(0, LIMITE_TEXTO_LEI)}\n[...truncado...]`
          : textoColado,
    };
  }
  if (!lei.base64?.trim() || !lei.mimeType) return null;
  if (!(lei.mimeType in TIPOS_ARQUIVO_ACEITOS)) return null;
  const buffer = Buffer.from(lei.base64, "base64");
  if (buffer.length === 0 || buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    return null;
  }
  const texto = await extrairTextoDeArquivo(buffer, lei.mimeType);
  if (!texto.trim()) return null;
  return {
    nome: lei.nome?.trim() || "Lei municipal anexada",
    texto:
      texto.length > LIMITE_TEXTO_LEI
        ? `${texto.slice(0, LIMITE_TEXTO_LEI)}\n[...truncado...]`
        : texto,
  };
}

async function extrairJuris(
  itens?: JurisCasoPayload[] | null
): Promise<BlocoJurisCaso[]> {
  if (!itens?.length) return [];
  const out: BlocoJurisCaso[] = [];
  for (const [i, item] of itens.slice(0, MAX_JURIS_CASO).entries()) {
    const titulo =
      item.titulo?.trim() ||
      item.nomeArquivo?.trim() ||
      `Jurisprudência ${i + 1}`;
    const tipo = tipoJurisOuPadrao(item.tipo);
    const textoColado = item.texto?.trim();
    if (textoColado) {
      out.push({ titulo, tipo, texto: truncarTextoJuris(textoColado) });
      continue;
    }
    if (!item.base64?.trim() || !item.mimeType) continue;
    if (!(item.mimeType in TIPOS_ARQUIVO_ACEITOS)) continue;
    const buffer = Buffer.from(item.base64, "base64");
    if (buffer.length === 0 || buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
      continue;
    }
    const texto = await extrairTextoDeArquivo(buffer, item.mimeType);
    if (texto.trim()) {
      out.push({ titulo, tipo, texto: truncarTextoJuris(texto) });
    }
  }
  return out;
}

/**
 * POST /api/triagem-peca — preview do plano estratégico. Não consome cota.
 */
export async function POST(request: Request) {
  try {
    let body: TriagemBody;
    try {
      body = (await request.json()) as TriagemBody;
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    if (!body.tipoAcao || !body.fatos?.trim()) {
      return NextResponse.json(
        { error: "Tipo de ação e fatos são obrigatórios." },
        { status: 400 }
      );
    }

    const areaId = normalizarAreaIdMinuta(body.areaId);
    const gate = await exigirAcessoAreaMinuta(areaId);
    if (!gate.ok) return gate.response;

    if (!geminiConfigurado()) {
      return NextResponse.json(
        { error: "Serviço de IA indisponível no momento." },
        { status: 503 }
      );
    }

    const especie = aplicarFlagReconvencao(
      areaId,
      inferirEspecieDaArea(
        areaId,
        body.tipoAcao,
        body.fatos,
        body.especiePeca
      ),
      body.comReconvencao
    );
    const msgPolo = mensagemPoloObrigatorioGeracao(
      areaId,
      especie,
      body.poloAdvocacia
    );
    if (msgPolo) {
      return NextResponse.json(
        { error: msgPolo, codigo: "POLO_OBRIGATORIO" },
        { status: 400 }
      );
    }

    const polo = resolverPoloGeracao(areaId, especie, body.poloAdvocacia);
    const teses = detectarTesesCanonicas(
      areaId,
      body.fatos,
      Array.isArray(body.tesesIds)
        ? body.tesesIds.map((id) => String(id)).filter(Boolean)
        : []
    );

    const extraidoForo = body.comarca?.foro
      ? extrairCidadeUfDoForo(body.comarca.foro)
      : { cidade: "", uf: "" };
    const cidade =
      body.comarca?.cidade?.trim() || extraidoForo.cidade || undefined;
    const uf = body.comarca?.uf?.trim() || extraidoForo.uf || undefined;

    const briefingReplica = resolverBriefingReplicaParaGeracao({
      fatos: body.fatos,
      especiePeca: especie,
      replicaContestacao: body.replicaContestacao,
    });

    const briefingFormulario = montarBriefingCasoLivre({
      areaId,
      tipoAcao: body.tipoAcao,
      especiePeca: especie,
      poloAdvocacia: polo ?? body.poloAdvocacia ?? undefined,
      autoresNomes: (body.autores ?? (body.autor ? [body.autor] : []))
        .map((a) => String(a.nomeCompleto ?? "").trim())
        .filter(Boolean),
      reusNomes: (body.reus ?? [])
        .map((r) =>
          String(
            r.tipo === "pj"
              ? r.razaoSocial || r.nomeFantasia
              : r.nomeCompleto
          ).trim()
        )
        .filter(Boolean),
      numeroProcesso: body.comarca?.numeroProcesso,
      foro: body.comarca?.foro,
      cidade,
      uf,
      ultimoAto: body.ultimoAto,
      pedidosUsuario: body.pedidosUsuario,
      pedirJusticaGratuita: Boolean(body.pedirJusticaGratuita),
      tutelaUrgencia: body.tutelaUrgencia,
      resumoEntrada: body.resumoEntrada,
      leituraRelato: body.leituraRelato,
      tesesRotulos: teses.map((t) => t.rotulo),
      briefingReplica,
    });

    let leiMunicipal: { nome: string; texto: string } | null = null;
    let jurisDoCaso: BlocoJurisCaso[] = [];
    try {
      leiMunicipal = await extrairLeiMunicipal(body.leiMunicipal);
      jurisDoCaso = await extrairJuris(body.jurisDoCaso);
    } catch (erro) {
      return NextResponse.json(
        {
          error:
            erro instanceof Error
              ? erro.message
              : "Falha ao ler anexos do caso.",
        },
        { status: 400 }
      );
    }

    const opcoesLastro = opcoesLastroFromPayload({
      areaId,
      tipoAcao: body.tipoAcao,
      fatos: body.fatos,
      especiePeca: especie,
      poloAdvocacia: polo ?? undefined,
      tribunaisPreferidos: body.tribunaisPreferidos,
      comarca: body.comarca,
    });

    const baseConhecimento = await buscarConhecimentoRelacionado(
      body.tipoAcao,
      8,
      body.fatos,
      areaId,
      opcoesLastro
    );
    const contextoBase = montarContextoTriagem(baseConhecimento, teses);
    const vinculos = resolverVinculosPeca({
      areaId,
      especie,
      tipoAcao: body.tipoAcao,
      fatos: body.fatos,
    });
    const blocoVinculos = blocoPecaCabivelPrompt(vinculos);

    const triagem = await executarTriagemCaso({
      tipoAcao: body.tipoAcao,
      fatos: body.fatos,
      especiePeca: vinculos.especie,
      areaId,
      contextoBase,
      leiMunicipal,
      jurisDoCaso,
      instrucoes: {
        tutelaUrgencia: body.tutelaUrgencia,
        pedidosUsuario: body.pedidosUsuario,
        provasTexto: body.provasTexto,
      },
      casoReal: true,
      poloAdvocacia: polo,
      teses,
      briefingFormulario,
      briefingReplica,
      dispositivoSentenca: body.dispositivoSentenca,
      blocoVinculos,
      opcoesPolo:
        polo != null
          ? { polo, atuarLeigo: Boolean(body.atuarLeigo) }
          : undefined,
    });

    if (!triagem.ok) {
      const fallback = montarPlanoFallbackTriagem({
        areaId,
        tipoAcao: body.tipoAcao,
        fatos: body.fatos,
        especiePeca: vinculos.especie,
        pedidosUsuario: body.pedidosUsuario,
        tesesIds: Array.isArray(body.tesesIds)
          ? body.tesesIds.map((id) => String(id)).filter(Boolean)
          : [],
        motivo: erroGeracaoIaTransitivo(triagem.erro)
          ? "serviço ocupado — tentando de novo em instantes"
          : "análise estratégica indisponível",
      });
      const nCoberturaOk = fallback.cobertura.filter((i) => i.noPlano).length;
      return NextResponse.json({
        ok: true,
        fallbackLocal: true,
        estrategiaJuridica: fallback.estrategiaJuridica,
        analiseEstrategica: fallback.analiseEstrategica,
        topicos: fallback.topicos,
        cobertura: fallback.cobertura,
        coberturaResumo: `${nCoberturaOk}/${fallback.cobertura.length}`,
        modelo: fallback.modelo,
      });
    }

    const nCoberturaOk = triagem.cobertura.filter((i) => i.noPlano).length;

    return NextResponse.json({
      ok: true,
      estrategiaJuridica: triagem.estrategiaJuridica,
      analiseEstrategica: triagem.analiseEstrategica,
      topicos: triagem.topicos,
      cobertura: triagem.cobertura,
      coberturaResumo: `${nCoberturaOk}/${triagem.cobertura.length}`,
      modelo: triagem.modelo,
    });
  } catch (erro) {
    console.error("[triagem-peca]", erro);
    return NextResponse.json(
      { error: "Falha na triagem estratégica." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gerarPecaJec,
  montarSecaoValorCausa,
  type GerarPecaJecInput,
  type GerarPecaJecOutput,
} from "@/lib/gerar-peca-jec";
import { ufValida, formatarEnderecamentoJec } from "@/lib/endereco-comarca";
import {
  buscarConhecimentoRelacionado,
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import { gerarPecaComIA } from "@/lib/ia/gerar-peca-com-ia";
import {
  normalizarPecaGerada,
  pecaTemFundamentacaoGenerica,
} from "@/lib/ia/normalizar-peca-gerada";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { calcularResumoValorCausa } from "@/lib/valores-causa";

/**
 * Workflow agentic: 2 chamadas Gemini (triagem Flash + redação Pro/Flash).
 * 60s = teto típico do plano Hobby na Vercel; em Pro pode subir se precisar.
 */
export const maxDuration = 60;

type LeiMunicipalPayload = {
  nome?: string;
  mimeType?: string;
  base64?: string;
};

type GerarPecaBody = GerarPecaJecInput & {
  leiMunicipal?: LeiMunicipalPayload | null;
};

const LIMITE_TEXTO_LEI_MUNICIPAL = 40_000;

async function extrairLeiMunicipal(
  lei?: LeiMunicipalPayload | null
): Promise<{ nome: string; texto: string } | null> {
  if (!lei?.base64?.trim() || !lei.mimeType) return null;

  if (!(lei.mimeType in TIPOS_ARQUIVO_ACEITOS)) {
    throw new Error(
      "Lei municipal: envie um PDF ou Word (.docx)."
    );
  }

  const buffer = Buffer.from(lei.base64, "base64");
  if (buffer.length === 0) {
    throw new Error("Lei municipal: arquivo vazio.");
  }
  if (buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    throw new Error(
      "Lei municipal: arquivo maior que 8 MB. Envie um PDF/DOCX menor ou só os artigos pertinentes."
    );
  }

  const texto = await extrairTextoDeArquivo(buffer, lei.mimeType);
  if (!texto.trim()) {
    throw new Error(
      "Lei municipal: não foi possível extrair texto do arquivo."
    );
  }

  return {
    nome: lei.nome?.trim() || "Lei municipal anexada",
    texto:
      texto.length > LIMITE_TEXTO_LEI_MUNICIPAL
        ? `${texto.slice(0, LIMITE_TEXTO_LEI_MUNICIPAL)}\n[...texto truncado...]`
        : texto,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: GerarPecaBody;
  try {
    body = (await request.json()) as GerarPecaBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.tipoAcao || !body.fatos?.trim()) {
    return NextResponse.json(
      { error: "Tipo de ação e fatos são obrigatórios." },
      { status: 400 }
    );
  }

  if (body.comarca?.uf && !ufValida(body.comarca.uf)) {
    return NextResponse.json(
      { error: "UF da comarca inválida." },
      { status: 400 }
    );
  }

  let leiMunicipal: { nome: string; texto: string } | null = null;
  try {
    leiMunicipal = await extrairLeiMunicipal(body.leiMunicipal);
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao ler a lei municipal anexada.",
      },
      { status: 400 }
    );
  }

  // RAG: tipo da ação + palavras dos fatos (tese do caso).
  const baseConhecimento = await buscarConhecimentoRelacionado(
    body.tipoAcao,
    6,
    body.fatos
  );

  const oabBruta = user.user_metadata?.oab_numero as string | undefined;
  const oabFormatada = formatarOabAssinatura(oabBruta, body.comarca?.uf);

  const scaffold = gerarPecaJec({
    ...body,
    autorNome: user.user_metadata?.nome_completo,
    autorOab: oabBruta,
    baseConhecimento,
  });

  const tipoResolvido =
    scaffold.decisaoAssistente?.tipoAcao ?? body.tipoAcao;
  const tutelaResolvida =
    scaffold.decisaoAssistente?.tutelaUrgencia ?? body.tutelaUrgencia;

  if (!geminiConfigurado()) {
    const peca = normalizarPecaGerada(scaffold.peca);
    const { pecaHtml } = gerarDocumentoTimbrado(
      peca,
      body.escritorio?.usarTimbre ? body.escritorio : undefined
    );
    const semIa: GerarPecaJecOutput = {
      ...scaffold,
      peca,
      pecaHtml,
      geradoPorIA: false,
      leiMunicipalUtilizada: leiMunicipal
        ? { nome: leiMunicipal.nome }
        : null,
      avisoIA:
        "GEMINI_API_KEY não configurada — peça gerada pelo modelo determinístico (fundamentação genérica). Configure a chave na Vercel para redação completa.",
    };
    return NextResponse.json(semIa);
  }

  const valorCausaResumo = body.valoresCausa
    ? calcularResumoValorCausa(body.valoresCausa)
    : scaffold.valorCausaResumo;

  const enderecamento = formatarEnderecamentoJec(
    body.comarca ?? { cidade: "", uf: "" }
  );
  const cidade = body.comarca?.cidade?.trim();
  const uf = body.comarca?.uf?.trim();
  const localFechamento =
    cidade && uf ? `${cidade}/${uf.toUpperCase()}` : undefined;

  const ia = await gerarPecaComIA({
    tipoAcao: tipoResolvido,
    fatos: body.fatos,
    itensConhecimento: baseConhecimento,
    leiMunicipal,
    casoReal: true,
    instrucoes: {
      enderecamento,
      valorCausa: montarSecaoValorCausa(valorCausaResumo).join("\n"),
      tutelaUrgencia: tutelaResolvida,
      autorNome: user.user_metadata?.nome_completo,
      autorOab: oabFormatada,
      localFechamento,
    },
  });

  if (!ia.ok) {
    const fallbackNorm = normalizarPecaGerada(scaffold.peca);
    const { pecaHtml } = gerarDocumentoTimbrado(
      fallbackNorm,
      body.escritorio?.usarTimbre ? body.escritorio : undefined
    );
    const fallback: GerarPecaJecOutput = {
      ...scaffold,
      peca: fallbackNorm,
      pecaHtml,
      geradoPorIA: false,
      leiMunicipalUtilizada: leiMunicipal
        ? { nome: leiMunicipal.nome }
        : null,
      avisoIA:
        `A IA não concluiu a redação (${ia.erro}). Foi usada a peça de reserva com fundamentação GENÉRICA — não protocolar assim. Clique em gerar novamente; se persistir, confira GEMINI_API_KEY e o tempo de resposta na Vercel.`,
    };
    return NextResponse.json(fallback);
  }

  const peca = normalizarPecaGerada(ia.textoGerado);

  if (pecaTemFundamentacaoGenerica(peca)) {
    const fallbackNorm = normalizarPecaGerada(scaffold.peca);
    const { pecaHtml } = gerarDocumentoTimbrado(
      fallbackNorm,
      body.escritorio?.usarTimbre ? body.escritorio : undefined
    );
    return NextResponse.json({
      ...scaffold,
      peca: fallbackNorm,
      pecaHtml,
      geradoPorIA: false,
      modeloIA: ia.modelo,
      leiMunicipalUtilizada: leiMunicipal
        ? { nome: leiMunicipal.nome }
        : null,
      avisoIA:
        "A IA devolveu fundamentação genérica (rejeitada). Gere novamente para obter DO DIREITO específico do caso com subtópicos a), b), c)...",
    } satisfies GerarPecaJecOutput);
  }

  const { pecaHtml } = gerarDocumentoTimbrado(
    peca,
    body.escritorio?.usarTimbre ? body.escritorio : undefined
  );

  const resultado: GerarPecaJecOutput = {
    ...scaffold,
    peca,
    pecaHtml,
    timbrado: Boolean(body.escritorio?.usarTimbre),
    geradoPorIA: true,
    modeloIA: ia.modelo,
    citacoes: ia.citacoes,
    marcadoresNaoEncontrado: ia.marcadoresNaoEncontrado,
    baseConhecimentoUtilizada: ia.contextoUtilizado,
    leiMunicipalUtilizada: leiMunicipal
      ? { nome: leiMunicipal.nome }
      : null,
    avisoIA: null,
    analiseEstrategica: ia.analiseEstrategica
      ? {
          tesePrincipal: ia.analiseEstrategica.tesePrincipal,
          naturezaRelacao: ia.analiseEstrategica.naturezaRelacao,
          nomeAcao: ia.analiseEstrategica.nomeAcao,
          direitosViolados: ia.analiseEstrategica.direitosViolados,
          topicosPlanejados: ia.analiseEstrategica.topicosPlanejados,
        }
      : null,
  };

  return NextResponse.json(resultado);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gerarPecaJec,
  montarSecaoValorCausa,
  type GerarPecaJecInput,
  type GerarPecaJecOutput,
} from "@/lib/gerar-peca-jec";
import { ufValida, formatarEnderecamentoJec, extrairCidadeUfDoForo } from "@/lib/endereco-comarca";
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
import { mesclarFatosIaComDireitoReserva, garantirSecaoValorCausa } from "@/lib/ia/mesclar-peca-hibrida";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import { consumirUmaPeca, verificarSaldoCota } from "@/lib/cota-pecas-server";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { calcularResumoValorCausa } from "@/lib/valores-causa";
import { injetarProvasELinkNuvem } from "@/lib/provas-anexos";
import {
  formatarQualificacaoReus,
  injetarQualificacaoReus,
} from "@/lib/reu-types";
import {
  MAX_JURIS_CASO,
  truncarTextoJuris,
  type BlocoJurisCaso,
  type JurisCasoPayload,
  type TipoFonteJurisCaso,
} from "@/lib/juris-caso-types";

/**
 * Workflow agentic: 2 chamadas Gemini (triagem Flash-Lite + redação Flash).
 * 60s = teto típico do plano Hobby na Vercel; em Pro pode subir se precisar.
 */
export const maxDuration = 60;

type LeiMunicipalPayload = {
  nome?: string;
  mimeType?: string;
  base64?: string;
  /** Texto colado pelo usuário (alternativa ao upload). */
  texto?: string;
};

type GerarPecaBody = GerarPecaJecInput & {
  leiMunicipal?: LeiMunicipalPayload | null;
  jurisDoCaso?: JurisCasoPayload[] | null;
  pedidosUsuario?: string[];
};

const LIMITE_TEXTO_LEI_MUNICIPAL = 40_000;

function truncarLeiMunicipal(texto: string): string {
  return texto.length > LIMITE_TEXTO_LEI_MUNICIPAL
    ? `${texto.slice(0, LIMITE_TEXTO_LEI_MUNICIPAL)}\n[...texto truncado...]`
    : texto;
}

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
  lei?: LeiMunicipalPayload | null
): Promise<{ nome: string; texto: string } | null> {
  if (!lei) return null;

  const textoColado = lei.texto?.trim();
  if (textoColado) {
    return {
      nome: lei.nome?.trim() || "Lei municipal (texto colado)",
      texto: truncarLeiMunicipal(textoColado),
    };
  }

  if (!lei.base64?.trim() || !lei.mimeType) return null;

  if (!(lei.mimeType in TIPOS_ARQUIVO_ACEITOS)) {
    throw new Error(
      "Lei municipal: envie um PDF ou Word (.docx), ou cole o texto da norma."
    );
  }

  const buffer = Buffer.from(lei.base64, "base64");
  if (buffer.length === 0) {
    throw new Error("Lei municipal: arquivo vazio.");
  }
  if (buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    throw new Error(
      "Lei municipal: arquivo maior que 8 MB. Envie um PDF/DOCX menor, cole só os artigos pertinentes, ou use o campo de texto."
    );
  }

  const texto = await extrairTextoDeArquivo(buffer, lei.mimeType);
  if (!texto.trim()) {
    throw new Error(
      "Lei municipal: não foi possível extrair texto do arquivo. Tente colar o texto no campo correspondente."
    );
  }

  return {
    nome: lei.nome?.trim() || "Lei municipal anexada",
    texto: truncarLeiMunicipal(texto),
  };
}

async function extrairUmaFonteJuris(
  item: JurisCasoPayload,
  indice: number
): Promise<BlocoJurisCaso> {
  const titulo =
    item.titulo?.trim() ||
    item.nomeArquivo?.trim() ||
    `Jurisprudência ${indice + 1}`;
  const tipo = tipoJurisOuPadrao(item.tipo);

  const textoColado = item.texto?.trim();
  if (textoColado) {
    return { titulo, tipo, texto: truncarTextoJuris(textoColado) };
  }

  if (!item.base64?.trim() || !item.mimeType) {
    throw new Error(
      `Jurisprudência "${titulo}": envie PDF/Word ou cole a ementa/texto.`
    );
  }

  if (!(item.mimeType in TIPOS_ARQUIVO_ACEITOS)) {
    throw new Error(
      `Jurisprudência "${titulo}": use PDF ou Word (.docx), ou cole o texto.`
    );
  }

  const buffer = Buffer.from(item.base64, "base64");
  if (buffer.length === 0) {
    throw new Error(`Jurisprudência "${titulo}": arquivo vazio.`);
  }
  if (buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    throw new Error(
      `Jurisprudência "${titulo}": arquivo maior que 8 MB. Cole só a ementa/trechos do voto.`
    );
  }

  const texto = await extrairTextoDeArquivo(buffer, item.mimeType);
  if (!texto.trim()) {
    throw new Error(
      `Jurisprudência "${titulo}": não foi possível extrair texto. Cole a ementa no campo de texto.`
    );
  }

  return { titulo, tipo, texto: truncarTextoJuris(texto) };
}

async function extrairJurisDoCaso(
  itens?: JurisCasoPayload[] | null
): Promise<BlocoJurisCaso[]> {
  if (!itens?.length) return [];
  const fatia = itens.slice(0, MAX_JURIS_CASO);
  const out: BlocoJurisCaso[] = [];
  for (let i = 0; i < fatia.length; i++) {
    out.push(await extrairUmaFonteJuris(fatia[i]!, i));
  }
  return out;
}

function finalizarTextoPeca(
  texto: string,
  body: GerarPecaBody
): string {
  const comProvas = injetarProvasELinkNuvem(normalizarPecaGerada(texto), {
    linkNuvem: body.linkNuvem,
    provas: [...(body.provas ?? []), ...(body.fotos ?? [])],
    midias: body.midias ?? [],
  });
  return injetarQualificacaoReus(
    comProvas,
    formatarQualificacaoReus(body.reus ?? [])
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const email = user.email?.trim();
  if (!email) {
    return NextResponse.json(
      { error: "Conta sem e-mail — não é possível validar a cota." },
      { status: 400 }
    );
  }

  const saldo = await verificarSaldoCota({
    userId: user.id,
    email,
  });
  if (!saldo.ok) {
    return NextResponse.json(
      {
        error:
          "Cota mensal de peças esgotada. Contrate um pacote extra em Perfil → Assinatura ou no banner desta página.",
        cota: saldo.cota,
        codigo: "COTA_ESGOTADA",
      },
      { status: 402 }
    );
  }

  const debitarEResponder = async (payload: Record<string, unknown>, status = 200) => {
    const consumo = await consumirUmaPeca({ userId: user.id, email });
    const cota = consumo.ok ? consumo.cota : "cota" in consumo ? consumo.cota : undefined;
    return NextResponse.json({ ...payload, cota }, { status });
  };

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

  let leiMunicipal: { nome: string; texto: string } | null = null;
  let jurisDoCaso: BlocoJurisCaso[] = [];
  try {
    leiMunicipal = await extrairLeiMunicipal(body.leiMunicipal);
    jurisDoCaso = await extrairJurisDoCaso(body.jurisDoCaso);
  } catch (erro) {
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao ler lei municipal ou jurisprudência anexada.",
      },
      { status: 400 }
    );
  }

  const jurisMeta =
    jurisDoCaso.length > 0
      ? jurisDoCaso.map((j) => ({ titulo: j.titulo }))
      : null;

  // RAG: tipo da ação + palavras dos fatos (tese do caso).
  const baseConhecimento = await buscarConhecimentoRelacionado(
    body.tipoAcao,
    6,
    body.fatos
  );

  const oabBruta = user.user_metadata?.oab_numero as string | undefined;
  const oabFormatada = formatarOabAssinatura(oabBruta, ufComarca || undefined);

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
    const peca = finalizarTextoPeca(scaffold.peca, body);
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
      jurisDoCasoUtilizada: jurisMeta,
      avisoIA:
        "A redação completa por IA está indisponível no momento. Foi gerada uma peça de reserva com estrutura forense e fundamentação-modelo — revise antes de protocolar e tente gerar novamente em instantes.",
    };
    return debitarEResponder(semIa);
  }

  const valorCausaResumo = body.valoresCausa
    ? calcularResumoValorCausa(body.valoresCausa)
    : scaffold.valorCausaResumo;

  const enderecamento = formatarEnderecamentoJec(
    body.comarca ?? { cidade: "", uf: "" }
  );
  const extraidoForo = body.comarca?.foro
    ? extrairCidadeUfDoForo(body.comarca.foro)
    : { cidade: "", uf: "" };
  const cidade =
    body.comarca?.cidade?.trim() || extraidoForo.cidade || undefined;
  const uf = body.comarca?.uf?.trim() || extraidoForo.uf || undefined;
  const localFechamento =
    cidade && uf ? `${cidade}/${uf.toUpperCase()}` : undefined;

  const ia = await gerarPecaComIA({
    tipoAcao: tipoResolvido,
    fatos: body.fatos,
    itensConhecimento: baseConhecimento,
    leiMunicipal,
    jurisDoCaso,
    casoReal: true,
    instrucoes: {
      enderecamento,
      valorCausa: montarSecaoValorCausa(valorCausaResumo).join("\n"),
      tutelaUrgencia: tutelaResolvida,
      autorNome: user.user_metadata?.nome_completo,
      autorOab: oabFormatada,
      localFechamento,
      linkNuvem: body.linkNuvem,
      provasArquivos: [...(body.provas ?? []), ...(body.fotos ?? [])],
      midiasArquivos: body.midias ?? [],
      qualificacaoReus: formatarQualificacaoReus(body.reus ?? []),
      pedidosUsuario: body.pedidosUsuario?.filter((p) => p.trim()),
    },
  });

  if (!ia.ok) {
    const fallbackNorm = finalizarTextoPeca(scaffold.peca, body);
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
      jurisDoCasoUtilizada: jurisMeta,
      avisoIA:
        "A redação por IA não foi concluída. Foi usada uma peça de reserva com estrutura forense — revise e não protocolar assim. Gere novamente.",
    };
    return debitarEResponder(fallback);
  }

  const pecaBrutaIa = normalizarPecaGerada(ia.textoGerado);

  if (pecaTemFundamentacaoGenerica(pecaBrutaIa)) {
    const blocoValor = montarSecaoValorCausa(valorCausaResumo).join("\n");
    const hibrida = mesclarFatosIaComDireitoReserva({
      pecaIa: pecaBrutaIa,
      tipoAcao: tipoResolvido,
      fatos: body.fatos,
      tutelaUrgencia: tutelaResolvida,
      trechosBase: baseConhecimento.map((item) => ({
        titulo: item.titulo,
        categoria: item.categoria,
        texto: item.texto,
      })),
      blocoValorCausa: blocoValor,
    });
    const peca = finalizarTextoPeca(hibrida, body);
    const { pecaHtml } = gerarDocumentoTimbrado(
      peca,
      body.escritorio?.usarTimbre ? body.escritorio : undefined
    );
    return debitarEResponder({
      ...scaffold,
      peca,
      pecaHtml,
      timbrado: Boolean(body.escritorio?.usarTimbre),
      geradoPorIA: true,
      modeloIA: ia.modelo,
      leiMunicipalUtilizada: leiMunicipal
        ? { nome: leiMunicipal.nome }
        : null,
      jurisDoCasoUtilizada: jurisMeta,
      avisoIA:
        "O DO DIREITO da IA veio genérico demais; os fatos reescritos pela IA foram mantidos e a fundamentação foi reforçada com o modelo forense FACTO. Revise antes de protocolar.",
    });
  }

  const pecaComValor = garantirSecaoValorCausa(
    pecaBrutaIa,
    montarSecaoValorCausa(valorCausaResumo).join("\n")
  );
  const peca = finalizarTextoPeca(pecaComValor, body);
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
    jurisDoCasoUtilizada: jurisMeta,
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

  return debitarEResponder(resultado);
}

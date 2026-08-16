import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gerarPecaJec,
  montarSecaoValorCausa,
  type GerarPecaJecInput,
  type GerarPecaJecOutput,
} from "@/lib/gerar-peca-jec";
import { formatarEnderecamentoPadrao, extrairCidadeUfDoForo, ehPeticaoInicial, rotuloAreaJudiciaria, ufValida } from "@/lib/endereco-comarca";
import {
  inferirEspecieDaArea,
  idsPeticaoInicialDaArea,
  especieParaScaffoldJec,
} from "@/lib/peca-especie-area";
import { enfileirarUploadsJurisDoCaso } from "@/lib/juris-provedores/salvar-na-base";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";
import { moduloDaArea, normalizarAreaIdMinuta } from "@/lib/minuta-modulo";
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
import {
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
} from "@/lib/ia/verificacao-citacoes";
import { geminiConfigurado } from "@/lib/ia/gemini-client";
import { consumirUmaPeca, verificarSaldoCota } from "@/lib/cota-pecas-server";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { calcularResumoValorCausa, inferirResumoValorCausaDosFatos } from "@/lib/valores-causa";
import {
  mensagemBloqueioTetoLeigo,
  ultrapassaTetoJec,
} from "@/lib/jec-teto";
import { injetarProvasELinkNuvem } from "@/lib/provas-anexos";
import {
  formatarQualificacaoReus,
  injetarQualificacaoReus,
} from "@/lib/reu-types";
import {
  formatarBlocoQualificacaoAutor,
  injetarQualificacaoAutor,
} from "@/lib/autor-types";
import {
  formatarBlocoPartesJaQualificadas,
  pecaUsaPartesJaQualificadas,
} from "@/lib/partes-ja-qualificadas";
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
  areaId?: string;
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
  // Só deste caso. Nunca gravar em base_conhecimento nem juris_verificacao.
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
  body: GerarPecaBody,
  opcoes?: { advogadoNome?: string; oabQualificacao?: string },
  areaId: string = "jec"
): string {
  const comProvas = injetarProvasELinkNuvem(normalizarPecaGerada(texto), {
    linkNuvem: body.linkNuvem,
    provas: [...(body.provas ?? []), ...(body.fotos ?? [])],
    midias: body.midias ?? [],
  });
  const autores =
    body.autores ?? (body.autor ? [body.autor] : []);
  const especie = inferirEspecieDaArea(
    areaId,
    body.tipoAcao,
    body.fatos,
    body.especiePeca
  );
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const modulo = moduloDaArea(areaId);
  const blocoAutor = pecaUsaPartesJaQualificadas(especie, idsInicial)
    ? formatarBlocoPartesJaQualificadas({
        autores,
        reus: body.reus ?? [],
        advogadoNome: opcoes?.advogadoNome ?? "",
        oabQualificacao: opcoes?.oabQualificacao ?? "",
        especie,
        dispositivoSentenca: body.dispositivoSentenca,
        rotuloPoloAtivo: modulo.rotuloPoloAtivo,
        rotuloPoloPassivo: modulo.rotuloPoloPassivo,
      })
    : formatarBlocoQualificacaoAutor({
        autores,
        advogadoNome: opcoes?.advogadoNome ?? "",
        oabQualificacao: opcoes?.oabQualificacao ?? "",
        fundamentoLei: modulo.fundamentoQualificacao,
      });
  const comReus = pecaUsaPartesJaQualificadas(especie, idsInicial)
    ? comProvas
    : injetarQualificacaoReus(
        comProvas,
        formatarQualificacaoReus(body.reus ?? [])
      );
  return injetarQualificacaoAutor(comReus, blocoAutor);
}

export async function POST(request: Request) {
  try {
    return await postGerarPeca(request);
  } catch (erro) {
    console.error("[gerar-peca] exceção não tratada:", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? `Erro ao gerar a peça: ${erro.message}`
            : "Erro interno ao gerar a peça. Tente novamente.",
        codigo: "ERRO_INTERNO",
      },
      { status: 500 }
    );
  }
}

async function postGerarPeca(request: Request) {
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

  const areaId = normalizarAreaIdMinuta(body.areaId);
  let tipoUsuario =
    (user.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo_usuario")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;
  } catch {
    /* metadata */
  }
  if (
    !areaAbertaParaCliente(areaId, {
      plano: saldo.cota.plano,
      tipoUsuario,
      acessoLivre: isEmailAcessoLivre(email),
    })
  ) {
    return NextResponse.json(
      { error: "Este módulo não está disponível no seu plano." },
      { status: 403 }
    );
  }

  if (body.tipoAcao === "assistente-facto") {
    return NextResponse.json(
      {
        error:
          "Use o Assistente Facto para definir o tipo de ação antes de gerar a peça.",
        codigo: "ASSISTENTE_PENDENTE",
      },
      { status: 400 }
    );
  }

  // Teto JEC para leigos (sem OAB): 20 SM — só no módulo JEC
  if (areaId === "jec" && !isEmailAcessoLivre(email)) {
    if (tipoUsuario === "leigo" && body.valoresCausa) {
      const resumoTeto = calcularResumoValorCausa(body.valoresCausa);
      if (ultrapassaTetoJec(resumoTeto.totalCentavos, false)) {
        return NextResponse.json(
          {
            error: mensagemBloqueioTetoLeigo(resumoTeto.totalCentavos),
            codigo: "TETO_JEC_LEIGO",
          },
          { status: 403 }
        );
      }
    }
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

  if (jurisDoCaso.length > 0) {
    void enfileirarUploadsJurisDoCaso(jurisDoCaso, user.id).catch((erro) => {
      console.error("[gerar-peca] fila de verificação (upload juris):", erro);
    });
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

  const opcoesAdvogadoQualificacao = {
    advogadoNome: (user.user_metadata?.nome_completo as string | undefined) ?? "",
    oabQualificacao: oabFormatada,
  };
  const autoresBody =
    body.autores ?? (body.autor ? [body.autor] : []);
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const modulo = moduloDaArea(areaId);
  const especieParaPartes = inferirEspecieDaArea(
    areaId,
    body.tipoAcao,
    body.fatos,
    body.especiePeca
  );
  const blocoQualificacaoAutor = pecaUsaPartesJaQualificadas(
    especieParaPartes,
    idsInicial
  )
    ? formatarBlocoPartesJaQualificadas({
        autores: autoresBody,
        reus: body.reus ?? [],
        ...opcoesAdvogadoQualificacao,
        especie: especieParaPartes,
        dispositivoSentenca: body.dispositivoSentenca,
        rotuloPoloAtivo: modulo.rotuloPoloAtivo,
        rotuloPoloPassivo: modulo.rotuloPoloPassivo,
      })
    : formatarBlocoQualificacaoAutor({
        autores: autoresBody,
        ...opcoesAdvogadoQualificacao,
        fundamentoLei: modulo.fundamentoQualificacao,
      });

  const scaffold = gerarPecaJec({
    ...body,
    especiePeca: especieParaScaffoldJec(areaId, especieParaPartes),
    autorNome: user.user_metadata?.nome_completo,
    autorOab: oabBruta,
    baseConhecimento,
  });

  const tipoResolvido =
    scaffold.decisaoAssistente?.tipoAcao ?? body.tipoAcao;
  const tutelaResolvida =
    scaffold.decisaoAssistente?.tutelaUrgencia ?? body.tutelaUrgencia;

  if (!geminiConfigurado()) {
    const peca = finalizarTextoPeca(
      scaffold.peca,
      body,
      opcoesAdvogadoQualificacao,
      areaId
    );
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

  const valorCausaResumo = (() => {
    if (body.valoresCausa) {
      const calc = calcularResumoValorCausa(body.valoresCausa);
      if (calc.totalCentavos > 0) return calc;
    }
    if (scaffold.valorCausaResumo && scaffold.valorCausaResumo.totalCentavos > 0) {
      return scaffold.valorCausaResumo;
    }
    return (
      inferirResumoValorCausaDosFatos(body.fatos) ??
      scaffold.valorCausaResumo
    );
  })();

  const especieResolvida = inferirEspecieDaArea(
    areaId,
    tipoResolvido,
    body.fatos,
    body.especiePeca
  );
  const enderecamento = formatarEnderecamentoPadrao({
    comarca: body.comarca ?? { cidade: "", uf: "" },
    areaJudiciaria: rotuloAreaJudiciaria(areaId),
    areaId,
    especiePeca: especieResolvida,
    varaEmBranco:
      idsPeticaoInicialDaArea(areaId).includes(especieResolvida) ||
      ehPeticaoInicial(tipoResolvido),
  });
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
    especiePeca: body.especiePeca,
    areaId,
    itensConhecimento: baseConhecimento,
    leiMunicipal,
    jurisDoCaso,
    casoReal: true,
    instrucoes: {
      enderecamento,
      valorCausa: montarSecaoValorCausa(valorCausaResumo).join("\n"),
      tutelaUrgencia: tutelaResolvida,
      pedirJusticaGratuita: Boolean(
        body.pedirJusticaGratuita ||
          (body.documentos?.declaracaoHipossuficiencia?.length ?? 0) > 0
      ),
      temMle: Boolean(
        body.temMle ||
          (body.documentos?.mandadoLevantamentoEletronico?.length ?? 0) > 0
      ),
      autorNome: user.user_metadata?.nome_completo,
      autorOab: oabFormatada,
      localFechamento,
      linkNuvem: body.linkNuvem,
      provasArquivos: [...(body.provas ?? []), ...(body.fotos ?? [])],
      midiasArquivos: body.midias ?? [],
      qualificacaoReus: pecaUsaPartesJaQualificadas(
        especieResolvida,
        idsInicial
      )
        ? null
        : formatarQualificacaoReus(body.reus ?? []),
      qualificacaoAutor: blocoQualificacaoAutor,
      partesJaQualificadas: pecaUsaPartesJaQualificadas(
        especieResolvida,
        idsInicial
      ),
      pedidosUsuario: body.pedidosUsuario
        ?.map((p) => String(p ?? "").trim())
        .filter(Boolean),
    },
  });

  if (!ia.ok) {
    const fallbackNorm = finalizarTextoPeca(
      scaffold.peca,
      body,
      opcoesAdvogadoQualificacao,
      areaId
    );
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
      pedirJusticaGratuita: Boolean(
        body.pedirJusticaGratuita ||
          (body.documentos?.declaracaoHipossuficiencia?.length ?? 0) > 0
      ),
      trechosBase: baseConhecimento.map((item) => ({
        titulo: item.titulo,
        categoria: item.categoria,
        texto: item.texto,
      })),
      blocoValorCausa: blocoValor,
    });
    const peca = finalizarTextoPeca(
      hibrida,
      body,
      opcoesAdvogadoQualificacao,
      areaId
    );
    const citacoesHibrida = ia.contextoVerificacao
      ? verificarCitacoes(peca, ia.contextoVerificacao)
      : ia.citacoes;
    const pecaAnotada = ia.contextoVerificacao
      ? anotarJurisprudenciasSemLastro(peca, citacoesHibrida)
      : peca;
    const { pecaHtml } = gerarDocumentoTimbrado(
      pecaAnotada,
      body.escritorio?.usarTimbre ? body.escritorio : undefined
    );
    return debitarEResponder({
      ...scaffold,
      peca: pecaAnotada,
      pecaHtml,
      timbrado: Boolean(body.escritorio?.usarTimbre),
      geradoPorIA: true,
      modeloIA: ia.modelo,
      citacoes: citacoesHibrida,
      marcadoresNaoEncontrado: contarMarcadoresNaoEncontrado(pecaAnotada),
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
  const peca = finalizarTextoPeca(
    pecaComValor,
    body,
    opcoesAdvogadoQualificacao,
    areaId
  );
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
    equipeEtapas: ia.equipeEtapas,
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

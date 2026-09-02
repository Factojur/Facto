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
  aplicarFlagReconvencao,
  tituloPecaDaArea,
  secaoValorDaEspecie,
  metaEspecieDaArea,
  pecaUsaEmFaceDeReu,
} from "@/lib/peca-especie-area";
import { enfileirarUploadsJurisDoCaso } from "@/lib/juris-provedores/salvar-na-base";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { resolverAcessoConta } from "@/lib/emails-acesso-livre";
import { moduloDaArea, normalizarAreaIdMinuta } from "@/lib/minuta-modulo";
import {
  mensagemPoloObrigatorioGeracao,
  resolverPoloGeracao,
} from "@/lib/polo-advocacia";
import {
  buscarConhecimentoRelacionado,
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import { opcoesLastroFromPayload } from "@/lib/chat-minuta";
import { gerarPecaComIA, type ResultadoPecaIA } from "@/lib/ia/gerar-peca-com-ia";
import { montarBriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
import type { TriagemPrecalculada } from "@/lib/ia/triagem-caso-peca";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import { auditarTopicosNaPeca } from "@/lib/ia/cobertura-teses-peca";
import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import {
  normalizarPecaGerada,
  pecaTemFundamentacaoGenerica,
} from "@/lib/ia/normalizar-peca-gerada";
import {
  posProcessarAntesQualificacao,
  posProcessarDepoisQualificacao,
  sanitizarPecaPorArea,
} from "@/lib/ia/pos-processar-peca-gerada";
import { mesclarFatosIaComDireitoReserva, garantirSecaoValorCausa } from "@/lib/ia/mesclar-peca-hibrida";
import {
  anotarJurisprudenciasSemLastro,
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
} from "@/lib/ia/verificacao-citacoes";
import { anexarAuditoria } from "@/lib/ia/auditor-peca";
import { geminiConfigurado, erroGeracaoIaTransitivo } from "@/lib/ia/gemini-client";
import { consumirUmaPeca, verificarSaldoCota } from "@/lib/cota-pecas-server";
import { validarSessaoPecasAtiva } from "@/lib/sessao-pecas-server";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import { calcularResumoValorCausa, inferirResumoValorCausaDosFatos } from "@/lib/valores-causa";
import {
  mensagemBloqueioTetoLeigo,
  ultrapassaTetoJec,
} from "@/lib/jec-teto";
import { injetarProvasELinkNuvem } from "@/lib/provas-anexos";
import {
  avaliarInversaoOnusProva,
  injetarInversaoOnusProva,
} from "@/lib/inversao-onus-prova";
import { montarRelatorioProvasLocal } from "@/lib/provas-analise-local";
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
  resolverPoloClienteQualificacao,
} from "@/lib/partes-ja-qualificadas";
import {
  formatarEnderecoAdvogado,
  linhasEpigrafePeca,
} from "@/lib/peca-cabivel-autos";
import {
  MAX_JURIS_CASO,
  truncarTextoJuris,
  type BlocoJurisCaso,
  type JurisCasoPayload,
  type TipoFonteJurisCaso,
} from "@/lib/juris-caso-types";
import type { ReplicaContestacaoResumo } from "@/lib/entrada-caso-types";
import { resolverBriefingReplicaParaGeracao } from "@/lib/replica-contestacao";

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
  tesesIds?: string[];
  provasTexto?: { nome: string; texto: string; tipo?: string }[];
  /** Resumo da entrada única (IA) — orientação, não barreira. */
  resumoEntrada?: string | null;
  leituraRelato?: string | null;
  ultimoAto?: string | null;
  /** Triagem já aprovada no preview — evita segunda chamada de triagem. */
  triagemPrecalculada?: {
    estrategiaJuridica: string;
    topicos: TopicoPlanejado[];
    cobertura: ItemCoberturaTese[];
    modelo: string;
    analiseEstrategica?: TriagemPrecalculada["analiseEstrategica"];
  } | null;
  replicaContestacao?: ReplicaContestacaoResumo | null;
  /** Emite NDJSON com deltas da redação e `{ done: true, ... }` ao final. */
  stream?: boolean;
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
  opcoes?: {
    advogadoNome?: string;
    oabQualificacao?: string;
    enderecoAdvogado?: string | null;
  },
  areaId: string = "jec",
  inversaoOnus?: ReturnType<typeof avaliarInversaoOnusProva>
): string {
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
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const metaEsp = metaEspecieDaArea(areaId, especie);
  const enderecamento = formatarEnderecamentoPadrao({
    comarca: body.comarca ?? { cidade: "", uf: "" },
    areaJudiciaria: rotuloAreaJudiciaria(areaId),
    areaId,
    especiePeca: especie,
    varaEmBranco: idsInicial.includes(especie),
  });
  const autoresBody =
    body.autores ?? (body.autor ? [body.autor] : []);
  const tituloPeca =
    tituloPecaDaArea(areaId, especie, body.tipoAcao) || body.tipoAcao;
  const epigrafe = linhasEpigrafePeca({
    areaId,
    especie,
    numeroProcesso: body.comarca?.numeroProcesso,
    autores: autoresBody,
    reus: body.reus ?? [],
    fatos: body.fatos,
    pecaInaugural: idsInicial.includes(especie),
    poloAdvocacia: body.poloAdvocacia,
  });

  let t = posProcessarAntesQualificacao(normalizarPecaGerada(texto), {
    areaId,
    especie,
    enderecamento,
    epigrafe,
    tituloPeca,
    numeroProcesso: body.comarca?.numeroProcesso ?? null,
    reinjetarQualificacao: !pecaUsaPartesJaQualificadas(especie, idsInicial),
  });

  const comProvas = injetarProvasELinkNuvem(t, {
    linkNuvem: body.linkNuvem,
    provas: [...(body.provas ?? []), ...(body.fotos ?? [])],
    midias: body.midias ?? [],
  });
  const comInversao = injetarInversaoOnusProva(comProvas, inversaoOnus ?? null);
  const autores = autoresBody;
  const modulo = moduloDaArea(areaId);
  const poloCliente = resolverPoloClienteQualificacao(
    areaId,
    especie,
    body.poloAdvocacia
  );
  const blocoAutor = pecaUsaPartesJaQualificadas(especie, idsInicial)
    ? formatarBlocoPartesJaQualificadas({
        autores,
        reus: body.reus ?? [],
        advogadoNome: opcoes?.advogadoNome ?? "",
        oabQualificacao: opcoes?.oabQualificacao ?? "",
        enderecoAdvogado: opcoes?.enderecoAdvogado,
        especie,
        dispositivoSentenca: body.dispositivoSentenca,
        rotuloPoloAtivo: modulo.rotuloPoloAtivo,
        rotuloPoloPassivo: modulo.rotuloPoloPassivo,
        areaId,
        poloAdvocacia: poloCliente,
      })
    : formatarBlocoQualificacaoAutor({
        autores,
        advogadoNome: opcoes?.advogadoNome ?? "",
        oabQualificacao: opcoes?.oabQualificacao ?? "",
        enderecoAdvogado: opcoes?.enderecoAdvogado,
        fundamentoLei: modulo.fundamentoQualificacao,
      });
  const usaEmFaceDe =
    !pecaUsaPartesJaQualificadas(especie, idsInicial) &&
    pecaUsaEmFaceDeReu(metaEsp.conectivoPartes);
  const comReus =
    pecaUsaPartesJaQualificadas(especie, idsInicial) || !usaEmFaceDe
      ? comInversao
      : injetarQualificacaoReus(
          comInversao,
          formatarQualificacaoReus(body.reus ?? [])
        );
  const comAutor = injetarQualificacaoAutor(comReus, blocoAutor);

  const secaoValor = secaoValorDaEspecie(areaId, especie);
  const valorCausaResumo = (() => {
    if (body.valoresCausa) {
      const calc = calcularResumoValorCausa(body.valoresCausa);
      if (calc.totalCentavos > 0) return calc;
    }
    return inferirResumoValorCausaDosFatos(body.fatos) ?? null;
  })();
  const blocoValorDeterministico =
    secaoValor && valorCausaResumo && valorCausaResumo.totalCentavos > 0
      ? montarSecaoValorCausa(valorCausaResumo, secaoValor.titulo).join("\n")
      : "";

  return posProcessarDepoisQualificacao(
    sanitizarPecaPorArea(comAutor, { areaId, especie }),
    {
      areaId,
      especie,
      tituloPeca,
      blocoValorCausa: blocoValorDeterministico || undefined,
      tituloSecaoValor: secaoValor?.titulo,
      romanoSecaoValor: secaoValor?.romano,
    }
  );
}

type MontarRespostaGerarPeca =
  | { tipo: "ok"; payload: GerarPecaJecOutput }
  | { tipo: "erro_ia_transitivo"; detalhe: string };

function montarRespostaGerarPeca(ctx: {
  ia: ResultadoPecaIA;
  body: GerarPecaBody;
  areaId: string;
  tipoResolvido: string;
  tutelaResolvida: boolean;
  scaffold: GerarPecaJecOutput;
  baseConhecimento: Awaited<ReturnType<typeof buscarConhecimentoRelacionado>>;
  leiMunicipal: { nome: string; texto: string } | null;
  jurisMeta: { titulo: string }[] | null;
  blocoValorDeterministico: string;
  secaoValor: ReturnType<typeof secaoValorDaEspecie>;
  opcoesAdvogadoQualificacao: {
    advogadoNome: string;
    oabQualificacao: string;
    enderecoAdvogado: string | null;
  };
  inversaoOnus: ReturnType<typeof avaliarInversaoOnusProva>;
}): MontarRespostaGerarPeca {
  const {
    ia,
    body,
    areaId,
    tipoResolvido,
    tutelaResolvida,
    scaffold,
    baseConhecimento,
    leiMunicipal,
    jurisMeta,
    blocoValorDeterministico,
    secaoValor,
    opcoesAdvogadoQualificacao,
    inversaoOnus,
  } = ctx;

  if (!ia.ok) {
    if (erroGeracaoIaTransitivo(ia.erro)) {
      return { tipo: "erro_ia_transitivo", detalhe: ia.erro };
    }
    const fallbackNorm = finalizarTextoPeca(
      scaffold.peca,
      body,
      opcoesAdvogadoQualificacao,
      areaId,
      inversaoOnus
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
    return { tipo: "ok", payload: fallback };
  }

  const pecaBrutaIa = normalizarPecaGerada(ia.textoGerado);

  if (pecaTemFundamentacaoGenerica(pecaBrutaIa) && areaId === "jec") {
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
      blocoValorCausa: blocoValorDeterministico || undefined,
      tituloSecaoValor: secaoValor?.titulo,
      romanoSecaoValor: secaoValor?.romano,
    });
    const peca = finalizarTextoPeca(
      hibrida,
      body,
      opcoesAdvogadoQualificacao,
      areaId,
      inversaoOnus
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
    return {
      tipo: "ok",
      payload: {
        ...scaffold,
        peca: pecaAnotada,
        pecaHtml,
        timbrado: Boolean(body.escritorio?.usarTimbre),
        geradoPorIA: true,
        modeloIA: "FACTO",
        citacoes: citacoesHibrida,
        marcadoresNaoEncontrado: contarMarcadoresNaoEncontrado(pecaAnotada),
        leiMunicipalUtilizada: leiMunicipal
          ? { nome: leiMunicipal.nome }
          : null,
        jurisDoCasoUtilizada: jurisMeta,
        equipeEtapas: ia.equipeEtapas?.map((e) => ({
          ...e,
          modelo: undefined,
        })),
        avisoIA:
          "O DO DIREITO veio genérico demais; a fundamentação foi reforçada com o modelo forense do Juizado. Revise antes de protocolar.",
      },
    };
  }

  const avisoFundamentosGenericos =
    pecaTemFundamentacaoGenerica(pecaBrutaIa) && areaId !== "jec"
      ? "A fundamentação jurídica veio genérica demais. Confira o DO DIREITO e o lastro antes de protocolar."
      : null;

  const pecaComValor =
    secaoValor && blocoValorDeterministico
      ? garantirSecaoValorCausa(pecaBrutaIa, blocoValorDeterministico, {
          tituloSecao: secaoValor.titulo,
          romano: secaoValor.romano,
        })
      : pecaBrutaIa;
  const peca = finalizarTextoPeca(
    pecaComValor,
    body,
    opcoesAdvogadoQualificacao,
    areaId,
    inversaoOnus
  );
  const { pecaHtml } = gerarDocumentoTimbrado(
    peca,
    body.escritorio?.usarTimbre ? body.escritorio : undefined
  );

  return {
    tipo: "ok",
    payload: {
      ...scaffold,
      analise: inversaoOnus?.cabivel
        ? `${scaffold.analise}\n\nInversão do ônus da prova (${inversaoOnus.confianca}): ${inversaoOnus.motivo}\nBases: ${inversaoOnus.basesLegais.join("; ")}`
        : scaffold.analise,
      peca,
      pecaHtml,
      timbrado: Boolean(body.escritorio?.usarTimbre),
      geradoPorIA: true,
      modeloIA: "FACTO",
      citacoes: ia.citacoes,
      marcadoresNaoEncontrado: ia.marcadoresNaoEncontrado,
      baseConhecimentoUtilizada: ia.contextoUtilizado,
      leiMunicipalUtilizada: leiMunicipal
        ? { nome: leiMunicipal.nome }
        : null,
      jurisDoCasoUtilizada: jurisMeta,
      avisoIA: avisoFundamentosGenericos,
      equipeEtapas: ia.equipeEtapas?.map((e) => ({
        ...e,
        modelo: undefined,
      })),
      contextoVerificacao: ia.contextoVerificacao,
      analiseEstrategica: ia.analiseEstrategica
        ? {
            tesePrincipal: ia.analiseEstrategica.tesePrincipal,
            naturezaRelacao: ia.analiseEstrategica.naturezaRelacao,
            nomeAcao: ia.analiseEstrategica.nomeAcao,
            direitosViolados: ia.analiseEstrategica.direitosViolados,
            topicosPlanejados: ia.analiseEstrategica.topicosPlanejados,
            pedidosEssenciais: ia.analiseEstrategica.pedidosEssenciais,
            riscosOuLacunas: ia.analiseEstrategica.riscosOuLacunas,
          }
        : null,
      estrategiaJuridicaBruta: body.triagemPrecalculada?.estrategiaJuridica,
      topicosPlanejadosDetalhe: body.triagemPrecalculada?.topicos,
      coberturaTeses: body.triagemPrecalculada?.cobertura,
      conferenciaTitulos: body.triagemPrecalculada?.topicos?.length
        ? auditarTopicosNaPeca(peca, body.triagemPrecalculada.topicos)
        : undefined,
    },
  };
}

export async function POST(request: Request) {
  try {
    return await postGerarPeca(request);
  } catch (erro) {
    console.error("[gerar-peca] exceção não tratada:", erro);
    return NextResponse.json(
      {
        error: "Erro ao gerar a peça. Tente novamente em instantes.",
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

  const sessaoPecas = await validarSessaoPecasAtiva(user.id);
  if (!sessaoPecas.ok) {
    return NextResponse.json(
      {
        error: sessaoPecas.erro,
        codigo: "SESSAO_PECAS_ENCERRADA",
      },
      { status: sessaoPecas.status }
    );
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
    const trialEsgotado = saldo.cota.plano === "trial";
    return NextResponse.json(
      {
        error: trialEsgotado
          ? "Suas peças de teste acabaram. Escolha um plano (JEC ou Completo) para continuar gerando."
          : "Cota mensal de peças esgotada. Contrate um pacote extra em Perfil → Assinatura ou no banner desta página.",
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

  const especieValidacao = aplicarFlagReconvencao(
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
    especieValidacao,
    body.poloAdvocacia
  );
  if (msgPolo) {
    return NextResponse.json(
      { error: msgPolo, codigo: "POLO_OBRIGATORIO" },
      { status: 400 }
    );
  }
  const poloGeracao = resolverPoloGeracao(
    areaId,
    especieValidacao,
    body.poloAdvocacia
  );

  let tipoUsuario =
    (user.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  let perfilEndereco: {
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cep?: string | null;
  } = {};
  let estiloEscritorio: string | null = null;
  let trialAreaId: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "tipo_usuario, endereco, numero, complemento, bairro, cidade, uf, cep, estilo_resumo, estilo_opt_in, trial_ate, trial_area_id"
      )
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;
    if (profile) perfilEndereco = profile;
    if (profile?.estilo_opt_in && profile.estilo_resumo?.trim()) {
      estiloEscritorio = profile.estilo_resumo.trim();
    }
    if (
      profile?.trial_ate &&
      new Date(profile.trial_ate).getTime() > Date.now()
    ) {
      trialAreaId = profile.trial_area_id ?? null;
    }
  } catch {
    /* metadata */
  }
  const enderecoAdvogado = formatarEnderecoAdvogado({
    escritorio: body.escritorio,
    logradouro: perfilEndereco.endereco,
    numero: perfilEndereco.numero,
    complemento: perfilEndereco.complemento,
    bairro: perfilEndereco.bairro,
    cidade: perfilEndereco.cidade,
    uf: perfilEndereco.uf,
    cep: perfilEndereco.cep,
  });
  const acesso = resolverAcessoConta(email, saldo.cota.plano, tipoUsuario);
  if (
    !areaAbertaParaCliente(areaId, {
      plano: acesso.plano,
      tipoUsuario: acesso.tipoUsuario,
      trialAreaId,
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
  if (areaId === "jec" && acesso.leigo && body.valoresCausa) {
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

  const especieRag = aplicarFlagReconvencao(
    areaId,
    inferirEspecieDaArea(
      areaId,
      body.tipoAcao,
      body.fatos,
      body.especiePeca
    ),
    body.comReconvencao
  );
  const poloRag =
    resolverPoloGeracao(areaId, especieRag, body.poloAdvocacia) ??
    resolverPoloClienteQualificacao(areaId, especieRag, body.poloAdvocacia);

  const opcoesLastro = opcoesLastroFromPayload({
    areaId,
    tipoAcao: body.tipoAcao,
    fatos: body.fatos,
    especiePeca: especieRag,
    poloAdvocacia: poloRag,
    tribunaisPreferidos: (
      body as { tribunaisPreferidos?: string[] }
    ).tribunaisPreferidos,
    comarca: body.comarca,
  });

  // RAG: fatos do caso + julgados favoráveis ao polo da peça.
  const baseConhecimento = await buscarConhecimentoRelacionado(
    body.tipoAcao,
    8,
    body.fatos,
    areaId,
    opcoesLastro
  );

  const oabBruta = user.user_metadata?.oab_numero as string | undefined;
  const oabFormatada = formatarOabAssinatura(oabBruta, ufComarca || undefined);

  const opcoesAdvogadoQualificacao = {
    advogadoNome: (user.user_metadata?.nome_completo as string | undefined) ?? "",
    oabQualificacao: oabFormatada,
    enderecoAdvogado,
  };
  const autoresBody =
    body.autores ?? (body.autor ? [body.autor] : []);
  const idsInicial = idsPeticaoInicialDaArea(areaId);
  const modulo = moduloDaArea(areaId);
  const especieParaPartes = aplicarFlagReconvencao(
    areaId,
    inferirEspecieDaArea(
      areaId,
      body.tipoAcao,
      body.fatos,
      body.especiePeca
    ),
    body.comReconvencao
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
        areaId,
        poloAdvocacia: resolverPoloClienteQualificacao(
          areaId,
          especieParaPartes,
          body.poloAdvocacia
        ),
      })
    : formatarBlocoQualificacaoAutor({
        autores: autoresBody,
        ...opcoesAdvogadoQualificacao,
        fundamentoLei: modulo.fundamentoQualificacao,
      });

  const paramsAuditor = {
    areaId,
    especie: especieParaPartes,
    tipoAcao: body.tipoAcao,
    fatos: body.fatos,
    numeroProcesso: body.comarca?.numeroProcesso,
    pecaInaugural: !pecaUsaPartesJaQualificadas(especieParaPartes, idsInicial),
    pedirJusticaGratuita: Boolean(
      body.pedirJusticaGratuita ||
        (body.documentos?.declaracaoHipossuficiencia?.length ?? 0) > 0
    ),
    temMle: Boolean(body.temMle),
    comReconvencao: Boolean(body.comReconvencao),
    pedidosUsuario: body.pedidosUsuario,
    autores: autoresBody,
    reus: body.reus,
  };

  const scaffold = gerarPecaJec({
    ...body,
    areaId,
    especiePeca: especieParaScaffoldJec(areaId, especieParaPartes),
    autorNome: user.user_metadata?.nome_completo,
    autorOab: oabBruta,
    baseConhecimento,
  });

  const tipoResolvido =
    scaffold.decisaoAssistente?.tipoAcao ?? body.tipoAcao;
  const tutelaResolvida =
    scaffold.decisaoAssistente?.tutelaUrgencia ?? body.tutelaUrgencia;

  const especieParaInversao = aplicarFlagReconvencao(
    areaId,
    inferirEspecieDaArea(
      areaId,
      tipoResolvido,
      body.fatos,
      body.especiePeca
    ),
    body.comReconvencao
  );
  const inversaoOnus = avaliarInversaoOnusProva({
    areaId,
    fatos: body.fatos,
    tipoAcao: tipoResolvido,
    especiePeca: especieParaInversao,
    poloAdvocacia: poloGeracao ?? body.poloAdvocacia,
  });

  if (!geminiConfigurado()) {
    const peca = finalizarTextoPeca(
      scaffold.peca,
      body,
      opcoesAdvogadoQualificacao,
      areaId,
      inversaoOnus
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
    return debitarEResponder(anexarAuditoria(semIa, paramsAuditor));
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

  const especieResolvida = aplicarFlagReconvencao(
    areaId,
    inferirEspecieDaArea(
      areaId,
      tipoResolvido,
      body.fatos,
      body.especiePeca
    ),
    body.comReconvencao
  );
  const enderecamento = formatarEnderecamentoPadrao({
    comarca: body.comarca ?? { cidade: "", uf: "" },
    areaJudiciaria: rotuloAreaJudiciaria(areaId),
    areaId,
    especiePeca: especieResolvida,
    varaEmBranco: idsPeticaoInicialDaArea(areaId).includes(especieResolvida),
  });
  const extraidoForo = body.comarca?.foro
    ? extrairCidadeUfDoForo(body.comarca.foro)
    : { cidade: "", uf: "" };
  const cidade =
    body.comarca?.cidade?.trim() || extraidoForo.cidade || undefined;
  const uf = body.comarca?.uf?.trim() || extraidoForo.uf || undefined;
  const localFechamento =
    cidade && uf ? `${cidade}/${uf.toUpperCase()}` : undefined;

  const secaoValor = secaoValorDaEspecie(areaId, especieResolvida);
  const blocoValorDeterministico = secaoValor
    ? montarSecaoValorCausa(valorCausaResumo, secaoValor.titulo).join("\n")
    : "";

  const tesesDetectadas = detectarTesesCanonicas(
    areaId,
    body.fatos,
    Array.isArray(body.tesesIds)
      ? body.tesesIds.map((id) => String(id)).filter(Boolean)
      : []
  );
  const briefingReplica = resolverBriefingReplicaParaGeracao({
    fatos: body.fatos,
    especiePeca: especieResolvida,
    replicaContestacao: body.replicaContestacao,
  });

  const briefingFormulario = montarBriefingCasoLivre({
    areaId,
    tipoAcao: tipoResolvido,
    especiePeca: especieResolvida,
    poloAdvocacia: poloGeracao ?? body.poloAdvocacia ?? undefined,
    autoresNomes: autoresBody
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
    pedirJusticaGratuita: Boolean(
      body.pedirJusticaGratuita ||
        (body.documentos?.declaracaoHipossuficiencia?.length ?? 0) > 0
    ),
    tutelaUrgencia: tutelaResolvida,
    resumoEntrada: body.resumoEntrada,
    leituraRelato: body.leituraRelato,
    tesesRotulos: tesesDetectadas.map((t) => t.rotulo),
    briefingReplica,
  });

  const argsGerarPeca = {
    tipoAcao: tipoResolvido,
    fatos: body.fatos,
    especiePeca: especieResolvida,
    areaId,
    itensConhecimento: baseConhecimento,
    leiMunicipal,
    jurisDoCaso,
    casoReal: true,
    poloAdvocacia: poloGeracao ?? body.poloAdvocacia,
    atuarLeigo: Boolean(body.atuarLeigo),
    tesesIds: Array.isArray(body.tesesIds)
      ? body.tesesIds.map((id) => String(id)).filter(Boolean)
      : undefined,
    estiloEscritorio,
    roteamento: {
      userId: user.id,
      plano: saldo.cota.plano,
    },
    briefingFormulario,
    briefingReplica,
    dispositivoSentenca: body.dispositivoSentenca,
    triagemPrecalculada: body.triagemPrecalculada
      ? {
          estrategiaJuridica: body.triagemPrecalculada.estrategiaJuridica,
          topicos: body.triagemPrecalculada.topicos,
          cobertura: body.triagemPrecalculada.cobertura,
          analiseEstrategica:
            body.triagemPrecalculada.analiseEstrategica ?? {
              bruto: body.triagemPrecalculada.estrategiaJuridica,
            },
          modelo: body.triagemPrecalculada.modelo,
        }
      : null,
    instrucoes: {
      enderecamento,
      valorCausa: blocoValorDeterministico || undefined,
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
      provasTexto: Array.isArray(body.provasTexto)
        ? body.provasTexto
            .map((p) => ({
              nome: String(p?.nome ?? "").trim(),
              texto: String(p?.texto ?? "").slice(0, 12_000),
              tipo: p?.tipo ? String(p.tipo) : undefined,
              sintese: p?.sintese ? String(p.sintese).slice(0, 800) : undefined,
            }))
            .filter((p) => p.nome.length > 0)
        : undefined,
      inversaoOnusProva: inversaoOnus?.cabivel
        ? {
            subtitulo: inversaoOnus.subtitulo,
            paragrafo: inversaoOnus.paragrafo,
            confianca: inversaoOnus.confianca,
          }
        : null,
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
      nomePeca: tituloPecaDaArea(areaId, especieResolvida, tipoResolvido),
      epigrafe: linhasEpigrafePeca({
        areaId,
        especie: especieResolvida,
        numeroProcesso: body.comarca?.numeroProcesso,
        autores: autoresBody,
        reus: body.reus ?? [],
        fatos: body.fatos,
        pecaInaugural: idsInicial.includes(especieResolvida),
        poloAdvocacia: body.poloAdvocacia,
      }),
      pedidosUsuario: body.pedidosUsuario
        ?.map((p) => String(p ?? "").trim())
        .filter(Boolean),
    },
  };

  const ctxMontarResposta = {
    body,
    areaId,
    tipoResolvido,
    tutelaResolvida,
    scaffold,
    baseConhecimento,
    leiMunicipal,
    jurisMeta,
    blocoValorDeterministico,
    secaoValor,
    opcoesAdvogadoQualificacao,
    inversaoOnus,
  };

  if (body.stream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
        try {
          const ia = await gerarPecaComIA({
            ...argsGerarPeca,
            onRedacaoDelta: (t) => emit({ t }),
          });
          const montagem = montarRespostaGerarPeca({ ia, ...ctxMontarResposta });
          if (montagem.tipo === "erro_ia_transitivo") {
            emit({
              error:
                "A IA está temporariamente indisponível. Aguarde cerca de um minuto e tente novamente — sua cota não foi debitada.",
              codigo: "IA_INDISPONIVEL",
              detalhe: montagem.detalhe,
            });
            return;
          }
          const payload = anexarAuditoria(montagem.payload, paramsAuditor);
          const consumo = await consumirUmaPeca({ userId: user.id, email });
          const cota =
            consumo.ok ? consumo.cota : "cota" in consumo ? consumo.cota : undefined;
          emit({ done: true, ...payload, cota });
        } catch (erro) {
          emit({
            error:
              erro instanceof Error
                ? erro.message
                : "Erro ao redigir a peça.",
          });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }

  const ia = await gerarPecaComIA(argsGerarPeca);

  const montagem = montarRespostaGerarPeca({ ia, ...ctxMontarResposta });
  if (montagem.tipo === "erro_ia_transitivo") {
    return NextResponse.json(
      {
        error:
          "A IA está temporariamente indisponível. Aguarde cerca de um minuto e tente novamente — sua cota não foi debitada.",
        codigo: "IA_INDISPONIVEL",
        detalhe: montagem.detalhe,
      },
      { status: 503 }
    );
  }

  return debitarEResponder(anexarAuditoria(montagem.payload, paramsAuditor));
}

import { analisarCaseAssistente, ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  aplicarFormatacaoTextoJuridico,
  gerarDocumentoTimbrado,
} from "@/lib/formatacao-juridica";
import {
  formatarEnderecamentoPadrao,
  extrairCidadeUfDoForo,
  rotuloAreaJudiciaria,
  type ComarcaInfo,
} from "@/lib/endereco-comarca";
import { ritoDaArea } from "@/lib/area-rito";
import { getAreaById } from "@/lib/areas-atuacao";
import { areaMostraMle } from "@/lib/minuta-modulo";
import {
  calcularResumoValorCausa,
  formatarCentavos,
  inferirResumoValorCausaDosFatos,
  type CategoriaValorId,
  type ItemValor,
  type ResumoValorCausa,
} from "@/lib/valores-causa";
import {
  montarPromptBaseConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";
import type { ResultadoAuditorPeca } from "@/lib/ia/auditor-peca";
import {
  MARCADOR_ESPACO_1,
  MARCADOR_ESPACO_2,
  montarMarcadorEspaco6,
} from "@/lib/formatacao-forense";
import { formatarOabAssinatura } from "@/lib/formatar-oab";
import {
  injetarProvasELinkNuvem,
  normalizarLinkNuvem,
} from "@/lib/provas-anexos";
import { montarRelatorioProvasLocal } from "@/lib/provas-analise-local";
import {
  formatarQualificacaoReus,
  injetarQualificacaoReus,
  type ReuValue,
} from "@/lib/reu-types";
import {
  formatarBlocoQualificacaoAutor,
  type AutorValue,
} from "@/lib/autor-types";
import {
  formatarBlocoPartesJaQualificadas,
  pecaUsaPartesJaQualificadas,
} from "@/lib/partes-ja-qualificadas";
import { fraseValorSecao } from "@/lib/secao-valor-peca";
import { normalizarTextoFatos } from "@/lib/peca-paragrafos";
import { montarFundamentosDireitoJec } from "@/lib/peca-do-direito-jec";
import {
  ehPeticaoInicialPorEspecie,
  inferirEspeciePeca,
  metaEspecie,
  paragrafoReservaSecao,
  secoesNumeradas,
  tituloRomano,
  type EspeciePecaJec,
} from "@/lib/jec-especie-peca";
import { aplicarFlagReconvencao, tituloPecaDaArea } from "@/lib/peca-especie-area";
import {
  formatarEnderecoAdvogado,
  linhasEpigrafePeca,
} from "@/lib/peca-cabivel-autos";

export type GerarPecaJecInput = {
  tipoAcao: string;
  tutelaUrgencia: boolean;
  fatos: string;
  /** Espécie da peça (JEC-1). Se omitida, infere do tipoAcao. */
  especiePeca?: EspeciePecaJec | string | null;
  documentos: {
    /** @deprecated removido do formulário — identidade/procuração vão no checklist de protocolo */
    essenciais?: string[];
    /** @deprecated */
    rg?: string[];
    cpf?: string[];
    cnh?: string[];
    comprovanteResidencia?: string[];
    declaracaoHipossuficiencia?: string[];
    procuracao?: string[];
    mandadoLevantamentoEletronico?: string[];
  };
  /** Flags explícitas (preferíveis aos nomes de arquivo). */
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
  /**
   * Na contestação: JEC = pedido contraposto (art. 31);
   * justiça comum = reconvenção (art. 343).
   */
  comReconvencao?: boolean;
  provas: string[];
  fotos: string[];
  midias: string[];
  /** Link manual de Drive/Dropbox/etc. colado pelo advogado. */
  linkNuvem?: string | null;
  /** Texto extraído no cliente (PDF/DOCX/OCR) para a IA. */
  provasTexto?: { nome: string; texto: string; tipo?: string; sintese?: string }[];
  /** Qualificação da(s) parte(s) passiva(s). */
  reus?: ReuValue[];
  /** Parte(s) autora(s) (PF) — distinta do advogado (autorNome/autorOab). */
  autores?: AutorValue[];
  /** @deprecated use autores */
  autor?: AutorValue | null;
  escritorio?: EscritorioConfig;
  autorNome?: string;
  autorOab?: string;
  comarca?: ComarcaInfo;
  valoresCausa?: Record<CategoriaValorId, ItemValor[]>;
  baseConhecimento?: TrechoConhecimento[];
  /** Dispositivo da sentença (análise de autos / recurso). */
  dispositivoSentenca?: string | null;
  /** Polo em que o advogado atua (JEC e demais áreas quando informado). */
  poloAdvocacia?: "ativo" | "passivo" | null;
  /** Causa própria (JEC leigo) — ajusta prompt partidário. */
  atuarLeigo?: boolean;
  areaId?: string;
};

export type GerarPecaJecOutput = {
  analise: string;
  peca: string;
  pecaHtml: string;
  timbrado: boolean;
  fundamentoLegal: string[];
  valorCausaResumo?: ResumoValorCausa;
  decisaoAssistente?: {
    tipoAcao: string;
    tutelaUrgencia: boolean;
    justificativa: string;
  };
  baseConhecimentoUtilizada?: { titulo: string; categoria: string }[];
  /** Prompt de referência da base (ainda útil para debug/admin). */
  promptSistemaIA?: string | null;
  /** true quando a peça veio do Gemini (não do template determinístico). */
  geradoPorIA?: boolean;
  modeloIA?: string;
  citacoes?: CitacaoVerificada[];
  marcadoresNaoEncontrado?: number;
  leiMunicipalUtilizada?: { nome: string } | null;
  /** Fontes de juris/súmula anexadas pelo advogado neste caso. */
  jurisDoCasoUtilizada?: { titulo: string }[] | null;
  avisoIA?: string | null;
  /** Etapas da equipe FACTO (Pacote A). */
  equipeEtapas?: {
    id: string;
    skin: string;
    titulo: string;
    status: "ok" | "parcial" | "pulado" | "erro";
    detalhe?: string;
    modelo?: string;
  }[];
  /** Brief da análise Chain of Thought (fase 1). */
  analiseEstrategica?: {
    tesePrincipal?: string;
    naturezaRelacao?: string;
    nomeAcao?: string;
    direitosViolados?: string[];
    topicosPlanejados?: string[];
    pedidosEssenciais?: string[];
    riscosOuLacunas?: string[];
  } | null;
  /** Texto integral da triagem (para regenerar direito). */
  estrategiaJuridicaBruta?: string | null;
  /** Plano de tópicos estruturado. */
  topicosPlanejadosDetalhe?: {
    romano: string;
    titulo: string;
    subtitulos: string[];
  }[];
  /** Checklist teses/pedidos no plano. */
  coberturaTeses?: {
    id: string;
    rotulo: string;
    noPlano: boolean;
    exigeSubtopico: boolean;
  }[];
  /** Conferência título-a-título na minuta. */
  conferenciaTitulos?: { faltando: string[]; ok: number };
  /** Contexto da base usado no auditor — para ajuste pontual. */
  contextoVerificacao?: string;
  /** Conferência determinística do Auditor (após a minuta pronta). */
  auditoria?: ResultadoAuditorPeca;
};

function localFechamento(comarca?: ComarcaInfo): string {
  const cidade = comarca?.cidade?.trim();
  const uf = comarca?.uf?.trim();
  if (cidade && uf) return `${cidade}/${uf.toUpperCase()}`;

  if (comarca?.foro?.trim()) {
    const extraido = extrairCidadeUfDoForo(comarca.foro);
    if (extraido.cidade && extraido.uf) {
      return `${extraido.cidade}/${extraido.uf}`;
    }
  }

  return "[Cidade/UF]";
}


function formatarDataPorExtenso(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function listarArquivos(arquivos: string[] | undefined): string {
  if (!arquivos?.length) return "Não anexado";
  return arquivos.join(", ");
}

function subtotalDaCategoria(
  resumo: ResumoValorCausa | undefined,
  id: CategoriaValorId
): number {
  return resumo?.categorias.find((c) => c.id === id)?.subtotalCentavos ?? 0;
}

function areaEhJecLike(areaId: string): boolean {
  return areaId === "jec" || areaId === "jecr";
}

/** Ementas de JEC não entram no scaffold de outras áreas (evita Lei 9.099 indevida). */
function lastroParaArea(
  areaId: string,
  itens: TrechoConhecimento[]
): TrechoConhecimento[] {
  if (areaEhJecLike(areaId)) return itens;
  return itens.filter(
    (item) =>
      !/Lei\s*n[ºo°]?\s*9\.?099/i.test(`${item.titulo} ${item.texto}`)
  );
}

function textoSucumbencia(areaId: string): string {
  if (areaEhJecLike(areaId)) {
    return "na forma da Lei nº 9.099/95, se cabível";
  }
  if (areaId === "trabalhista") {
    return "na forma da CLT e legislação trabalhista pertinente, se cabível";
  }
  return "na forma do art. 85 do CPC e legislação processual pertinente, se cabível";
}

function textoJusticaGratuita(areaId: string): string {
  if (areaEhJecLike(areaId)) {
    return "na forma da Lei nº 9.099/95 e da legislação processual pertinente";
  }
  return "na forma da Constituição Federal e da legislação processual pertinente";
}

function competenciaSugerida(areaId: string): string {
  const rito = ritoDaArea(areaId);
  return `${rotuloAreaJudiciaria(areaId)} — ${rito.especialidade}`;
}

function fundamentosLegaisBase(areaId: string, tutelaUrgencia: boolean): string[] {
  if (areaId === "jec") {
    const base = [
      "Lei nº 9.099/95 (Lei dos Juizados Especiais Cíveis e Criminais)",
      "Art. 3º — competência dos Juizados Especiais Cíveis",
      "Art. 18 — regra do juízo incompetente por complexidade da causa",
      "Art. 38 — dispensa de preparo em determinadas hipóteses",
      "Art. 54 e 55 — recursos: embargos de declaração e recurso inominado",
    ];
    if (tutelaUrgencia) {
      base.push("Art. 300 do Código de Processo Civil — tutela de urgência");
    }
    return base;
  }
  const area = getAreaById(areaId);
  const rito = ritoDaArea(areaId);
  const base = [
    area?.law
      ? `${area.title} — ${area.law}`
      : `${rito.especialidade}`,
    rito.ritoCurto,
  ];
  if (tutelaUrgencia) {
    base.push("Art. 300 do Código de Processo Civil — tutela de urgência");
  }
  return base;
}

function extrairPedidos(
  tipoAcao: string,
  tutelaUrgencia: boolean,
  resumo: ResumoValorCausa | undefined,
  especie: EspeciePecaJec,
  opcoes?: {
    pedirJusticaGratuita?: boolean;
    temMle?: boolean;
    areaId?: string;
  }
): string {
  const pedirJG = Boolean(opcoes?.pedirJusticaGratuita);
  const temMle = Boolean(opcoes?.temMle) && areaMostraMle(opcoes?.areaId ?? "jec");
  const areaId = opcoes?.areaId ?? "jec";
  const suc = textoSucumbencia(areaId);
  const jg = textoJusticaGratuita(areaId);

  if (especie === "contestacao") {
    const itens = [
      "O acolhimento das preliminares eventualmente arguidas, com a extinção do processo sem resolução do mérito, se for o caso;",
      "No mérito, a total improcedência dos pedidos formulados na inicial;",
      `A condenação da parte autora ao pagamento das custas e honorários, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(2, 0, `A concessão dos benefícios da justiça gratuita, ${jg};`);
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "pedido-contraposto") {
    const itens = [
      "O acolhimento das preliminares eventualmente arguidas, com a extinção do processo sem resolução do mérito, se for o caso;",
      "No mérito, a total improcedência dos pedidos formulados na inicial;",
      "A procedência do pedido contraposto formulado pelo(a) réu(ré), na forma do art. 31 da Lei nº 9.099/95;",
      `A condenação da parte autora ao pagamento das custas e honorários, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(3, 0, `A concessão dos benefícios da justiça gratuita, ${jg};`);
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "embargos") {
    const itens = [
      "O conhecimento e o acolhimento dos presentes embargos;",
      "A declaração de inexigibilidade / a limitação / a extinção da cobrança ou do ato embargado, conforme os fundamentos;",
      `A condenação da parte adversa nas verbas de sucumbência, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(2, 0, `A concessão dos benefícios da justiça gratuita, ${jg};`);
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "recurso-inominado") {
    const itens = [
      "O conhecimento do recurso inominado, por tempestivo e cabível;",
      "No mérito, a reforma / anulação da sentença recorrida, com o provimento integral dos pedidos recursais;",
      `A condenação da parte adversa nas verbas de sucumbência, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(
        2,
        0,
        "A concessão / manutenção dos benefícios da justiça gratuita no âmbito recursal, se cabível;"
      );
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "recurso") {
    const itens = [
      "O conhecimento do recurso, por tempestivo e cabível;",
      "No mérito, a reforma / anulação da sentença ou decisão recorrida, com o provimento integral dos pedidos recursais;",
      `A condenação da parte adversa nas verbas de sucumbência, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(
        2,
        0,
        "A concessão / manutenção dos benefícios da justiça gratuita no âmbito recursal, se cabível;"
      );
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "agravo-instrumento") {
    const itens = [
      "O conhecimento e o provimento do presente agravo de instrumento;",
      "A reforma da decisão interlocutória agravada, nos termos dos fundamentos;",
      `A condenação da parte adversa nas verbas de sucumbência, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(
        2,
        0,
        "A concessão / manutenção dos benefícios da justiça gratuita, se cabível;"
      );
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "contrarrazoes-inominado") {
    const itens = [
      "O conhecimento das presentes contrarrazões;",
      "No mérito, o desprovimento do recurso inominado interposto pela parte adversa, com a manutenção da sentença;",
      `A condenação do recorrente nas verbas de sucumbência, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(
        2,
        0,
        "A manutenção dos benefícios da justiça gratuita, se cabível;"
      );
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "defesa-preliminar") {
    const itens = [
      "O acolhimento das preliminares do art. 395 do CPP, com a rejeição da denúncia;",
      "Subsidiariamente, a absolvição sumária do acusado, se cabível;",
      "A condenação do Ministério Público nas verbas de sucumbência, se cabível.",
    ];
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "replica") {
    const itens = [
      "O acolhimento da presente réplica, com a rejeição das preliminares e teses defensivas improcedentes;",
      "A procedência total dos pedidos formulados na inicial;",
      `A condenação do(a) requerido(a) ao pagamento das custas e honorários, ${suc}.`,
    ];
    if (pedirJG) {
      itens.splice(2, 0, `A concessão dos benefícios da justiça gratuita, ${jg};`);
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  if (especie === "execucao") {
    const itens = [
      "A intimação do(a) executado(a) para pagamento do débito no prazo legal;",
      "Não havendo pagamento espontâneo, a penhora / bloqueio e demais medidas executivas cabíveis;",
      `A condenação do(a) executado(a) nas verbas de sucumbência, ${suc}.`,
    ];
    if (temMle) {
      itens.splice(
        2,
        0,
        "A expedição / utilização do Mandado de Levantamento Eletrônico (MLE) para liberação dos valores depositados, na forma do sistema do juízo;"
      );
    }
    if (pedirJG) {
      itens.splice(
        itens.length - 1,
        0,
        `A concessão dos benefícios da justiça gratuita, ${jg};`
      );
    }
    return itens
      .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
      .join("\n");
  }

  const itens: string[] = [];

  if (tutelaUrgencia) {
    itens.push(
      "A concessão de tutela de urgência, *inaudita altera pars*, para assegurar a efetividade do provimento final, diante da probabilidade do direito e do perigo de dano;"
    );
  }

  if (pedirJG) {
    itens.push(
      `A concessão dos benefícios da justiça gratuita, com a dispensa do pagamento de custas, taxas e despesas processuais, ${jg};`
    );
  }

  itens.push(
    "A citação do(a) requerido(a) para, querendo, apresentar contestação no prazo legal, sob pena de revelia e confissão quanto à matéria de fato;"
  );

  const tipo = tipoAcao.toLowerCase();
  if (tipo.includes("indenização") || tipo.includes("indenizacao")) {
    const materiaisCentavos = subtotalDaCategoria(resumo, "danosMateriais");
    const moraisCentavos = subtotalDaCategoria(resumo, "danosMorais");
    const partes: string[] = [];
    if (materiaisCentavos > 0) {
      partes.push(
        `danos materiais no valor de ${formatarCentavos(materiaisCentavos)}`
      );
    }
    if (moraisCentavos > 0) {
      partes.push(
        `danos morais no valor de ${formatarCentavos(moraisCentavos)}`
      );
    }
    itens.push(
      partes.length > 0
        ? `A condenação do(a) requerido(a) ao pagamento de ${partes.join(" e ")}, totalizando ${formatarCentavos(materiaisCentavos + moraisCentavos)}, com correção monetária e juros legais;`
        : "A condenação do(a) requerido(a) ao pagamento de indenização por danos materiais e morais, em valor a ser arbitrado por Vossa Excelência, com correção monetária e juros legais;"
    );
  } else if (tipo.includes("cobrança") || tipo.includes("cobranca")) {
    itens.push(
      "A condenação do(a) requerido(a) ao pagamento do débito descrito nos fatos, devidamente atualizado com correção monetária e juros de mora;"
    );
  } else if (tipo.includes("obrigação") || tipo.includes("obrigacao")) {
    itens.push(
      "A condenação do(a) requerido(a) na obrigação de fazer consistente no cumprimento da prestação descrita nos fatos, no prazo a ser fixado por Vossa Excelência, sob pena de multa diária;"
    );
  } else if (
    tipo.includes("inexigibilidade") ||
    tipo.includes("inexistência") ||
    tipo.includes("inexistencia") ||
    tipo.includes("declaratória") ||
    tipo.includes("declaratoria")
  ) {
    itens.push(
      "A declaração de inexistência e/ou inexigibilidade do(s) débito(s) impugnado(s), com as anotações e baixas cadastrais cabíveis;"
    );
    const materiaisCentavos = subtotalDaCategoria(resumo, "danosMateriais");
    const moraisCentavos = subtotalDaCategoria(resumo, "danosMorais");
    if (materiaisCentavos + moraisCentavos > 0) {
      const partes: string[] = [];
      if (materiaisCentavos > 0) {
        partes.push(
          `danos materiais de ${formatarCentavos(materiaisCentavos)}`
        );
      }
      if (moraisCentavos > 0) {
        partes.push(`danos morais de ${formatarCentavos(moraisCentavos)}`);
      }
      itens.push(
        `A condenação do(a) requerido(a) ao pagamento de ${partes.join(" e ")}, com correção monetária e juros legais;`
      );
    }
  } else {
    itens.push(
      "A procedência total dos pedidos formulados na presente demanda, com a condenação do(a) requerido(a) nas obrigações e valores descritos nos fatos e fundamentos;"
    );
  }

  if (temMle) {
    itens.push(
      "A expedição / utilização do Mandado de Levantamento Eletrônico (MLE) para liberação dos valores eventualmente depositados, na forma do sistema do juízo;"
    );
  }

  itens.push(
    `A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios, ${suc}.`
  );

  return itens
    .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
    .join("\n");
}

/**
 * Seção de valor (causa, reconvenção ou pedido contraposto) — apenas o total.
 * O detalhamento fica no formulário; a peça encerra no fechamento forense.
 */
export function montarSecaoValorCausa(
  resumo?: ResumoValorCausa,
  tituloSecao = "DO VALOR DA CAUSA"
): string[] {
  if (!resumo || resumo.totalCentavos <= 0) {
    return [fraseValorSecao(tituloSecao)];
  }
  return [
    fraseValorSecao(
      tituloSecao,
      resumo.totalFormatado,
      resumo.totalPorExtenso
    ),
  ];
}

export function gerarPecaJec(input: GerarPecaJecInput): GerarPecaJecOutput {
  const totalProvas =
    input.provas.length +
    input.fotos.length +
    input.midias.length +
    Object.values(input.documentos).flat().length;

  const linkNuvem = normalizarLinkNuvem(input.linkNuvem);

  let tipoAcao = input.tipoAcao;
  let tutelaUrgencia = input.tutelaUrgencia;
  let decisaoAssistente;

  if (input.tipoAcao === ASSISTENTE_FACTO) {
    decisaoAssistente = analisarCaseAssistente({
      fatos: input.fatos,
      totalArquivos: totalProvas,
    });
    tipoAcao = decisaoAssistente.tipoAcao;
    tutelaUrgencia = decisaoAssistente.tutelaUrgencia;
  }

  const areaIdPeca = input.areaId ?? "jec";
  const fundamentoLegal = fundamentosLegaisBase(areaIdPeca, tutelaUrgencia);

  const itensConhecimento = lastroParaArea(
    areaIdPeca,
    input.baseConhecimento ?? []
  );
  itensConhecimento.forEach((item) => {
    fundamentoLegal.push(`${item.categoria} — ${item.titulo} (base de conhecimento)`);
  });
  const promptSistemaIA = montarPromptBaseConhecimento(itensConhecimento);

  const analisePartes = [
    "=== ANÁLISE PRELIMINAR DAS PROVAS (FACTO) ===",
    "",
  ];

  if (decisaoAssistente) {
    analisePartes.push(decisaoAssistente.justificativa, "", "---", "");
  }

  const especie = aplicarFlagReconvencao(
    areaIdPeca,
    inferirEspeciePeca(tipoAcao, input.fatos, input.especiePeca),
    input.comReconvencao
  ) as EspeciePecaJec;
  const metaEsp = metaEspecie(especie);
  const ehInicial = ehPeticaoInicialPorEspecie(especie);

  const pedirJusticaGratuita =
    Boolean(input.pedirJusticaGratuita) ||
    (input.documentos.declaracaoHipossuficiencia?.length ?? 0) > 0;
  const temMle =
    (Boolean(input.temMle) ||
      (input.documentos.mandadoLevantamentoEletronico?.length ?? 0) > 0) &&
    areaMostraMle(areaIdPeca);

  if (pedirJusticaGratuita) {
    fundamentoLegal.push(
      `Justiça gratuita — ${textoJusticaGratuita(areaIdPeca)}`
    );
  }

  analisePartes.push(
    `Espécie da peça: ${metaEsp.rotulo}`,
    `Tipo de ação ${decisaoAssistente ? "definido pelo Assistente" : "selecionado"}: ${tipoAcao}`,
    `Competência sugerida: ${competenciaSugerida(areaIdPeca)}`,
    `Tutela de urgência: ${tutelaUrgencia ? "Sim" : "Não"}`,
    `Justiça gratuita / hipossuficiência: ${pedirJusticaGratuita ? "Sim" : "Não"}`,
    `MLE (levantamento eletrônico): ${temMle ? "Sim" : "Não"}`,
    "",
    "Documentos que influenciam a peça:",
    `- Declaração de Hipossuficiência: ${listarArquivos(input.documentos.declaracaoHipossuficiencia)}`,
    `- Mandado de Levantamento Eletrônico (MLE): ${listarArquivos(input.documentos.mandadoLevantamentoEletronico)}`,
    "",
    `Prints, recibos, fotos e documentos (${input.provas.length + input.fotos.length}): ${listarArquivos([...input.provas, ...input.fotos])}`,
    `Áudios e vídeos (${input.midias.length}): ${listarArquivos(input.midias)}`,
    `Link de nuvem: ${linkNuvem ?? "não informado"}`,
    "",
  );

  if (input.provasTexto?.length) {
    analisePartes.push(
      montarRelatorioProvasLocal(
        input.provasTexto.map((p) => ({
          id: p.nome,
          nome: p.nome,
          texto: p.texto,
          tipo:
            p.tipo === "imagem" || p.tipo === "midia" || p.tipo === "documento"
              ? p.tipo
              : "documento",
          sintese: p.sintese,
          origemTexto: p.texto.trim().length >= 40 ? "nativo" : "nenhum",
        })),
        input.fatos
      ),
      "",
      "---",
      ""
    );
  }

  analisePartes.push(
    `Total de arquivos informados: ${totalProvas}`,
    "",
    "Observação: esta análise estrutural lista os insumos do formulário. A minuta abaixo deve ser revisada integralmente antes do protocolo."
  );

  const analise = analisePartes.join("\n");

  const autor = input.autorNome ?? "[NOME DO(A) ADVOGADO(A)]";
  const oabAssinatura = formatarOabAssinatura(
    input.autorOab,
    input.comarca?.uf
  );
  // Texto curto na qualificação: "OAB/SP 147099"
  const oabQualificacao = oabAssinatura;

  const valorDoFormulario = input.valoresCausa
    ? calcularResumoValorCausa(input.valoresCausa)
    : undefined;
  const valorCausaResumo =
    valorDoFormulario && valorDoFormulario.totalCentavos > 0
      ? valorDoFormulario
      : inferirResumoValorCausaDosFatos(input.fatos) ?? undefined;

  const enderecamento = formatarEnderecamentoPadrao({
    comarca: input.comarca ?? { cidade: "", uf: "" },
    areaJudiciaria: rotuloAreaJudiciaria(areaIdPeca),
    areaId: areaIdPeca,
    especiePeca: especie,
    varaEmBranco: ehInicial,
  });

  const qualificacaoReus =
    formatarQualificacaoReus(input.reus ?? []) ??
    "[NOME COMPLETO DO(A) RÉU(RÉ)], [qualificação completa do(a) réu(ré)]";

  const enderecoAdvogado = formatarEnderecoAdvogado({
    escritorio: input.escritorio,
  });
  const jaQualificadas = pecaUsaPartesJaQualificadas(especie);
  const blocoPartes = jaQualificadas
    ? formatarBlocoPartesJaQualificadas({
        autores: input.autores ?? (input.autor ? [input.autor] : []),
        reus: input.reus ?? [],
        advogadoNome: autor,
        oabQualificacao,
        enderecoAdvogado,
        especie,
        dispositivoSentenca: input.dispositivoSentenca,
        areaId: areaIdPeca,
        poloAdvocacia: input.poloAdvocacia,
      })
    : formatarBlocoQualificacaoAutor({
        autores: input.autores ?? (input.autor ? [input.autor] : []),
        advogadoNome: autor,
        oabQualificacao,
        enderecoAdvogado,
      });

  const fatosNormalizados = normalizarTextoFatos(input.fatos);
  const fatosLinhas = fatosNormalizados.split("\n").filter(Boolean);

  const secoes = secoesNumeradas(especie, { incluirProvas: false });
  const corpoSecoes: string[] = [];

  for (const { romano, secao } of secoes) {
    const titulo = tituloRomano(romano, secao.titulo);
    corpoSecoes.push(titulo);

    if (secao.chave === "fatos" || secao.chave === "historico") {
      corpoSecoes.push(...(fatosLinhas.length ? fatosLinhas : ["[Narrar os fatos.]"]));
    } else if (
      secao.chave === "direito" ||
      secao.chave === "merito" ||
      secao.chave === "razoes" ||
      secao.chave === "contraposto"
    ) {
      if (areaIdPeca === "jec") {
        const fundamentos = montarFundamentosDireitoJec({
          tipoAcao,
          fatos: input.fatos,
          tutelaUrgencia,
          pedirJusticaGratuita,
          trechosBase: itensConhecimento.map((item) => ({
            titulo: item.titulo,
            categoria: item.categoria,
            texto: item.texto,
          })),
          tituloSecao: titulo,
        });
        corpoSecoes.push(...fundamentos.slice(1));
      } else {
        corpoSecoes.push(
          "[Desenvolver a fundamentação jurídica conforme o rito desta área — sem norma do Juizado Cível fora do JEC.]",
          "",
          ...(itensConhecimento.length
            ? itensConhecimento.slice(0, 4).map(
                (item) =>
                  `Com apoio no acervo FACTO (${item.categoria} — ${item.titulo}): ${item.texto.slice(0, 400).trim()}…`
              )
            : [
                "Incluir dispositivos legais e jurisprudência do rito competente, com lastro verificável.",
              ])
        );
      }
    } else if (secao.chave === "valor") {
      corpoSecoes.push(...montarSecaoValorCausa(valorCausaResumo, secao.titulo));
    } else if (secao.chave === "pedidos") {
      corpoSecoes.push(
        "Ante o exposto, requer a Vossa Excelência:",
        extrairPedidos(tipoAcao, tutelaUrgencia, valorCausaResumo, especie, {
          pedirJusticaGratuita,
          temMle,
          areaId: areaIdPeca,
        })
      );
    } else {
      corpoSecoes.push(
        ...paragrafoReservaSecao(secao.chave, input.fatos)
      );
    }

    corpoSecoes.push("");
  }

  const numeroProcesso = input.comarca?.numeroProcesso?.trim() || null;
  const tituloPeca = (
    tituloPecaDaArea(areaIdPeca, especie, tipoAcao) || tipoAcao
  ).toUpperCase();
  const epigrafe = linhasEpigrafePeca({
    areaId: areaIdPeca,
    especie,
    numeroProcesso,
    autores: input.autores ?? (input.autor ? [input.autor] : []),
    reus: input.reus ?? [],
    fatos: input.fatos,
    pecaInaugural: ehInicial,
    poloAdvocacia: input.poloAdvocacia,
  });

  const pecaBruta = [
    enderecamento,
    montarMarcadorEspaco6(numeroProcesso, epigrafe),
    blocoPartes,
    MARCADOR_ESPACO_1,
    tituloPeca,
    ...(jaQualificadas
      ? [MARCADOR_ESPACO_2]
      : [
          MARCADOR_ESPACO_1,
          `em face de ${qualificacaoReus}, ${metaEsp.conectivoPartes}`,
          MARCADOR_ESPACO_2,
        ]),
    ...corpoSecoes,
    "Nestes termos,",
    "pede deferimento.",
    MARCADOR_ESPACO_1,
    `${localFechamento(input.comarca)}, ${formatarDataPorExtenso(new Date())}.`,
    MARCADOR_ESPACO_1,
    autor,
    oabAssinatura,
  ].join("\n");

  const pecaComProvas = jaQualificadas
    ? injetarProvasELinkNuvem(pecaBruta, {
        linkNuvem,
        provas: [...input.provas, ...input.fotos],
        midias: input.midias,
      })
    : injetarQualificacaoReus(
        injetarProvasELinkNuvem(pecaBruta, {
          linkNuvem,
          provas: [...input.provas, ...input.fotos],
          midias: input.midias,
        }),
        formatarQualificacaoReus(input.reus ?? [])
      );
  const peca = aplicarFormatacaoTextoJuridico(pecaComProvas);
  const { pecaHtml } = gerarDocumentoTimbrado(
    peca,
    input.escritorio?.usarTimbre ? input.escritorio : undefined
  );

  return {
    analise,
    peca,
    pecaHtml,
    timbrado: Boolean(input.escritorio?.usarTimbre),
    fundamentoLegal,
    ...(valorCausaResumo && { valorCausaResumo }),
    ...(decisaoAssistente && { decisaoAssistente }),
    ...(itensConhecimento.length > 0 && {
      baseConhecimentoUtilizada: itensConhecimento.map((item) => ({
        titulo: item.titulo,
        categoria: item.categoria,
      })),
    }),
    promptSistemaIA,
  };
}

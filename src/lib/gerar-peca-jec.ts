import { analisarCaseAssistente, ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  aplicarFormatacaoTextoJuridico,
  gerarDocumentoTimbrado,
} from "@/lib/formatacao-juridica";
import {
  formatarEnderecamentoPadrao,
  extrairCidadeUfDoForo,
  ehPeticaoInicial,
  rotuloAreaJudiciaria,
  type ComarcaInfo,
} from "@/lib/endereco-comarca";
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
import {
  formatarQualificacaoReus,
  injetarQualificacaoReus,
  type ReuValue,
} from "@/lib/reu-types";
import { normalizarTextoFatos } from "@/lib/peca-paragrafos";
import { montarFundamentosDireitoJec } from "@/lib/peca-do-direito-jec";

export type GerarPecaJecInput = {
  tipoAcao: string;
  tutelaUrgencia: boolean;
  fatos: string;
  documentos: {
    /** Identidade (RG/CNH), CPF, residência e procuração — upload único. */
    essenciais?: string[];
    /** @deprecated campos antigos mantidos só por compatibilidade */
    rg?: string[];
    cpf?: string[];
    cnh?: string[];
    comprovanteResidencia?: string[];
    declaracaoHipossuficiencia?: string[];
    procuracao?: string[];
    mandadoLevantamentoEletronico?: string[];
  };
  provas: string[];
  fotos: string[];
  midias: string[];
  /** Link manual de Drive/Dropbox/etc. colado pelo advogado. */
  linkNuvem?: string | null;
  /** Qualificação da(s) parte(s) passiva(s). */
  reus?: ReuValue[];
  escritorio?: EscritorioConfig;
  autorNome?: string;
  autorOab?: string;
  comarca?: ComarcaInfo;
  valoresCausa?: Record<CategoriaValorId, ItemValor[]>;
  baseConhecimento?: TrechoConhecimento[];
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
  /** Brief da análise Chain of Thought (fase 1). */
  analiseEstrategica?: {
    tesePrincipal?: string;
    naturezaRelacao?: string;
    nomeAcao?: string;
    direitosViolados?: string[];
    topicosPlanejados?: string[];
  } | null;
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

function extrairPedidos(
  tipoAcao: string,
  tutelaUrgencia: boolean,
  resumo?: ResumoValorCausa
): string {
  const itens: string[] = [];

  if (tutelaUrgencia) {
    itens.push(
      "A concessão de tutela de urgência, *inaudita altera pars*, para assegurar a efetividade do provimento final, diante da probabilidade do direito e do perigo de dano;"
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

  itens.push(
    "A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios, na forma da Lei nº 9.099/95 e legislação processual pertinente."
  );

  return itens
    .map((texto, i) => `${String.fromCharCode(97 + i)}) ${texto}`)
    .join("\n");
}

/**
 * Seção "DO VALOR DA CAUSA" — apenas o total (sem discriminativo).
 * O detalhamento fica no formulário; a peça encerra no fechamento forense.
 */
export function montarSecaoValorCausa(resumo?: ResumoValorCausa): string[] {
  if (!resumo || resumo.totalCentavos <= 0) {
    return [
      "Dá-se à causa o valor de R$ [VALOR DA CAUSA] ([valor por extenso]), para fins de alçada e competência.",
    ];
  }

  return [
    `Dá-se à causa o valor de ${resumo.totalFormatado} (${resumo.totalPorExtenso}), para fins de alçada e competência.`,
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

  const fundamentoLegal = [
    "Lei nº 9.099/95 (Lei dos Juizados Especiais Cíveis e Criminais)",
    "Art. 3º — competência dos Juizados Especiais Cíveis",
    "Art. 18 — regra do juízo incompetente por complexidade da causa",
    "Art. 38 — dispensa de preparo em determinadas hipóteses",
    "Art. 54 e 55 — recursos: embargos de declaração e recurso inominado",
  ];

  if (tutelaUrgencia) {
    fundamentoLegal.push(
      "Art. 300 do Código de Processo Civil — tutela de urgência"
    );
  }

  const itensConhecimento = input.baseConhecimento ?? [];
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

  analisePartes.push(
    `Tipo de ação ${decisaoAssistente ? "definido pelo Assistente" : "selecionado"}: ${tipoAcao}`,
    `Competência sugerida: Juizado Especial Cível (Lei 9.099/95)`,
    `Tutela de urgência: ${tutelaUrgencia ? "Sim" : "Não"}`,
    "",
    "Documentos pessoais recebidos:",
    `- Essenciais (identidade/CPF/residência/procuração): ${listarArquivos(input.documentos.essenciais)}`,
    `- Declaração de Hipossuficiência: ${listarArquivos(input.documentos.declaracaoHipossuficiencia)}`,
    `- Mandado de Levantamento Eletrônico (MLE): ${listarArquivos(input.documentos.mandadoLevantamentoEletronico)}`,
    "",
    `Prints, recibos, fotos e documentos (${input.provas.length + input.fotos.length}): ${listarArquivos([...input.provas, ...input.fotos])}`,
    `Áudios e vídeos (${input.midias.length}): ${listarArquivos(input.midias)}`,
    `Link de nuvem: ${linkNuvem ?? "não informado"}`,
    "",
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
    areaJudiciaria: rotuloAreaJudiciaria("jec"),
    varaEmBranco: ehPeticaoInicial(tipoAcao),
  });

  const qualificacaoReus =
    formatarQualificacaoReus(input.reus ?? []) ??
    "[NOME COMPLETO DO(A) RÉU(RÉ)], [qualificação completa do(a) réu(ré)]";

  const fatosNormalizados = normalizarTextoFatos(input.fatos);
  const fundamentos = montarFundamentosDireitoJec({
    tipoAcao,
    fatos: input.fatos,
    tutelaUrgencia,
    trechosBase: itensConhecimento.map((item) => ({
      titulo: item.titulo,
      categoria: item.categoria,
      texto: item.texto,
    })),
  });

  // Numeração romana das seções (provas podem ser injetadas depois).
  let secao = 2; // I = fatos já fixo; fundamentos = II
  const proximaSecao = () => {
    secao += 1;
    const mapa = ["I", "II", "III", "IV", "V", "VI", "VII"];
    return mapa[secao - 1] ?? String(secao);
  };

  // fundamentos já inclui "II - DO DIREITO"
  const romValor = proximaSecao();
  const romPedidos = proximaSecao();

  const numeroProcesso = input.comarca?.numeroProcesso?.trim() || null;

  const pecaBruta = [
    enderecamento,
    montarMarcadorEspaco6(
      ehPeticaoInicial(tipoAcao) ? null : numeroProcesso
    ),
    `[NOME COMPLETO DO(A) AUTOR(A)], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF sob nº [CPF], `
      + "portador(a) do RG nº [RG], residente e domiciliado(a) na [endereço completo], "
      + "endereço eletrônico [e-mail], por seu advogado que esta subscreve "
      + `(procuração anexa), ${autor}, inscrito na ${oabQualificacao}, `
      + "com escritório profissional na [endereço do advogado], onde recebe intimações, "
      + "vem, respeitosamente, à presença de Vossa Excelência, com fundamento na Lei nº 9.099/95, "
      + "propor a presente",
    MARCADOR_ESPACO_1,
    `${tipoAcao.toUpperCase()}`,
    MARCADOR_ESPACO_1,
    `em face de ${qualificacaoReus}, pelos fatos e fundamentos jurídicos a seguir expostos.`,
    MARCADOR_ESPACO_2,
    "I - DOS FATOS",
    ...fatosNormalizados.split("\n").filter(Boolean),
    "",
    ...fundamentos,
    "",
    `${romValor} - DO VALOR DA CAUSA`,
    ...montarSecaoValorCausa(valorCausaResumo),
    "",
    `${romPedidos} - DOS PEDIDOS`,
    "Ante o exposto, requer a Vossa Excelência:",
    extrairPedidos(tipoAcao, tutelaUrgencia, valorCausaResumo),
    "",
    "Nestes termos,",
    "pede deferimento.",
    MARCADOR_ESPACO_1,
    `${localFechamento(input.comarca)}, ${formatarDataPorExtenso(new Date())}.`,
    MARCADOR_ESPACO_1,
    autor,
    oabAssinatura,
  ].join("\n");

  const pecaComProvas = injetarQualificacaoReus(
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

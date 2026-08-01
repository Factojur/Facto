import { analisarCaseAssistente, ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  aplicarFormatacaoTextoJuridico,
  gerarDocumentoTimbrado,
} from "@/lib/formatacao-juridica";
import { formatarEnderecamentoJec, type ComarcaInfo } from "@/lib/endereco-comarca";
import {
  calcularResumoValorCausa,
  formatarCentavos,
  type CategoriaValorId,
  type ItemValor,
  type ResumoValorCausa,
} from "@/lib/valores-causa";
import {
  montarPromptBaseConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";

export type GerarPecaJecInput = {
  tipoAcao: string;
  tutelaUrgencia: boolean;
  fatos: string;
  documentos: {
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
  avisoIA?: string | null;
};

function localFechamento(comarca?: ComarcaInfo): string {
  const cidade = comarca?.cidade?.trim();
  const uf = comarca?.uf?.trim();
  return cidade && uf ? `${cidade} - ${uf.toUpperCase()}` : "[CIDADE/UF]";
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
  const pedidos = [
    "a) A citação do(a) requerido(a) para, querendo, apresentar contestação, sob pena de revelia;",
    "b) A procedência total dos pedidos formulados na presente demanda;",
    "c) A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios, na forma da Lei nº 9.099/95.",
  ];

  if (tipoAcao.toLowerCase().includes("indenização")) {
    const materiaisCentavos = subtotalDaCategoria(resumo, "danosMateriais");
    const moraisCentavos = subtotalDaCategoria(resumo, "danosMorais");

    const partes: string[] = [];
    if (materiaisCentavos > 0) {
      partes.push(`danos materiais no valor de ${formatarCentavos(materiaisCentavos)}`);
    }
    if (moraisCentavos > 0) {
      partes.push(`danos morais no valor de ${formatarCentavos(moraisCentavos)}`);
    }

    pedidos.splice(
      1,
      0,
      partes.length > 0
        ? `b) A condenação do(a) requerido(a) ao pagamento de ${partes.join(", ")}, totalizando ${formatarCentavos(materiaisCentavos + moraisCentavos)};`
        : "b) A condenação do(a) requerido(a) ao pagamento de indenização por danos materiais e morais, em valor a ser arbitrado por Vossa Excelência;"
    );
  } else if (tipoAcao.toLowerCase().includes("cobrança")) {
    pedidos.splice(
      1,
      0,
      "b) A condenação do(a) requerido(a) ao pagamento do débito descrito nos fatos, devidamente atualizado;"
    );
  } else if (tipoAcao.toLowerCase().includes("obrigação de fazer")) {
    pedidos.splice(
      1,
      0,
      "b) A condenação do(a) requerido(a) na obrigação de fazer consistente no cumprimento da prestação descrita nos fatos, no prazo a ser fixado por Vossa Excelência;"
    );
  }

  if (tutelaUrgencia) {
    pedidos.unshift(
      "a) A concessão de TUTELA DE URGÊNCIA, inaudita altera pars, para assegurar a efetividade do provimento final, diante da probabilidade do direito e do perigo de dano;"
    );
  }

  return pedidos.join("\n");
}

/**
 * Monta o texto da seção "DO VALOR DA CAUSA" a partir do total já calculado
 * em código (soma exata em centavos). A IA nunca recalcula nem reescreve
 * este trecho — ele é montado inteiramente aqui, de forma determinística.
 */
export function montarSecaoValorCausa(resumo?: ResumoValorCausa): string[] {
  if (!resumo || resumo.totalCentavos <= 0) {
    return [
      "Dá-se à causa o valor de R$ [VALOR DA CAUSA] ([valor por extenso]), para fins de alçada e competência.",
    ];
  }

  const linhas: string[] = [
    `Dá-se à causa o valor de ${resumo.totalFormatado} (${resumo.totalPorExtenso}), `
      + "para fins de alçada e competência, assim discriminado:",
    "",
  ];

  for (const categoria of resumo.categorias) {
    if (categoria.itens.length === 0) continue;
    linhas.push(`${categoria.label}:`);
    categoria.itens.forEach((item) => {
      linhas.push(`- ${item.descricao}: ${formatarCentavos(item.centavos)}`);
    });
    linhas.push(`Subtotal ${categoria.label}: ${formatarCentavos(categoria.subtotalCentavos)}`);
    linhas.push("");
  }

  linhas.push(`TOTAL DA CAUSA: ${resumo.totalFormatado} (${resumo.totalPorExtenso}).`);

  return linhas;
}

export function gerarPecaJec(input: GerarPecaJecInput): GerarPecaJecOutput {
  const totalProvas =
    input.provas.length +
    input.fotos.length +
    input.midias.length +
    Object.values(input.documentos).flat().length;

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
    `- RG: ${listarArquivos(input.documentos.rg)}`,
    `- CPF: ${listarArquivos(input.documentos.cpf)}`,
    `- CNH: ${listarArquivos(input.documentos.cnh)}`,
    `- Comprovante de residência: ${listarArquivos(input.documentos.comprovanteResidencia)}`,
    `- Declaração de Hipossuficiência: ${listarArquivos(input.documentos.declaracaoHipossuficiencia)}`,
    `- Procuração: ${listarArquivos(input.documentos.procuracao)}`,
    `- Mandado de Levantamento Eletrônico (MLE): ${listarArquivos(input.documentos.mandadoLevantamentoEletronico)}`,
    "",
    `Prints, recibos e documentos (${input.provas.length}): ${listarArquivos(input.provas)}`,
    `Fotos e outros (${input.fotos.length}): ${listarArquivos(input.fotos)}`,
    `Áudios e vídeos (${input.midias.length}): ${listarArquivos(input.midias)}`,
    "",
    `Total de arquivos para análise: ${totalProvas}`,
    "",
    "Observação: A análise aprofundada do conteúdo dos arquivos será integrada com IA na próxima fase. "
      + "Nesta versão, a peça foi estruturada com base nos fatos narrados e na documentação listada."
  );

  const analise = analisePartes.join("\n");

  const autor = input.autorNome ?? "[NOME DO(A) ADVOGADO(A)]";
  const oab = input.autorOab ?? "[Nº OAB/UF]";

  const valorCausaResumo = input.valoresCausa
    ? calcularResumoValorCausa(input.valoresCausa)
    : undefined;

  const enderecamento = formatarEnderecamentoJec(
    input.comarca ?? { cidade: "", uf: "" }
  );

  const pecaBruta = [
    ...enderecamento.split("\n"),
    "",
    // Nome da ação aparece uma única vez — entre as qualificações, nunca
    // logo abaixo do endereçamento.
    `[NOME COMPLETO DO(A) AUTOR(A)], [nacionalidade], [estado civil], [profissão], inscrito(a) no CPF sob nº [CPF], `
      + "portador(a) do RG nº [RG], residente e domiciliado(a) na [endereço completo], "
      + "endereço eletrônico [e-mail], por seu advogado que esta subscreve "
      + `(procuração anexa), ${autor}, inscrito na OAB/${oab}, `
      + "com escritório profissional na [endereço do advogado], onde recebe intimações, "
      + "vem, respeitosamente, à presença de Vossa Excelência, com fundamento na Lei nº 9.099/95, "
      + "propor a presente",
    "",
    `${tipoAcao.toUpperCase()}`,
    "",
    "em face de [NOME COMPLETO DO(A) RÉU(RÉ)], [qualificação completa do(a) réu(ré)], "
      + "pelos fatos e fundamentos jurídicos a seguir expostos.",
    "",
    "I — DOS FATOS",
    "",
    input.fatos.trim(),
    "",
    "II — DO DIREITO",
    "",
    "A presente demanda tramita perante o Juizado Especial Cível, nos termos da Lei nº 9.099/95, "
      + " sendo a via adequada para causas de menor complexidade e valor, privilegiando a oralidade, "
      + "simplicidade, informalidade, economia processual e celeridade.",
    "",
    "Os fatos narrados demonstram a plausibilidade do direito invocado e a necessidade de "
      + "intervenção do Poder Judiciário para restabelecer a situação jurídica violada.",
    "",
    ...(tutelaUrgencia
      ? [
          "Presentes, ainda, os requisitos do art. 300 do CPC — probabilidade do direito e perigo de dano "
            + "ou risco ao resultado útil do processo — autorizando a concessão de tutela de urgência.",
          "",
        ]
      : []),
    ...(itensConhecimento.length > 0
      ? [
          "Aplicam-se ao caso, em especial, os seguintes dispositivos legais e entendimentos "
            + "jurisprudenciais cadastrados na base de conhecimento do escritório:",
          "",
          ...itensConhecimento.flatMap((item) => [
            `${item.categoria.toUpperCase()} — ${item.titulo}`,
            item.texto.trim(),
            "",
          ]),
        ]
      : []),
    "III — DAS PROVAS",
    "",
    "Protesta provar o alegado por todos os meios de prova em direito admitidos, especialmente:",
    "- Documentos pessoais: "
      + [
        ...(input.documentos.rg ?? []),
        ...(input.documentos.cpf ?? []),
        ...(input.documentos.cnh ?? []),
        ...(input.documentos.comprovanteResidencia ?? []),
      ].join(", ") || "a serem juntados",
    ...(input.documentos.declaracaoHipossuficiencia?.length
      ? [`- Declaração de Hipossuficiência: ${input.documentos.declaracaoHipossuficiencia.join(", ")}`]
      : []),
    ...(input.documentos.procuracao?.length
      ? [`- Procuração: ${input.documentos.procuracao.join(", ")}`]
      : []),
    ...(input.documentos.mandadoLevantamentoEletronico?.length
      ? [`- Mandado de Levantamento Eletrônico (MLE): ${input.documentos.mandadoLevantamentoEletronico.join(", ")}`]
      : []),
    input.provas.length
      ? `- Documentos probatórios (prints, recibos): ${input.provas.join(", ")}`
      : "- Documentos probatórios: a serem juntados",
    input.fotos.length
      ? `- Fotos e outros: ${input.fotos.join(", ")}`
      : "- Fotos e outros: a serem juntados",
    input.midias.length
      ? `- Áudios e vídeos: ${input.midias.join(", ")}`
      : "- Áudios e vídeos: a serem juntados",
    "- Depoimento pessoal das partes, oitiva de testemunhas e demais provas permitidas em sede de JEC.",
    "",
    "IV — DO VALOR DA CAUSA",
    "",
    ...montarSecaoValorCausa(valorCausaResumo),
    "",
    "V — DO PEDIDO",
    "",
    "Ante o exposto, requer:",
    "",
    extrairPedidos(tipoAcao, tutelaUrgencia, valorCausaResumo),
    "",
    "Termos em que,",
    "Pede deferimento.",
    "",
    `${localFechamento(input.comarca)}, ${formatarDataPorExtenso(new Date())}.`,
    "",
    autor,
    `OAB/${oab}`,
  ].join("\n");

  const peca = aplicarFormatacaoTextoJuridico(pecaBruta, input.fatos);
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

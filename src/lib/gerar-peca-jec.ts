import { analisarCaseAssistente, ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  aplicarFormatacaoTextoJuridico,
  gerarDocumentoTimbrado,
} from "@/lib/formatacao-juridica";

export type GerarPecaJecInput = {
  tipoAcao: string;
  tutelaUrgencia: boolean;
  fatos: string;
  documentos: {
    rg?: string[];
    cpf?: string[];
    cnh?: string[];
    comprovanteResidencia?: string[];
  };
  provas: string[];
  fotos: string[];
  midias: string[];
  escritorio?: EscritorioConfig;
  autorNome?: string;
  autorOab?: string;
};

export type GerarPecaJecOutput = {
  analise: string;
  peca: string;
  pecaHtml: string;
  timbrado: boolean;
  fundamentoLegal: string[];
  decisaoAssistente?: {
    tipoAcao: string;
    tutelaUrgencia: boolean;
    justificativa: string;
  };
};

function listarArquivos(arquivos: string[] | undefined): string {
  if (!arquivos?.length) return "Não anexado";
  return arquivos.join(", ");
}

function extrairPedidos(tipoAcao: string, tutelaUrgencia: boolean): string {
  const pedidos = [
    "a) A citação do(a) requerido(a) para, querendo, apresentar contestação, sob pena de revelia;",
    "b) A procedência total dos pedidos formulados na presente demanda;",
    "c) A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios, na forma da Lei nº 9.099/95.",
  ];

  if (tipoAcao.toLowerCase().includes("indenização")) {
    pedidos.splice(
      1,
      0,
      "b) A condenação do(a) requerido(a) ao pagamento de indenização por danos materiais e morais, em valor a ser arbitrado por Vossa Excelência;"
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

  const pecaBruta = [
    "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL",
    "DA COMARCA DE [CIDADE/UF]",
    "",
    `${tipoAcao.toUpperCase()}`,
    "",
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
    tutelaUrgencia
      ? "Presentes, ainda, os requisitos do art. 300 do CPC — probabilidade do direito e perigo de dano "
        + "ou risco ao resultado útil do processo — autorizando a concessão de tutela de urgência."
      : "",
    "",
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
    "Dá-se à causa o valor de R$ [VALOR DA CAUSA] ([valor por extenso]), para fins de alçada e competência.",
    "",
    "V — DO PEDIDO",
    "",
    "Ante o exposto, requer:",
    "",
    extrairPedidos(tipoAcao, tutelaUrgencia),
    "",
    "Termos em que,",
    "Pede deferimento.",
    "",
    "[CIDADE/UF], [DATA].",
    "",
    autor,
    `OAB/${oab}`,
  ]
    .filter(Boolean)
    .join("\n");

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
    ...(decisaoAssistente && { decisaoAssistente }),
  };
}

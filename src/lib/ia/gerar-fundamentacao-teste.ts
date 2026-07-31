/**
 * Orquestra o sandbox de teste de geração por IA (/admin/teste-ia): busca a
 * base de conhecimento pelo tema, monta o system prompt "Assistente Facto"
 * (peça completa, estrutura dinâmica) e injeta a base de conhecimento como
 * material de citação obrigatório, chama a Gemini API (camada gratuita) e
 * roda a verificação de citações por código.
 *
 * Isolado da rota /api/gerar-peca de propósito — este caminho é só para
 * teste com casos fictícios, nunca é usado no fluxo real do dashboard.
 */

import {
  buscarConhecimentoRelacionado,
  montarContextoConhecimento,
} from "@/lib/base-conhecimento";
import { gerarTextoComGemini, geminiConfigurado } from "@/lib/ia/gemini-client";
import {
  verificarCitacoes,
  contarMarcadoresNaoEncontrado,
  MARCADOR_NAO_ENCONTRADO,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";

/**
 * System prompt "Assistente Facto" — pedido explicitamente pelo usuário em
 * 30/07/2026, mantido o mais próximo possível do texto original. A regra 4
 * (DO DIREITO) foi ajustada em dois níveis de confiança, decidido com o
 * usuário em 30/07/2026:
 *
 * - Leis e códigos consolidados (CF, CC, CPC, CDC, CLT, Lei 9.099/95): o
 *   modelo PODE citar de memória, sem precisar estar na base_conhecimento.
 *   São textos públicos, estáveis e fartamente repetidos no treinamento —
 *   não vale a pena (nem cabe no orçamento de tokens) carregar códigos
 *   inteiros só para isso.
 * - Súmulas e jurisprudência: continuam proibidas fora da base_conhecimento
 *   injetada. É a categoria de maior risco de invenção (número de processo,
 *   data, relator são praticamente arbitrários) — ver canvas
 *   "melhores-ias-peca-juridica" para o histórico desse risco.
 */
function montarSystemPrompt(contexto: string): string {
  return [
    "Você é o Assistente Facto, uma Inteligência Artificial Jurídica de alta performance. Seu objetivo é redigir peças processuais completas, persuasivas e prontas para protocolo, além de atuar como um consultor estratégico para o usuário.",
    "",
    "COMPORTAMENTO E INTERAÇÃO (PONTOS DE ATENÇÃO):",
    `Antes de iniciar a redação da peça, analise os dados fornecidos. Se você notar que faltam informações cruciais para o sucesso da ação (ex: datas de prescrição, valores específicos, documentos essenciais não mencionados), crie um bloco inicial chamado "⚠️ PONTOS DE ATENÇÃO PARA COMPLEMENTAÇÃO:" listando em bullet points o que o usuário precisa providenciar ou preencher. Após esse bloco, redija a peça completa com os dados disponíveis.`,
    "",
    "ESTRUTURA DINÂMICA DA PEÇA:",
    "Você tem total liberdade para criar, organizar e numerar os tópicos (em algarismos romanos: I, II, III...) e subtópicos (letras: a, b, c...) conforme a necessidade e a estratégia da ação, baseando-se nas melhores práticas jurídicas.",
    "Exemplo de estrutura (adapte conforme o caso): I. Da Competência; II. Da Tempestividade; III. Dos Fatos; IV. Da Tutela de Urgência (se houver); V. Do Direito (dividido em subtópicos temáticos); VI. Das Provas; VII. Dos Pedidos.",
    "",
    "REGRAS DE REDAÇÃO POR TÓPICO:",
    "1. ENDEREÇAMENTO: Siga os padrões do judiciário. Utilize o fórum/competência indicado pelo usuário. Se não for indicado, deixe um espaço formatado com colchetes para preenchimento futuro (ex: AO JUÍZO DA ___ VARA [CÍVEL/FEDERAL/ETC] DA COMARCA DE [CIDADE/ESTADO]).",
    "2. QUALIFICAÇÃO: Siga rigorosamente o Art. 319, II, do CPC. Extraia os dados da narração ou dos documentos fornecidos. Deixe lacunas indicadas (ex: [Estado Civil], [Profissão]) apenas para o que for impossível deduzir.",
    "3. DOS FATOS: Narre de forma cronológica, detalhada e altamente persuasiva. Se o usuário fornecer um resumo curto (ex: 4 linhas), expanda a narrativa de forma lógica, coerente e jurídica, criando um cenário completo e robusto, enriquecendo a argumentação fática sem inventar provas irreais.",
    "4. DO DIREITO: Aplique a legislação pertinente e faça a conexão exata entre a lei e o caso concreto (subsunção). Duas regras de fundamentação, com níveis de confiança diferentes:",
    "   4.1. LEIS E CÓDIGOS (Constituição Federal, Código Civil, CPC, CDC, CLT, Lei 9.099/95 e demais códigos consolidados): você pode citar artigos desses códigos usando seu próprio conhecimento, mesmo que não estejam no material abaixo — são textos públicos e estáveis. Ainda assim, se o artigo exato estiver no material entre <BASE_DE_CONHECIMENTO> e </BASE_DE_CONHECIMENTO>, prefira citá-lo dali (é a versão verificada). Cite sempre o número do artigo com o máximo de precisão possível e, na dúvida sobre o número exato de um inciso ou parágrafo, prefira citar só o caput do artigo a arriscar um número errado.",
    "   4.2. SÚMULAS E JURISPRUDÊNCIA (acórdãos, súmulas, número de processo, relator, data de julgamento): você DEVE fundamentar exclusivamente com o que estiver LITERALMENTE no material abaixo, entre <BASE_DE_CONHECIMENTO> e </BASE_DE_CONHECIMENTO>. É estritamente proibido citar qualquer súmula, jurisprudência, número de processo ou data que não esteja nesse material — mesmo que você tenha certeza de que existe. Não cite de memória. Se o material não tiver nada relevante para um ponto específico, escreva " + MARCADOR_NAO_ENCONTRADO + " nesse trecho e prossiga com fundamentação genérica do rito aplicável, apoiada apenas na lei (regra 4.1).",
    "5. DOS PEDIDOS: Liste todos os pedidos pertinentes à ação em bullet points. Inclua obrigatoriamente os pedidos de praxe (citação, condenação em custas e honorários sucumbenciais, produção de provas, etc.).",
    "",
    "FORMATAÇÃO:",
    "Retorne todo o texto formatado em Markdown, utilizando negrito para destacar partes importantes, para que seja exibido perfeitamente na tela do sistema.",
    "",
    "<BASE_DE_CONHECIMENTO>",
    contexto || "(nenhum item cadastrado para este tema — use apenas o próprio conhecimento para leis/códigos consolidados, e sinalize com o marcador de não encontrado ao citar súmula ou jurisprudência)",
    "</BASE_DE_CONHECIMENTO>",
  ].join("\n");
}

export type ResultadoTesteIA =
  | {
      ok: true;
      textoGerado: string;
      modelo: string;
      contextoUtilizado: { titulo: string; categoria: string }[];
      citacoes: CitacaoVerificada[];
      marcadoresNaoEncontrado: number;
    }
  | {
      ok: false;
      erro: string;
    };

export async function gerarPecaTeste(params: {
  tipoAcao: string;
  fatosFicticios: string;
}): Promise<ResultadoTesteIA> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada. Adicione a chave gratuita do Google AI Studio no .env.local.",
    };
  }

  const itens = await buscarConhecimentoRelacionado(params.tipoAcao);
  const contexto = montarContextoConhecimento(itens);
  const systemPrompt = montarSystemPrompt(contexto);
  const userPrompt = `Tipo de ação: ${params.tipoAcao}\n\nFatos (caso de TESTE, fictício):\n${params.fatosFicticios.trim()}`;

  const resultado = await gerarTextoComGemini({ systemPrompt, userPrompt });

  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  const citacoes = verificarCitacoes(resultado.texto, contexto);
  const marcadoresNaoEncontrado = contarMarcadoresNaoEncontrado(resultado.texto);

  return {
    ok: true,
    textoGerado: resultado.texto,
    modelo: resultado.modelo,
    contextoUtilizado: itens.map((item) => ({ titulo: item.titulo, categoria: item.categoria })),
    citacoes,
    marcadoresNaoEncontrado,
  };
}

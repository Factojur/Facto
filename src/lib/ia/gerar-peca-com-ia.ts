/**
 * Geração de peça via Gemini com RAG + verificação de citações.
 * Compartilhado entre o sandbox de teste e a rota real /api/gerar-peca.
 */

import {
  buscarConhecimentoRelacionado,
  montarContextoConhecimento,
  type TrechoConhecimento,
} from "@/lib/base-conhecimento";
import {
  montarSystemPromptAssistenteFacto,
  type BlocoLeiMunicipal,
} from "@/lib/ia/assistente-facto-prompt";
import { gerarTextoComGemini, geminiConfigurado } from "@/lib/ia/gemini-client";
import {
  contarMarcadoresNaoEncontrado,
  verificarCitacoes,
  type CitacaoVerificada,
} from "@/lib/ia/verificacao-citacoes";

export type InstrucoesDeterministicas = {
  enderecamento?: string;
  valorCausa?: string;
  tutelaUrgencia?: boolean;
  autorNome?: string;
  autorOab?: string;
  localFechamento?: string;
};

export type ResultadoPecaIA =
  | {
      ok: true;
      textoGerado: string;
      modelo: string;
      contextoUtilizado: { titulo: string; categoria: string }[];
      citacoes: CitacaoVerificada[];
      marcadoresNaoEncontrado: number;
      itensConhecimento: TrechoConhecimento[];
    }
  | {
      ok: false;
      erro: string;
    };

function montarUserPrompt(params: {
  tipoAcao: string;
  fatos: string;
  instrucoes?: InstrucoesDeterministicas;
  casoReal: boolean;
}): string {
  const partes = [
    `Tipo de ação: ${params.tipoAcao}`,
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela de urgência: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir pedido e fundamentação" : "Não"}`
      : null,
    "",
    params.casoReal
      ? "Fatos do caso (redija a peça com base nisto):"
      : "Fatos (caso de TESTE, fictício):",
    params.fatos.trim(),
  ].filter((p): p is string => p != null);

  if (params.instrucoes?.enderecamento?.trim()) {
    partes.push(
      "",
      "ENDEREÇAMENTO DETERMINÍSTICO (usar literalmente no início da peça):",
      params.instrucoes.enderecamento.trim()
    );
  }

  if (params.instrucoes?.valorCausa?.trim()) {
    partes.push(
      "",
      "VALOR DA CAUSA DETERMINÍSTICO (reproduzir literalmente na seção do valor da causa):",
      params.instrucoes.valorCausa.trim()
    );
  }

  if (params.instrucoes?.autorNome || params.instrucoes?.autorOab) {
    partes.push(
      "",
      "Dados do advogado subscritor (use na qualificação/fechamento quando couber):",
      `Nome: ${params.instrucoes.autorNome ?? "[NOME DO(A) ADVOGADO(A)]"}`,
      `OAB: ${params.instrucoes.autorOab ?? "[Nº OAB/UF]"}`
    );
  }

  if (params.instrucoes?.localFechamento) {
    partes.push(
      "",
      `Local e data de fechamento sugeridos: ${params.instrucoes.localFechamento}, ${new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.`
    );
  }

  return partes.join("\n");
}

/** Remove marcação Markdown leve para o preview/exporto da peça. */
export function markdownLeveParaTexto(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .trim();
}

export async function gerarPecaComIA(params: {
  tipoAcao: string;
  fatos: string;
  /** Se omitido, busca na base pelo tipo + fatos. */
  itensConhecimento?: TrechoConhecimento[];
  leiMunicipal?: BlocoLeiMunicipal | null;
  instrucoes?: InstrucoesDeterministicas;
  /** false = sandbox de teste (fatos fictícios). */
  casoReal?: boolean;
}): Promise<ResultadoPecaIA> {
  if (!geminiConfigurado()) {
    return {
      ok: false,
      erro: "GEMINI_API_KEY não configurada. Adicione a chave no ambiente do servidor.",
    };
  }

  const itens =
    params.itensConhecimento ??
    (await buscarConhecimentoRelacionado(params.tipoAcao, 6, params.fatos));

  const contextoBase = montarContextoConhecimento(itens);
  const leiMunicipal = params.leiMunicipal?.texto?.trim()
    ? {
        nome: params.leiMunicipal.nome || "Lei municipal anexada",
        texto: params.leiMunicipal.texto.trim(),
      }
    : null;

  const systemPrompt = montarSystemPromptAssistenteFacto(
    contextoBase,
    leiMunicipal
  );
  const userPrompt = montarUserPrompt({
    tipoAcao: params.tipoAcao,
    fatos: params.fatos,
    instrucoes: params.instrucoes,
    casoReal: params.casoReal ?? true,
  });

  const resultado = await gerarTextoComGemini({ systemPrompt, userPrompt });
  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  const contextoParaVerificacao = [
    contextoBase,
    leiMunicipal
      ? `[Lei municipal] ${leiMunicipal.nome}\n${leiMunicipal.texto}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  const citacoes = verificarCitacoes(resultado.texto, contextoParaVerificacao);
  const marcadoresNaoEncontrado = contarMarcadoresNaoEncontrado(
    resultado.texto
  );

  return {
    ok: true,
    textoGerado: resultado.texto,
    modelo: resultado.modelo,
    contextoUtilizado: itens.map((item) => ({
      titulo: item.titulo,
      categoria: item.categoria,
    })),
    citacoes,
    marcadoresNaoEncontrado,
    itensConhecimento: itens,
  };
}

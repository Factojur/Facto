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
    "TAREFA: redija a peça JEC completa seguindo o system prompt (workflow de advogado sênior).",
    "",
    `Indicação do formulário (pista — NÃO prevalece sobre a qualificação correta dos fatos): ${params.tipoAcao}`,
    params.instrucoes?.tutelaUrgencia != null
      ? `Tutela de urgência indicada no formulário: ${params.instrucoes.tutelaUrgencia ? "Sim — incluir pedido e fundamentação (art. 300 do CPC)" : "Não — só inclua se os fatos revelarem urgência manifesta"}`
      : null,
    "",
    "IMPORTANTE:",
    "- Qualifique o NOME CORRETO da ação com base no relato.",
    "- NÃO copie o relato bruto. Reescreva os fatos em 3ª pessoa, parágrafos curtos separados por linha em branco (\\n\\n).",
    "- Fundamentação profunda em DO DIREITO (CDC/CC/súmulas consolidadas quando couber), com subsunção.",
    "",
    params.casoReal
      ? "<RELATO_BRUTO_DO_USUARIO> (insumo — reescrever, nunca colar):"
      : "<RELATO_BRUTO_DO_USUARIO> (caso de TESTE fictício — reescrever, nunca colar):",
    params.fatos.trim(),
    "</RELATO_BRUTO_DO_USUARIO>",
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

/**
 * Remove Markdown leve e garante espaçamento dissertativo entre parágrafos
 * para o preview HTML / PDF / Word.
 */
export function markdownLeveParaTexto(texto: string): string {
  let t = texto
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  // Normaliza títulos "I. DOS FATOS" / "I - DOS FATOS" → "I — DOS FATOS"
  t = t.replace(
    /^([IVXLCDM]+)\s*[.\-–—:]\s+/gim,
    (_m, romanos: string) => `${romanos.toUpperCase()} — `
  );

  // Se o modelo entregou quase tudo em um bloco, tenta abrir parágrafos
  // após pontuação forte seguida de maiúscula (sem já haver quebra dupla).
  if (!/\n\s*\n/.test(t) && t.length > 400) {
    t = t.replace(/([.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g, "$1\n\n");
  }

  // Colapsa 3+ quebras em exatamente 2 (parágrafo)
  t = t.replace(/\n{3,}/g, "\n\n");

  return t.trim();
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

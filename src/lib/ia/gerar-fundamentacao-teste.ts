/**
 * Orquestra o sandbox de teste de geração por IA (/admin/teste-ia).
 * Usa o mesmo pipeline de RAG + Gemini + verificação da geração real,
 * e aplica a tipografia forense (normalização + HTML) para prévia igual à do dashboard.
 */

import { gerarPecaComIA } from "@/lib/ia/gerar-peca-com-ia";
import { normalizarPecaGerada } from "@/lib/ia/normalizar-peca-gerada";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import {
  formatarEnderecamentoPadrao,
  rotuloAreaJudiciaria,
} from "@/lib/endereco-comarca";
import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";

export type ResultadoTesteIA =
  | {
      ok: true;
      /** Texto já normalizado (mesma base do PDF/Word). */
      textoGerado: string;
      /** HTML forense (Times 12, margens, tipografia). */
      pecaHtml: string;
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
  const enderecamento = formatarEnderecamentoPadrao({
    comarca: { cidade: "[CIDADE]", uf: "UF" },
    areaJudiciaria: rotuloAreaJudiciaria("jec"),
    varaEmBranco: true,
  });

  const resultado = await gerarPecaComIA({
    tipoAcao: params.tipoAcao,
    fatos: params.fatosFicticios,
    casoReal: false,
    instrucoes: {
      enderecamento,
      localFechamento: "[Cidade]/UF",
      autorNome: "[Nome do Advogado]",
      tutelaUrgencia: /tutela|urgente|liminar/i.test(params.fatosFicticios),
    },
  });

  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  const textoGerado = normalizarPecaGerada(resultado.textoGerado);
  const { pecaHtml } = gerarDocumentoTimbrado(textoGerado);

  return {
    ok: true,
    textoGerado,
    pecaHtml,
    modelo: resultado.modelo,
    contextoUtilizado: resultado.contextoUtilizado,
    citacoes: resultado.citacoes,
    marcadoresNaoEncontrado: resultado.marcadoresNaoEncontrado,
  };
}

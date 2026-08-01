/**
 * Orquestra o sandbox de teste de geração por IA (/admin/teste-ia).
 * Usa o mesmo pipeline de RAG + Gemini + verificação da geração real,
 * sempre com fatos marcados como fictícios.
 */

import { gerarPecaComIA } from "@/lib/ia/gerar-peca-com-ia";
import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";

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
  const resultado = await gerarPecaComIA({
    tipoAcao: params.tipoAcao,
    fatos: params.fatosFicticios,
    casoReal: false,
  });

  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  return {
    ok: true,
    textoGerado: resultado.textoGerado,
    modelo: resultado.modelo,
    contextoUtilizado: resultado.contextoUtilizado,
    citacoes: resultado.citacoes,
    marcadoresNaoEncontrado: resultado.marcadoresNaoEncontrado,
  };
}

/**
 * Endereçamento exato do cabeçalho da peça (comarca/foro). O texto é montado
 * inteiramente em código a partir de dados estruturados — a IA nunca recebe a
 * tarefa de escrever ou reescrever esta parte, apenas o resultado pronto.
 */

export type ComarcaInfo = {
  cep?: string;
  cidade: string;
  uf: string;
  numeroJuizado?: string;
};

type ViaCepResposta = {
  cep: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export function normalizarCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function cepValido(cep: string): boolean {
  return normalizarCep(cep).length === 8;
}

/**
 * Busca cidade/UF a partir do CEP do fórum via ViaCEP (API pública e
 * gratuita). Retorna null se o CEP for inválido ou a busca falhar — nesse
 * caso o formulário deve permitir preenchimento manual.
 */
export async function buscarComarcaPorCep(
  cepBruto: string
): Promise<{ cidade: string; uf: string } | null> {
  const cep = normalizarCep(cepBruto);
  if (cep.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) return null;

    const dados = (await resposta.json()) as ViaCepResposta;
    if (dados.erro || !dados.localidade || !dados.uf) return null;

    return { cidade: dados.localidade, uf: dados.uf };
  } catch {
    return null;
  }
}

const UFS_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function ufValida(uf: string): boolean {
  return UFS_VALIDAS.has(uf.trim().toUpperCase());
}

/**
 * Monta o cabeçalho de endereçamento exato da peça do JEC, a partir dos
 * dados de comarca já validados. Nunca deixa a IA reescrever esse trecho.
 */
export function formatarEnderecamentoJec(info: ComarcaInfo): string {
  const cidade = info.cidade.trim();
  const uf = info.uf.trim().toUpperCase();

  if (!cidade || !uf) {
    return [
      "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL",
      "DA COMARCA DE [CIDADE/UF]",
    ].join("\n");
  }

  const juizado = info.numeroJuizado?.trim()
    ? `${info.numeroJuizado.trim()}º JUIZADO ESPECIAL CÍVEL`
    : "JUIZADO ESPECIAL CÍVEL";

  return [
    `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO ${juizado}`,
    `DA COMARCA DE ${cidade.toUpperCase()} - ${uf}`,
  ].join("\n");
}

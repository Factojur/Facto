/**
 * Endereçamento exato do cabeçalho da peça (comarca/foro). O texto é montado
 * inteiramente em código a partir de dados estruturados — a IA nunca recebe a
 * tarefa de escrever ou reescrever esta parte, apenas o resultado pronto.
 */

export type ComarcaInfo = {
  /** Texto livre do foro (preferencial para o cabeçalho). */
  foro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
  numeroJuizado?: string;
};

/**
 * Tenta extrair município/UF do texto do foro (ex.: "... de Campinas/SP",
 * "... de Campinas - SP") para fechamento e OAB.
 */
export function extrairCidadeUfDoForo(foro: string): {
  cidade: string;
  uf: string;
} {
  const t = foro.trim();
  if (!t) return { cidade: "", uf: "" };

  const m =
    t.match(
      /(?:de|da comarca de)\s+([A-Za-zÀ-ÿ'.\s]+?)\s*[-–/]\s*([A-Za-z]{2})\s*$/i
    ) ??
    t.match(/([A-Za-zÀ-ÿ'.\s]+?)\s*[-–/]\s*([A-Za-z]{2})\s*$/i);

  if (!m) return { cidade: "", uf: "" };
  const cidade = m[1]!.replace(/\s+/g, " ").trim();
  const uf = m[2]!.trim().toUpperCase();
  if (!ufValida(uf) || cidade.length < 2) return { cidade: "", uf: "" };
  return { cidade, uf };
}

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
 * Monta o cabeçalho de endereçamento exato da peça do JEC.
 * Preferência: texto livre do foro. Fallback: cidade/UF estruturados.
 * Nunca deixa a IA reescrever esse trecho.
 */
export function formatarEnderecamentoJec(info: ComarcaInfo): string {
  const foro = info.foro?.trim();
  if (foro) {
    return [
      "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO",
      foro.toUpperCase(),
    ].join("\n");
  }

  const cidade = (info.cidade ?? "").trim();
  const uf = (info.uf ?? "").trim().toUpperCase();

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

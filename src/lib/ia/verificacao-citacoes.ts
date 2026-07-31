/**
 * Verificação de citações jurídicas geradas por IA — sem nenhuma chamada de
 * modelo adicional. Como o FACTO controla exatamente quais textos (leis,
 * súmulas, jurisprudências) foram injetados no prompt, basta comparar cada
 * citação que aparece no texto gerado contra esse contexto: se não houver
 * correspondência, a citação é marcada como não verificada para revisão
 * humana antes do protocolo. Ver canvas "melhores-ias-peca-juridica" — esta
 * é a camada de "misgrounding check" recomendada ali, e não ataca invenção
 * total (isso é papel do prompt), apenas confirma se o que foi citado tem
 * lastro no material fornecido.
 */

// Padrões de citação jurídica mais comuns em peças brasileiras. Propositalmente
// amplos (falso positivo é aceitável — só gera mais itens para revisar; falso
// negativo é o risco real, porque deixaria uma citação passar sem checagem).
//
// Separados em duas categorias porque o nível de confiança é diferente:
// - "lei": artigos de códigos consolidados (CF, CC, CPC, CDC, CLT, Lei
//   9.099/95). O modelo pode citar isso de memória (é conteúdo público,
//   estável e fartamente repetido no treinamento) — não citar de base
//   forçaria a IA a marcar até "Art. 5º da CF" como "não encontrado".
// - "jurisprudencia": súmulas, acórdãos, número de processo. Aqui o risco de
//   invenção é real e documentado (datas, relatores e números de processo
//   são praticamente arbitrários) — o prompt exige que só sejam citados se
//   estiverem literalmente na base_conhecimento injetada.
export type TipoCitacao = "lei" | "jurisprudencia";

const PADROES_CITACAO: { tipo: TipoCitacao; regex: RegExp }[] = [
  { tipo: "jurisprudencia", regex: /súmula\s+(?:vinculante\s+)?n?[ºo°.]?\s*\d+(?:\s+d[oa]\s+\w+)?/gi },
  { tipo: "lei", regex: /lei\s+n?[ºo°.]?\s*[\d.]+(?:\/\d{2,4})?/gi },
  { tipo: "lei", regex: /decreto(?:-lei)?\s+n?[ºo°.]?\s*[\d.]+(?:\/\d{2,4})?/gi },
  { tipo: "lei", regex: /art(?:igo)?\.?\s*\d+[º°]?(?:[,-]?\s*(?:§\s*\d+[º°]?|inciso\s+[ivxlcdm]+|caput))?/gi },
  { tipo: "jurisprudencia", regex: /(?:re|resp|agrg|agint|aresp|edcl|hc|adi|adpf|rext)\s*n?[ºo°.]?\s*[\d.\-\/]+/gi },
  { tipo: "jurisprudencia", regex: /processo\s+n?[ºo°.]?\s*[\d.\-\/]+/gi },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type CitacaoVerificada = {
  trecho: string;
  tipo: TipoCitacao;
  verificada: boolean;
};

/**
 * Extrai todas as citações jurídicas de `textoGerado` e checa, para cada
 * uma, se ela (normalizada) aparece em algum lugar de `contextoFornecido` —
 * a concatenação exata dos textos da base de conhecimento que foram
 * realmente injetados no prompt daquela geração.
 *
 * `verificada: false` numa citação de lei é apenas informativo (o modelo tem
 * permissão de citar códigos consolidados de memória). Numa citação de
 * jurisprudência, `verificada: false` é um alerta real — o prompt proíbe
 * esse tipo de citação fora da base, então se aparece sem lastro é sinal de
 * possível invenção e precisa de revisão humana antes do protocolo.
 */
export function verificarCitacoes(
  textoGerado: string,
  contextoFornecido: string
): CitacaoVerificada[] {
  const contextoNormalizado = normalizar(contextoFornecido);
  const encontradas = new Map<string, CitacaoVerificada>();

  for (const { tipo, regex } of PADROES_CITACAO) {
    const matches = textoGerado.matchAll(regex);
    for (const match of matches) {
      const trecho = match[0].trim();
      const chave = normalizar(trecho);
      if (encontradas.has(chave)) continue;

      encontradas.set(chave, {
        trecho,
        tipo,
        verificada: contextoNormalizado.includes(chave),
      });
    }
  }

  return Array.from(encontradas.values());
}

/**
 * Marcador literal que o system prompt instrui a IA a usar quando ela
 * própria reconhece que não há fundamento suficiente no material fornecido.
 * Contá-lo aqui é mais confiável do que tentar inferir "incerteza" no texto.
 */
export const MARCADOR_NAO_ENCONTRADO = "[NÃO ENCONTRADO NA BASE]";

export function contarMarcadoresNaoEncontrado(texto: string): number {
  return texto.split(MARCADOR_NAO_ENCONTRADO).length - 1;
}

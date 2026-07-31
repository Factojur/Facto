/**
 * Base de conhecimento jurídico — fundação do sistema de RAG (Retrieval
 * Augmented Generation) do FACTO. Leis, súmulas e jurisprudências cadastradas
 * pelo admin em /admin/conhecimento são buscadas aqui por palavra-chave e
 * injetadas como contexto obrigatório antes de qualquer geração de peça.
 */

import { createAdminClient } from "@/lib/supabase/admin";

export const CATEGORIAS_CONHECIMENTO = ["Lei", "Súmula", "Jurisprudência"] as const;
export type CategoriaConhecimento = (typeof CATEGORIAS_CONHECIMENTO)[number];

export type ItemConhecimento = {
  id: string;
  titulo: string;
  categoria: string;
  texto: string;
  criado_em: string;
  arquivo_nome?: string | null;
  arquivo_path?: string | null;
  arquivo_tipo?: string | null;
};

/**
 * Um trecho relevante extraído de um item da base de conhecimento. Documentos
 * grandes (uma lei inteira, um código, a Constituição) são cadastrados por
 * completo em `base_conhecimento`, mas nunca são injetados inteiros num
 * prompt — são quebrados em trechos (artigo a artigo, quando possível) e só
 * os trechos mais relevantes para o tema da ação entram no contexto da IA.
 */
export type TrechoConhecimento = {
  titulo: string;
  categoria: string;
  texto: string;
};

export const TIPOS_ARQUIVO_ACEITOS = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
} as const;

export type TipoArquivoAceito =
  (typeof TIPOS_ARQUIVO_ACEITOS)[keyof typeof TIPOS_ARQUIVO_ACEITOS];

export const TAMANHO_MAXIMO_ARQUIVO_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Extrai o texto de um PDF ou Word (.docx) para ser usado como conteúdo
 * pesquisável da base de conhecimento — o mesmo texto que seria colado
 * manualmente no campo "Texto/Conteúdo". Arquivos .doc (formato binário
 * antigo) não são suportados, apenas .docx (formato OOXML).
 */
export async function extrairTextoDeArquivo(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const resultado = await parser.getText();
      return resultado.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const resultado = await mammoth.extractRawText({ buffer });
    return resultado.value.trim();
  }

  throw new Error(
    "Formato de arquivo não suportado. Envie um PDF ou um Word (.docx)."
  );
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function palavrasChave(tipoAcao: string): string[] {
  const palavrasDoTipo = normalizar(tipoAcao)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 3);

  return Array.from(
    new Set([...palavrasDoTipo, "juizado especial civel", "9099", "9.099"])
  );
}

// Tamanho máximo de um trecho individual — grande o bastante para caber um
// artigo inteiro com seus parágrafos e incisos, pequeno o bastante para que
// vários trechos de fontes diferentes caibam no orçamento total do prompt.
const TAMANHO_MAXIMO_TRECHO = 2_500;

/**
 * Quebra o texto de um item em trechos menores. Leis, códigos e a
 * Constituição têm uma estrutura previsível ("Art. 5º ...", "Art. 6º ..."),
 * então a divisão é feita por artigo sempre que o texto tiver artigos
 * suficientes para isso valer a pena. Súmulas e ementas de jurisprudência
 * (textos curtos, sem essa estrutura) simplesmente viram um único trecho.
 */
function dividirEmTrechos(texto: string): string[] {
  const textoLimpo = texto.trim();
  if (!textoLimpo) return [];

  const porArtigo = textoLimpo
    .split(/(?=art(?:igo)?\.?\s*\d+[º°]?\b)/gi)
    .map((parte) => parte.trim())
    .filter(Boolean);

  const partesBase = porArtigo.length > 3 ? porArtigo : [textoLimpo];

  const trechos: string[] = [];
  for (const parte of partesBase) {
    if (parte.length <= TAMANHO_MAXIMO_TRECHO) {
      trechos.push(parte);
      continue;
    }

    // Artigo (ou documento sem estrutura de artigos) grande demais: quebra
    // por parágrafo em blocos que caibam no limite.
    const paragrafos = parte.split(/\n{2,}/);
    let atual = "";
    for (const paragrafo of paragrafos) {
      const candidato = atual ? `${atual}\n\n${paragrafo}` : paragrafo;
      if (candidato.length > TAMANHO_MAXIMO_TRECHO && atual) {
        trechos.push(atual.trim());
        atual = paragrafo;
      } else {
        atual = candidato;
      }
    }
    if (atual.trim()) trechos.push(atual.trim());
  }

  return trechos;
}

function pontuarTrecho(trechoNormalizado: string, palavras: string[]): number {
  let pontos = 0;
  for (const palavra of palavras) {
    if (!palavra) continue;
    pontos += trechoNormalizado.split(palavra).length - 1;
  }
  return pontos;
}

/**
 * Busca na base de conhecimento os trechos relacionados ao tema da ação.
 *
 * Funciona em duas etapas: primeiro um filtro grosseiro no banco (documentos
 * que mencionam pelo menos uma palavra-chave em algum lugar) só para reduzir
 * o que precisa ser lido; depois, cada documento candidato é quebrado em
 * trechos (por artigo, quando possível) e cada trecho é pontuado pela
 * quantidade de palavras-chave que contém. Só os trechos mais relevantes são
 * retornados — nunca o documento inteiro. Isso permite cadastrar uma lei ou
 * código inteiro na base sem que ele "vença" a busca inteiro toda vez que
 * contiver algum termo genérico em algum canto.
 *
 * Falha de forma silenciosa (retorna lista vazia) se a tabela ainda não
 * existir ou a busca der erro — a geração da peça nunca deve travar por
 * causa disso.
 */
export async function buscarConhecimentoRelacionado(
  tipoAcao: string,
  limite = 6
): Promise<TrechoConhecimento[]> {
  const palavras = palavrasChave(tipoAcao);
  if (palavras.length === 0) return [];

  try {
    const admin = createAdminClient();

    const condicoes = palavras
      .map((p) => {
        const termo = p.replace(/[,()]/g, "");
        return `titulo.ilike.%${termo}%,categoria.ilike.%${termo}%,texto.ilike.%${termo}%`;
      })
      .join(",");

    const { data, error } = await admin
      .from("base_conhecimento")
      .select("id, titulo, categoria, texto, criado_em")
      .or(condicoes)
      .order("criado_em", { ascending: false })
      .limit(30);

    if (error) throw error;
    const documentos = (data ?? []) as ItemConhecimento[];
    if (documentos.length === 0) return [];

    const candidatos: (TrechoConhecimento & { score: number })[] = [];
    for (const documento of documentos) {
      const trechos = dividirEmTrechos(documento.texto);
      for (const trecho of trechos) {
        const score = pontuarTrecho(normalizar(trecho), palavras);
        if (score > 0) {
          candidatos.push({
            titulo: documento.titulo,
            categoria: documento.categoria,
            texto: trecho,
            score,
          });
        }
      }
    }

    candidatos.sort((a, b) => b.score - a.score);
    return candidatos
      .slice(0, limite)
      .map(({ titulo, categoria, texto }) => ({ titulo, categoria, texto }));
  } catch {
    return [];
  }
}

// Um item de base de conhecimento pode ser uma lei inteira, uma constituição,
// um PDF de centenas de páginas — não há limite no cadastro. Sem um teto por
// item e por soma total, um único documento grande estoura sozinho a quota de
// tokens de qualquer provedor de IA (foi o que aconteceu em produção: alguém
// cadastrou a Constituição Federal inteira como "Lei", 1,5 milhão de
// caracteres, e ela passou a entrar em praticamente toda busca por conter
// termos genéricos como "indenização" e "dano"). Os limites abaixo protegem
// qualquer chamada de IA — real ou de teste — desse cenário.
const LIMITE_CARACTERES_POR_ITEM = 12_000; // ~3.000 tokens por item
const LIMITE_CARACTERES_TOTAL_CONTEXTO = 40_000; // ~10.000 tokens no total injetado

function truncarParaOrcamento(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite)}\n[...texto truncado — item muito longo para caber no limite de contexto da IA; cadastre trechos mais específicos em vez do documento inteiro...]`;
}

/**
 * Monta o texto da base de conhecimento a ser injetado no prompt de uma IA,
 * respeitando um orçamento de caracteres por item e no total — nunca deixa
 * um único documento grande estourar a quota de tokens da chamada. Usada
 * tanto pelo prompt de referência do fluxo determinístico quanto pelo
 * sandbox de teste em /admin/teste-ia.
 */
export function montarContextoConhecimento(itens: TrechoConhecimento[]): string {
  let restante = LIMITE_CARACTERES_TOTAL_CONTEXTO;
  const blocos: string[] = [];

  for (const item of itens) {
    if (restante <= 0) break;
    const limiteItem = Math.min(LIMITE_CARACTERES_POR_ITEM, restante);
    const textoAjustado = truncarParaOrcamento(item.texto.trim(), limiteItem);
    blocos.push(`[${item.categoria}] ${item.titulo}\n${textoAjustado}`);
    restante -= textoAjustado.length;
  }

  return blocos.join("\n\n---\n\n");
}

/**
 * Monta o texto que deve ser injetado no System Prompt da IA quando a
 * geração de peça por IA generativa for implementada. Hoje a peça do JEC é
 * montada de forma determinística (sem chamada a nenhum modelo de IA) — este
 * prompt já fica pronto no retorno da API para ser plugado assim que o
 * modelo for integrado.
 */
export function montarPromptBaseConhecimento(
  itens: TrechoConhecimento[]
): string | null {
  if (itens.length === 0) return null;

  return `Utilize obrigatoriamente as seguintes leis e jurisprudências:\n\n${montarContextoConhecimento(itens)}`;
}

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

/**
 * Busca na base de conhecimento os itens relacionados ao tema da ação, por
 * palavra-chave em título, categoria e texto. Falha de forma silenciosa
 * (retorna lista vazia) se a tabela ainda não existir ou a busca der erro —
 * a geração da peça nunca deve travar por causa disso.
 */
export async function buscarConhecimentoRelacionado(
  tipoAcao: string,
  limite = 6
): Promise<ItemConhecimento[]> {
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
      .limit(limite);

    if (error) throw error;
    return (data ?? []) as ItemConhecimento[];
  } catch {
    return [];
  }
}

/**
 * Monta o texto que deve ser injetado no System Prompt da IA quando a
 * geração de peça por IA generativa for implementada. Hoje a peça do JEC é
 * montada de forma determinística (sem chamada a nenhum modelo de IA) — este
 * prompt já fica pronto no retorno da API para ser plugado assim que o
 * modelo for integrado.
 */
export function montarPromptBaseConhecimento(
  itens: ItemConhecimento[]
): string | null {
  if (itens.length === 0) return null;

  const textos = itens
    .map((item) => `[${item.categoria}] ${item.titulo}\n${item.texto.trim()}`)
    .join("\n\n---\n\n");

  return `Utilize obrigatoriamente as seguintes leis e jurisprudências:\n\n${textos}`;
}

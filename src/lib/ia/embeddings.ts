/**
 * Embeddings via Gemini (gemini-embedding-001, 768 dimensões).
 * Usado no RAG semântico da base_conhecimento.
 *
 * text-embedding-004 foi descontinuado; usamos gemini-embedding-001
 * com outputDimensionality=768 (compatível com a coluna vector(768)).
 */

import { geminiConfigurado } from "@/lib/ia/gemini-client";

const EMBED_MODELOS = [
  "gemini-embedding-001",
  "gemini-embedding-2",
] as const;
const EMBED_DIM = 768;
/** Limite seguro de caracteres por chamada. */
const MAX_CHARS = 6_000;

export function embeddingDimensao(): number {
  return EMBED_DIM;
}

export function textoParaEmbedding(titulo: string, texto: string): string {
  const t = `${titulo.trim()}\n\n${texto.trim()}`.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_CHARS) return t;
  return `${t.slice(0, MAX_CHARS)}…`;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Gera embedding; retorna null se Gemini não estiver configurado ou falhar.
 */
export async function gerarEmbedding(
  texto: string,
  opcoes?: { taskType?: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" }
): Promise<number[] | null> {
  if (!geminiConfigurado()) return null;
  const key = process.env.GEMINI_API_KEY!.trim();
  const input = texto.trim().slice(0, MAX_CHARS);
  if (input.length < 8) return null;

  const taskType = opcoes?.taskType ?? "RETRIEVAL_DOCUMENT";

  for (const modelo of EMBED_MODELOS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:embedContent?key=${encodeURIComponent(key)}`;

    for (let tentativa = 0; tentativa < 4; tentativa++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: `models/${modelo}`,
            content: { parts: [{ text: input }] },
            taskType,
            outputDimensionality: EMBED_DIM,
          }),
        });

        if (res.status === 429 || res.status === 503) {
          const wait = 2_000 * Math.pow(2, tentativa); // 2s, 4s, 8s, 16s
          console.warn("[embedding]", modelo, res.status, `retry em ${wait}ms`);
          await sleep(wait);
          continue;
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.warn("[embedding]", modelo, res.status, errText.slice(0, 180));
          break; // tenta próximo modelo
        }

        const json = (await res.json()) as {
          embedding?: { values?: number[] };
        };
        const values = json.embedding?.values;
        if (!Array.isArray(values) || values.length < 64) break;

        if (values.length === EMBED_DIM) return values;
        if (values.length > EMBED_DIM) return values.slice(0, EMBED_DIM);
        const padded = values.slice();
        while (padded.length < EMBED_DIM) padded.push(0);
        return padded;
      } catch (e) {
        console.warn("[embedding]", modelo, e);
        await sleep(1_000 * (tentativa + 1));
      }
    }
  }

  return null;
}

/** Similaridade de cosseno entre dois vetores. */
export function cosseno(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Indexa / reindexa embeddings na base_conhecimento.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  gerarEmbedding,
  textoParaEmbedding,
} from "@/lib/ia/embeddings";

export async function indexarConhecimentoPorId(
  id: string
): Promise<{ ok: boolean; erro?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("base_conhecimento")
    .select("id, titulo, texto")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, erro: error?.message ?? "Item não encontrado." };
  }

  const vetor = await gerarEmbedding(
    textoParaEmbedding(data.titulo, data.texto),
    { taskType: "RETRIEVAL_DOCUMENT" }
  );
  if (!vetor) {
    return {
      ok: false,
      erro: "Não foi possível gerar embedding (GEMINI_API_KEY / API).",
    };
  }

  const { error: updErr } = await admin
    .from("base_conhecimento")
    .update({ embedding: vetor })
    .eq("id", id);

  if (updErr) {
    // Coluna ainda não migrada
    if (/embedding|vector|column/i.test(updErr.message)) {
      return {
        ok: false,
        erro:
          "Coluna embedding ausente. Rode supabase/migration-base-conhecimento-embeddings.sql",
      };
    }
    return { ok: false, erro: updErr.message };
  }

  return { ok: true };
}

/** Indexa itens sem embedding (ou todos se `forcar`). */
export async function reindexarBaseConhecimento(opcoes?: {
  forcar?: boolean;
  limite?: number;
}): Promise<{ indexados: number; falhas: number; avisos: string[] }> {
  const admin = createAdminClient();
  const limite = opcoes?.limite ?? 500;
  const avisos: string[] = [];

  let query = admin
    .from("base_conhecimento")
    .select("id")
    .order("criado_em", { ascending: false })
    .limit(limite);

  // Sem forçar: só quem ainda não tem vetor (evita reprocessar os recentes).
  if (!opcoes?.forcar) {
    query = query.is("embedding", null);
  }

  const { data, error } = await query;
  if (error) {
    avisos.push(error.message);
    return { indexados: 0, falhas: 0, avisos };
  }

  let indexados = 0;
  let falhas = 0;
  let falhasSeguidas = 0;

  for (const row of data ?? []) {
    const r = await indexarConhecimentoPorId(row.id);
    if (r.ok) {
      indexados++;
      falhasSeguidas = 0;
    } else {
      falhas++;
      falhasSeguidas++;
      if (r.erro && avisos.length < 5) avisos.push(r.erro);
      // Quota/API: para cedo para não queimar o lote inteiro em 429
      if (falhasSeguidas >= 8) {
        avisos.push("Interrompido após falhas seguidas (quota/API Gemini).");
        break;
      }
    }
    // Evita estourar rate limit da Gemini
    await new Promise((res) => setTimeout(res, 250));
  }

  return { indexados, falhas, avisos };
}

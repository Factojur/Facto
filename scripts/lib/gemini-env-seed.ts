/**
 * Seeds, reindex e smokes de embedding usam APENAS Gemini free (GEMINI_API_KEY_SEED).
 * Produção (Vercel) usa GEMINI_API_KEY paygo — nunca rode seed com paygo.
 *
 * .env.local exemplo:
 *   GEMINI_API_KEY=AQ....          ← paygo (peças, chat prod) — NÃO usar em seeds
 *   GEMINI_API_KEY_SEED=AIza....   ← free (reindex após seed, smokes locais)
 */

import { config } from "dotenv";
import { resolve } from "path";

export function carregarEnvLocal(): void {
  config({ path: resolve(process.cwd(), ".env.local") });
}

/**
 * Substitui GEMINI_API_KEY pela SEED neste processo (scripts que optarem por isso).
 * @deprecated Prefira exigirGeminiApenasSeed() — não cai em paygo se SEED faltar.
 */
export function preferirGeminiSeedParaScripts(): boolean {
  const seed = process.env.GEMINI_API_KEY_SEED?.trim();
  if (!seed) return false;
  process.env.GEMINI_API_KEY = seed;
  return true;
}

/**
 * Obrigatório em todo script de seed/reindex/smoke com embedding.
 * Aborta se GEMINI_API_KEY_SEED não existir — nunca consome paygo.
 */
export function exigirGeminiApenasSeed(contexto = "seed"): void {
  carregarEnvLocal();
  const seed = process.env.GEMINI_API_KEY_SEED?.trim();
  if (!seed) {
    console.error(
      `[${contexto}] ABORTADO: defina GEMINI_API_KEY_SEED (conta free) no .env.local. ` +
        "Scripts de seed/reindex NÃO podem usar GEMINI_API_KEY paygo."
    );
    process.exit(1);
  }
  process.env.GEMINI_API_KEY = seed;
  console.log(`[${contexto}] Gemini embeddings via GEMINI_API_KEY_SEED (free) — paygo bloqueado.`);
}

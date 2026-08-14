/**
 * Lotes 57+ — mesmos temas que vieram vazios/fracos, no tribunal da API certo.
 *
 * A Jurisprudências.ai NÃO tem TSE. Eleitoral vai no STJ (recursos).
 * Previdenciário: TRF3 / TRF4 (STJ no lote 36 deu 0).
 * Trabalhista: TST (TJSP deu pouco ou zero).
 * Tributo federal: CARF.
 *
 * Depois de 40–56: npx tsx scripts/seed-juris-ai-faixa.ts 57 64
 */
import {
  TERMOS_MULTIAREA_LOTE_7,
  TERMOS_MULTIAREA_LOTE_9,
  TERMOS_MULTIAREA_LOTE_22,
} from "./seed-juris-termos-lotes-7-30";
import {
  TERMOS_MULTIAREA_LOTE_32,
  TERMOS_MULTIAREA_LOTE_35,
  TERMOS_MULTIAREA_LOTE_36,
  TERMOS_MULTIAREA_LOTE_51,
} from "./seed-juris-termos-lotes-31-56";

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
};

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

/** Lote 57 — Previdenciário II no TRF3 (SP/MS). */
export const TERMOS_LOTE_57 = noTribunal(TERMOS_MULTIAREA_LOTE_36, "trf3");

/** Lote 58 — Previdenciário II no TRF4 (Sul). */
export const TERMOS_LOTE_58 = noTribunal(TERMOS_MULTIAREA_LOTE_36, "trf4");

/** Lote 59 — Previdenciário I no TRF3. */
export const TERMOS_LOTE_59 = noTribunal(TERMOS_MULTIAREA_LOTE_7, "trf3");

/** Lote 60 — Trabalhista II no TST. */
export const TERMOS_LOTE_60 = noTribunal(TERMOS_MULTIAREA_LOTE_9, "tst");

/** Lote 61 — Trabalhista III no TST. */
export const TERMOS_LOTE_61 = noTribunal(TERMOS_MULTIAREA_LOTE_32, "tst");

/** Lote 62 — Processo do trabalho no TST. */
export const TERMOS_LOTE_62 = noTribunal(TERMOS_MULTIAREA_LOTE_51, "tst");

/** Lote 63 — Eleitoral no STJ (TSE não existe na API). */
export const TERMOS_LOTE_63 = noTribunal(TERMOS_MULTIAREA_LOTE_22, "stj");

/** Lote 64 — Tributário federal no CARF. */
export const TERMOS_LOTE_64 = noTribunal(TERMOS_MULTIAREA_LOTE_35, "carf");

export const LOTES_57_A_64: Record<number, TermoSeed[]> = {
  57: TERMOS_LOTE_57,
  58: TERMOS_LOTE_58,
  59: TERMOS_LOTE_59,
  60: TERMOS_LOTE_60,
  61: TERMOS_LOTE_61,
  62: TERMOS_LOTE_62,
  63: TERMOS_LOTE_63,
  64: TERMOS_LOTE_64,
};

export const ROTULO_LOTE_57_64: Record<number, string> = {
  57: "Previdenciário II · TRF3",
  58: "Previdenciário II · TRF4",
  59: "Previdenciário I · TRF3",
  60: "Trabalhista II · TST",
  61: "Trabalhista III · TST",
  62: "Processo do trabalho · TST",
  63: "Eleitoral · STJ (sem TSE na API)",
  64: "Tributário III · CARF",
};

export const LOTE_MAX_LACUNAS = 64;

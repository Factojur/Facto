/**
 * Opções de tribunal para busca de jurisprudência (API / UI).
 * Slugs alinhados ao Jurisprudências.ai (`/courts/{slug}/decisions`).
 */

export const MAX_TRIBUNAIS_POR_BUSCA = 3;

export type OpcaoTribunal = {
  /** Slug API (ex.: tjsp, stj). */
  id: string;
  /** Rótulo curto na UI. */
  rotulo: string;
  /** Grupo visual. */
  grupo: "superior" | "estadual";
  uf?: string;
};

/** Superiores sempre disponíveis. */
export const TRIBUNAIS_SUPERIORES: OpcaoTribunal[] = [
  { id: "stj", rotulo: "STJ", grupo: "superior" },
  { id: "stf", rotulo: "STF", grupo: "superior" },
];

/** Principais TJs (expansão gradual). */
export const TRIBUNAIS_ESTADUAIS: OpcaoTribunal[] = [
  { id: "tjsp", rotulo: "TJSP", grupo: "estadual", uf: "SP" },
  { id: "tjrj", rotulo: "TJRJ", grupo: "estadual", uf: "RJ" },
  { id: "tjmg", rotulo: "TJMG", grupo: "estadual", uf: "MG" },
  { id: "tjrs", rotulo: "TJRS", grupo: "estadual", uf: "RS" },
  { id: "tjpr", rotulo: "TJPR", grupo: "estadual", uf: "PR" },
  { id: "tjsc", rotulo: "TJSC", grupo: "estadual", uf: "SC" },
  { id: "tjba", rotulo: "TJBA", grupo: "estadual", uf: "BA" },
  { id: "tjpe", rotulo: "TJPE", grupo: "estadual", uf: "PE" },
  { id: "tjce", rotulo: "TJCE", grupo: "estadual", uf: "CE" },
  { id: "tjgo", rotulo: "TJGO", grupo: "estadual", uf: "GO" },
  { id: "tjdft", rotulo: "TJDFT", grupo: "estadual", uf: "DF" },
  { id: "tjes", rotulo: "TJES", grupo: "estadual", uf: "ES" },
  { id: "tjmt", rotulo: "TJMT", grupo: "estadual", uf: "MT" },
  { id: "tjms", rotulo: "TJMS", grupo: "estadual", uf: "MS" },
];

const POR_ID = new Map<string, OpcaoTribunal>(
  [...TRIBUNAIS_SUPERIORES, ...TRIBUNAIS_ESTADUAIS].map((t) => [t.id, t])
);

export function tribunalPorId(id: string): OpcaoTribunal | undefined {
  return POR_ID.get(id.toLowerCase());
}

export function tjPorUf(uf: string | null | undefined): OpcaoTribunal | null {
  const u = (uf ?? "").trim().toUpperCase();
  if (!u) return null;
  return TRIBUNAIS_ESTADUAIS.find((t) => t.uf === u) ?? null;
}

/** Extrai UF do texto do foro (ex.: "… de Campinas/SP" ou "…/SP"). */
export function extrairUfDoForo(foro: string | null | undefined): string | null {
  const t = (foro ?? "").trim();
  if (!t) return null;
  const m =
    t.match(/\/\s*([A-Za-z]{2})\s*$/) ||
    t.match(/\b([A-Za-z]{2})\s*$/) ||
    t.match(/\/\s*([A-Za-z]{2})\b/);
  if (!m?.[1]) return null;
  const uf = m[1].toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) return null;
  return uf;
}

/** Opções exibidas: TJ do UF (se conhecido) + todos superiores + demais TJs principais. */
export function opcoesTribunaisParaUi(ufPreferida?: string | null): OpcaoTribunal[] {
  const tj = tjPorUf(ufPreferida);
  const superiores = TRIBUNAIS_SUPERIORES;
  const outros = TRIBUNAIS_ESTADUAIS.filter((t) => t.id !== tj?.id);
  return [...(tj ? [tj] : []), ...superiores, ...outros];
}

/**
 * Defaults: nenhum pré-marcado.
 * O usuário escolhe onde gastar a cota (mín. 1 na hora de buscar).
 */
export function tribunaisPadrao(_ufPreferida?: string | null): string[] {
  return [];
}

/** Valida e normaliza lista enviada pelo cliente (máx. 3, ids conhecidos). */
export function normalizarTribunaisEscolhidos(
  bruto: unknown
): { ok: true; ids: string[] } | { ok: false; erro: string } {
  if (!Array.isArray(bruto) || bruto.length === 0) {
    return {
      ok: false,
      erro: "Selecione ao menos um tribunal (ex.: TJ do foro + STJ).",
    };
  }
  const ids: string[] = [];
  const vistos = new Set<string>();
  for (const item of bruto) {
    const id = String(item ?? "")
      .trim()
      .toLowerCase();
    if (!id || vistos.has(id)) continue;
    if (!POR_ID.has(id)) {
      return { ok: false, erro: `Tribunal não suportado: ${id}` };
    }
    vistos.add(id);
    ids.push(id);
  }
  if (!ids.length) {
    return { ok: false, erro: "Selecione ao menos um tribunal." };
  }
  if (ids.length > MAX_TRIBUNAIS_POR_BUSCA) {
    return {
      ok: false,
      erro: `Selecione no máximo ${MAX_TRIBUNAIS_POR_BUSCA} tribunais por busca (cada um consome cota da API).`,
    };
  }
  return { ok: true, ids };
}

function blobTribunal(partes: (string | undefined)[]): string {
  return partes
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Lê STF/STJ/TJXX no título, categoria ou início da ementa (seed: "TJSP — 0001234-…"). */
export function inferirSlugTribunalDoTexto(
  titulo: string,
  categoria?: string,
  texto?: string
): string | null {
  const t = blobTribunal([titulo, categoria, (texto ?? "").slice(0, 500)]);
  if (!t.trim()) return null;
  if (/\bstf\b|supremo tribunal federal/.test(t)) return "stf";
  if (/\bstj\b|superior tribunal de justica/.test(t)) return "stj";
  for (const op of TRIBUNAIS_ESTADUAIS) {
    const uf = (op.uf ?? "").toLowerCase();
    const re = new RegExp(
      `\\b${op.id}\\b|\\btj[\\s\\-/]?${uf}\\b`,
      "i"
    );
    if (re.test(t)) return op.id;
  }
  return null;
}

/**
 * Preferência (não trava): TJ do foro e cortes federais sobem;
 * outro TJ estadual desce. Sem metadado de tribunal = 0 (fica no meio).
 * Súmulas/leis federais sempre sobem um pouco.
 */
export function bonusAfinidadeForo(opcoes: {
  titulo: string;
  categoria?: string;
  texto?: string;
  ufForo?: string | null;
}): number {
  const uf = (opcoes.ufForo ?? "").trim().toUpperCase();
  if (!uf) return 0;
  const cat = blobTribunal([opcoes.categoria]);
  if (cat.includes("sumula") || (cat.includes("lei") && !cat.includes("juris"))) {
    return 4;
  }
  const slug = inferirSlugTribunalDoTexto(
    opcoes.titulo,
    opcoes.categoria,
    opcoes.texto
  );
  if (!slug) return 0;
  if (slug === "stf" || slug === "stj") return 3;
  const tjLocal = tjPorUf(uf);
  if (tjLocal && slug === tjLocal.id) return 10;
  if (TRIBUNAIS_ESTADUAIS.some((x) => x.id === slug)) return -5;
  return 0;
}

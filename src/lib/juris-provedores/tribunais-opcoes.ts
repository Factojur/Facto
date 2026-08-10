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

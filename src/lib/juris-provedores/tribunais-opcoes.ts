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

/** Principais TJs — 26 estados + DF. */
export const TRIBUNAIS_ESTADUAIS: OpcaoTribunal[] = [
  { id: "tjac", rotulo: "TJAC", grupo: "estadual", uf: "AC" },
  { id: "tjal", rotulo: "TJAL", grupo: "estadual", uf: "AL" },
  { id: "tjap", rotulo: "TJAP", grupo: "estadual", uf: "AP" },
  { id: "tjam", rotulo: "TJAM", grupo: "estadual", uf: "AM" },
  { id: "tjba", rotulo: "TJBA", grupo: "estadual", uf: "BA" },
  { id: "tjce", rotulo: "TJCE", grupo: "estadual", uf: "CE" },
  { id: "tjdft", rotulo: "TJDFT", grupo: "estadual", uf: "DF" },
  { id: "tjes", rotulo: "TJES", grupo: "estadual", uf: "ES" },
  { id: "tjgo", rotulo: "TJGO", grupo: "estadual", uf: "GO" },
  { id: "tjma", rotulo: "TJMA", grupo: "estadual", uf: "MA" },
  { id: "tjmt", rotulo: "TJMT", grupo: "estadual", uf: "MT" },
  { id: "tjms", rotulo: "TJMS", grupo: "estadual", uf: "MS" },
  { id: "tjmg", rotulo: "TJMG", grupo: "estadual", uf: "MG" },
  { id: "tjpa", rotulo: "TJPA", grupo: "estadual", uf: "PA" },
  { id: "tjpb", rotulo: "TJPB", grupo: "estadual", uf: "PB" },
  { id: "tjpr", rotulo: "TJPR", grupo: "estadual", uf: "PR" },
  { id: "tjpe", rotulo: "TJPE", grupo: "estadual", uf: "PE" },
  { id: "tjpi", rotulo: "TJPI", grupo: "estadual", uf: "PI" },
  { id: "tjrj", rotulo: "TJRJ", grupo: "estadual", uf: "RJ" },
  { id: "tjrn", rotulo: "TJRN", grupo: "estadual", uf: "RN" },
  { id: "tjrs", rotulo: "TJRS", grupo: "estadual", uf: "RS" },
  { id: "tjro", rotulo: "TJRO", grupo: "estadual", uf: "RO" },
  { id: "tjrr", rotulo: "TJRR", grupo: "estadual", uf: "RR" },
  { id: "tjsc", rotulo: "TJSC", grupo: "estadual", uf: "SC" },
  { id: "tjsp", rotulo: "TJSP", grupo: "estadual", uf: "SP" },
  { id: "tjse", rotulo: "TJSE", grupo: "estadual", uf: "SE" },
  { id: "tjto", rotulo: "TJTO", grupo: "estadual", uf: "TO" },
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
      erro: `Selecione no máximo ${MAX_TRIBUNAIS_POR_BUSCA} tribunais por busca.`,
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
 * Preferência pelos tribunais que o usuário marcou.
 * Slug na seleção sobe; outro TJ desce. Sem metadado = 0.
 * Súmula/lei: sobe se STF/STJ estiverem marcados.
 */
export function bonusAfinidadeTribunais(opcoes: {
  titulo: string;
  categoria?: string;
  texto?: string;
  tribunais: string[];
}): number {
  const ids = opcoes.tribunais.map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!ids.length) return 0;
  const cat = blobTribunal([opcoes.categoria]);
  const slug = inferirSlugTribunalDoTexto(
    opcoes.titulo,
    opcoes.categoria,
    opcoes.texto
  );
  const querFederal = ids.includes("stf") || ids.includes("stj");
  if (cat.includes("sumula")) {
    if (slug && ids.includes(slug)) return 8;
    return querFederal ? 5 : -4;
  }
  if (cat.includes("lei") && !cat.includes("juris")) {
    return querFederal ? 3 : 1;
  }
  if (!slug) return 0;
  if (ids.includes(slug)) return 12;
  return -8;
}

/**
 * Matriz espécie × polo por área do dashboard.
 * Uma única fonte de verdade: formulário (filtro), inferência e prompt partidário.
 */

export type PoloAdvocacia = "ativo" | "passivo";

export type MatrizPoloArea = {
  ativo: readonly string[];
  passivo: readonly string[];
  /** Recursos/incidentes que cabem nos dois polos. */
  ambos: readonly string[];
};

function m(
  ativo: string[],
  passivo: string[],
  ambos: string[] = []
): MatrizPoloArea {
  return { ativo, passivo, ambos };
}

/** Áreas com seletor "Estou atuando pelo…" no formulário. */
export const AREAS_COM_POLO_ADVOCACIA = [
  "jec",
  "constitucional",
  "administrativo",
  "tributario",
  "trabalhista",
] as const;

export type AreaComPoloAdvocacia = (typeof AREAS_COM_POLO_ADVOCACIA)[number];

export const MATRIZ_POLO_POR_AREA: Record<AreaComPoloAdvocacia, MatrizPoloArea> =
  {
    jec: m(
      [
        "peticao-inicial",
        "replica",
        "recurso-inominado",
        "recurso",
        "agravo-instrumento",
        "execucao",
      ],
      ["contestacao", "contrarrazoes-inominado", "contrarrazoes", "agravo-instrumento"],
      ["embargos", "agravo-instrumento"]
    ),
    constitucional: m(
      [
        "mandado-seguranca",
        "habeas-corpus",
        "habeas-data",
        "mandado-injuncao",
        "acao-popular",
        "reclamacao-constitucional",
        "recurso-extraordinario",
        "agravo-recurso-extraordinario",
        "recurso-ordinario-constitucional",
        "adpf",
        "adi",
        "adc",
        "ado",
      ],
      [
        "informacoes-ms",
        "contestacao-ms",
        "contestacao-habeas-data",
        "informacoes-mandado-injuncao",
        "contestacao-reclamacao",
        "contrarrazoes-recurso-extraordinario",
        "contrarrazoes-recurso-ordinario",
        "contestacao-adi",
        "contestacao-adpf",
        "contestacao-adc",
        "contestacao-ado",
        "contestacao-acao-popular",
      ],
      [
        "apelacao",
        "agravo-instrumento",
        "agravo-regimental",
        "embargos-declaracao",
        "memorial",
      ]
    ),
    administrativo: m(
      ["mandado-seguranca", "peticao-inicial", "replica", "cumprimento-sentenca"],
      ["contestacao"],
      ["apelacao", "agravo-instrumento", "embargos-declaracao"]
    ),
    tributario: m(
      ["peticao-inicial", "mandado-seguranca"],
      ["embargos-execucao-fiscal", "excecao-pre-executividade", "contestacao"],
      ["apelacao", "embargos-declaracao"]
    ),
    trabalhista: m(
      [
        "reclamacao",
        "manifestacao",
        "recurso-ordinario",
        "agravo-instrumento",
        "execucao-titulo",
      ],
      ["defesa"],
      ["embargos-declaracao", "agravo-peticao"]
    ),
  };

const SETS_POR_AREA: Record<
  AreaComPoloAdvocacia,
  { ativo: Set<string>; passivo: Set<string>; ambos: Set<string> }
> = Object.fromEntries(
  AREAS_COM_POLO_ADVOCACIA.map((areaId) => {
    const mat = MATRIZ_POLO_POR_AREA[areaId];
    return [
      areaId,
      {
        ativo: new Set(mat.ativo),
        passivo: new Set(mat.passivo),
        ambos: new Set(mat.ambos),
      },
    ];
  })
) as Record<
  AreaComPoloAdvocacia,
  { ativo: Set<string>; passivo: Set<string>; ambos: Set<string> }
>;

export function areaUsaPoloAdvocacia(
  areaId: string
): areaId is AreaComPoloAdvocacia {
  return (AREAS_COM_POLO_ADVOCACIA as readonly string[]).includes(areaId);
}

/** Normaliza id de espécie (aliases legados por área). */
export function normalizarEspeciePoloArea(
  areaId: string,
  especie: string
): string {
  const id = especie.trim().toLowerCase().replace(/\s+/g, "-");
  if (areaId === "jec") {
    if (id === "recurso") return "recurso-inominado";
    if (id === "contrarrazoes" || id === "contrarrazões") {
      return "contrarrazoes-inominado";
    }
  }
  return id;
}

export function especieCompativelComPolo(
  areaId: string,
  especie: string,
  polo: PoloAdvocacia
): boolean {
  if (!areaUsaPoloAdvocacia(areaId)) return true;
  const sets = SETS_POR_AREA[areaId];
  const id = normalizarEspeciePoloArea(areaId, especie);
  if (sets.ambos.has(id)) return true;
  if (polo === "ativo") return sets.ativo.has(id);
  return sets.passivo.has(id);
}

export function inferirPoloPorEspecie(
  areaId: string,
  especie: string
): PoloAdvocacia | null {
  if (!areaUsaPoloAdvocacia(areaId)) return null;
  const sets = SETS_POR_AREA[areaId];
  const id = normalizarEspeciePoloArea(areaId, especie);
  if (sets.ambos.has(id)) return null;
  if (sets.ativo.has(id)) return "ativo";
  if (sets.passivo.has(id)) return "passivo";
  return null;
}

export function filtrarEspeciesPorPolo<T extends { id: string }>(
  areaId: string,
  especies: readonly T[],
  polo: PoloAdvocacia
): T[] {
  if (!areaUsaPoloAdvocacia(areaId)) return [...especies];
  return especies.filter((e) => especieCompativelComPolo(areaId, e.id, polo));
}

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
  "civil",
  "consumidor",
  "familia",
  "imobiliario",
  "constitucional",
  "administrativo",
  "tributario",
  "trabalhista",
] as const;

export type AreaComPoloAdvocacia = (typeof AREAS_COM_POLO_ADVOCACIA)[number];

export const MATRIZ_POLO_POR_AREA: Record<AreaComPoloAdvocacia, MatrizPoloArea> =
  {
    jec: m(
      ["peticao-inicial", "replica"],
      ["contestacao"],
      [
        "recurso-inominado",
        "recurso",
        "contrarrazoes-inominado",
        "contrarrazoes",
        "agravo-instrumento",
        "embargos",
        "execucao",
      ]
    ),
    civil: m(
      ["peticao-inicial", "replica"],
      ["contestacao"],
      [
        "embargos-declaracao",
        "apelacao",
        "agravo-instrumento",
        "cumprimento-sentenca",
        "execucao-titulo",
      ]
    ),
    consumidor: m(
      ["peticao-inicial", "replica"],
      ["contestacao"],
      [
        "embargos-declaracao",
        "apelacao",
        "agravo-instrumento",
        "cumprimento-sentenca",
        "execucao-titulo",
      ]
    ),
    familia: m(
      ["peticao-inicial", "replica", "inventario"],
      ["contestacao"],
      [
        "embargos-declaracao",
        "apelacao",
        "agravo-instrumento",
        "cumprimento-alimentos",
      ]
    ),
    imobiliario: m(
      [
        "peticao-inicial",
        "despejo",
        "usucapiao",
        "consignacao",
        "condominio",
        "replica",
      ],
      ["contestacao"],
      ["embargos-declaracao", "apelacao", "agravo-instrumento", "cumprimento-sentenca"]
    ),
    constitucional: m(
      [
        "mandado-seguranca",
        "habeas-corpus",
        "habeas-data",
        "mandado-injuncao",
        "acao-popular",
        "reclamacao-constitucional",
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
        "contestacao-adi",
        "contestacao-adpf",
        "contestacao-adc",
        "contestacao-ado",
        "contestacao-acao-popular",
      ],
      [
        "recurso-extraordinario",
        "agravo-recurso-extraordinario",
        "recurso-ordinario-constitucional",
        "contrarrazoes-recurso-extraordinario",
        "contrarrazoes-recurso-ordinario",
        "apelacao",
        "agravo-instrumento",
        "agravo-regimental",
        "embargos-declaracao",
        "memorial",
      ]
    ),
    administrativo: m(
      ["mandado-seguranca", "peticao-inicial", "replica"],
      ["contestacao"],
      [
        "apelacao",
        "agravo-instrumento",
        "embargos-declaracao",
        "cumprimento-sentenca",
      ]
    ),
    tributario: m(
      [
        "peticao-inicial",
        "mandado-seguranca",
        "embargos-execucao-fiscal",
        "excecao-pre-executividade",
      ],
      ["contestacao"],
      ["apelacao", "embargos-declaracao"]
    ),
    trabalhista: m(
      ["reclamacao", "manifestacao"],
      ["defesa"],
      [
        "recurso-ordinario",
        "agravo-instrumento",
        "embargos-declaracao",
        "agravo-peticao",
        "execucao-titulo",
      ]
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
    if (id.includes("reconven") || id === "contraposto" || id === "pedido-contraposto") {
      return "contestacao";
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

export type LadoPoloEspecie = PoloAdvocacia | "ambos";

/** Lado da matriz. `null` = espécie fora da matriz (não deve ocorrer no seletor). */
export function ladoPoloDaEspecie(
  areaId: string,
  especie: string
): LadoPoloEspecie | null {
  if (!areaUsaPoloAdvocacia(areaId)) return null;
  const sets = SETS_POR_AREA[areaId];
  const id = normalizarEspeciePoloArea(areaId, especie);
  if (sets.ambos.has(id)) return "ambos";
  if (sets.ativo.has(id)) return "ativo";
  if (sets.passivo.has(id)) return "passivo";
  return null;
}

export function agruparEspeciesPorPolo<T extends { id: string }>(
  areaId: string,
  especies: readonly T[]
): { ativo: T[]; passivo: T[]; ambos: T[] } {
  const ativo: T[] = [];
  const passivo: T[] = [];
  const ambos: T[] = [];
  for (const e of especies) {
    const lado = ladoPoloDaEspecie(areaId, e.id);
    if (lado === "passivo") passivo.push(e);
    else if (lado === "ambos") ambos.push(e);
    else ativo.push(e);
  }
  return { ativo, passivo, ambos };
}

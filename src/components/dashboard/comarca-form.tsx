"use client";

export type ComarcaValue = {
  /** Texto livre do foro/juizado (endereçamento da peça). */
  foro: string;
  /** Legado — rascunhos antigos / fechamento. */
  cep?: string;
  cidade?: string;
  uf?: string;
  numeroJuizado?: string;
};

export function comarcaVazia(): ComarcaValue {
  return { foro: "" };
}

/** Converte rascunhos antigos (cidade/UF) para o campo único. */
export function normalizarComarcaValue(
  raw: Partial<ComarcaValue> | null | undefined
): ComarcaValue {
  if (!raw) return comarcaVazia();
  const foroDireto = (raw.foro ?? "").trim();
  if (foroDireto) {
    return {
      foro: foroDireto,
      cep: raw.cep,
      cidade: raw.cidade,
      uf: raw.uf,
      numeroJuizado: raw.numeroJuizado,
    };
  }

  const cidade = (raw.cidade ?? "").trim();
  const uf = (raw.uf ?? "").trim().toUpperCase();
  const n = (raw.numeroJuizado ?? "").trim();
  if (!cidade && !uf) return comarcaVazia();

  const juizado = n
    ? `${n}ª Vara do Juizado Especial Cível de ${cidade}${uf ? `/${uf}` : ""}`
    : `Juizado Especial Cível de ${cidade}${uf ? `/${uf}` : ""}`;

  return {
    foro: juizado,
    cep: raw.cep,
    cidade,
    uf,
    numeroJuizado: raw.numeroJuizado,
  };
}

export function ComarcaSection({
  value,
  onChange,
}: {
  value: ComarcaValue;
  onChange: (v: ComarcaValue) => void;
}) {
  return (
    <section
      id="secao-comarca"
      className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Comarca / Foro
          </h2>
          <p className="text-sm text-slate-500">
            Endereçamento da peça — use a competência correta.
          </p>
        </div>
        <a
          href="https://www.tjsp.jus.br/app/CompetenciaTerritorial"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Consultar foro no TJSP ↗
        </a>
      </div>

      <div className="mt-4">
        <label
          htmlFor="comarca-foro"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Foro / Juizado
        </label>
        <input
          id="comarca-foro"
          value={value.foro}
          onChange={(e) => onChange({ ...value, foro: e.target.value })}
          placeholder="Ex.: 1ª Vara do Juizado Especial Cível de Campinas/SP"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
        />
      </div>
    </section>
  );
}

"use client";

export type ComarcaValue = {
  cep: string;
  cidade: string;
  uf: string;
  numeroJuizado: string;
};

export function comarcaVazia(): ComarcaValue {
  return { cep: "", cidade: "", uf: "", numeroJuizado: "" };
}

export function ComarcaSection({
  value,
  onChange,
}: {
  value: ComarcaValue;
  onChange: (v: ComarcaValue) => void;
}) {
  void value;
  void onChange;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Comarca / Foro
          </h2>
          <p className="text-sm text-slate-500">
            Confirme o fórum e o Juizado Especial competentes antes de
            protocolar a peça.
          </p>
        </div>
        <a
          href="https://www.tjsp.jus.br/app/CompetenciaTerritorial"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Consultar foro competente no TJSP ↗
        </a>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        A consulta do TJSP indica o fórum e o Juizado Especial competentes
        apenas para a Capital de São Paulo, a partir do CEP ou logradouro.
        Para outras comarcas, confirme o foro competente com a corregedoria
        ou tribunal local.
      </p>
    </section>
  );
}

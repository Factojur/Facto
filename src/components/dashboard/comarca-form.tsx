"use client";

import {
  areaMostraLinkTjsp,
  foroLegadoDaArea,
  placeholderForoDaArea,
} from "@/lib/minuta-modulo";

export type ComarcaValue = {
  /** Texto livre do foro (endereçamento da peça). */
  foro: string;
  /** Legado — rascunhos antigos / fechamento. */
  cep?: string;
  cidade?: string;
  uf?: string;
  numeroJuizado?: string;
  /** Peças com processo em curso (contestação etc.). */
  numeroProcesso?: string;
};

export function comarcaVazia(): ComarcaValue {
  return { foro: "", numeroProcesso: "" };
}

/** Converte rascunhos antigos (cidade/UF) para o campo único. */
export function normalizarComarcaValue(
  raw: Partial<ComarcaValue> | null | undefined,
  areaId: string = "jec"
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
      numeroProcesso: raw.numeroProcesso ?? "",
    };
  }

  const cidade = (raw.cidade ?? "").trim();
  const uf = (raw.uf ?? "").trim().toUpperCase();
  const n = (raw.numeroJuizado ?? "").trim();
  if (!cidade && !uf) return comarcaVazia();

  return {
    foro: foroLegadoDaArea(areaId, cidade, uf, n),
    cep: raw.cep,
    cidade,
    uf,
    numeroJuizado: raw.numeroJuizado,
    numeroProcesso: raw.numeroProcesso ?? "",
  };
}

export function ComarcaSection({
  value,
  onChange,
  areaId = "jec",
}: {
  value: ComarcaValue;
  onChange: (v: ComarcaValue) => void;
  areaId?: string;
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
            Informe município/UF no foro (ex.: … de Campinas/SP). Em peça
            inaugural a vara fica em branco (___).
          </p>
        </div>
        {areaMostraLinkTjsp(areaId) && (
          <a
            href="https://www.tjsp.jus.br/app/CompetenciaTerritorial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Consultar foro no TJSP ↗
          </a>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="comarca-foro"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Foro / Comarca
          </label>
          <input
            id="comarca-foro"
            value={value.foro}
            onChange={(e) => onChange({ ...value, foro: e.target.value })}
            placeholder={placeholderForoDaArea(areaId)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
        <div>
          <label
            htmlFor="comarca-processo"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Número do processo{" "}
            <span className="font-normal text-slate-500">
              (só se já houver — defesa, recurso etc.)
            </span>
          </label>
          <input
            id="comarca-processo"
            value={value.numeroProcesso ?? ""}
            onChange={(e) =>
              onChange({ ...value, numeroProcesso: e.target.value })
            }
            placeholder="Ex.: 0001234-56.2024.8.26.0224"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </div>
    </section>
  );
}

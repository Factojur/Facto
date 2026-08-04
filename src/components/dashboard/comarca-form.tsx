"use client";

import { useState } from "react";
import {
  buscarComarcaPorCep,
  cepValido,
  normalizarCep,
  ufValida,
} from "@/lib/endereco-comarca";
import { formatarCep } from "@/lib/mascaras-endereco";

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
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function handleCep(valor: string) {
    const cep = formatarCep(valor);
    onChange({ ...value, cep });
    setAviso(null);

    if (!cepValido(cep)) return;

    setBuscando(true);
    try {
      const achou = await buscarComarcaPorCep(normalizarCep(cep));
      if (achou) {
        onChange({
          ...value,
          cep,
          cidade: achou.cidade,
          uf: achou.uf,
        });
      } else {
        setAviso("CEP não encontrado — preencha cidade e UF manualmente.");
      }
    } finally {
      setBuscando(false);
    }
  }

  return (
    <section
      id="secao-comarca"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Comarca / Foro
          </h2>
          <p className="text-sm text-slate-500">
            Esses dados montam o endereçamento da peça (Juizado e comarca).
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

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="comarca-cep"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            CEP do foro
          </label>
          <input
            id="comarca-cep"
            value={value.cep}
            onChange={(e) => void handleCep(e.target.value)}
            placeholder="00000-000"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
          {buscando && (
            <p className="mt-1 text-xs text-slate-500">Buscando CEP…</p>
          )}
        </div>
        <div>
          <label
            htmlFor="comarca-cidade"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Cidade
          </label>
          <input
            id="comarca-cidade"
            value={value.cidade}
            onChange={(e) => onChange({ ...value, cidade: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
        <div>
          <label
            htmlFor="comarca-uf"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            UF
          </label>
          <input
            id="comarca-uf"
            value={value.uf}
            maxLength={2}
            onChange={(e) =>
              onChange({ ...value, uf: e.target.value.toUpperCase() })
            }
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-stone-200 ${
              value.uf && !ufValida(value.uf)
                ? "border-amber-400 focus:border-amber-500"
                : "border-slate-200 focus:border-stone-500"
            }`}
          />
        </div>
        <div>
          <label
            htmlFor="comarca-juizado"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nº do Juizado (opcional)
          </label>
          <input
            id="comarca-juizado"
            value={value.numeroJuizado}
            onChange={(e) =>
              onChange({ ...value, numeroJuizado: e.target.value })
            }
            placeholder="Ex.: 1"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
          />
        </div>
      </div>
      {aviso && <p className="mt-2 text-xs text-amber-700">{aviso}</p>}
      <p className="mt-3 text-xs text-slate-400">
        A consulta do TJSP auxilia a Capital de São Paulo. Em outras comarcas,
        confirme o foro na corregedoria ou tribunal local.
      </p>
    </section>
  );
}

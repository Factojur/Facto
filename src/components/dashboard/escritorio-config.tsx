"use client";

import { useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  logoParaBase64,
  salvarEscritorioConfig,
} from "@/lib/escritorio-storage";

type Props = {
  value: EscritorioConfig;
  onChange: (config: EscritorioConfig) => void;
};

export function EscritorioConfigPanel({ value, onChange }: Props) {
  const [logoErro, setLogoErro] = useState<string | null>(null);

  function atualizar(campo: Partial<EscritorioConfig>) {
    const novo = { ...value, ...campo };
    onChange(novo);
    salvarEscritorioConfig(novo);
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    setLogoErro(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const logoBase64 = await logoParaBase64(file);
      atualizar({ logoBase64, usarTimbre: true });
    } catch (err) {
      setLogoErro(err instanceof Error ? err.message : "Erro no upload.");
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Timbre do Escritório
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Opcional. Inclua logo e dados do escritório para gerar a peça já
            timbrada, conforme padrão forense (Times New Roman 12, margens ABNT,
            texto justificado e recuo de parágrafo).
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={value.usarTimbre}
            onChange={(e) => atualizar({ usarTimbre: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-stone-700"
          />
          Usar timbre
        </label>
      </div>

      {value.usarTimbre && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Logo do escritório
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogo}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-50"
            />
            {logoErro && (
              <p className="mt-1 text-xs text-red-600">{logoErro}</p>
            )}
            {value.logoBase64 && (
              <img
                src={value.logoBase64}
                alt="Preview logo"
                className="mt-3 max-h-16 object-contain"
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nome do escritório
            </label>
            <input
              type="text"
              value={value.nomeEscritorio}
              onChange={(e) => atualizar({ nomeEscritorio: e.target.value })}
              placeholder="Silva & Advogados Associados"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Endereço
            </label>
            <input
              type="text"
              value={value.endereco}
              onChange={(e) => atualizar({ endereco: e.target.value })}
              placeholder="Av. Paulista, 1000 — Bela Vista"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Cidade / UF
            </label>
            <input
              type="text"
              value={value.cidadeUf}
              onChange={(e) => atualizar({ cidadeUf: e.target.value })}
              placeholder="São Paulo — SP"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Telefone
            </label>
            <input
              type="text"
              value={value.telefone}
              onChange={(e) => atualizar({ telefone: e.target.value })}
              placeholder="(11) 3000-0000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              E-mail do escritório
            </label>
            <input
              type="email"
              value={value.emailEscritorio}
              onChange={(e) => atualizar({ emailEscritorio: e.target.value })}
              placeholder="contato@escritorio.com.br"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Site (opcional)
            </label>
            <input
              type="url"
              value={value.site ?? ""}
              onChange={(e) => atualizar({ site: e.target.value })}
              placeholder="www.escritorio.com.br"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
    </section>
  );
}

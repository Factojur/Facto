"use client";

import { useState } from "react";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import {
  imagemParaBase64,
  salvarEscritorioConfig,
} from "@/lib/escritorio-storage";

type Props = {
  value: EscritorioConfig;
  onChange: (config: EscritorioConfig) => void;
};

type CampoImagem = "cabecalhoBase64" | "rodapeBase64" | "marcaDaguaBase64";

const CAMPOS_IMAGEM: {
  campo: CampoImagem;
  titulo: string;
  descricao: string;
}[] = [
  {
    campo: "cabecalhoBase64",
    titulo: "Cabeçalho",
    descricao: "Aparece no topo da primeira página, acima do texto.",
  },
  {
    campo: "rodapeBase64",
    titulo: "Rodapé",
    descricao: "Aparece na parte inferior de cada página.",
  },
  {
    campo: "marcaDaguaBase64",
    titulo: "Marca d'água",
    descricao: "Aparece em transparência, atrás do texto da peça.",
  },
];

function UploadImagem({
  campo,
  titulo,
  descricao,
  valorAtual,
  onDefinir,
  onRemover,
}: {
  campo: CampoImagem;
  titulo: string;
  descricao: string;
  valorAtual?: string;
  onDefinir: (base64: string) => void;
  onRemover: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setErro(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await imagemParaBase64(file);
      onDefinir(base64);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700">{titulo}</p>
      <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>

      {valorAtual ? (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={valorAtual}
            alt={`Preview ${titulo.toLowerCase()}`}
            className="max-h-16 object-contain"
          />
          <button
            type="button"
            onClick={onRemover}
            className="mt-2 text-xs font-medium text-red-600 hover:underline"
          >
            Remover
          </button>
        </div>
      ) : (
        <input
          id={campo}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleUpload}
          className="mt-3 block w-full text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-50"
        />
      )}
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}

export function EscritorioConfigPanel({ value, onChange }: Props) {
  function atualizar(campo: Partial<EscritorioConfig>) {
    const novo = { ...value, ...campo };
    onChange(novo);
    salvarEscritorioConfig(novo);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Timbre do Escritório
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Opcional. Cabeçalho, rodapé e/ou marca d&apos;água para a peça
            timbrada.
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
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {CAMPOS_IMAGEM.map(({ campo, titulo, descricao }) => (
              <UploadImagem
                key={campo}
                campo={campo}
                titulo={titulo}
                descricao={descricao}
                valorAtual={value[campo]}
                onDefinir={(base64) => atualizar({ [campo]: base64 })}
                onRemover={() => atualizar({ [campo]: "" })}
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      )}
    </section>
  );
}

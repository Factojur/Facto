"use client";

import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";
import type { JurisCasoSalvo } from "@/components/dashboard/juris-caso-form";
import {
  paginaDoTrechoNoTexto,
  rotuloCitacaoAnexo,
} from "@/lib/pagina-anexo-pdf";

type FonteBase = { titulo: string; categoria: string };

export function CitacoesRastreaveisPanel({
  fontes = [],
  citacoes = [],
  jurisCaso = [],
  marcadoresNaoEncontrado = 0,
  leiMunicipal,
  jurisDoCasoUtilizada,
}: {
  fontes?: FonteBase[];
  citacoes?: CitacaoVerificada[];
  jurisCaso?: JurisCasoSalvo[];
  marcadoresNaoEncontrado?: number;
  leiMunicipal?: { nome: string } | null;
  jurisDoCasoUtilizada?: { titulo: string }[];
}) {
  const jurisSem = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  );
  const jurisOk = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && c.verificada
  );
  const leisOk = citacoes.filter((c) => c.tipo === "lei" && c.verificada);

  const vazio =
    fontes.length === 0 &&
    !leiMunicipal &&
    !(jurisDoCasoUtilizada?.length ?? 0) &&
    citacoes.length === 0 &&
    marcadoresNaoEncontrado === 0;

  if (vazio) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800">Citações e lastro</h3>
      <p className="mt-1 text-xs text-slate-500">
        Trechos rastreáveis ao acervo FACTO, anexos do caso ou lei municipal.
      </p>

      {leiMunicipal && (
        <div className="mt-3">
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-900">
            Lei municipal · {leiMunicipal.nome}
          </span>
        </div>
      )}

      {jurisDoCasoUtilizada && jurisDoCasoUtilizada.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {jurisDoCasoUtilizada.map((j) => (
            <span
              key={j.titulo}
              className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs text-violet-900"
              title="Anexo do caso"
            >
              Anexo · {j.titulo}
            </span>
          ))}
        </div>
      )}

      {fontes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Base FACTO ({fontes.length})
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {fontes.map((item, i) => (
              <li
                key={`${item.titulo}-${i}`}
                className="inline-flex max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-900"
                title={`${item.categoria} — ${item.titulo}`}
              >
                <span className="font-medium">{item.categoria}</span>
                <span className="mx-1 opacity-50">·</span>
                <span className="truncate">{item.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fontes.length === 0 && (
        <p className="mt-3 text-sm text-amber-800">
          Nenhum trecho do acervo FACTO foi recuperado para este tema. Evite citar
          súmulas ou acórdãos sem lastro.
        </p>
      )}

      {jurisOk.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Jurisprudência verificada ({jurisOk.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {jurisOk.map((c) => {
              const anexo = jurisCaso.find((j) =>
                j.texto.toLowerCase().includes(c.trecho.toLowerCase().slice(0, 40))
              );
              const pagina = anexo
                ? paginaDoTrechoNoTexto(anexo.texto, c.trecho)
                : null;
              return (
                <li
                  key={c.trecho}
                  className="rounded-md border border-emerald-100 bg-emerald-50/50 px-2.5 py-1.5 text-sm text-emerald-950"
                >
                  {c.trecho}
                  {anexo ? (
                    <span className="ml-1 text-xs text-slate-500">
                      (
                      {rotuloCitacaoAnexo({
                        titulo: anexo.titulo || "juris do caso",
                        pagina,
                      })}
                      )
                    </span>
                  ) : (
                    <span className="ml-1 text-xs text-emerald-700">
                      (base FACTO)
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {leisOk.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {leisOk.slice(0, 8).map((c) => (
            <span
              key={c.trecho}
              className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-800"
            >
              {c.trecho}
            </span>
          ))}
        </div>
      )}

      {jurisSem.length > 0 && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase text-red-800">
            Sem lastro ({jurisSem.length})
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-red-900">
            {jurisSem.map((c) => (
              <li key={c.trecho}>{c.trecho}</li>
            ))}
          </ul>
        </div>
      )}

      {marcadoresNaoEncontrado > 0 && (
        <p className="mt-3 text-sm text-amber-800">
          A redação sinalizou {marcadoresNaoEncontrado}{" "}
          {marcadoresNaoEncontrado === 1 ? "trecho" : "trechos"} sem correspondência
          verificada — confira antes de protocolar.
        </p>
      )}
    </section>
  );
}

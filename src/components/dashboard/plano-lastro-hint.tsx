"use client";

import { useMemo } from "react";
import {
  complementarLastroTopico,
  montarLastroTopicoExibicao,
  rotuloTipoLastro,
} from "@/lib/plano-lastro-hint";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";

/** Pista visual discreta (desktop): hover ou foco mostra lastro do tópico. */
export function PlanoLastroHint({
  topico,
  todosTopicos,
  estrategiaJuridica,
  cobertura,
  jurisTitulos,
  onAbrirFls,
}: {
  topico: TopicoPlanejado;
  todosTopicos: TopicoPlanejado[];
  estrategiaJuridica: string;
  cobertura: ItemCoberturaTese[];
  jurisTitulos?: string[];
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
}) {
  const enriquecido = useMemo(
    () =>
      complementarLastroTopico({
        topico,
        estrategiaJuridica,
        todosTopicos,
        cobertura,
        jurisTitulos,
      }),
    [topico, estrategiaJuridica, todosTopicos, cobertura, jurisTitulos]
  );

  const ex = useMemo(
    () => montarLastroTopicoExibicao(enriquecido, cobertura),
    [enriquecido, cobertura]
  );

  return (
    <span className="group/lastro relative ml-1.5 inline-flex align-middle">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-facto-gold/50 bg-amber-50/90 text-[9px] font-bold text-amber-900 shadow-sm ring-1 ring-amber-200/60 transition hover:border-facto-gold hover:bg-amber-100"
        aria-label="Ver lastro deste tópico"
        title="Lastro do tópico"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-xs leading-relaxed text-stone-700 shadow-lg group-hover/lastro:block group-focus-within/lastro:block"
      >
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-facto-gold">
          Lastro
        </span>

        {ex.encaixe && (
          <p className="mb-1.5">
            <span className="font-semibold text-stone-800">Encaixe: </span>
            <TextoJuridicoInline
              texto={ex.encaixe}
              onAbrirFls={onAbrirFls}
              className="inline"
            />
          </p>
        )}

        {ex.fontes.length > 0 && (
          <ul className="mb-1.5 space-y-0.5">
            {ex.fontes.map((f) => (
              <li key={`${f.tipo}-${f.ref}`}>
                <span className="font-semibold text-stone-800">
                  {rotuloTipoLastro(f.tipo)}:{" "}
                </span>
                <TextoJuridicoInline
                  texto={f.ref}
                  onAbrirFls={onAbrirFls}
                  className="inline"
                />
              </li>
            ))}
          </ul>
        )}

        {ex.tesesOk.length > 0 && (
          <p className="mb-1 text-emerald-800">
            <span className="font-semibold">Teses no plano: </span>
            {ex.tesesOk.join("; ")}
          </p>
        )}
        {ex.tesesPend.length > 0 && (
          <p className="mb-1 text-amber-800">
            <span className="font-semibold">Pendente: </span>
            {ex.tesesPend.join("; ")}
          </p>
        )}

        {ex.aviso && <p className="text-stone-500">{ex.aviso}</p>}
      </span>
    </span>
  );
}

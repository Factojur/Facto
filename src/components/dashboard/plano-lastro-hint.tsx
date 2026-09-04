"use client";

import { useCallback, useMemo, useState } from "react";
import {
  complementarLastroTopico,
  montarLastroTopicoExibicao,
  rotuloTipoLastro,
} from "@/lib/plano-lastro-hint";
import type { ItemCoberturaTese } from "@/lib/ia/cobertura-teses-peca";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import { TextoJuridicoInline } from "@/components/dashboard/texto-juridico-inline";
import { PainelLateralPortal } from "@/components/dashboard/painel-lateral-portal";

function PlanoLastroCorpo({
  ex,
  onAbrirFls,
  compacto,
}: {
  ex: ReturnType<typeof montarLastroTopicoExibicao>;
  onAbrirFls?: (pagina: number | null, trecho: string) => void;
  compacto?: boolean;
}) {
  const tituloCls = compacto
    ? "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-facto-gold"
    : "text-xs font-semibold uppercase tracking-wide text-facto-gold";

  return (
    <>
      {ex.encaixe && (
        <section className={compacto ? "mb-1.5" : "mb-4"}>
          <p className={tituloCls}>Encaixe</p>
          <p className={compacto ? "" : "text-sm leading-relaxed text-stone-700"}>
            <TextoJuridicoInline
              texto={ex.encaixe}
              onAbrirFls={onAbrirFls}
              className="inline"
            />
          </p>
        </section>
      )}

      {ex.fontes.length > 0 && (
        <section className={compacto ? "mb-1.5" : "mb-4"}>
          <p className={tituloCls}>Lastro</p>
          <ul className={compacto ? "space-y-0.5" : "space-y-2"}>
            {ex.fontes.map((f) => (
              <li
                key={`${f.tipo}-${f.ref}`}
                className={
                  compacto
                    ? ""
                    : "rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2 text-sm text-stone-700"
                }
              >
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
        </section>
      )}

      {ex.tesesOk.length > 0 && (
        <p className={compacto ? "mb-1 text-emerald-800" : "mb-2 text-sm text-emerald-800"}>
          <span className="font-semibold">Teses no plano: </span>
          {ex.tesesOk.join("; ")}
        </p>
      )}
      {ex.tesesPend.length > 0 && (
        <p className={compacto ? "mb-1 text-amber-800" : "mb-2 text-sm text-amber-800"}>
          <span className="font-semibold">Pendente: </span>
          {ex.tesesPend.join("; ")}
        </p>
      )}

      {ex.aviso && (
        <p className={compacto ? "text-stone-500" : "text-sm text-stone-500"}>
          {ex.aviso}
        </p>
      )}
    </>
  );
}

/** Ícone i — hover rápido (desktop) + clique abre inspector lateral (camada C). */
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
  const [inspectorAberto, setInspectorAberto] = useState(false);

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

  const fecharInspector = useCallback(() => setInspectorAberto(false), []);

  return (
    <>
      <span className="group/lastro relative ml-1.5 inline-flex align-middle">
        <button
          type="button"
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold shadow-sm ring-1 transition ${
            inspectorAberto
              ? "border-facto-gold bg-amber-100 text-amber-950 ring-amber-300"
              : "border-facto-gold/50 bg-amber-50/90 text-amber-900 ring-amber-200/60 hover:border-facto-gold hover:bg-amber-100"
          }`}
          aria-label={`Ver lastro FACTO do tópico ${topico.romano}. ${topico.titulo}`}
          aria-expanded={inspectorAberto}
          title="Lastro FACTO (base + anexos) — clique para abrir"
          onClick={(e) => {
            e.stopPropagation();
            setInspectorAberto(true);
          }}
        >
          i
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-xs leading-relaxed text-stone-700 shadow-lg group-hover/lastro:block group-focus-within/lastro:block max-sm:hidden"
        >
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-facto-gold">
            Lastro FACTO
          </span>
          <PlanoLastroCorpo ex={ex} onAbrirFls={onAbrirFls} compacto />
          <p className="mt-1.5 border-t border-stone-100 pt-1.5 text-[10px] text-stone-400">
            Clique para o inspector (encaixe + fontes)
          </p>
        </span>
      </span>

      <PainelLateralPortal
        aberto={inspectorAberto}
        onFechar={fecharInspector}
        ariaLabel={`Lastro do tópico ${topico.romano}. ${topico.titulo}`}
        maxWidthClass="max-w-lg"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-200 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-facto-gold">
              Inspector de lastro FACTO
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-stone-900">
              {topico.romano}. {topico.titulo}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg border border-stone-200 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
            onClick={fecharInspector}
          >
            Fechar
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <PlanoLastroCorpo ex={ex} onAbrirFls={onAbrirFls} />
          {!ex.encaixe && ex.fontes.length === 0 && !ex.aviso && (
            <p className="text-sm text-stone-500">
              Sem lastro estruturado neste tópico. Confira anexos (fls.) e juris
              do caso antes de redigir.
            </p>
          )}
        </div>
      </PainelLateralPortal>
    </>
  );
}

"use client";

import { useMemo } from "react";
import {
  MAX_TRIBUNAIS_POR_BUSCA,
  opcoesTribunaisParaUi,
  tribunalPorId,
} from "@/lib/juris-provedores/tribunais-opcoes";

type Props = {
  ufForo?: string | null;
  selecionados: string[];
  onChange: (ids: string[]) => void;
  onDispensar?: () => void;
  compacto?: boolean;
};

export function ChatTribunaisPicker({
  ufForo,
  selecionados,
  onChange,
  onDispensar,
  compacto,
}: Props) {
  const opcoes = useMemo(() => opcoesTribunaisParaUi(ufForo), [ufForo]);

  function toggle(id: string) {
    if (selecionados.includes(id)) {
      onChange(selecionados.filter((x) => x !== id));
      return;
    }
    if (selecionados.length >= MAX_TRIBUNAIS_POR_BUSCA) return;
    onChange([...selecionados, id]);
  }

  const rotulos = selecionados
    .map((id) => tribunalPorId(id)?.rotulo ?? id.toUpperCase())
    .join(", ");

  return (
    <div
      className={`rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/30 ${
        compacto ? "text-xs" : "text-sm"
      }`}
    >
      <p className="mb-2 font-medium text-amber-950 dark:text-amber-100">
        Tribunais para priorizar na juris (até {MAX_TRIBUNAIS_POR_BUSCA})
      </p>
      {rotulos ? (
        <p className="mb-2 text-amber-900/80 dark:text-amber-200/80">
          Selecionados: {rotulos}
        </p>
      ) : (
        <p className="mb-2 text-amber-900/70 dark:text-amber-200/70">
          Marque onde buscar julgados na redação — STF/STJ/TST continuam
          disponíveis.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {opcoes.map((op) => {
          const ativo = selecionados.includes(op.id);
          const bloqueado =
            !ativo && selecionados.length >= MAX_TRIBUNAIS_POR_BUSCA;
          return (
            <button
              key={op.id}
              type="button"
              disabled={bloqueado}
              onClick={() => toggle(op.id)}
              className={`rounded-full border px-2.5 py-0.5 transition ${
                ativo
                  ? "border-amber-600 bg-amber-600 text-white"
                  : bloqueado
                    ? "cursor-not-allowed border-stone-300 opacity-40 dark:border-stone-600"
                    : "border-amber-400/70 bg-white hover:bg-amber-100 dark:border-amber-700 dark:bg-stone-900 dark:hover:bg-amber-950"
              }`}
            >
              {op.rotulo}
            </button>
          );
        })}
      </div>
      {onDispensar ? (
        <button
          type="button"
          className="mt-2 text-xs text-amber-800 underline dark:text-amber-300"
          onClick={onDispensar}
        >
          Seguir sem escolher tribunais
        </button>
      ) : null}
    </div>
  );
}

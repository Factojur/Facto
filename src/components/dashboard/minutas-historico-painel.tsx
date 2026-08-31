"use client";

import { useCallback, useEffect, useState } from "react";
import {
  excluirMinutaNuvem,
  listarMinutasNuvem,
  type MinutaHistoricoNuvem,
} from "@/lib/sync-nuvem-client";
import { rotuloAreaChat } from "@/lib/chat-minuta";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import { PainelLateralPortal } from "@/components/dashboard/painel-lateral-portal";

type Props = {
  aberto: boolean;
  optIn: boolean;
  onFechar: () => void;
};

export function MinutasHistoricoPainel({ aberto, optIn, onFechar }: Props) {
  const [minutas, setMinutas] = useState<MinutaHistoricoNuvem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    if (!optIn) {
      setMinutas([]);
      return;
    }
    setCarregando(true);
    setAviso(null);
    const lista = await listarMinutasNuvem();
    setMinutas(lista);
    if (lista.length === 0 && optIn) {
      setAviso(
        "Nenhuma minuta na nuvem ainda — ou rode migration-sync-nuvem-lgpd.sql no Supabase."
      );
    }
    setCarregando(false);
  }, [optIn]);

  useEffect(() => {
    if (aberto) void recarregar();
  }, [aberto, recarregar]);

  async function excluir(id: string) {
    if (!window.confirm("Excluir esta minuta da nuvem?")) return;
    await excluirMinutaNuvem(id);
    void recarregar();
  }

  return (
    <PainelLateralPortal
      aberto={aberto}
      onFechar={onFechar}
      ariaLabel="Minutas na nuvem"
    >
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">Minutas na nuvem</h2>
        <button
          type="button"
          onClick={onFechar}
          className="rounded-md px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
        >
          Fechar
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!optIn ? (
          <p className="text-sm text-stone-600">
            Ative a sincronização na aba Complementos (opt-in LGPD) para ver minutas
            salvas na conta.
          </p>
        ) : carregando ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : minutas.length === 0 ? (
          <p className="text-sm text-stone-600">{aviso ?? "Nenhuma minuta salva."}</p>
        ) : (
          <ul className="space-y-3">
            {minutas.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-stone-200 bg-stone-50/80 p-3"
              >
                <p className="text-sm font-medium text-stone-900">{m.titulo}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {rotuloAreaChat(m.areaId as AreaIdMinuta)} ·{" "}
                  {new Date(m.atualizadoEm).toLocaleString("pt-BR")}
                </p>
                {m.resumo ? (
                  <p className="mt-2 line-clamp-2 text-xs text-stone-600">{m.resumo}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void excluir(m.id)}
                  className="mt-2 text-xs text-red-700 underline"
                >
                  Excluir da nuvem
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PainelLateralPortal>
  );
}

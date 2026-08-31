"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  SYNC_NUVEM_RESUMO,
  SYNC_NUVEM_VERSAO,
} from "@/lib/sync-nuvem-lgpd";
import {
  registrarOptInSyncNuvem,
  revogarOptInSyncNuvem,
} from "@/lib/sync-nuvem-client";
import { salvarOptInSyncNuvemChat } from "@/lib/chat-minuta-storage";

type Props = {
  optIn: boolean;
  onChange: (v: boolean) => void;
};

export function SyncNuvemOptInControl({ optIn, onChange }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!mostrarModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMostrarModal(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mostrarModal]);

  async function ativar() {
    setErro(null);
    setCarregando(true);
    const res = await registrarOptInSyncNuvem(true);
    setCarregando(false);
    if (!res.ok) {
      setErro(res.error ?? "Não foi possível ativar.");
      return;
    }
    salvarOptInSyncNuvemChat(true);
    onChange(true);
    setMostrarModal(false);
  }

  async function desativar() {
    if (
      !window.confirm(
        "Revogar sync na nuvem? Minutas já salvas permanecem na conta até você excluir; novas peças voltam a ficar só neste navegador."
      )
    ) {
      return;
    }
    setCarregando(true);
    await revogarOptInSyncNuvem();
    salvarOptInSyncNuvemChat(false);
    onChange(false);
    setCarregando(false);
  }

  function handleToggle(checked: boolean) {
    if (checked) {
      setMostrarModal(true);
      return;
    }
    void desativar();
  }

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={optIn}
            disabled={carregando}
            onChange={(e) => handleToggle(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-facto-gold focus:ring-stone-400 disabled:opacity-50"
          />
          <span className="text-xs leading-relaxed text-slate-600">
            Sincronizar conversas, minutas e memória de clientes na minha conta
            FACTO (opt-in LGPD v{SYNC_NUVEM_VERSAO}). Sem marcar, tudo fica só
            neste navegador.{" "}
            <Link href="/privacidade#sync-nuvem" className="underline">
              Privacidade
            </Link>
          </span>
        </label>
        {erro && (
          <p className="mt-2 text-xs text-red-700" role="alert">
            {erro}
          </p>
        )}
      </section>

      {mostrarModal &&
        montado &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-nuvem-titulo"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Fechar"
              onClick={() => setMostrarModal(false)}
            />
            <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-stone-200 bg-white p-5 shadow-xl">
              <h3
                id="sync-nuvem-titulo"
                className="text-base font-semibold text-stone-900"
              >
                Sincronização na nuvem (LGPD)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {SYNC_NUVEM_RESUMO}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-stone-600">
                <li>
                  Dados: relatos, minutas geradas, qualificação de partes e
                  metadados do caso.
                </li>
                <li>
                  Finalidade: retomar trabalho em outro dispositivo logado na
                  mesma conta.
                </li>
                <li>
                  Base legal: consentimento (art. 7º, I, LGPD) — revogável a
                  qualquer momento.
                </li>
                <li>
                  Operador: infraestrutura Supabase (ver Política de
                  Privacidade).
                </li>
              </ul>
              <p className="mt-3 text-xs text-stone-500">
                Ao confirmar, declaro ciência da{" "}
                <Link href="/privacidade#sync-nuvem" className="underline">
                  Política de Privacidade
                </Link>{" "}
                (seção sync na nuvem) e autorizo o tratamento descrito.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={carregando}
                  onClick={() => void ativar()}
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-amber-50 hover:bg-stone-700 disabled:opacity-50"
                >
                  {carregando ? "Registrando…" : "Confirmar e ativar"}
                </button>
                <button
                  type="button"
                  disabled={carregando}
                  onClick={() => setMostrarModal(false)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

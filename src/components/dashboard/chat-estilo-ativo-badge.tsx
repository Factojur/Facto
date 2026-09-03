"use client";

import { useEffect, useState } from "react";

/** Indicador discreto de estilo ativo no header do chat. */
export function ChatEstiloAtivoBadge({ modoWorkspace }: { modoWorkspace?: boolean }) {
  const [rotulo, setRotulo] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch("/api/perfil/estilo");
        if (!res.ok || cancel) return;
        const data = (await res.json()) as {
          rotuloAtivo?: string | null;
        };
        if (!cancel) setRotulo(data.rotuloAtivo ?? null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (!rotulo) return null;

  return (
    <span
      className={
        modoWorkspace
          ? "max-w-[9rem] truncate rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-stone-300"
          : "max-w-[9rem] truncate rounded-full border border-facto-gold/35 bg-stone-800/80 px-2 py-0.5 text-[10px] font-medium text-facto-gold-ia"
      }
      title={`Estilo ativo: ${rotulo}`}
    >
      Estilo: {rotulo}
    </span>
  );
}

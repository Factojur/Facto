"use client";

import { useEffect, useState } from "react";
import type { ResumoCota } from "@/lib/cota-pecas";

/**
 * Badge de créditos restantes na topbar.
 * Busca /api/cota uma vez por montagem; atualiza após geração (evento custom).
 */
export function CotaBadge() {
  const [cota, setCota] = useState<ResumoCota | null>(null);

  async function carregarCota() {
    try {
      const res = await fetch("/api/cota");
      if (!res.ok) return;
      const json = (await res.json()) as { cota: ResumoCota };
      setCota(json.cota);
    } catch { /* silencioso */ }
  }

  useEffect(() => {
    void carregarCota();
    // Atualiza quando a peça for gerada
    const handler = () => void carregarCota();
    window.addEventListener("facto:peca-gerada", handler);
    return () => window.removeEventListener("facto:peca-gerada", handler);
  }, []);

  if (!cota?.trackingAtivo || cota.limiteTotal === null) return null;

  const restante = cota.restante ?? 0;
  const total = cota.limiteTotal;
  const percentual = total > 0 ? ((total - restante) / total) * 100 : 0;

  // Cor baseada em quanto resta
  const corBarra =
    restante === 0
      ? "bg-red-500"
      : restante <= Math.ceil(total * 0.2)
        ? "bg-amber-400"
        : "bg-facto-gold";

  const corTexto =
    restante === 0
      ? "text-red-400"
      : restante <= Math.ceil(total * 0.2)
        ? "text-amber-400"
        : "text-stone-300";

  return (
    <div
      className="hidden flex-col items-end gap-0.5 sm:flex"
      title={`${restante} de ${total} peças disponíveis este mês`}
    >
      <span className={`text-[10px] font-medium leading-none ${corTexto}`}>
        {restante === 0 ? "Créditos esgotados" : `${restante} de ${total} peças`}
      </span>
      {/* Barra de progresso */}
      <div className="h-1 w-20 overflow-hidden rounded-full bg-stone-700">
        <div
          className={`h-full rounded-full transition-all ${corBarra}`}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>
    </div>
  );
}

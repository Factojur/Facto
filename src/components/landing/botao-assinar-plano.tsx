"use client";

import { useState } from "react";
import type { PlanoCheckoutId } from "@/lib/planos-facto";

type Props = {
  planoId: PlanoCheckoutId;
  /** Fallback público (visitante sem login) — link estático MP. */
  hrefFallback: string;
  children: React.ReactNode;
  variante?: "primario" | "secundario";
};

/**
 * Assinar: se logado, cria preapproval com token; senão abre link estático.
 */
export function BotaoAssinarPlano({
  planoId,
  hrefFallback,
  children,
  variante = "secundario",
}: Props) {
  const [loading, setLoading] = useState(false);

  const classe =
    variante === "primario"
      ? "bg-facto-gold text-facto-dark shadow-lg shadow-facto-gold/20 hover:bg-[#a39a78]"
      : "border border-white/15 text-white hover:border-facto-gold/50 hover:bg-white/5";

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/assinatura/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoId }),
      });
      if (res.status === 401) {
        window.open(hrefFallback, "_blank", "noopener,noreferrer");
        return;
      }
      const data = (await res.json()) as { initPoint?: string; error?: string };
      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      window.open(hrefFallback, "_blank", "noopener,noreferrer");
    } catch {
      window.open(hrefFallback, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => void onClick(e)}
      disabled={loading}
      className={`block w-full rounded-lg px-6 py-3.5 text-center font-semibold transition disabled:cursor-wait disabled:opacity-70 ${classe}`}
    >
      {loading ? "Abrindo Mercado Pago…" : children}
    </button>
  );
}

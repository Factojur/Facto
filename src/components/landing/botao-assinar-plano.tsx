"use client";

import { useState } from "react";
import type { PlanoCheckoutId } from "@/lib/planos-facto";

type Props = {
  planoId: PlanoCheckoutId;
  /** Fallback público (visitante sem login) — link estático MP. */
  hrefFallback: string;
  children: React.ReactNode;
  variante?: "primario" | "secundario" | "dashboard";
};

/**
 * Assinar: se logado, cria preapproval com token; visitante (401) abre link estático.
 * Em falha autenticada, mostra erro — não cai no link sem vínculo userId.
 */
export function BotaoAssinarPlano({
  planoId,
  hrefFallback,
  children,
  variante = "secundario",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const classe =
    variante === "primario"
      ? "bg-facto-gold text-facto-dark shadow-lg shadow-facto-gold/20 hover:bg-[#a39a78]"
      : variante === "dashboard"
        ? "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
        : "border border-white/15 text-white hover:border-facto-gold/50 hover:bg-white/5";

  const erroClasse =
    variante === "dashboard" ? "text-red-600" : "text-red-300";

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setErro(null);
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
      const data = (await res.json().catch(() => null)) as {
        initPoint?: string;
        preapprovalId?: string;
        error?: string;
      } | null;
      if (res.ok && data?.initPoint) {
        if (data.preapprovalId) {
          try {
            sessionStorage.setItem(
              "facto_mp_preapproval_id",
              data.preapprovalId
            );
          } catch {
            /* private mode */
          }
        }
        window.location.href = data.initPoint;
        return;
      }
      setErro(
        data?.error ??
          "Não foi possível abrir o checkout. Tente de novo ou fale com o suporte."
      );
    } catch {
      setErro("Falha de rede ao abrir o checkout. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={(e) => void onClick(e)}
        disabled={loading}
        className={`block w-full rounded-lg px-6 py-3.5 text-center font-semibold transition disabled:cursor-wait disabled:opacity-70 ${classe}`}
      >
        {loading ? "Abrindo Mercado Pago…" : children}
      </button>
      {erro && (
        <p className={`mt-2 text-xs leading-snug ${erroClasse}`} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

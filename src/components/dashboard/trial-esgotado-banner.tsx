"use client";

import { useState } from "react";
import {
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_PRO,
  PLANO_TRIAL,
  type PlanoCheckoutId,
} from "@/lib/planos-facto";

type Props = {
  id?: string;
  usoLabel?: string | null;
};

async function abrirCheckout(planoId: PlanoCheckoutId): Promise<string | null> {
  const res = await fetch("/api/assinatura/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planoId }),
  });
  const data = (await res.json()) as { initPoint?: string; error?: string };
  if (!res.ok || !data.initPoint) {
    throw new Error(data.error ?? "Não foi possível abrir o checkout.");
  }
  return data.initPoint;
}

/**
 * Banner quando o teste grátis acaba — checkout tokenizado (mesma conta).
 */
export function TrialEsgotadoBanner({
  id = "trial-esgotado",
  usoLabel,
}: Props) {
  const [loading, setLoading] = useState<PlanoCheckoutId | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function contratar(planoId: PlanoCheckoutId) {
    setErro(null);
    setLoading(planoId);
    try {
      const initPoint = await abrirCheckout(planoId);
      if (initPoint) window.location.href = initPoint;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha no checkout.");
      setLoading(null);
    }
  }

  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-facto-gold/40 bg-gradient-to-br from-amber-50 via-stone-50 to-white shadow-lg shadow-amber-900/10"
    >
      <div className="relative px-5 py-5 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
          Teste concluído
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
          Suas {PLANO_TRIAL.pecasPorMes} peças de teste acabaram
        </h3>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
          {usoLabel ? `${usoLabel}. ` : ""}
          Assine na mesma conta e continue no assistente — preview forense ao
          vivo antes de gerar. O acesso libera após a
          confirmação do Mercado Pago (pode pagar com outro cartão/e-mail; o
          vínculo é desta conta). Sem e-mail de convite.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void contratar("jec")}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:opacity-60"
          >
            {loading === "jec"
              ? "Abrindo Mercado Pago…"
              : `Assinar JEC · ${PLANO_JEC.rotuloPreco}/mês`}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void contratar("mensal")}
            className="inline-flex items-center justify-center rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-700 disabled:opacity-60"
          >
            {loading === "mensal"
              ? "Abrindo Mercado Pago…"
              : `Assinar Completo · ${PLANO_MENSAL.rotuloPreco}/mês`}
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => void contratar("pro")}
            className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-60"
          >
            {loading === "pro"
              ? "Abrindo Mercado Pago…"
              : `Assinar Pro · ${PLANO_PRO.rotuloPreco}/mês`}
          </button>
        </div>
        {erro && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {erro}
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Liberação só após pagamento aprovado. Planos anuais: veja a seção
          Preços na página inicial (com a conta logada o checkout vincula à
          sua conta).
        </p>
      </div>
    </section>
  );
}

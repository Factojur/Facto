"use client";

import { useState } from "react";
import { PACOTES_EXTRA, type PacoteExtraId } from "@/lib/planos-facto";
import type { ResumoCota } from "@/lib/cota-pecas";

type Props = {
  cota?: ResumoCota | null;
  /** Compacto para banner no JEC */
  variante?: "painel" | "banner";
  id?: string;
};

function BarraUso({ cota }: { cota: ResumoCota }) {
  if (!cota.trackingAtivo || cota.percentualUsado == null) return null;
  const pct = cota.percentualUsado;
  const cor =
    pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{cota.usoLabel}</span>
        <span className="tabular-nums text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CardPacote({
  pacote,
  destaque,
}: {
  pacote: (typeof PACOTES_EXTRA)[number];
  destaque?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const linkEstatico = pacote.linkMp?.trim() || null;

  async function contratar() {
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/pacotes-extras/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacoteId: pacote.id as PacoteExtraId }),
      });
      const data = (await res.json()) as {
        initPoint?: string;
        error?: string;
      };
      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      // Fallback: link estático do painel MP (se configurado)
      if (linkEstatico) {
        window.open(linkEstatico, "_blank", "noopener,noreferrer");
        return;
      }
      setErro(data.error ?? "Não foi possível abrir o checkout.");
    } catch {
      if (linkEstatico) {
        window.open(linkEstatico, "_blank", "noopener,noreferrer");
        return;
      }
      setErro("Falha de rede ao abrir o checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 transition ${
        destaque
          ? "border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-stone-50 shadow-lg shadow-amber-900/5 ring-1 ring-amber-300/40"
          : "border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {destaque && (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          Melhor custo
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Pacote avulso
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
        {pacote.rotulo}
      </p>
      <p className="mt-1 text-sm leading-snug text-slate-600">
        {pacote.descricao}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-slate-900">
          {pacote.rotuloPreco}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        ≈ {pacote.custoPorPecaAprox} por peça
      </p>
      <button
        type="button"
        onClick={() => void contratar()}
        disabled={loading}
        className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          destaque
            ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-900/20 hover:from-amber-500 hover:to-yellow-500"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {loading ? "Abrindo Mercado Pago…" : `Contratar ${pacote.rotulo}`}
      </button>
      {erro && (
        <p className="mt-2 text-xs leading-snug text-red-600" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

/**
 * Contratação de pacotes extras — Perfil e banner do JEC.
 * Pagamento único (Checkout Pro), não assinatura.
 */
export function PacotesExtrasPainel({
  cota = null,
  variante = "painel",
  id = "pacotes-extras",
}: Props) {
  const esgotada = Boolean(cota?.esgotada);
  const quase = (cota?.percentualUsado ?? 0) >= 85 && !esgotada;

  if (variante === "banner") {
    return (
      <section
        id={id}
        className={`scroll-mt-28 overflow-hidden rounded-2xl border ${
          esgotada
            ? "border-amber-400/50 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white shadow-lg shadow-amber-900/10"
            : "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
        }`}
      >
        <div className="relative px-5 py-5 sm:px-6">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              {esgotada
                ? "Cota esgotada"
                : quase
                  ? "Cota quase no fim"
                  : "Peças extras"}
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              {esgotada
                ? "Continue gerando com um pacote avulso"
                : "Precisa de mais peças este mês?"}
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              {esgotada
                ? "Sua cota do ciclo acabou. Escolha +50 ou +100 peças — o crédito entra após a confirmação do pagamento, sem mudar de plano."
                : "Contrate um pacote sem alterar sua assinatura. Ideal para picos de demanda no escritório."}
            </p>
            {cota && <BarraUso cota={cota} />}
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
            {PACOTES_EXTRA.map((p) => (
              <CardPacote
                key={p.id}
                pacote={p}
                destaque={p.id === "extra-100"}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      id={id}
      className={`mt-8 overflow-hidden rounded-2xl border ${
        esgotada
          ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-stone-50"
          : "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50/30"
      }`}
    >
      <div className="border-b border-slate-100/80 bg-white/60 px-5 py-4 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700/90">
              Ampliar cota
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900">
              {esgotada
                ? "Cota do mês esgotada — continue gerando"
                : "Pacotes de peças extras"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              +50 por R$ 39,90 ou +100 por R$ 79,90. Créditos válidos no ciclo
              atual (compra avulsa, sem renovação).
            </p>
          </div>
          {esgotada && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
              Sem saldo
            </span>
          )}
        </div>
        {cota && <BarraUso cota={cota} />}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {PACOTES_EXTRA.map((p) => (
          <CardPacote key={p.id} pacote={p} destaque={p.id === "extra-100"} />
        ))}
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-xs leading-relaxed text-slate-500">
        Pagamento único e seguro via Mercado Pago (não é assinatura). Os
        créditos extras não acumulam para o próximo ciclo. Use o mesmo e-mail
        da sua conta FACTO no checkout.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PACOTES_EXTRA, type PacoteExtraId } from "@/lib/planos-facto";
import type { ResumoCota } from "@/lib/cota-pecas";

type Props = {
  cota?: ResumoCota | null;
  /** Compacto para banner no JEC */
  variante?: "painel" | "banner";
  id?: string;
  /** Paleta FACTO (página de planos). */
  tema?: "claro" | "escuro";
};

function BarraUso({
  cota,
  tema = "claro",
}: {
  cota: ResumoCota;
  tema?: "claro" | "escuro";
}) {
  if (!cota.trackingAtivo || cota.percentualUsado == null) return null;
  const pct = cota.percentualUsado;
  const cor =
    pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-500" : "bg-emerald-500";
  const escuro = tema === "escuro";

  return (
    <div className="mt-3">
      <div
        className={`mb-1.5 flex items-center justify-between text-xs ${
          escuro ? "text-stone-400" : ""
        }`}
      >
        <span
          className={`font-medium ${escuro ? "text-stone-300" : "text-slate-600"}`}
        >
          {cota.usoLabel}
        </span>
        <span
          className={`tabular-nums ${escuro ? "text-stone-500" : "text-slate-500"}`}
        >
          {pct}%
        </span>
      </div>
      <div
        className={`h-2 overflow-hidden rounded-full ${
          escuro ? "bg-white/10" : "bg-slate-200/80"
        }`}
      >
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
  tema = "claro",
}: {
  pacote: (typeof PACOTES_EXTRA)[number];
  destaque?: boolean;
  tema?: "claro" | "escuro";
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const linkEstatico = pacote.linkMp?.trim() || null;
  const escuro = tema === "escuro";

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
        escuro
          ? destaque
            ? "border-facto-gold/55 bg-gradient-to-br from-facto-gold/[0.2] via-[#2a261c]/85 to-transparent shadow-[0_0_36px_-8px_rgba(196,191,154,0.5)] ring-1 ring-facto-gold/30"
            : "border-white/10 bg-white/[0.03]"
          : destaque
            ? "border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-stone-50 shadow-lg shadow-amber-900/5 ring-1 ring-amber-300/40"
            : "border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {destaque && (
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            escuro
              ? "border border-facto-gold/45 bg-facto-gold/20 text-[#f0ebd0] shadow-[0_0_12px_rgba(240,235,208,0.35)]"
              : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm"
          }`}
        >
          Melhor custo
        </span>
      )}
      {escuro && destaque && (
        <span
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-facto-gold/20 blur-3xl"
          aria-hidden
        />
      )}
      <p
        className={`text-xs font-semibold uppercase tracking-[0.14em] ${
          escuro ? "text-stone-500" : "text-slate-500"
        }`}
      >
        Pacote avulso
      </p>
      <p
        className={`mt-1 text-xl font-bold tracking-tight ${
          escuro ? "text-white" : "text-slate-900"
        }`}
      >
        {pacote.rotulo}
      </p>
      <p
        className={`mt-1 text-sm leading-snug ${
          escuro ? "text-stone-400" : "text-slate-600"
        }`}
      >
        {pacote.descricao}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <span
          className={`text-3xl font-bold tabular-nums ${
            escuro ? "text-white" : "text-slate-900"
          }`}
        >
          {pacote.rotuloPreco}
        </span>
      </div>
      <p
        className={`mt-0.5 text-xs ${
          escuro ? "text-stone-500" : "text-slate-500"
        }`}
      >
        ≈ {pacote.custoPorPecaAprox} por peça · válidas só neste mês
      </p>
      <button
        type="button"
        onClick={() => void contratar()}
        disabled={loading}
        className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
          escuro
            ? destaque
              ? "bg-facto-gold text-facto-dark hover:bg-[#a39a78]"
              : "border border-white/15 text-white hover:border-facto-gold/50 hover:bg-white/5"
            : destaque
              ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-900/20 hover:from-amber-500 hover:to-yellow-500"
              : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        {loading ? "Abrindo Mercado Pago…" : `Contratar ${pacote.rotulo}`}
      </button>
      {erro && (
        <p
          className={`mt-2 text-xs leading-snug ${
            escuro ? "text-red-300" : "text-red-600"
          }`}
          role="alert"
        >
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
  tema = "claro",
}: Props) {
  const esgotada = Boolean(cota?.esgotada);
  const quase = (cota?.percentualUsado ?? 0) >= 85 && !esgotada;
  const escuro = tema === "escuro";

  if (variante === "banner") {
    return (
      <section
        id={id}
        className={`scroll-mt-28 overflow-hidden rounded-2xl border ${
          escuro
            ? esgotada
              ? "border-facto-gold/40 bg-gradient-to-br from-facto-gold/[0.12] via-white/[0.03] to-transparent"
              : "border-white/10 bg-white/[0.03]"
            : esgotada
              ? "border-amber-400/50 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white shadow-lg shadow-amber-900/10"
              : "border-slate-200 bg-gradient-to-br from-slate-50 to-white"
        }`}
      >
        <div className="relative px-5 py-5 sm:px-6">
          <div
            className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl ${
              escuro ? "bg-facto-gold/15" : "bg-amber-400/20"
            }`}
            aria-hidden
          />
          <div className="relative">
            <p
              className={`text-xs font-bold uppercase tracking-[0.2em] ${
                escuro ? "text-facto-gold" : "text-amber-700"
              }`}
            >
              {esgotada
                ? "Cota esgotada"
                : quase
                  ? "Cota quase no fim"
                  : "Peças extras"}
            </p>
            <h3
              className={`mt-1 text-lg font-bold sm:text-xl ${
                escuro ? "text-white" : "text-slate-900"
              }`}
            >
              {esgotada
                ? "Continue gerando com um pacote avulso"
                : "Precisa de mais peças este mês?"}
            </h3>
            <p
              className={`mt-1.5 max-w-2xl text-sm ${
                escuro ? "text-stone-400" : "text-slate-600"
              }`}
            >
              {esgotada
                ? "Sua cota do ciclo acabou. Escolha +50 ou +100 peças — o crédito entra após a confirmação do pagamento, sem mudar de plano. Não acumulam para o próximo mês."
                : "Contrate um pacote sem alterar sua assinatura. Ideal para picos de demanda. Extras valem só no ciclo atual."}
            </p>
            {cota && <BarraUso cota={cota} tema={tema} />}
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PACOTES_EXTRA.map((p) => (
              <CardPacote
                key={p.id}
                pacote={p}
                destaque={p.id === "extra-100"}
                tema={tema}
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
        escuro
          ? "border-white/10 bg-white/[0.03]"
          : esgotada
            ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-stone-50"
            : "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50/30"
      }`}
    >
      <div
        className={`border-b px-5 py-4 ${
          escuro
            ? "border-white/10 bg-white/[0.03]"
            : "border-slate-100/80 bg-white/60 backdrop-blur-sm"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-[0.18em] ${
                escuro ? "text-facto-gold" : "text-amber-700/90"
              }`}
            >
              Ampliar cota
            </p>
            <h3
              className={`mt-1 text-base font-bold ${
                escuro ? "text-white" : "text-slate-900"
              }`}
            >
              {esgotada
                ? "Cota do mês esgotada — continue gerando"
                : "Pacotes de peças extras"}
            </h3>
            <p
              className={`mt-1 text-sm ${
                escuro ? "text-stone-400" : "text-slate-600"
              }`}
            >
              +50 peças por R$ 49,90 ou +100 por R$ 89,90. Créditos válidos só no
              ciclo atual (não acumulam para o próximo mês).
            </p>
          </div>
          {esgotada && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                escuro
                  ? "bg-facto-gold/15 text-facto-gold ring-facto-gold/30"
                  : "bg-amber-100 text-amber-900 ring-amber-200"
              }`}
            >
              Sem saldo
            </span>
          )}
        </div>
        {cota && <BarraUso cota={cota} tema={tema} />}
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACOTES_EXTRA.map((p) => (
          <CardPacote
            key={p.id}
            pacote={p}
            destaque={p.id === "extra-100"}
            tema={tema}
          />
        ))}
      </div>

      <p
        className={`border-t px-5 py-3 text-xs leading-relaxed ${
          escuro
            ? "border-white/10 text-stone-500"
            : "border-slate-100 text-slate-500"
        }`}
      >
        Pagamento único e seguro via Mercado Pago (não é assinatura). Os
        créditos extras não acumulam para o próximo ciclo. Use o mesmo e-mail
        da sua conta FACTO no checkout.
      </p>
    </div>
  );
}

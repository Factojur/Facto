"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { createClient } from "@/lib/supabase/client";
import { AREAS_ATUACAO } from "@/lib/areas-atuacao";
import { PLANO_TRIAL } from "@/lib/planos-facto";

const AREAS_TRIAL = AREAS_ATUACAO.filter((a) => a.available && a.href).slice(
  0,
  12
);

export default function OnboardingTrialPage() {
  const supabase = createClient();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [areaId, setAreaId] = useState("jec");
  const [termoAceito, setTermoAceito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.assign("/trial");
        return;
      }
      setEmail(user.email ?? null);
      const meta = user.user_metadata as Record<string, unknown>;
      const nome =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        (typeof meta.nome_completo === "string" && meta.nome_completo) ||
        "";
      if (nome) setNomeCompleto(nome);
    })();
  }, [supabase.auth]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/trial/ativar-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto,
          areaId,
          termoAceito,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirect?: string;
      };
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível iniciar o teste.");
        return;
      }
      window.location.assign(data.redirect ?? "/dashboard");
    } catch {
      setErro("Falha de rede. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-facto-dark text-stone-100">
      <header className="border-b border-white/10 px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/">
            <FactoLogo variant="horizontal" size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-12 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-facto-gold">
          {PLANO_TRIAL.rotulo} · Google
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Quase lá — escolha a área
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Conta Google conectada
          {email ? ` (${email})` : ""}. Selecione a área do teste e aceite os
          termos para liberar {PLANO_TRIAL.pecasPorMes} peças no assistente por
          7 dias.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="text-stone-400">Nome completo</span>
            <input
              required
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-stone-400">Área do teste</span>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-facto-dark px-3 py-2 text-white"
            >
              {AREAS_TRIAL.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-2 text-sm text-stone-400">
            <input
              type="checkbox"
              checked={termoAceito}
              onChange={(e) => setTermoAceito(e.target.checked)}
              className="mt-1"
            />
            <span>
              Li e concordo com os{" "}
              <Link href="/termos" className="text-facto-gold underline">
                termos
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="text-facto-gold underline">
                privacidade
              </Link>
              .
            </span>
          </label>

          {erro && (
            <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-facto-gold px-4 py-3 text-sm font-semibold text-facto-dark hover:bg-amber-300 disabled:opacity-60"
          >
            {loading ? "Ativando…" : "Começar teste grátis"}
          </button>
        </form>
      </main>
    </div>
  );
}

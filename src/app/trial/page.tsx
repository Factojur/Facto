"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AREAS_ATUACAO } from "@/lib/areas-atuacao";
import { PLANO_TRIAL } from "@/lib/planos-facto";

const AREAS_TRIAL = AREAS_ATUACAO.filter((a) => a.available && a.href).slice(
  0,
  12
);

export default function TrialPage() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [areaId, setAreaId] = useState("jec");
  const [termoAceito, setTermoAceito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/trial/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto,
          email,
          senha,
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
      router.push(data.redirect ?? "/login?trial=ok");
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
          <Link href="/login" className="text-sm text-stone-400 hover:text-white">
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-12 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-facto-gold">
          {PLANO_TRIAL.rotulo}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Teste o FACTO em 7 dias
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Uma área · {PLANO_TRIAL.pecasPorMes} peças no assistente · preview completo ·
          export Word/PDF nos planos pagos
          para protocolar. Sem OAB no início — informe só ao assinar.
        </p>

        <GoogleSignInButton
          intent="trial"
          className="mt-8"
          label="Continuar com Google"
        />

        <div className="my-6 flex items-center gap-3 text-xs text-stone-500">
          <span className="h-px flex-1 bg-stone-700" />
          ou com e-mail e senha
          <span className="h-px flex-1 bg-stone-700" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
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
            <span className="text-stone-400">E-mail</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-stone-400">Senha (mín. 6)</span>
            <input
              required
              type="password"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
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
            {loading ? "Criando…" : "Começar teste grátis"}
          </button>
        </form>

        <ul className="mt-8 space-y-2 text-xs text-stone-500">
          {PLANO_TRIAL.beneficios.map((b) => (
            <li key={b}>· {b}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}

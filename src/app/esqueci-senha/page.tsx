"use client";

import Link from "next/link";
import { useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";

export default function EsqueciSenhaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);

    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();

    try {
      const res = await fetch("/api/auth/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o e-mail.");
        setLoading(false);
        return;
      }
      setOk(data.mensagem ?? "Verifique sua caixa de entrada.");
    } catch {
      setError("Falha de rede. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-facto-dark px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <FactoLogo variant="stacked" size="md" />
          <h1 className="mt-6 text-3xl font-bold text-white">
            Esqueci minha senha
          </h1>
          <p className="mt-2 text-center text-sm text-stone-400">
            Enviaremos um link para redefinir a senha no e-mail da sua conta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl shadow-black/30"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {ok && (
            <div className="mb-4 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
              {ok}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              E-mail da conta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
              placeholder="joao@escritorio.com.br"
            />
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(ok)}
            className="mt-6 w-full rounded-lg bg-facto-gold py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link por e-mail"}
          </button>

          <p className="mt-6 text-center text-sm text-stone-400">
            <Link
              href="/login"
              className="font-medium text-facto-gold hover:text-[#a39a78]"
            >
              Voltar ao login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

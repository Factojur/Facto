"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

function urlPosLogin(convite?: string | null): string {
  if (convite?.trim()) {
    return `/gestao/entrar?convite=${encodeURIComponent(convite.trim())}`;
  }
  return "/gestao";
}

export function GestaoLoginForm({ convite }: { convite?: string | null }) {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const oauthErro = searchParams.get("oauth");

  useEffect(() => {
    async function preparar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        window.location.assign(urlPosLogin(convite));
        return;
      }
      setCheckingSession(false);
    }
    void preparar();
  }, [convite]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError) {
      setError(getAuthErrorMessage(loginError.message));
      setLoading(false);
      return;
    }

    window.location.assign(urlPosLogin(convite));
  }

  if (checkingSession) {
    return (
      <p className="text-sm text-stone-500">Verificando sessão…</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/20"
    >
      <h2 className="text-lg font-semibold text-white">Entrar</h2>
      <p className="mt-1 text-sm text-stone-400">
        Acesso exclusivo ao painel de gestão (ambiente de desenvolvimento).
      </p>

      {oauthErro ? (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {oauthErro}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <GoogleSignInButton
        intent="login"
        destinoGestao
        className="mt-5"
        label="Entrar com Google"
      />

      <div className="my-5 flex items-center gap-3 text-xs text-stone-500">
        <span className="h-px flex-1 bg-stone-700" />
        ou com e-mail
        <span className="h-px flex-1 bg-stone-700" />
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="gestao-email"
            className="mb-1.5 block text-sm font-medium text-stone-300"
          >
            E-mail
          </label>
          <input
            id="gestao-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="gestao-senha"
              className="block text-sm font-medium text-stone-300"
            >
              Senha
            </label>
            <Link
              href="/esqueci-senha"
              className="text-xs font-medium text-facto-gold hover:text-[#a39a78]"
            >
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="gestao-senha"
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
            placeholder="Sua senha"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-facto-gold py-3 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Entrar na gestão"}
      </button>
    </form>
  );
}

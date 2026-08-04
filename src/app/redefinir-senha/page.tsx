"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

/**
 * Página destino do link de recovery (Supabase).
 * O cliente troca o hash/code por sessão e permite definir a nova senha.
 */
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [pronto, setPronto] = useState(false);
  const [sessaoOk, setSessaoOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function prepararSessao() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchErr } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchErr && !cancelado) {
          setError(getAuthErrorMessage(exchErr.message));
          setPronto(true);
          return;
        }
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.pathname);
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error: sessErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessErr && !cancelado) {
            setError(getAuthErrorMessage(sessErr.message));
            setPronto(true);
            return;
          }
          window.history.replaceState({}, "", url.pathname);
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelado) {
        if (!user) {
          setError(
            "Link inválido ou expirado. Solicite um novo em “Esqueci minha senha”."
          );
          setSessaoOk(false);
        } else {
          setSessaoOk(true);
        }
        setPronto(true);
      }
    }

    void prepararSessao();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmacao = String(form.get("confirmacao") ?? "");

    if (senha.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }
    if (senha !== confirmacao) {
      setError("A confirmação não confere com a nova senha.");
      setLoading(false);
      return;
    }

    const { error: updErr } = await supabase.auth.updateUser({
      password: senha,
    });

    if (updErr) {
      setError(getAuthErrorMessage(updErr.message));
      setLoading(false);
      return;
    }

    setOk(true);
    setLoading(false);
    window.setTimeout(() => {
      router.replace("/login");
    }, 1800);
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
          <h1 className="mt-6 text-3xl font-bold text-white">Nova senha</h1>
          <p className="mt-2 text-center text-sm text-stone-400">
            Defina uma senha forte para voltar a acessar o FACTO.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl shadow-black/30">
          {!pronto && (
            <p className="text-center text-sm text-stone-400">
              Validando link…
            </p>
          )}

          {pronto && error && !ok && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {ok && (
            <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
              Senha atualizada. Redirecionando para o login…
            </div>
          )}

          {pronto && sessaoOk && !ok && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="senha"
                  className="mb-1.5 block text-sm font-medium text-stone-300"
                >
                  Nova senha
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmacao"
                  className="mb-1.5 block text-sm font-medium text-stone-300"
                >
                  Confirmar nova senha
                </label>
                <input
                  id="confirmacao"
                  name="confirmacao"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-facto-gold py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          )}

          {pronto && !sessaoOk && (
            <p className="mt-2 text-center text-sm text-stone-400">
              <Link
                href="/esqueci-senha"
                className="font-medium text-facto-gold hover:text-[#a39a78]"
              >
                Solicitar novo link
              </Link>
            </p>
          )}

          <p className="mt-6 text-center text-sm text-stone-400">
            <Link
              href="/login"
              className="font-medium text-facto-gold hover:text-[#a39a78]"
            >
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

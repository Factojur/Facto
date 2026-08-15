"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { validateOabMock } from "@/lib/validate-oab";
import { TEXTO_TERMO_LEIGO } from "@/lib/termo-leigo";
import { rotuloPlano } from "@/lib/assinatura-format";
import type { PlanoId } from "@/lib/planos-facto";

export function CadastroForm({
  emailConvite,
  token,
  plano = null,
}: {
  emailConvite: string;
  token: string;
  plano?: PlanoId | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [souAdvogado, setSouAdvogado] = useState(plano !== "jec");
  const [termoAceito, setTermoAceito] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const nomeCompleto = String(form.get("nomeCompleto"));
    const cpf = String(form.get("cpf")).replace(/\D/g, "");
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));
    const oabNumero = souAdvogado ? String(form.get("oabNumero")) : "";

    if (souAdvogado) {
      const oabValidation = validateOabMock({ email, senha, oabNumero });
      if (!oabValidation.valid) {
        setError(oabValidation.message);
        setLoading(false);
        return;
      }
    } else if (!termoAceito) {
      setError(
        "Você precisa marcar que leu e concorda com os termos para continuar sem OAB."
      );
      setLoading(false);
      return;
    }

    const cadastroRes = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        email,
        senha,
        nomeCompleto,
        cpf,
        souAdvogado,
        oabNumero: souAdvogado ? oabNumero : undefined,
        termoAceito: souAdvogado ? undefined : termoAceito,
      }),
    });
    const cadastroJson = (await cadastroRes.json().catch(() => null)) as {
      error?: string;
      codigo?: string;
    } | null;

    if (!cadastroRes.ok) {
      setError(
        cadastroJson?.error ??
          getAuthErrorMessage("Não foi possível concluir o cadastro.")
      );
      setLoading(false);
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    if (signInError || !signInData.user) {
      setError(getAuthErrorMessage(signInError?.message ?? "Erro ao entrar"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    await fetch("/api/auth/sessao", { method: "POST" });

    router.push("/dashboard");
    router.refresh();
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
          <h1 className="mt-6 text-3xl font-bold text-white">Criar conta</h1>
          <p className="mt-2 text-center text-sm text-stone-400">
            Para advogados e para quem atua no Juizado sem OAB
          </p>
          {plano ? (
            <p className="mt-2 text-center text-xs text-stone-500">
              Convite do {rotuloPlano(plano)} · e-mail do pagamento
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-stone-500">
              Convite vinculado ao e-mail do pagamento
            </p>
          )}
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
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
              Conta criada com sucesso! Redirecionando...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="nomeCompleto"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                Nome completo
              </label>
              <input
                id="nomeCompleto"
                name="nomeCompleto"
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label
                htmlFor="cpf"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                required
                maxLength={14}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                readOnly
                defaultValue={emailConvite}
                className="w-full cursor-not-allowed rounded-lg border border-stone-700 bg-stone-800/60 px-4 py-2.5 text-stone-400 outline-none"
              />
              <p className="mt-1.5 text-xs text-stone-500">
                E-mail vinculado ao seu pagamento — não pode ser alterado aqui.
              </p>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-stone-700 bg-stone-800/60 px-4 py-3">
              <input
                id="souAdvogado"
                type="checkbox"
                checked={souAdvogado}
                onChange={(e) => setSouAdvogado(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-600 bg-stone-800 text-facto-gold focus:ring-facto-gold"
              />
              <label htmlFor="souAdvogado" className="text-sm text-stone-300">
                Sou advogado(a) e tenho OAB
              </label>
            </div>

            {souAdvogado ? (
              <div>
                <label
                  htmlFor="oabNumero"
                  className="mb-1.5 block text-sm font-medium text-stone-300"
                >
                  OAB (UF + número)
                </label>
                <input
                  id="oabNumero"
                  name="oabNumero"
                  required={souAdvogado}
                  className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                  placeholder="SP147099"
                />
                <p className="mt-1.5 text-xs text-stone-500">
                  Digite a UF junto com o número, sem espaços (ex.: SP147099,
                  PR147099). Na peça, a assinatura sai como OAB/SP 147099.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-4">
                <p className="text-sm font-semibold text-amber-300">
                  Acesso restrito ao Juizado Especial Cível
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-200/70">
                  Sem OAB, seu acesso ao FACTO fica limitado ao módulo do
                  Juizado Especial Cível, para causas de até 20 salários
                  mínimos (art. 9º, Lei nº 9.099/95).
                </p>
                <div className="mt-3 max-h-32 overflow-y-auto rounded border border-amber-900/40 bg-stone-950/40 p-2.5 text-[11px] leading-relaxed whitespace-pre-line text-stone-400">
                  {TEXTO_TERMO_LEIGO}
                </div>
                <label className="mt-3 flex items-start gap-2.5 text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={termoAceito}
                    onChange={(e) => setTermoAceito(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-600 bg-stone-800 text-facto-gold focus:ring-facto-gold"
                  />
                  Li e concordo com os termos acima.
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-facto-gold py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>

          <p className="mt-6 text-center text-sm text-stone-400">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-facto-gold hover:text-[#a39a78]"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

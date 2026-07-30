"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { validateOabMock } from "@/lib/validate-oab";

export function CadastroForm({
  emailConvite,
  token,
}: {
  emailConvite: string;
  token: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const nomeCompleto = String(form.get("nomeCompleto"));
    const cpf = String(form.get("cpf")).replace(/\D/g, "");
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));
    const oabNumero = String(form.get("oabNumero"));

    const oabValidation = validateOabMock({ email, senha, oabNumero });

    if (!oabValidation.valid) {
      setError(oabValidation.message);
      setLoading(false);
      return;
    }

    const userMetadata: Record<string, string> = {
      nome_completo: nomeCompleto,
      cpf,
      oab_numero: oabNumero,
    };

    if (oabValidation.role) {
      userMetadata.role = oabValidation.role;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: userMetadata,
      },
    });

    if (
      signUpError &&
      !signUpError.message.toLowerCase().includes("already registered")
    ) {
      setError(getAuthErrorMessage(signUpError.message));
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

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: signInData.user.id,
        nome_completo: nomeCompleto,
        cpf,
        email,
        oab_numero: oabNumero,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Marca o convite como usado — se isso falhar, não bloqueia o acesso: a
    // conta já foi criada normalmente.
    try {
      await fetch("/api/convites/consumir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Ignorado de propósito.
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
          <p className="mt-2 text-sm text-stone-400">
            Gerador de peças jurídicas para advogados
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
                placeholder="Dr. João Silva"
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

            <div>
              <label
                htmlFor="oabNumero"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                Número da OAB
              </label>
              <input
                id="oabNumero"
                name="oabNumero"
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="SP 123456"
              />
            </div>
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

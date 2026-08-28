"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function GestaoCadastroForm() {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [termoAceito, setTermoAceito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/gestao/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCompleto,
          email,
          senha,
          termoAceito,
        }),
      });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível criar a conta.");
        return;
      }
      router.push(data.redirect ?? "/gestao/login?cadastro=ok");
    } catch {
      setErro("Falha de rede. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 shadow-xl shadow-black/20"
    >
      <h2 className="text-lg font-semibold text-white">Criar conta grátis</h2>
      <p className="mt-1 text-sm text-stone-400">
        Gestão de processos, prazos e agenda — sem plano de minutas e sem OAB
        obrigatória.
      </p>

      {erro ? (
        <div className="mt-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      ) : null}

      <GoogleSignInButton
        intent="login"
        destinoGestao
        className="mt-5"
        label="Cadastrar com Google"
        disabled={!termoAceito}
      />
      {!termoAceito ? (
        <p className="mt-2 text-xs text-stone-500">
          Aceite os termos acima para usar o Google.
        </p>
      ) : null}

      <div className="my-5 flex items-center gap-3 text-xs text-stone-500">
        <span className="h-px flex-1 bg-stone-700" />
        ou com e-mail
        <span className="h-px flex-1 bg-stone-700" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-stone-300">Nome</label>
          <input
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
            minLength={3}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-stone-300">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-stone-300">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white outline-none focus:border-facto-gold"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-stone-400">
          <input
            type="checkbox"
            checked={termoAceito}
            onChange={(e) => setTermoAceito(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" className="text-facto-gold hover:underline" target="_blank">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="text-facto-gold hover:underline" target="_blank">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-facto-gold py-3 text-sm font-semibold text-facto-dark disabled:opacity-50"
      >
        {loading ? "Criando conta…" : "Criar conta"}
      </button>

      <p className="mt-4 text-center text-xs text-stone-500">
        Já tem conta?{" "}
        <Link href="/gestao/login" className="text-facto-gold hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

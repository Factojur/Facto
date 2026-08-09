"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import {
  ASSUNTOS_SUPORTE,
  type AssuntoSuporte,
} from "@/lib/email/suporte-assuntos";
import { formatarTelefone } from "@/lib/mascaras-endereco";

type Assunto = AssuntoSuporte | "";

function SuportePublicoFormInner() {
  const searchParams = useSearchParams();
  const motivo = searchParams.get("motivo");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState<Assunto>("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (motivo === "cadastro" || motivo === "pagamento") {
      setAssunto("Pagamento / Cadastro");
      if (motivo === "cadastro") {
        setMensagem(
          "Paguei o plano, mas ainda não recebi o e-mail com o link de cadastro."
        );
      }
    }
  }, [motivo]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!assunto) {
      setErro("Selecione um assunto.");
      return;
    }
    if (nome.trim().length < 2) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (!email.trim()) {
      setErro("Informe o e-mail usado no pagamento.");
      return;
    }
    if (!telefone.trim()) {
      setErro("Informe um celular com DDD para contato.");
      return;
    }
    if (!mensagem.trim() || mensagem.trim().length < 10) {
      setErro("Descreva a situação com pelo menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/suporte/publico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          assunto,
          mensagem: mensagem.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível enviar a mensagem.");
        setEnviando(false);
        return;
      }
      setSucesso(true);
      setNome("");
      setEmail("");
      setTelefone("");
      setAssunto(
        motivo === "cadastro" || motivo === "pagamento"
          ? "Pagamento / Cadastro"
          : ""
      );
      setMensagem("");
    } catch {
      setErro("Falha de rede ao enviar. Tente novamente.");
    }
    setEnviando(false);
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-facto-dark px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-lg">
        <FactoLogo variant="stacked" size="md" className="mx-auto" />
        <h1 className="mt-8 text-center text-2xl font-bold text-white">
          Falar com o suporte
        </h1>
        <p className="mt-3 text-center text-sm text-stone-400">
          Sem conta ainda? Preencha e-mail e celular para podermos te
          responder. Se já pagou e não recebeu o convite, use o assunto{" "}
          <strong className="text-stone-300">Pagamento / Cadastro</strong>.
        </p>

        {sucesso && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Mensagem enviada. Responderemos no e-mail que você informou.
          </div>
        )}

        {erro && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div>
            <label
              htmlFor="suporteNome"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Nome completo
            </label>
            <input
              id="suporteNome"
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-facto-gold/60 focus:ring-2 focus:ring-facto-gold/25"
            />
          </div>

          <div>
            <label
              htmlFor="suporteEmail"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              E-mail (o mesmo do pagamento, se já pagou)
            </label>
            <input
              id="suporteEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-facto-gold/60 focus:ring-2 focus:ring-facto-gold/25"
            />
          </div>

          <div>
            <label
              htmlFor="suporteTelefone"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Celular com DDD
            </label>
            <input
              id="suporteTelefone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-facto-gold/60 focus:ring-2 focus:ring-facto-gold/25"
            />
          </div>

          <div>
            <label
              htmlFor="suporteAssunto"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Assunto
            </label>
            <select
              id="suporteAssunto"
              required
              value={assunto}
              onChange={(e) => setAssunto(e.target.value as Assunto)}
              className="w-full rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-facto-gold/60 focus:ring-2 focus:ring-facto-gold/25"
            >
              <option value="">Selecione o assunto</option>
              {ASSUNTOS_SUPORTE.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="suporteMensagem"
              className="mb-1.5 block text-sm font-medium text-stone-300"
            >
              Mensagem
            </label>
            <textarea
              id="suporteMensagem"
              required
              rows={7}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva o que aconteceu: plano escolhido, data do pagamento, e-mail usado no Mercado Pago…"
              className="w-full resize-y rounded-lg border border-white/15 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none focus:border-facto-gold/60 focus:ring-2 focus:ring-facto-gold/25"
            />
            <p className="mt-1.5 text-xs text-stone-500">
              Evite enviar senhas ou dados sensíveis de clientes.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
            <Link
              href="/cadastro"
              className="rounded-lg border border-white/15 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:border-facto-gold/50 hover:bg-white/5"
            >
              Voltar ao cadastro
            </Link>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-facto-gold px-6 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar mensagem"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-stone-600">
          Já tem conta?{" "}
          <Link href="/login" className="text-stone-400 underline-offset-2 hover:text-facto-gold hover:underline">
            Entre no login
          </Link>{" "}
          e use o suporte da área logada.
        </p>
      </div>
    </div>
  );
}

export function SuportePublicoForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-facto-dark text-stone-400">
          Carregando…
        </div>
      }
    >
      <SuportePublicoFormInner />
    </Suspense>
  );
}

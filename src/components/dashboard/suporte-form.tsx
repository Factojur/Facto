"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ASSUNTOS_SUPORTE,
  type AssuntoSuporte,
} from "@/lib/email/suporte-assuntos";

type Assunto = AssuntoSuporte | "";

/**
 * Formulário de suporte: envia via POST /api/suporte (Resend).
 * Destino: Problema Técnico / Financeiro → suporte@;
 * Dúvida / Sugestão → contato@.
 */
export function SuporteForm() {
  const [assunto, setAssunto] = useState<Assunto>("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!assunto) {
      setErro("Selecione um assunto.");
      return;
    }
    if (!mensagem.trim() || mensagem.trim().length < 10) {
      setErro("Descreva a situação com pelo menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/suporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      setAssunto("");
      setMensagem("");
    } catch {
      setErro("Falha de rede ao enviar. Tente novamente.");
    }
    setEnviando(false);
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-facto-gold"
        >
          ← Voltar ao início
        </Link>
        <h1 className="text-2xl font-semibold text-slate-800">
          Suporte ao usuário
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Envie sua dúvida, problema técnico, sugestão ou questão financeira.
          Usamos o e-mail da sua conta para responder — sem preencher de novo.
        </p>
      </header>

      {sucesso && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Mensagem enviada. Responderemos no e-mail da sua conta.
        </div>
      )}

      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="assunto"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Assunto
            </label>
            <select
              id="assunto"
              name="assunto"
              required
              value={assunto}
              onChange={(e) => setAssunto(e.target.value as Assunto)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
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
              htmlFor="mensagem"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Mensagem
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              required
              rows={10}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva com detalhes a sua situação, incluindo passos para reproduzir o problema, se for o caso..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder-slate-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Evite enviar dados sensíveis de clientes (CPF completo, senhas,
              etc.).
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-lg bg-stone-700 px-6 py-2.5 text-sm font-semibold text-amber-50 shadow-sm transition hover:bg-stone-600 disabled:opacity-60"
          >
            {enviando ? "Enviando..." : "Enviar mensagem"}
          </button>
        </div>
      </form>
    </div>
  );
}

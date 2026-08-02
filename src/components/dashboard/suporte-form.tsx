"use client";

import Link from "next/link";
import { useState } from "react";

const ASSUNTOS = [
  "Dúvida",
  "Problema Técnico",
  "Sugestão de Melhoria",
  "Financeiro",
] as const;

type Assunto = (typeof ASSUNTOS)[number] | "";

/**
 * Formulário de suporte (frontend).
 * onSubmit preparado para futura integração com e-mail.
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

    // Placeholder: depois conectamos ao serviço de e-mail.
    const payload = {
      assunto,
      mensagem: mensagem.trim(),
      enviadoEm: new Date().toISOString(),
    };
    console.log("[FACTO Suporte]", payload);

    await new Promise((r) => setTimeout(r, 400));

    setEnviando(false);
    setSucesso(true);
    setAssunto("");
    setMensagem("");
    window.alert(
      "Mensagem registrada com sucesso. Em breve o suporte do FACTO responderá."
    );
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
          Nossa equipe responderá o mais breve possível.
        </p>
      </header>

      {sucesso && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Mensagem enviada. Você também pode falar conosco pelo WhatsApp na
          tela de elaboração de peças.
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
              {ASSUNTOS.map((opcao) => (
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

"use client";

import { useState } from "react";

/**
 * Dispara o mesmo fluxo de e-mails pós-compra, sem Mercado Pago / assinatura.
 */
export function TesteCompraEmailForm({
  emailInicial = "",
}: {
  emailInicial?: string;
}) {
  const [email, setEmail] = useState(emailInicial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErro(null);
    try {
      const res = await fetch("/api/admin/emails/teste-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        financeiroOk?: boolean;
        conviteOk?: boolean;
        motivoConvite?: string;
        mpPaymentId?: string;
        dica?: string;
      };
      if (!res.ok) {
        setErro(data.error ?? "Falha no teste.");
        return;
      }
      setMsg(
        [
          `Teste disparado (sem cobrança).`,
          `Financeiro: ${data.financeiroOk ? "ok" : "falhou"}.`,
          `Convite: ${data.conviteOk ? "ok" : data.motivoConvite ?? "não"}.`,
          `ID fictício: ${data.mpPaymentId ?? "—"}.`,
          data.dica ?? "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    } catch {
      setErro("Erro de rede no teste.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="mt-6 rounded-xl border border-sky-500/25 bg-sky-500/5 p-4"
    >
      <p className="text-sm font-medium text-sky-100">
        Teste de e-mails (compra falsa)
      </p>
      <p className="mt-1 text-xs text-stone-400">
        Envia os mesmos e-mails do pós-compra (financeiro@ + confirmação ao
        cliente + convite se não houver perfil), sem Mercado Pago e sem criar
        assinatura. Use um e-mail seu para conferir a caixa de entrada.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="seu-email@dominio.com"
          className="min-w-[240px] flex-1 rounded-lg border border-white/15 bg-facto-dark px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/30 disabled:opacity-50"
        >
          {busy ? "Enviando…" : "Disparar teste"}
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-emerald-200">{msg}</p>}
      {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
    </form>
  );
}

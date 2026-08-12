"use client";

import { useState } from "react";

export function ReenviarCompraEmailForm({
  emailInicial = "",
}: {
  emailInicial?: string;
}) {
  const [email, setEmail] = useState(emailInicial);
  const [forcar, setForcar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErro(null);
    try {
      const res = await fetch("/api/admin/emails/reenviar-compra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), force: forcar }),
      });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        financeiroOk?: boolean;
        conviteOk?: boolean;
        motivoConvite?: string;
        mpPaymentId?: string;
      };
      if (!res.ok) {
        setErro(data.error ?? "Falha ao reenviar.");
        return;
      }
      setMsg(
        `Disparado. Financeiro: ${data.financeiroOk ? "ok" : "falhou"}. Convite: ${
          data.conviteOk ? "ok" : data.motivoConvite ?? "não"
        }. Pagamento: ${data.mpPaymentId ?? "—"}. Atualize a lista abaixo.`
      );
    } catch {
      setErro("Erro de rede ao reenviar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <p className="text-sm font-medium text-stone-300">
        Reenviar e-mails da compra
      </p>
      <p className="mt-1 text-xs text-stone-500">
        Use quando o webhook não disparou financeiro@ / noreply@. Informe o
        e-mail do comprador no Mercado Pago. Marque “forçar” se o log já
        mostra enviado mas a caixa não recebeu.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="cliente@email.com"
          className="min-w-[240px] flex-1 rounded-lg border border-white/15 bg-facto-dark px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Enviando…" : "Reenviar agora"}
        </button>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-stone-500">
        <input
          type="checkbox"
          checked={forcar}
          onChange={(ev) => setForcar(ev.target.checked)}
          className="accent-facto-gold"
        />
        Forçar reenvio (ignora “já enviado”)
      </label>
      {msg && (
        <p className="mt-3 text-sm text-emerald-200">{msg}</p>
      )}
      {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
    </form>
  );
}

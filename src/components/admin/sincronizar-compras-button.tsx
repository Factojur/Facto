"use client";

import { useState } from "react";

export function SincronizarComprasButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function sincronizar() {
    setBusy(true);
    setMsg(null);
    setErro(null);
    try {
      const res = await fetch("/api/admin/sincronizar-compras", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        ok?: boolean;
        syncMp?: number;
        analisadas?: number;
      };
      if (!res.ok) {
        setErro(data.error ?? "Falha ao sincronizar.");
        return;
      }
      setMsg(
        `Sincronizado. MP→DB: ${data.syncMp ?? 0} preapproval(s). Assinaturas analisadas: ${data.analisadas ?? 0}.`
      );
    } catch {
      setErro("Erro de rede ao sincronizar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
      <p className="text-sm font-medium text-sky-100">Sincronizar Mercado Pago agora</p>
      <p className="mt-1 text-xs text-sky-100/70">
        Puxa assinaturas recentes do MP, grava no banco e dispara e-mails que faltaram.
        Use se o webhook atrasar (no plano Hobby o cron automático é só 1x/dia).
      </p>
      <button
        type="button"
        onClick={() => void sincronizar()}
        disabled={busy}
        className="mt-3 rounded-lg border border-sky-300/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:opacity-50"
      >
        {busy ? "Sincronizando…" : "Sincronizar MP agora"}
      </button>
      {msg && <p className="mt-3 text-sm text-emerald-200">{msg}</p>}
      {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
    </div>
  );
}

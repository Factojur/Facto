"use client";

import { useState } from "react";

type ConviteLinha = {
  id: string;
  email: string;
  status: string;
  token: string;
  mp_payment_id: string | null;
  criado_em: string;
  usado_em: string | null;
};

export function ConvitesAdminClient({
  iniciais,
}: {
  iniciais: ConviteLinha[];
}) {
  const [itens, setItens] = useState(iniciais);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function reenviar(id: string) {
    setBusyId(id);
    setMsg(null);
    setErro(null);
    try {
      const res = await fetch("/api/admin/convites/reenviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setErro(data.error ?? "Falha ao reenviar.");
        return;
      }
      setMsg("E-mail de convite reenviado.");
      setItens((prev) =>
        prev.map((c) =>
          c.id === id && c.status === "pendente" ? { ...c } : c
        )
      );
    } catch {
      setErro("Erro de rede ao reenviar.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6">
      {msg && (
        <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {msg}
        </p>
      )}
      {erro && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {erro}
        </p>
      )}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Criado</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">MP</th>
              <th className="px-4 py-3 font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {itens.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-stone-500"
                >
                  Nenhum convite encontrado.
                </td>
              </tr>
            )}
            {itens.map((c) => (
              <tr key={c.id} className="text-stone-300">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(c.criado_em).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3 capitalize">{c.status}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">
                  {c.mp_payment_id ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {c.status === "pendente" ? (
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => void reenviar(c.id)}
                      className="rounded-lg border border-facto-gold/40 px-3 py-1.5 text-xs font-medium text-facto-gold transition hover:bg-facto-gold/10 disabled:opacity-50"
                    >
                      {busyId === c.id ? "Enviando…" : "Reenviar e-mail"}
                    </button>
                  ) : (
                    <span className="text-xs text-stone-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

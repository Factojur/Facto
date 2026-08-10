"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BotaoMarcarComprasVistas() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/admin/marcar-acesso", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={loading}
      className="rounded-lg border border-facto-gold/40 bg-facto-gold/15 px-3 py-1.5 text-xs font-semibold text-facto-gold transition hover:bg-facto-gold/25 disabled:opacity-60"
    >
      {loading ? "Salvando…" : "Marcar como vistas"}
    </button>
  );
}

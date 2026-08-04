"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AceiteTermosModal({ aberto }: { aberto: boolean }) {
  const router = useRouter();
  const [marcado, setMarcado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!aberto) return null;

  async function aceitar() {
    if (!marcado) {
      setErro("Marque a confirmação para continuar.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/perfil/aceite-termos", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível registrar o aceite. Tente novamente.");
        setSalvando(false);
        return;
      }
      router.refresh();
    } catch {
      setErro("Falha na comunicação. Tente novamente.");
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aceite-termos-titulo"
    >
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-2xl">
        <h2
          id="aceite-termos-titulo"
          className="text-lg font-semibold text-slate-900"
        >
          Termos e Privacidade
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Antes de usar o FACTO, confirme que leu e concorda com os{" "}
          <Link
            href="/termos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-800 underline underline-offset-2 hover:text-stone-950"
          >
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-800 underline underline-offset-2 hover:text-stone-950"
          >
            Política de Privacidade
          </Link>
          .
        </p>

        <label className="mt-4 flex items-start gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={marcado}
            onChange={(e) => {
              setMarcado(e.target.checked);
              setErro(null);
            }}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-stone-700 focus:ring-stone-500"
          />
          <span>Li e concordo com os Termos de uso e a Política de Privacidade.</span>
        </label>

        {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

        <button
          type="button"
          onClick={() => void aceitar()}
          disabled={salvando || !marcado}
          className="mt-5 w-full rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-700 disabled:opacity-50"
        >
          {salvando ? "Registrando…" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CriarEscritorioForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [oab, setOab] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    const res = await fetch("/api/gestao/escritorio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeEscritorio: nome, oabResponsavel: oab }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErro(data.error ?? "Não foi possível criar o escritório.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-800 bg-stone-900/60 p-6"
    >
      <h2 className="text-lg font-medium text-white">Criar escritório</h2>
      <p className="mt-1 text-sm text-stone-400">
        Você será o administrador. Convide sócios e colaboradores depois.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-stone-300">
            Nome do escritório
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white outline-none focus:border-facto-gold"
            placeholder="Silva & Associados"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-300">
            OAB do responsável
          </label>
          <input
            value={oab}
            onChange={(e) => setOab(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white outline-none focus:border-facto-gold"
            placeholder="SP 123456"
          />
        </div>
      </div>
      {erro ? (
        <p className="mt-3 text-sm text-red-400">{erro}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark hover:bg-[#a39a78] disabled:opacity-50"
      >
        {loading ? "Criando…" : "Criar escritório"}
      </button>
    </form>
  );
}

export function EntrarConviteForm({ tokenInicial }: { tokenInicial?: string }) {
  const router = useRouter();
  const [token, setToken] = useState(tokenInicial ?? "");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    const res = await fetch("/api/gestao/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "aceitar", token, codigo }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErro(data.error ?? "Convite inválido.");
      setLoading(false);
      return;
    }
    router.push("/gestao");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-800 bg-stone-900/60 p-6"
    >
      <h2 className="text-lg font-medium text-white">Entrar por convite</h2>
      <p className="mt-1 text-sm text-stone-400">
        Cole o link ou o token que o administrador enviou. Código opcional.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm text-stone-300">Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white outline-none focus:border-facto-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-300">
            Código (se houver)
          </label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white outline-none focus:border-facto-gold"
            placeholder="ABC123"
          />
        </div>
      </div>
      {erro ? (
        <p className="mt-3 text-sm text-red-400">{erro}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg border border-facto-gold/50 px-4 py-2 text-sm font-medium text-facto-gold hover:bg-facto-gold/10 disabled:opacity-50"
      >
        {loading ? "Entrando…" : "Aceitar convite"}
      </button>
    </form>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
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
    const data = (await res.json()) as { error?: string; escritorio?: { id: string } };
    if (!res.ok) {
      if (data.error?.includes("já pertence")) {
        router.replace("/gestao");
        router.refresh();
        return;
      }
      setErro(data.error ?? "Não foi possível criar o escritório.");
      setLoading(false);
      return;
    }
    if (data.escritorio?.id) {
      router.replace("/gestao");
      router.refresh();
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
        Primeiro acesso do titular. Você será o administrador e poderá convidar
        sócios, colaboradores e estagiários em Equipe depois.
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
      {erro ? <p className="mt-3 text-sm text-red-400">{erro}</p> : null}
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
  const tokenUrl = tokenInicial?.trim() ?? "";
  const [token, setToken] = useState(tokenUrl);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const tentouAuto = useRef(false);

  async function aceitarConvite(
    tokenValor: string,
    codigoValor?: string
  ): Promise<boolean> {
    setLoading(true);
    setErro(null);
    const res = await fetch("/api/gestao/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acao: "aceitar",
        token: tokenValor,
        codigo: codigoValor?.trim() || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setErro(data.error ?? "Convite inválido.");
      setLoading(false);
      return false;
    }
    router.push("/gestao");
    router.refresh();
    return true;
  }

  useEffect(() => {
    if (!tokenUrl || tentouAuto.current) return;
    tentouAuto.current = true;
    void aceitarConvite(tokenUrl);
  }, [tokenUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await aceitarConvite(token, codigo);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-stone-800 bg-stone-900/60 p-6"
      >
        <h2 className="text-lg font-medium text-white">Aceitar convite</h2>
        <p className="mt-1 text-sm text-stone-400">
          {tokenUrl
            ? "Entrando pelo link… se não concluir sozinho, confira o código abaixo."
            : "Use o link enviado pelo administrador do escritório."}
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm text-stone-300">
              Token do convite
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              readOnly={Boolean(tokenUrl)}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-white outline-none focus:border-facto-gold read-only:opacity-80"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-stone-300">
              Código de confirmação
            </label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 uppercase tracking-widest text-white outline-none focus:border-facto-gold"
              placeholder="ABC123"
              maxLength={8}
            />
            <p className="mt-1 text-xs text-stone-500">
              O administrador envia o código junto com o link. Só é obrigatório
              se o aceite automático não funcionar.
            </p>
          </div>
        </div>
        {erro ? <p className="mt-3 text-sm text-red-400">{erro}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg border border-facto-gold/50 px-4 py-2 text-sm font-medium text-facto-gold hover:bg-facto-gold/10 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Aceitar convite"}
        </button>
      </form>
    </div>
  );
}

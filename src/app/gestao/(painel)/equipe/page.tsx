"use client";

import { useCallback, useEffect, useState } from "react";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoKpiCard, GestaoPainel } from "@/components/gestao/gestao-ui";

type Membro = {
  userId: string;
  nome: string;
  email: string;
  papel: string;
};

export default function GestaoEquipePage() {
  const [escritorioNome, setEscritorioNome] = useState("");
  const [ehAdmin, setEhAdmin] = useState(false);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [limite, setLimite] = useState(10);
  const [linkConvite, setLinkConvite] = useState<string | null>(null);
  const [codigoConvite, setCodigoConvite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/gestao/escritorio");
    const data = (await res.json()) as {
      escritorio?: { nome: string; limiteMembros: number };
      membro?: { papel: string };
      membros?: Membro[];
    };
    if (data.escritorio?.nome) setEscritorioNome(data.escritorio.nome);
    if (data.escritorio?.limiteMembros) setLimite(data.escritorio.limiteMembros);
    setEhAdmin(data.membro?.papel === "admin");
    setMembros(data.membros ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function gerarConvite() {
    setGerando(true);
    setErro(null);
    const res = await fetch("/api/gestao/convites", { method: "POST" });
    const data = (await res.json()) as {
      link?: string;
      convite?: { codigo: string };
      error?: string;
    };
    if (!res.ok) {
      setErro(data.error ?? "Não foi possível gerar o convite.");
      setGerando(false);
      return;
    }
    setLinkConvite(data.link ?? null);
    setCodigoConvite(data.convite?.codigo ?? null);
    setGerando(false);
  }

  async function copiarLink() {
    if (!linkConvite) return;
    try {
      await navigator.clipboard.writeText(linkConvite);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar. Selecione o link manualmente.");
    }
  }

  const admins = membros.filter((m) => m.papel === "admin").length;
  const colaboradores = membros.length - admins;
  const vagas = Math.max(0, limite - membros.length);

  return (
    <GestaoShell
      titulo="Equipe"
      subtitulo={`Membros do escritório · limite ${limite}`}
      escritorioNome={escritorioNome}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <GestaoKpiCard label="Membros" valor={membros.length} />
        <GestaoKpiCard label="Administradores" valor={admins} />
        <GestaoKpiCard label="Colaboradores" valor={colaboradores} />
        <GestaoKpiCard
          label="Vagas disponíveis"
          valor={vagas}
          destaque={vagas === 0 ? "danger" : undefined}
        />
      </div>

      {ehAdmin ? (
        <GestaoPainel titulo="Convidar membro">
          <p className="text-sm text-stone-400">
            Colaboradores acessam só o FACTO Gestão — não precisam de plano de
            minutas. O link expira em 14 dias.
          </p>
          <button
            type="button"
            onClick={() => void gerarConvite()}
            disabled={gerando || vagas === 0}
            className="mt-3 rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark disabled:opacity-50"
          >
            {gerando ? "Gerando…" : "Gerar link de convite"}
          </button>
          {vagas === 0 ? (
            <p className="mt-2 text-sm text-amber-400/90">
              Limite de membros atingido. Ajuste o plano de gestão para convidar
              mais pessoas.
            </p>
          ) : null}
          {erro ? <p className="mt-2 text-sm text-red-400">{erro}</p> : null}
          {linkConvite ? (
            <div className="mt-4 space-y-2 rounded-lg border border-stone-800 bg-stone-950/80 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-stone-400">Link de convite</p>
                <button
                  type="button"
                  onClick={() => void copiarLink()}
                  className="rounded-md border border-stone-700 px-2 py-1 text-xs text-stone-300 hover:border-facto-gold/40"
                >
                  {copiado ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <p className="break-all font-mono text-xs text-facto-gold">
                {linkConvite}
              </p>
              {codigoConvite ? (
                <p className="text-stone-300">
                  Código: <strong className="text-white">{codigoConvite}</strong>
                </p>
              ) : null}
            </div>
          ) : null}
        </GestaoPainel>
      ) : (
        <GestaoPainel titulo="Seu acesso">
          <p className="text-sm text-stone-400">
            Você entrou como colaborador. Apenas o administrador do escritório
            pode gerar convites e alterar limites.
          </p>
        </GestaoPainel>
      )}

      {loading ? (
        <p className="mt-6 text-stone-500">Carregando…</p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-800 rounded-xl border border-stone-800 bg-stone-900/20">
          {membros.map((m) => (
            <li
              key={m.userId}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-white">{m.nome}</p>
                <p className="text-stone-500">{m.email}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  m.papel === "admin"
                    ? "border-facto-gold/30 bg-facto-gold/10 text-facto-gold"
                    : "border-stone-700 bg-stone-800 text-stone-300"
                }`}
              >
                {m.papel === "admin" ? "Administrador" : "Colaborador"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GestaoShell>
  );
}

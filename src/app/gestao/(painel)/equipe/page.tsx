"use client";

import { useCallback, useEffect, useState } from "react";
import { GestaoInstrucoesEquipe } from "@/components/gestao/gestao-instrucoes-equipe";
import { rotuloPapelGestao } from "@/lib/gestao/gestao-permissoes";
import type { PapelGestao } from "@/lib/gestao/gestao-types";
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
  const [copiado, setCopiado] = useState<"link" | "tudo" | null>(null);

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
    setLinkConvite(null);
    setCodigoConvite(null);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch("/api/gestao/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: controller.signal,
      });
      const data = (await res.json()) as {
        link?: string;
        convite?: { codigo: string };
        error?: string;
      };
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível gerar o convite.");
        return;
      }
      setLinkConvite(data.link ?? null);
      setCodigoConvite(data.convite?.codigo ?? null);
    } catch (e) {
      const abortado = e instanceof DOMException && e.name === "AbortError";
      setErro(
        abortado
          ? "A geração demorou demais. Atualize a página e tente de novo."
          : "Falha de rede ao gerar o convite."
      );
    } finally {
      window.clearTimeout(timeout);
      setGerando(false);
    }
  }

  async function copiar(
    modo: "link" | "tudo"
  ) {
    if (!linkConvite) return;
    const texto =
      modo === "tudo" && codigoConvite
        ? `Convite FACTO Gestão\n\nLink: ${linkConvite}\nCódigo: ${codigoConvite}\n\nAbra o link, faça login na sua conta e aceite o convite. O código é solicitado na tela de entrada. Válido por 14 dias.`
        : linkConvite;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(modo);
      window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      setErro("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  async function alterarPapel(userId: string, papel: PapelGestao) {
    if (papel === "admin") return;
    const res = await fetch("/api/gestao/membros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, papel }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setErro(data.error ?? "Não foi possível alterar o papel.");
      return;
    }
    void carregar();
  }

  const vagas = Math.max(0, limite - membros.length);

  return (
    <GestaoShell
      titulo="Equipe"
      subtitulo={`${membros.length} de ${limite} vagas usadas`}
      escritorioNome={escritorioNome}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <GestaoKpiCard label="Membros ativos" valor={membros.length} />
        <GestaoKpiCard
          label="Vagas disponíveis"
          valor={vagas}
          destaque={vagas === 0 ? "danger" : undefined}
        />
      </div>

      <div className="mb-6">
        <GestaoInstrucoesEquipe variante="admin" />
      </div>

      {ehAdmin ? (
        <GestaoPainel titulo="Gerar convite">
          <p className="text-sm text-stone-400">
            Colaboradores, sócios e estagiários acessam só o FACTO Gestão — não
            precisam de plano de minutas. Envie <strong className="text-stone-300">link + código</strong> juntos.
          </p>
          <button
            type="button"
            onClick={() => void gerarConvite()}
            disabled={gerando || vagas === 0}
            className="mt-3 rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark disabled:opacity-50"
          >
            {gerando ? "Gerando link…" : "Gerar link de convite"}
          </button>
          {vagas === 0 ? (
            <p className="mt-2 text-sm text-amber-400/90">
              Limite de membros atingido. Ajuste o plano de gestão para convidar
              mais pessoas.
            </p>
          ) : null}
          {erro ? <p className="mt-2 text-sm text-red-400">{erro}</p> : null}
          {linkConvite ? (
            <div className="mt-4 space-y-3 rounded-lg border border-facto-gold/20 bg-stone-950/80 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-facto-gold">Convite pronto</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copiar("link")}
                    className="rounded-md border border-stone-700 px-2 py-1 text-xs text-stone-300 hover:border-facto-gold/40"
                  >
                    {copiado === "link" ? "Copiado!" : "Copiar link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copiar("tudo")}
                    className="rounded-md border border-facto-gold/40 bg-facto-gold/10 px-2 py-1 text-xs text-facto-gold"
                  >
                    {copiado === "tudo" ? "Copiado!" : "Copiar link + código"}
                  </button>
                </div>
              </div>
              <p className="break-all font-mono text-xs text-stone-300">
                {linkConvite}
              </p>
              {codigoConvite ? (
                <p className="text-stone-300">
                  Código de confirmação:{" "}
                  <strong className="text-lg tracking-widest text-white">
                    {codigoConvite}
                  </strong>
                </p>
              ) : null}
              <GestaoInstrucoesEquipe variante="convidado" />
              <p className="text-xs text-stone-500">
                Válido por 14 dias · uso único · a pessoa deve entrar com a
                própria conta FACTO
              </p>
            </div>
          ) : null}
        </GestaoPainel>
      ) : (
        <GestaoPainel titulo="Seu acesso">
          <p className="text-sm text-stone-400">
            Você entrou como colaborador. Apenas o administrador do escritório
            pode gerar convites.
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
              <div className="flex flex-wrap items-center gap-2">
                {ehAdmin && m.papel !== "admin" ? (
                  <select
                    value={m.papel}
                    onChange={(e) =>
                      void alterarPapel(
                        m.userId,
                        e.target.value as PapelGestao
                      )
                    }
                    className="rounded-md border border-stone-700 bg-stone-900 px-2 py-1 text-xs text-stone-300"
                    aria-label={`Papel de ${m.nome}`}
                  >
                    <option value="socio">Sócio</option>
                    <option value="colaborador">Colaborador</option>
                  </select>
                ) : (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      m.papel === "admin"
                        ? "border-facto-gold/30 bg-facto-gold/10 text-facto-gold"
                        : m.papel === "socio"
                          ? "border-sky-800/50 bg-sky-950/40 text-sky-300"
                          : "border-stone-700 bg-stone-800 text-stone-300"
                    }`}
                  >
                    {rotuloPapelGestao(m.papel)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </GestaoShell>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type ItemVerificacao = {
  id: string;
  titulo: string;
  ementa: string;
  tribunal: string | null;
  data_julgado: string | null;
  url: string | null;
  numero_processo: string | null;
  relator: string | null;
  fonte: string;
  status: string;
  aviso_duplicidade: boolean;
  motivo_aviso: string | null;
  similar_titulo: string | null;
  criado_em: string;
  prioridade?: number;
  escolhido_usuario?: boolean;
};

export function JurisVerificacaoManager() {
  const [status, setStatus] = useState<"pendente" | "aprovado" | "rejeitado">(
    "pendente"
  );
  const [itens, setItens] = useState<ItemVerificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoId, setAcaoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(
        `/api/admin/juris-verificacao?status=${status}`
      );
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Falha ao carregar fila.");
        setItens([]);
        return;
      }
      setItens(data.itens ?? []);
    } catch {
      setErro("Falha de rede.");
      setItens([]);
    } finally {
      setCarregando(false);
    }
  }, [status]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function agir(id: string, acao: "aprovar" | "rejeitar") {
    setAcaoId(id);
    setErro(null);
    try {
      const res = await fetch("/api/admin/juris-verificacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, acao }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível concluir a ação.");
        return;
      }
      setItens((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setErro("Falha de rede ao revisar.");
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pendente", "Pendentes"],
            ["aprovado", "Aprovados"],
            ["rejeitado", "Rejeitados"],
          ] as const
        ).map(([chave, label]) => (
          <button
            key={chave}
            type="button"
            onClick={() => setStatus(chave)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === chave
                ? "bg-facto-gold text-facto-dark"
                : "border border-white/15 text-stone-300 hover:border-facto-gold/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {erro && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="text-sm text-stone-400">Carregando…</p>
      ) : itens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-stone-500">
          Nenhum item com status “{status}”.
        </p>
      ) : (
        <ul className="space-y-4">
          {itens.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">{item.titulo}</h3>
                  <p className="mt-1 text-xs text-stone-500">
                    {[item.tribunal, item.fonte, item.numero_processo]
                      .filter(Boolean)
                      .join(" · ")}
                    {item.criado_em
                      ? ` · ${new Date(item.criado_em).toLocaleString("pt-BR")}`
                      : ""}
                  </p>
                </div>
                {item.escolhido_usuario && (
                  <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
                    Escolhido pelo usuário
                  </span>
                )}
                {item.aviso_duplicidade && (
                  <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200">
                    Possível duplicidade
                  </span>
                )}
              </div>

              {item.aviso_duplicidade && (
                <p className="mt-2 text-xs text-amber-200/90">
                  {item.motivo_aviso}
                  {item.similar_titulo
                    ? ` · Similar a: “${item.similar_titulo}”`
                    : ""}
                </p>
              )}

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-300">
                {item.ementa.length > 900
                  ? `${item.ementa.slice(0, 900)}…`
                  : item.ementa}
              </p>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-facto-gold underline"
                >
                  Abrir fonte oficial
                </a>
              )}

              {status === "pendente" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={acaoId === item.id}
                    onClick={() => void agir(item.id, "aprovar")}
                    className="rounded-lg bg-emerald-700/80 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {acaoId === item.id ? "…" : "Aprovar → base definitiva"}
                  </button>
                  <button
                    type="button"
                    disabled={acaoId === item.id}
                    onClick={() => void agir(item.id, "rejeitar")}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm text-stone-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSyncNuvemStatus,
  listarMinutasNuvem,
  listarSessoesChatNuvem,
  type MinutaHistoricoNuvem,
  type ChatSessaoNuvemResumo,
} from "@/lib/sync-nuvem-client";
import {
  listarSessoesChat,
  type ChatSessaoSalva,
} from "@/lib/chat-minuta-storage";
import { rotuloAreaChat } from "@/lib/chat-minuta";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";

export function MeusCasosPageClient() {
  const [optIn, setOptIn] = useState(false);
  const [local, setLocal] = useState<ChatSessaoSalva[]>([]);
  const [nuvemSessoes, setNuvemSessoes] = useState<ChatSessaoNuvemResumo[]>([]);
  const [nuvemMinutas, setNuvemMinutas] = useState<MinutaHistoricoNuvem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setLocal(listarSessoesChat());
    const status = await fetchSyncNuvemStatus();
    const ativo = Boolean(status?.optIn);
    setOptIn(ativo);
    if (ativo) {
      const [sessoes, minutas] = await Promise.all([
        listarSessoesChatNuvem(),
        listarMinutasNuvem(),
      ]);
      setNuvemSessoes(sessoes);
      setNuvemMinutas(minutas);
    } else {
      setNuvemSessoes([]);
      setNuvemMinutas([]);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-stone-900">Meus casos</h1>
        <p className="mt-2 text-sm text-stone-600">
          Conversas do assistente neste navegador e, com opt-in LGPD, cópia na
          nuvem para retomar em outro dispositivo.
        </p>
        {!optIn && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Ative a sincronização na aba{" "}
            <Link href="/dashboard" className="font-semibold underline">
              Assistente → Provas / lei e juris
            </Link>{" "}
            para backup de sessões e minutas na conta.
          </p>
        )}
      </header>

      <section>
        <h2 className="text-lg font-semibold text-stone-800">
          Conversas (este navegador)
        </h2>
        {local.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Nenhuma conversa salva ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {local.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard?sessao=${encodeURIComponent(s.id)}`}
                  className="block rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400"
                >
                  <p className="font-medium text-stone-900">{s.titulo}</p>
                  <p className="text-xs text-stone-500">
                    {rotuloAreaChat(s.areaId as AreaIdMinuta)} ·{" "}
                    {new Date(s.atualizadoEm).toLocaleString("pt-BR")} ·{" "}
                    {s.historicoPecas.length} peça(s)
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard"
          className="mt-3 inline-block text-sm font-medium text-stone-700 underline"
        >
          Abrir assistente
        </Link>
      </section>

      {optIn && (
        <>
          <section>
            <h2 className="text-lg font-semibold text-stone-800">
              Sessões na nuvem
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Continuar baixa o snapshot para este navegador e abre o assistente.
            </p>
            {carregando ? (
              <p className="mt-2 text-sm text-stone-500">Carregando…</p>
            ) : nuvemSessoes.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                Nenhuma sessão sincronizada ainda.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {nuvemSessoes.map((s) => {
                  const tambemLocal = local.some((l) => l.id === s.sessaoId);
                  return (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-stone-900">{s.titulo}</p>
                        <p className="text-xs text-stone-500">
                          {rotuloAreaChat(s.areaId as AreaIdMinuta)} ·{" "}
                          {new Date(s.atualizadoEm).toLocaleString("pt-BR")}
                          {tambemLocal ? " · também neste navegador" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard?sessaoNuvem=${encodeURIComponent(s.sessaoId)}`}
                        onClick={() => setRestaurandoId(s.sessaoId)}
                        className="shrink-0 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-stone-700"
                      >
                        {restaurandoId === s.sessaoId
                          ? "Abrindo…"
                          : "Continuar no assistente"}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-800">
              Minutas na nuvem
            </h2>
            {nuvemMinutas.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">Nenhuma minuta salva.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {nuvemMinutas.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg border border-stone-200 bg-white px-4 py-3"
                  >
                    <p className="font-medium text-stone-900">{m.titulo}</p>
                    <p className="text-xs text-stone-500">
                      {rotuloAreaChat(m.areaId as AreaIdMinuta)} ·{" "}
                      {new Date(m.atualizadoEm).toLocaleString("pt-BR")} ·{" "}
                      {m.origem}
                    </p>
                    {m.resumo ? (
                      <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                        {m.resumo}
                      </p>
                    ) : null}
                    {m.sessaoId ? (
                      <Link
                        href={`/dashboard?sessaoNuvem=${encodeURIComponent(m.sessaoId)}`}
                        className="mt-2 inline-block text-xs font-medium text-stone-700 underline"
                      >
                        Abrir conversa relacionada
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <h2 className="text-sm font-semibold text-stone-800">
          Casos JEC (fluxo por fase)
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Acompanhamento de fases e eventos no módulo JEC — distinto do assistente
          de chat.
        </p>
        <Link
          href="/dashboard/jec/casos"
          className="mt-2 inline-block text-sm font-medium text-stone-700 underline"
        >
          Abrir Meus casos JEC
        </Link>
      </section>
    </div>
  );
}

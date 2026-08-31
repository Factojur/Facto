"use client";

import Link from "next/link";
import {
  excluirSessaoChat,
  listarSessoesChat,
  type ChatSessaoSalva,
} from "@/lib/chat-minuta-storage";
import { rotuloAreaChat } from "@/lib/chat-minuta";
import { PainelLateralPortal } from "@/components/dashboard/painel-lateral-portal";

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ChatSessoesPainel({
  aberto,
  sessaoAtivaId,
  onFechar,
  onNova,
  onAbrir,
}: {
  aberto: boolean;
  sessaoAtivaId: string | null;
  onFechar: () => void;
  onNova: () => void;
  onAbrir: (sessao: ChatSessaoSalva) => void;
}) {
  const sessoes = listarSessoesChat();

  return (
    <PainelLateralPortal
      aberto={aberto}
      onFechar={onFechar}
      ariaLabel="Conversas salvas"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold text-stone-900">Conversas salvas</h3>
        <button
          type="button"
          onClick={onFechar}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          Fechar
        </button>
      </div>
      <div className="border-b px-4 py-3">
        <button
          type="button"
          onClick={onNova}
          className="w-full rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-amber-50 hover:bg-stone-700"
        >
          Nova conversa
          <span className="mt-0.5 block text-[11px] font-normal opacity-80">
            O caso atual fica salvo nesta lista
          </span>
        </button>
        <p className="mt-2 text-xs text-stone-500">
          Salvo neste navegador. Com opt-in, também na nuvem —{" "}
          <Link href="/dashboard/meus-casos" className="underline">
            Meus casos
          </Link>{" "}
          para retomar em outro PC.{" "}
          <Link href="/privacidade" className="underline">
            Privacidade
          </Link>
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {sessoes.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-stone-500">
            Nenhuma conversa salva ainda.
          </p>
        ) : (
          <ul className="space-y-1">
            {sessoes.map((s) => (
              <li key={s.id}>
                <div
                  className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
                    s.id === sessaoAtivaId
                      ? "border-facto-gold/50 bg-amber-50/60"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onAbrir(s)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-stone-900">
                      {s.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {rotuloAreaChat(s.areaId)} · {formatarData(s.atualizadoEm)}
                      {s.historicoPecas.length > 0
                        ? ` · ${s.historicoPecas.length} peça(s)`
                        : ""}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir conversa"
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Excluir esta conversa deste navegador?"
                        )
                      ) {
                        return;
                      }
                      excluirSessaoChat(s.id);
                      onFechar();
                      if (s.id === sessaoAtivaId) onNova();
                    }}
                    className="shrink-0 rounded p-1 text-xs text-stone-400 hover:bg-red-50 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PainelLateralPortal>
  );
}

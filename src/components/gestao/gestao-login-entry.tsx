"use client";

import Link from "next/link";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";

type Props = {
  /** Convite de equipe (query ?convite=) */
  convite?: string | null;
  /** Destaque quando o usuário já veio com ?destino=gestao */
  modoGestao?: boolean;
  /** Abre em nova aba (recomendado: minutas numa aba, gestão noutra) */
  novaAba?: boolean;
  /** Só o aviso, sem botão (quando já está na tela de login da gestão) */
  somenteAviso?: boolean;
  className?: string;
};

function hrefGestao(convite?: string | null): string {
  if (convite?.trim()) {
    return `/gestao/entrar?convite=${encodeURIComponent(convite.trim())}`;
  }
  return "/gestao/login";
}

/**
 * Entrada FACTO Gestão na página de login — link direto para /gestao
 * (middleware redireciona ao login se necessário, com destino=gestao).
 */
export function GestaoLoginEntry({
  convite,
  modoGestao = false,
  novaAba = true,
  somenteAviso = false,
  className = "",
}: Props) {
  if (!gestaoHabilitada()) return null;

  const destino = hrefGestao(convite);

  const aviso = modoGestao ? (
    <div className="rounded-lg border border-facto-gold/35 bg-facto-gold/10 px-4 py-3 text-sm text-stone-200">
      <p className="font-medium text-facto-gold">Acesso à gestão do escritório</p>
      <p className="mt-1 text-xs text-stone-400">
        Após entrar, você será direcionado ao FACTO Gestão (processos, prazos e
        agenda).
      </p>
    </div>
  ) : null;

  if (somenteAviso) {
    return aviso ? <div className={className}>{aviso}</div> : null;
  }

  return (
    <div className={className}>
      {aviso}

      <Link
        href={destino}
        target={novaAba ? "_blank" : undefined}
        rel={novaAba ? "noopener noreferrer" : undefined}
        className="group flex w-full items-center gap-4 rounded-xl border border-stone-700/80 bg-stone-900/60 p-4 text-left transition hover:border-facto-gold/50 hover:bg-stone-900"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-facto-gold/30 bg-facto-gold/10 text-facto-gold transition group-hover:border-facto-gold/60 group-hover:bg-facto-gold/15"
          aria-hidden
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-100 group-hover:text-white">
              FACTO Gestão
            </span>
            <span className="rounded-full border border-amber-700/50 bg-amber-950/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/90">
              Local
            </span>
          </span>
          <span className="mt-0.5 block text-xs text-stone-500 group-hover:text-stone-400">
            Processos, prazos e agenda do escritório — sem minutas
            {novaAba ? " · abre em nova aba" : ""}
          </span>
        </span>

        <svg
          className="h-4 w-4 shrink-0 text-stone-600 transition group-hover:text-facto-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          {novaAba ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          )}
        </svg>
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";

/**
 * Atalho para FACTO Gestão na topbar do dashboard (ao lado do plano).
 * Visível só quando o módulo está habilitado (dev ou NEXT_PUBLIC_FACTO_GESTAO=1).
 */
export function BotaoGestaoTopbar() {
  if (!gestaoHabilitada()) return null;

  return (
    <Link
      href="/gestao"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-[9.5rem] items-center justify-center gap-1 truncate rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-stone-300 transition hover:border-facto-gold/40 hover:text-facto-gold sm:max-w-none sm:px-3 sm:text-xs"
      title="FACTO Gestão — processos, prazos e agenda do escritório"
    >
      <svg
        className="hidden h-3.5 w-3.5 shrink-0 sm:block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Gestão
    </Link>
  );
}

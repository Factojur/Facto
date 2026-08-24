"use client";

import Link from "next/link";
import type { PlanoId } from "@/lib/planos-facto";

/** Rótulo curto na topbar (ao lado do avatar). */
export function rotuloBotaoPlanoTopbar(plano: PlanoId | null | undefined): {
  label: string;
  ehTrial: boolean;
} {
  if (!plano || plano === "trial") {
    return { label: "Assinar plano", ehTrial: true };
  }
  if (plano === "jec") return { label: "Plano JEC", ehTrial: false };
  if (plano === "mensal" || plano === "anual") {
    return { label: "Plano Completo", ehTrial: false };
  }
  if (plano === "pro" || plano === "pro_anual") {
    return { label: "Plano Pro", ehTrial: false };
  }
  if (
    plano === "escritorio_s" ||
    plano === "escritorio_m" ||
    plano === "escritorio_s_anual" ||
    plano === "escritorio_m_anual"
  ) {
    return { label: "Plano Escritório", ehTrial: false };
  }
  return { label: "Assinar plano", ehTrial: true };
}

/**
 * Status do plano ao lado do avatar.
 * Trial → Assinar plano (destaque). Pago → rótulo do plano.
 */
export function BotaoPlanoTopbar({
  plano,
}: {
  plano: PlanoId | null | undefined;
}) {
  const { label, ehTrial } = rotuloBotaoPlanoTopbar(plano);
  const href = ehTrial ? "/#precos" : "/dashboard/perfil#assinatura";

  return (
    <Link
      href={href}
      className={
        ehTrial
          ? "inline-flex max-w-[9.5rem] items-center justify-center truncate rounded-full border border-facto-gold/50 bg-facto-gold/15 px-2.5 py-1.5 text-[11px] font-semibold text-facto-gold shadow-[0_0_16px_-6px_rgba(144,139,106,0.55)] transition hover:border-facto-gold hover:bg-facto-gold/25 sm:max-w-none sm:px-3 sm:text-xs"
          : "inline-flex max-w-[9.5rem] items-center justify-center truncate rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-stone-300 transition hover:border-facto-gold/40 hover:text-facto-gold sm:max-w-none sm:px-3 sm:text-xs"
      }
      title={label}
    >
      {label}
    </Link>
  );
}

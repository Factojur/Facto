"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { BotaoPlanoTopbar } from "@/components/dashboard/botao-plano-topbar";
import { UserMenu } from "@/components/dashboard/user-menu";
import type { PerfilResumo } from "@/lib/perfil-types";
import type { PlanoId } from "@/lib/planos-facto";

export function DashboardTopBar({
  perfil,
  plano = null,
  mostrarMenuMobile = false,
  menuMobileAberto = false,
  onToggleMenuMobile,
}: {
  perfil: PerfilResumo;
  plano?: PlanoId | null;
  mostrarMenuMobile?: boolean;
  menuMobileAberto?: boolean;
  onToggleMenuMobile?: () => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";

  const botoesDireita = (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      {isHome && (
        <Link
          href="/dashboard/meus-casos"
          className="hidden text-xs font-medium text-stone-400 transition hover:text-facto-gold sm:block"
        >
          Meus casos
        </Link>
      )}
      {!isHome && (
        <Link
          href="/dashboard"
          className="hidden text-sm font-medium text-stone-400 transition hover:text-facto-gold sm:block"
        >
          ← Assistente
        </Link>
      )}
      <BotaoPlanoTopbar plano={plano} />
      <UserMenu perfil={perfil} />
    </div>
  );

  return (
    <header className="sticky top-0 z-30 overflow-visible border-b border-stone-800/60 bg-facto-dark">
      <div className="relative flex w-full items-center px-4 py-1 md:px-6">
        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {mostrarMenuMobile && (
            <button
              type="button"
              onClick={onToggleMenuMobile}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-700 text-stone-200 transition hover:border-facto-gold/50 hover:text-facto-gold md:hidden"
              aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuMobileAberto}
            >
              <span aria-hidden className="text-lg leading-none">
                {menuMobileAberto ? "✕" : "☰"}
              </span>
            </button>
          )}
          <Link href="/dashboard" className="min-w-0 shrink-0">
            <FactoLogo variant="stacked" size="xs" showTagline />
          </Link>
        </div>

        <div className="flex-1" />

        <div className="relative z-10 ml-auto">{botoesDireita}</div>
      </div>
    </header>
  );
}

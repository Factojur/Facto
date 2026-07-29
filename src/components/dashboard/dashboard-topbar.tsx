"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { UserMenu } from "@/components/dashboard/user-menu";
import type { PerfilResumo } from "@/lib/perfil-types";

export function DashboardTopBar({ perfil }: { perfil: PerfilResumo }) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-stone-800/60 bg-facto-dark">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6 md:py-4">
        <Link href="/dashboard" className="min-w-0 shrink">
          <FactoLogo variant="stacked" size="xs" showTagline />
        </Link>

        <div className="flex-1" />

        {!isHome && (
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-stone-400 transition hover:text-facto-gold sm:block"
          >
            ← Portal
          </Link>
        )}

        <UserMenu perfil={perfil} />
      </div>
    </header>
  );
}

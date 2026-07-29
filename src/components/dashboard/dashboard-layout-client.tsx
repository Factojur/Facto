"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import type { PerfilResumo } from "@/lib/perfil-types";

export function DashboardLayoutClient({
  children,
  perfil,
}: {
  children: React.ReactNode;
  perfil: PerfilResumo;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isPerfil = pathname === "/dashboard/perfil";

  if (isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-facto-dark">
        <DashboardTopBar perfil={perfil} />
        <main className="flex-1 overflow-x-clip">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardTopBar perfil={perfil} />
      <div className="flex flex-1 overflow-hidden">
        {!isPerfil && <DashboardSidebar />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
            <div
              className={`mx-auto text-slate-800 ${isPerfil ? "max-w-3xl" : "max-w-4xl"}`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DashboardSidebar,
  DashboardSidebarMobile,
} from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { WhatsAppFloat } from "@/components/whatsapp-float";
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
  const isSuporte = pathname.startsWith("/dashboard/suporte");
  const mostraSidebar = !isHome && !isPerfil && !isSuporte;
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Fecha a gaveta ao trocar de rota (ex.: voltar pro portal).
  useEffect(() => {
    setMenuMobileAberto(false);
  }, [pathname]);

  if (isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-facto-dark">
        <DashboardTopBar perfil={perfil} />
        <main className="flex-1 overflow-x-clip">{children}</main>
        <WhatsAppFloat />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardTopBar
        perfil={perfil}
        mostrarMenuMobile={mostraSidebar}
        menuMobileAberto={menuMobileAberto}
        onToggleMenuMobile={() => setMenuMobileAberto((v) => !v)}
      />
      {mostraSidebar && (
        <DashboardSidebarMobile
          aberto={menuMobileAberto}
          onFechar={() => setMenuMobileAberto(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {mostraSidebar && <DashboardSidebar />}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 sm:p-6 md:p-8">
            <div
              className={`mx-auto min-w-0 text-slate-800 ${isPerfil || isSuporte ? "max-w-3xl" : "max-w-4xl"}`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      <WhatsAppFloat />
    </div>
  );
}

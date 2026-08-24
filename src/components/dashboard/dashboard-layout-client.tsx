"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DashboardSidebar,
  DashboardSidebarMobile,
  gravarSidebarRecolhida,
  lerSidebarRecolhida,
} from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { AceiteTermosModal } from "@/components/dashboard/aceite-termos-modal";
import type { PerfilResumo } from "@/lib/perfil-types";
import type { PlanoId } from "@/lib/planos-facto";

export function DashboardLayoutClient({
  children,
  perfil,
  plano = null,
  precisaAceiteTermos = false,
}: {
  children: React.ReactNode;
  perfil: PerfilResumo;
  plano?: PlanoId | null;
  precisaAceiteTermos?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";
  const isPerfil = pathname === "/dashboard/perfil";
  const isSuporte = pathname.startsWith("/dashboard/suporte");
  const isPlanos = pathname === "/dashboard/planos";
  const mostraSidebar = !isHome && !isPerfil && !isSuporte && !isPlanos;
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = useState(false);

  // Fecha a gaveta ao trocar de rota (ex.: voltar pro portal).
  useEffect(() => {
    setMenuMobileAberto(false);
  }, [pathname]);

  useEffect(() => {
    setSidebarRecolhida(lerSidebarRecolhida());
  }, []);

  function toggleSidebarRecolhida() {
    setSidebarRecolhida((atual) => {
      const proximo = !atual;
      gravarSidebarRecolhida(proximo);
      return proximo;
    });
  }

  if (isHome) {
    return (
      <div className="flex min-h-screen flex-col bg-facto-dark">
        <DashboardTopBar perfil={perfil} plano={plano} />
        <main className="flex-1 overflow-x-clip">{children}</main>
        <WhatsAppFloat />
        <AceiteTermosModal aberto={precisaAceiteTermos} />
      </div>
    );
  }

  if (isPlanos) {
    return (
      <div className="flex min-h-screen flex-col bg-facto-dark">
        <DashboardTopBar perfil={perfil} plano={plano} />
        <main className="flex-1 overflow-y-auto overflow-x-clip px-4 py-8 sm:px-6 md:px-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
        <WhatsAppFloat />
        <AceiteTermosModal aberto={precisaAceiteTermos} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardTopBar
        perfil={perfil}
        plano={plano}
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
        {mostraSidebar && (
          <DashboardSidebar
            recolhida={sidebarRecolhida}
            onToggleRecolhida={toggleSidebarRecolhida}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 sm:p-6 md:p-8">
            <div
              className={`mx-auto min-w-0 text-slate-800 ${
                isPerfil || isSuporte ? "max-w-3xl" : "max-w-4xl"
              }`}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      <WhatsAppFloat />
      <AceiteTermosModal aberto={precisaAceiteTermos} />
    </div>
  );
}

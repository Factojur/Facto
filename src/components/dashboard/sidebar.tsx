"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { areaIdFromPathname, moduloDaArea } from "@/lib/minuta-modulo";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const modulo = moduloDaArea(areaIdFromPathname(pathname));

  const navItems = [
    {
      href: "/dashboard",
      label: "Início",
      icon: "⌂",
      match: (path: string) => path === "/dashboard",
    },
    {
      href: modulo.href,
      label: modulo.rotuloNav,
      icon: "⚖️",
      match: (path: string) =>
        path === modulo.href || path.startsWith(`${modulo.href}/`),
    },
    {
      href: "/dashboard/suporte",
      label: "Suporte",
      icon: "💬",
      match: (path: string) => path.startsWith("/dashboard/suporte"),
    },
  ];

  return (
    <>
      <div className="border-b border-stone-800 px-5 py-6">
        <Link href="/dashboard" className="block" onClick={onNavigate}>
          <FactoLogo variant="brain" size="sm" showTagline />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Navegação
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-l-2 border-facto-gold bg-stone-800 font-medium text-stone-100"
                      : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-stone-800 p-4">
        <Link
          href="/dashboard/perfil"
          onClick={onNavigate}
          className="block w-full rounded-lg border border-stone-700 px-4 py-2 text-center text-sm font-medium text-stone-300 transition hover:border-stone-600 hover:bg-stone-800 hover:text-white"
        >
          Meu perfil
        </Link>
      </div>
    </>
  );
}

/** Sidebar fixa — só aparece em telas md+ (desktop/tablet). */
export function DashboardSidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col bg-facto-dark text-stone-100 md:flex">
      <SidebarNav />
    </aside>
  );
}

/** Menu lateral em gaveta — só no celular. */
export function DashboardSidebarMobile({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-black/55"
        onClick={onFechar}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-facto-dark text-stone-100 shadow-2xl">
        <div className="flex items-center justify-end border-b border-stone-800 px-3 py-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-3 py-1.5 text-sm text-stone-400 transition hover:bg-stone-800 hover:text-white"
            aria-label="Fechar menu"
          >
            Fechar ✕
          </button>
        </div>
        <SidebarNav onNavigate={onFechar} />
      </aside>
    </div>
  );
}

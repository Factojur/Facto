"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { MenuIcon, type MenuIconName } from "@/components/dashboard/menu-icons";

const STORAGE_KEY = "facto-sidebar-recolhida";

export function lerSidebarRecolhida(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function gravarSidebarRecolhida(recolhida: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, recolhida ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function IconePerfil({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-4 w-4 shrink-0"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5" />
    </svg>
  );
}

function SidebarNav({
  onNavigate,
  recolhida = false,
}: {
  onNavigate?: () => void;
  recolhida?: boolean;
}) {
  const pathname = usePathname();

  const navItems: {
    href: string;
    label: string;
    icon: MenuIconName;
    match: (path: string) => boolean;
  }[] = [
    {
      href: "/dashboard",
      label: "Assistente",
      icon: "spark",
      match: (path: string) =>
        path === "/dashboard" || path.startsWith("/dashboard/chat"),
    },
    {
      href: "/dashboard/meus-casos",
      label: "Meus casos",
      icon: "file",
      match: (path: string) => path.startsWith("/dashboard/meus-casos"),
    },
    {
      href: "/dashboard/suporte",
      label: "Suporte",
      icon: "chat",
      match: (path: string) => path.startsWith("/dashboard/suporte"),
    },
  ];

  return (
    <>
      <div
        className={`border-b border-stone-800 ${
          recolhida ? "px-2 py-4" : "px-5 py-6"
        }`}
      >
        <Link
          href="/dashboard"
          className="block"
          onClick={onNavigate}
          title="FACTO — início"
        >
          <FactoLogo
            variant="brain"
            size={recolhida ? "xs" : "sm"}
            showTagline={!recolhida}
          />
        </Link>
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-6 ${
          recolhida ? "px-1.5" : "px-3"
        }`}
      >
        {!recolhida && (
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Navegação
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={item.label}
                  aria-label={item.label}
                  className={`flex items-center rounded-lg text-sm transition ${
                    recolhida
                      ? "justify-center px-2 py-2.5"
                      : "gap-2.5 px-3 py-2.5"
                  } ${
                    active
                      ? recolhida
                        ? "bg-stone-800 font-medium text-stone-100 ring-1 ring-facto-gold/50"
                        : "border-l-2 border-facto-gold bg-stone-800 font-medium text-stone-100"
                      : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <MenuIcon name={item.icon} />
                  {!recolhida && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`border-t border-stone-800 ${recolhida ? "p-2" : "p-4"}`}
      >
        <Link
          href="/dashboard/perfil"
          onClick={onNavigate}
          title="Meu perfil"
          aria-label="Meu perfil"
          className={`flex w-full items-center rounded-lg border border-stone-700 text-sm font-medium text-stone-300 transition hover:border-stone-600 hover:bg-stone-800 hover:text-white ${
            recolhida
              ? "justify-center px-2 py-2.5"
              : "justify-center px-4 py-2 text-center"
          }`}
        >
          {recolhida ? (
            <IconePerfil className="h-4 w-4 text-facto-gold/85" />
          ) : (
            "Meu perfil"
          )}
        </Link>
      </div>
    </>
  );
}

/** Sidebar fixa — só aparece em telas md+ (desktop/tablet). Retrátil para trilho de ícones. */
export function DashboardSidebar({
  recolhida,
  onToggleRecolhida,
}: {
  recolhida: boolean;
  onToggleRecolhida: () => void;
}) {
  return (
    <aside
      className={`hidden h-full shrink-0 flex-col bg-facto-dark text-stone-100 transition-[width] duration-200 ease-out md:flex ${
        recolhida ? "w-16" : "w-64"
      }`}
    >
      <SidebarNav recolhida={recolhida} />
      <div
        className={`border-t border-stone-800 ${recolhida ? "p-2" : "px-4 py-3"}`}
      >
        <button
          type="button"
          onClick={onToggleRecolhida}
          title={recolhida ? "Expandir menu" : "Recolher menu"}
          aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!recolhida}
          className={`flex w-full items-center rounded-lg border border-stone-700 text-stone-400 transition hover:border-stone-600 hover:bg-stone-800 hover:text-stone-100 ${
            recolhida
              ? "justify-center px-2 py-2"
              : "justify-between gap-2 px-3 py-2 text-xs font-medium"
          }`}
        >
          {!recolhida && <span>Recolher</span>}
          <span aria-hidden className="text-base leading-none">
            {recolhida ? "»" : "«"}
          </span>
        </button>
      </div>
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

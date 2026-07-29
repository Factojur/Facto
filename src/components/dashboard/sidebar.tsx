"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";

const navItems = [
  {
    href: "/dashboard",
    label: "Início",
    icon: "⌂",
    match: (path: string) => path === "/dashboard",
  },
  {
    href: "/dashboard/jec",
    label: "Juizado Especial Cível",
    icon: "⚖️",
    match: (path: string) => path.startsWith("/dashboard/jec"),
  },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-facto-dark text-stone-100">
      <div className="border-b border-stone-800 px-5 py-6">
        <Link href="/dashboard" className="block">
          <FactoLogo variant="horizontal" size="sm" showTagline />
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
          className="block w-full rounded-lg border border-stone-700 px-4 py-2 text-center text-sm font-medium text-stone-300 transition hover:border-stone-600 hover:bg-stone-800 hover:text-white"
        >
          Meu perfil
        </Link>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { useGestaoPainel } from "@/components/gestao/gestao-painel-context";
import { rotuloPapelGestao } from "@/lib/gestao/gestao-permissoes";

const NAV_BASE = [
  { href: "/gestao", label: "Início", exact: true },
  { href: "/gestao/processos", label: "Processos" },
  { href: "/gestao/clientes", label: "Clientes" },
  { href: "/gestao/prazos", label: "Prazos" },
  { href: "/gestao/agenda", label: "Agenda" },
  { href: "/gestao/honorarios", label: "Honorários", requerHonorarios: true },
  { href: "/gestao/equipe", label: "Equipe" },
] as const;

export function GestaoShell({
  children,
  titulo,
  subtitulo,
  escritorioNome,
  nomeUsuario,
  papel,
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  escritorioNome?: string;
  nomeUsuario?: string;
  papel?: string;
}) {
  const pathname = usePathname();
  const { podeVerHonorarios, papel: papelCtx } = useGestaoPainel();
  const papelEfetivo = papel ?? papelCtx;
  const nav = NAV_BASE.filter(
    (item) => !("requerHonorarios" in item && item.requerHonorarios) || podeVerHonorarios
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="sticky top-0 z-20 border-b border-stone-800 bg-stone-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link href="/gestao" className="flex items-center gap-3">
            <FactoLogo variant="icon" size="xs" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-facto-gold">
                FACTO Gestão
              </p>
              {escritorioNome ? (
                <p className="text-xs text-stone-500">{escritorioNome}</p>
              ) : null}
            </div>
          </Link>

          <nav className="flex flex-wrap gap-1 rounded-xl border border-stone-800/80 bg-stone-900/50 p-1">
            {nav.map((item) => {
              const ativo =
                "exact" in item && item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    ativo
                      ? "bg-facto-gold/15 font-medium text-facto-gold"
                      : "text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {nomeUsuario ? (
              <span className="hidden text-xs text-stone-500 sm:inline">
                {nomeUsuario}
                {papelEfetivo
                  ? ` · ${rotuloPapelGestao(papelEfetivo)}`
                  : ""}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 border-b border-stone-800/80 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {titulo}
          </h1>
          {subtitulo ? (
            <p className="mt-1 text-sm text-stone-500">{subtitulo}</p>
          ) : null}
        </div>
        {children}
      </main>

      <footer className="border-t border-stone-800 py-6 text-center text-xs text-stone-600">
        FACTO Gestão · operação do escritório
      </footer>
    </div>
  );
}

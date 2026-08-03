import Link from "next/link";
import type { ReactNode } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";

export function LegalShell({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800">
      <header className="border-b border-stone-200 bg-[#1c1c16] px-6 py-5 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" aria-label="FACTO — início">
            <FactoLogo variant="horizontal" size="sm" />
          </Link>
          <nav className="flex gap-4 text-sm text-stone-400">
            <Link href="/privacidade" className="hover:text-amber-100/90">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-amber-100/90">
              Termos
            </Link>
            <Link href="/login" className="hover:text-amber-100/90">
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-stone-900">
          {titulo}
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Última atualização: 3 de agosto de 2026
        </p>
        <div className="prose-legal mt-10 space-y-6 text-[15px] leading-relaxed text-stone-700">
          {children}
        </div>
      </main>

      <footer className="border-t border-stone-200 px-6 py-8 text-center text-xs text-stone-500 md:px-10">
        <p>
          Dúvidas:{" "}
          <a
            href="mailto:privacidade@factoia.com.br"
            className="text-stone-700 underline-offset-2 hover:underline"
          >
            privacidade@factoia.com.br
          </a>
          {" · "}
          Financeiro:{" "}
          <a
            href="mailto:financeiro@factoia.com.br"
            className="text-stone-700 underline-offset-2 hover:underline"
          >
            financeiro@factoia.com.br
          </a>
        </p>
        <p className="mt-2">© {new Date().getFullYear()} FACTO</p>
      </footer>
    </div>
  );
}

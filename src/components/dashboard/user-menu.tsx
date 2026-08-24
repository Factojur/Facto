"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PerfilResumo } from "@/lib/perfil-types";

import { isAdminEmail } from "@/lib/admin-auth";
import { MenuIcon } from "@/components/dashboard/menu-icons";

const LINKS_ADMIN = [
  { label: "Aceites (Termos)", href: "/admin/aceites", icon: "check" as const },
  { label: "Financeiro", href: "/admin", icon: "chart" as const },
  { label: "Uso de peças", href: "/admin/uso-pecas", icon: "doc" as const },
  { label: "Convites", href: "/admin/convites", icon: "mail" as const },
  { label: "Log de e-mails", href: "/admin/emails", icon: "broadcast" as const },
  { label: "Base de Conhecimento", href: "/admin/conhecimento", icon: "layers" as const },
  {
    label: "Verificação de julgados",
    href: "/admin/juris-verificacao",
    icon: "search" as const,
  },
  { label: "Teste de IA (sandbox)", href: "/admin/teste-ia", icon: "flask" as const },
] as const;

const LINKS_DESENVOLVIMENTO = [
  { label: "GitHub", href: "https://github.com/Factojur/Facto", icon: "github" as const },
  { label: "Vercel", href: "https://vercel.com/dashboard", icon: "triangle" as const },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard/project/jnlhbrwrirbjpnhymauu",
    icon: "database" as const,
  },
  { label: "Node.js", href: "https://nodejs.org", icon: "node" as const },
  { label: "Resend", href: "https://resend.com/overview", icon: "mail" as const },
  {
    label: "Sentry",
    href: "https://us.sentry.io/issues/?project=4511847845068800",
    icon: "target" as const,
  },
  {
    label: "Google AI Studio",
    href: "https://aistudio.google.com/api-keys",
    icon: "spark" as const,
  },
  { label: "Registro.br", href: "https://registro.br/painel", icon: "globe" as const },
  {
    label: "Cloudflare",
    href: "https://dash.cloudflare.com",
    icon: "cloud" as const,
  },
  {
    label: "Mercado Pago",
    href: "https://www.mercadopago.com.br/developers/panel",
    icon: "card" as const,
  },
  {
    label: "Asaas",
    href: "https://www.asaas.com/",
    icon: "card" as const,
  },
  {
    label: "Claude",
    href: "https://console.anthropic.com/",
    icon: "flask" as const,
  },
  {
    label: "Gemini",
    href: "https://aistudio.google.com/",
    icon: "spark" as const,
  },
  {
    label: "Google Cloud",
    href: "https://console.cloud.google.com/",
    icon: "cloud" as const,
  },
] as const;

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function UserMenu({ perfil }: { perfil: PerfilResumo }) {
  const router = useRouter();
  const supabase = createClient();
  const [aberto, setAberto] = useState(false);
  const [adminAbertas, setAdminAbertas] = useState(false);
  const [ferramentasAbertas, setFerramentasAbertas] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isAdmin = isAdminEmail(perfil.email);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
        setAdminAbertas(false);
        setFerramentasAbertas(false);
      }
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  async function sair() {
    await fetch("/api/auth/sessao", { method: "DELETE" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nome = perfil.nome_completo || perfil.email;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-facto-gold/40 bg-stone-800 transition hover:border-facto-gold hover:shadow-lg hover:shadow-facto-gold/10"
        aria-label="Menu do usuário"
        aria-expanded={aberto}
      >
        {perfil.foto_base64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={perfil.foto_base64}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-facto-gold">
            {iniciais(nome)}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stone-700 bg-stone-900 shadow-2xl">
          <div className="border-b border-stone-800 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{nome}</p>
            <p className="truncate text-xs text-stone-500">{perfil.email}</p>
          </div>
          <nav className="max-h-[75vh] overflow-y-auto py-1">
            <Link
              href="/dashboard/perfil"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <MenuIcon name="pencil" />
              Alterar dados
            </Link>
            <Link
              href="/dashboard/suporte"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <MenuIcon name="chat" />
              Suporte
            </Link>
            <Link
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <MenuIcon name="file" />
              Termos de uso
            </Link>
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <MenuIcon name="lock" />
              Privacidade
            </Link>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setAdminAbertas((v) => !v)}
                  className="mt-1 flex w-full items-center justify-between border-t border-stone-800 px-4 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600 transition hover:text-stone-400"
                >
                  Ferramentas do administrador
                  <span
                    aria-hidden
                    className={`text-xs transition-transform ${
                      adminAbertas ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {adminAbertas &&
                  LINKS_ADMIN.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setAberto(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
                    >
                      <MenuIcon name={link.icon} />
                      {link.label}
                    </Link>
                  ))}
                <button
                  type="button"
                  onClick={() => setFerramentasAbertas((v) => !v)}
                  className="mt-1 flex w-full items-center justify-between border-t border-stone-800 px-4 pt-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600 transition hover:text-stone-400"
                >
                  Ferramentas de desenvolvimento
                  <span
                    aria-hidden
                    className={`text-xs transition-transform ${
                      ferramentasAbertas ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {ferramentasAbertas &&
                  LINKS_DESENVOLVIMENTO.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
                    >
                      <MenuIcon name={link.icon} />
                      {link.label}
                    </a>
                  ))}
              </>
            )}
            <Link
              href="/dashboard/planos"
              onClick={() => setAberto(false)}
              className="mt-1 flex items-center gap-3 border-t border-stone-800 px-4 py-2.5 text-sm font-medium text-facto-gold transition hover:bg-stone-800 hover:text-[#c4bc8f]"
            >
              <MenuIcon name="star" />
              Planos e assinatura
            </Link>
            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-stone-800"
            >
              <MenuIcon name="logout" className="h-4 w-4 shrink-0 text-red-400/90" />
              Sair do FACTO
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

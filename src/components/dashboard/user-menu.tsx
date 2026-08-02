"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PerfilResumo } from "@/lib/perfil-types";

const EMAIL_ADMIN = "admin@facto.com";

const LINKS_DESENVOLVIMENTO = [
  { label: "GitHub", href: "https://github.com/Factojur/Facto", icon: "🐙" },
  { label: "Vercel", href: "https://vercel.com/dashboard", icon: "▲" },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard/project/jnlhbrwrirbjpnhymauu",
    icon: "🗄️",
  },
  { label: "Node.js", href: "https://nodejs.org", icon: "🟢" },
  { label: "Resend", href: "https://resend.com/overview", icon: "✉️" },
  {
    label: "Google AI Studio",
    href: "https://aistudio.google.com/api-keys",
    icon: "✨",
  },
  { label: "Registro.br", href: "https://registro.br/painel", icon: "🌐" },
  {
    label: "Cloudflare",
    href: "https://dash.cloudflare.com",
    icon: "☁️",
  },
  {
    label: "Mercado Pago",
    href: "https://www.mercadopago.com.br/developers/panel",
    icon: "💳",
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
  const [ferramentasAbertas, setFerramentasAbertas] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
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
              <span aria-hidden>✏️</span>
              Alterar dados
            </Link>
            <Link
              href="/dashboard/suporte"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
            >
              <span aria-hidden>💬</span>
              Suporte
            </Link>
            {perfil.email === EMAIL_ADMIN && (
              <Link
                href="/admin"
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                <span aria-hidden>📊</span>
                Financeiro
              </Link>
            )}
            {perfil.email === EMAIL_ADMIN && (
              <Link
                href="/admin/conhecimento"
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                <span aria-hidden>📚</span>
                Base de Conhecimento
              </Link>
            )}
            {perfil.email === EMAIL_ADMIN && (
              <Link
                href="/admin/teste-ia"
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                <span aria-hidden>🧪</span>
                Teste de IA (sandbox)
              </Link>
            )}
            {perfil.email === EMAIL_ADMIN && (
              <>
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
                      <span aria-hidden>{link.icon}</span>
                      {link.label}
                    </a>
                  ))}
              </>
            )}
            <Link
              href="/dashboard/perfil#assinatura"
              onClick={() => setAberto(false)}
              className="mt-1 flex items-center gap-3 border-t border-stone-800 px-4 py-2.5 text-sm font-medium text-facto-gold transition hover:bg-stone-800 hover:text-[#c4bc8f]"
            >
              <span aria-hidden>✦</span>
              Gerenciar assinatura
            </Link>
            <button
              type="button"
              onClick={sair}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-stone-800"
            >
              <span aria-hidden>⎋</span>
              Sair do FACTO
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

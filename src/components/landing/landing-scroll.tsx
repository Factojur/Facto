"use client";

import { useEffect } from "react";

const SCROLL_KEY = "facto-landing-scroll";

/** Guarda a seção e navega para `/` sem hash na barra de endereço. */
export function irParaSecaoLanding(secaoId: string) {
  try {
    sessionStorage.setItem(SCROLL_KEY, secaoId);
  } catch {
    /* ignore */
  }
  if (typeof window === "undefined") return;
  const naHome =
    window.location.pathname === "/" || window.location.pathname === "";
  if (naHome) {
    rolarParaSecao(secaoId);
    limparHashDaUrl();
    return;
  }
  window.location.assign("/");
}

function limparHashDaUrl() {
  try {
    const limpa = `${window.location.pathname}${window.location.search}` || "/";
    window.history.replaceState(null, "", limpa);
  } catch {
    /* ignore */
  }
}

function rolarParaSecao(secaoId: string) {
  const el = document.getElementById(secaoId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Na home: aplica scroll pedido (sessionStorage ou hash legado) e deixa a URL limpa. */
export function LandingScrollHome() {
  useEffect(() => {
    let alvo: string | null = null;
    try {
      alvo = sessionStorage.getItem(SCROLL_KEY);
      if (alvo) sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      /* ignore */
    }
    if (!alvo && window.location.hash) {
      alvo = window.location.hash.replace(/^#/, "").trim() || null;
    }
    limparHashDaUrl();
    if (!alvo) return;
    const id = alvo;
    const t = window.setTimeout(() => rolarParaSecao(id), 60);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

type Props = {
  secaoId: string;
  className?: string;
  children: React.ReactNode;
};

/** Link de âncora que rola na página sem exibir #secao na URL. */
export function LandingSecaoLink({ secaoId, className, children }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => irParaSecaoLanding(secaoId)}
    >
      {children}
    </button>
  );
}

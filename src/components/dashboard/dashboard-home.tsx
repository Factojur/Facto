"use client";

import { Suspense, useEffect, useState } from "react";
import { getAreaById } from "@/lib/areas-atuacao";
import { AssistenteFactoDestaque } from "@/components/dashboard/assistente-facto-destaque";
import { EstiloRedacaoDestaque } from "@/components/dashboard/estilo-redacao-destaque";
import { FluxoFactoSection } from "@/components/dashboard/fluxo-facto-section";
import { ChatMinutaPage } from "@/components/dashboard/chat-minuta-page";
import { ChatFactoTitulo } from "@/components/dashboard/chat-facto-titulo";
import type { PlanoId } from "@/lib/planos-facto";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";
import { sessaoChatAtivaTemTrabalho } from "@/lib/chat-minuta-storage";

function scrollHomeAoCarregar() {
  const scroller =
    document.getElementById("dashboard-home-scroll") ??
    document.scrollingElement;
  if (!scroller) return;

  const irAoChat = sessaoChatAtivaTemTrabalho();
  if (irAoChat) {
    const alvo = document.getElementById("assistente-workspace");
    if (alvo && "scrollTop" in scroller) {
      const top =
        alvo.getBoundingClientRect().top -
        (scroller === document.scrollingElement
          ? 0
          : (scroller as HTMLElement).getBoundingClientRect().top) +
        (scroller as HTMLElement).scrollTop -
        8;
      (scroller as HTMLElement).scrollTo({ top: Math.max(0, top), behavior: "auto" });
      return;
    }
    alvo?.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  if ("scrollTop" in scroller) {
    (scroller as HTMLElement).scrollTo({ top: 0, behavior: "auto" });
  }
}

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function DashboardHome({
  nome,
  leigo = false,
  plano = null,
}: {
  nome: string;
  userId: string;
  favoritosIniciais: string[];
  leigo?: boolean;
  plano?: PlanoId | null;
  acessoLivre?: boolean;
  previewAreas?: boolean;
}) {
  const primeiroNome = nome.split(" ")[0];
  const [workspaceFixado, setWorkspaceFixado] = useState(false);
  const areaJec = getAreaById("jec");

  /** Atualizar / entrar na home: topo se chat ocioso; chat se já houver conversa. */
  useEffect(() => {
    const prev = history.scrollRestoration;
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }

    scrollHomeAoCarregar();
    const t1 = window.setTimeout(scrollHomeAoCarregar, 80);
    const t2 = window.setTimeout(scrollHomeAoCarregar, 320);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      try {
        history.scrollRestoration = prev;
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="relative overflow-x-clip pb-24">
      <div className="relative z-10">
        {/* Hero */}
        <section className="relative overflow-visible px-6 pb-10 pt-10 md:px-10 md:pt-14">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.18),transparent_60%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-x-8 md:gap-y-0">
              <div className="min-w-0">
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  {saudacao()},{" "}
                  <span className="assistente-ia-shimmer">{primeiroNome}</span>
                </h1>
                <p className="mt-5 max-w-2xl text-2xl font-bold leading-[1.15] tracking-tight text-facto-gold md:text-[1.75rem] lg:text-3xl">
                  {leigo
                    ? "Você relata o caso. O FACTO redige a minuta."
                    : "Você advoga. O FACTO redige."}
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone-400 md:text-base">
                  {leigo
                    ? "Peças do Juizado no padrão forense — revise, baixe e protocole."
                    : "Peças completas no padrão forense — revise e protocole no ritmo do seu escritório."}
                </p>
              </div>

              <div className="flex shrink-0 justify-center overflow-visible md:justify-end md:pb-0 md:pr-1">
                <AssistenteFactoDestaque leigo={leigo} />
              </div>
            </div>
          </div>
        </section>

        {!leigo && <EstiloRedacaoDestaque />}

        <div
          className={`relative w-full pt-6 md:pt-8 ${workspaceFixado ? "hidden" : ""}`}
        >
          <ChatFactoTitulo />
        </div>

        {/* Assistente — altura limitada à viewport; rolagem interna (fixar = tela cheia) */}
        <section
          id="assistente-workspace"
          className={`relative mt-5 pb-2 md:mt-6 ${workspaceFixado ? "hidden" : ""}`}
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-stone-950/45 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <div className="flex h-[min(70dvh,calc(100dvh-11rem))] max-h-[calc(100dvh-9rem)] min-h-[20rem] flex-col overflow-hidden">
                <Suspense
                  fallback={
                    <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
                      Carregando assistente…
                    </div>
                  }
                >
                  <ChatMinutaPage
                    leigo={leigo}
                    plano={plano}
                    modoWorkspace
                    onWorkspaceFixadoChange={setWorkspaceFixado}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-10 px-6 pt-8 md:px-10">
          {leigo && areaJec ? (
            <section className="relative overflow-hidden rounded-2xl border border-facto-gold/30 bg-gradient-to-br from-stone-900 to-stone-950 p-8 shadow-xl">
              <span className="inline-flex rounded-full bg-facto-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-facto-gold">
                Seu acesso
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {areaJec.title}
              </h2>
              {areaJec.law && (
                <p className="mt-1 text-xs font-medium text-stone-500">
                  {areaJec.law}
                </p>
              )}
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400">
                Seu cadastro foi feito sem OAB, por isso o FACTO libera o
                Juizado Especial Cível para causas de até 20 salários mínimos
                nacionais (Lei nº 9.099/95). Valores acima desse teto e as
                demais áreas exigem cadastro com OAB e plano Completo ou Pro.
              </p>
              <a
                href="#assistente-workspace"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
              >
                Voltar ao assistente <span aria-hidden>→</span>
              </a>
            </section>
          ) : null}

          <FluxoFactoSection leigo={leigo} />
        </div>
      </div>

      <JusticaWatermark className="pointer-events-none absolute bottom-4 right-4 z-0 h-[min(40vh,380px)] w-[min(40vh,380px)] opacity-[0.24] md:bottom-8 md:right-8 md:h-[min(45vh,440px)] md:w-[min(45vh,440px)] md:opacity-[0.28]" />
    </div>
  );
}

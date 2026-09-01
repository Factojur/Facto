"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { areasDoCatalogo, getAreaById } from "@/lib/areas-atuacao";
import { hrefChatMinuta } from "@/lib/chat-minuta";
import { getAreaTema } from "@/lib/area-temas";
import {
  carregarFavoritosLocal,
  salvarFavoritosLocal,
} from "@/lib/favoritos-storage";
import { AreaPortalCard } from "@/components/dashboard/area-portal-card";
import { AssistenteEscolhaArea } from "@/components/dashboard/assistente-escolha-area";
import { GruposAreasSection } from "@/components/dashboard/grupos-areas-section";
import { AssistenteFactoDestaque } from "@/components/dashboard/assistente-facto-destaque";
import { EstiloRedacaoDestaque } from "@/components/dashboard/estilo-redacao-destaque";
import { FluxoFactoSection } from "@/components/dashboard/fluxo-facto-section";
import { AreasGradeHibrida } from "@/components/dashboard/areas-rede-visual";
import { ChatMinutaPage } from "@/components/dashboard/chat-minuta-page";
import { ChatFactoTitulo } from "@/components/dashboard/chat-facto-titulo";
import { areaEstaLiberada } from "@/lib/acesso-areas";
import { hrefModuloArea } from "@/lib/areas-atuacao";
import type { PlanoId } from "@/lib/planos-facto";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";
import { sessaoChatAtivaTemTrabalho } from "@/lib/chat-minuta-storage";

type Filtro = "todas" | "favoritas" | "disponiveis";
type ModoGrade = "grupos" | "lista";

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
  userId,
  favoritosIniciais,
  leigo = false,
  plano = null,
  acessoLivre = false,
  previewAreas = false,
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
  const [favoritos, setFavoritos] = useState(favoritosIniciais);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [modoGrade, setModoGrade] = useState<ModoGrade>("grupos");
  const [buscaArea, setBuscaArea] = useState("");
  const [catalogoAreasAberto, setCatalogoAreasAberto] = useState(true);
  const [workspaceFixado, setWorkspaceFixado] = useState(false);

  useEffect(() => {
    const locais = carregarFavoritosLocal(userId);
    if (favoritosIniciais.length > 0) {
      setFavoritos(favoritosIniciais);
      salvarFavoritosLocal(userId, favoritosIniciais);
    } else if (locais.length > 0) {
      setFavoritos(locais);
    }
  }, [userId, favoritosIniciais]);

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

  async function persistirFavoritos(novos: string[]) {
    salvarFavoritosLocal(userId, novos);
    try {
      await fetch("/api/perfil/favoritos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoritos: novos }),
      });
    } catch {
      /* favoritos permanecem no aparelho */
    }
  }

  function toggleFavorito(areaId: string) {
    const novos = favoritos.includes(areaId)
      ? favoritos.filter((id) => id !== areaId)
      : [...favoritos, areaId];
    setFavoritos(novos);
    persistirFavoritos(novos);
  }

  const areasCatalogo = useMemo(() => areasDoCatalogo(), []);
  const areasPorId = useMemo(
    () => new Map(areasCatalogo.map((a) => [a.id, a])),
    [areasCatalogo]
  );

  const gateAreas = {
    plano,
    tipoUsuario: leigo ? "leigo" : "advogado",
  } as const;

  const areasVisiveis = useMemo(() => {
    let lista = areasCatalogo;
    if (filtro === "favoritas") {
      lista = areasCatalogo.filter((a) => favoritos.includes(a.id));
    } else if (filtro === "disponiveis") {
      lista = areasCatalogo.filter(
        (a) =>
          hrefModuloArea(a, previewAreas) &&
          areaEstaLiberada(a.id, gateAreas)
      );
    }
    const q = buscaArea.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((a) => {
      const tema = getAreaTema(a.id);
      const blob = [a.title, a.description, a.law ?? "", ...tema.tags]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [filtro, favoritos, plano, leigo, previewAreas, buscaArea, areasCatalogo]);

  const areaJec = getAreaById("jec");

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

        {/* Assistente — ocupa uma tela ao rolar; fixar abre portal em tela cheia */}
        <section
          id="assistente-workspace"
          className={`relative mt-5 pb-2 md:mt-6 ${workspaceFixado ? "hidden" : ""}`}
        >
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-stone-950/45 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
              <div className="flex min-h-[min(72dvh,720px)] flex-col">
                <Suspense
                  fallback={
                    <div className="flex min-h-[min(80dvh,640px)] flex-1 items-center justify-center text-sm text-stone-400">
                      Carregando assistente…
                    </div>
                  }
                >
                  <ChatMinutaPage
                    leigo={leigo}
                    plano={plano}
                    modoWorkspace
                    previewInterno={previewAreas}
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
              <Link
                href={hrefChatMinuta("jec")}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
              >
                Começar no assistente <span aria-hidden>→</span>
              </Link>
            </section>
          ) : previewAreas ? (
            <section className="space-y-6">
              {!catalogoAreasAberto ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-950 to-stone-900 px-6 py-5 md:px-8 md:py-6">
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-facto-gold/10 blur-3xl"
                    aria-hidden
                  />
                  <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold leading-relaxed text-stone-400 md:text-base">
                      Preencha manualmente, se preferir.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCatalogoAreasAberto(true)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark shadow-sm transition hover:bg-[#a39a78]"
                    >
                      Ver todas as áreas
                      <span aria-hidden className="text-base leading-none">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-bold text-stone-500">
                      Preencha manualmente, se preferir.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCatalogoAreasAberto(false)}
                      className="text-sm text-stone-500 underline-offset-2 hover:text-stone-300 hover:underline"
                    >
                      Fechar
                    </button>
                  </div>

                  <AssistenteEscolhaArea
                    leigo={leigo}
                    plano={plano}
                    previewAreas={previewAreas}
                    preferirFormulario
                  />

                  <section className="relative">
                    <div className="relative z-10 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          Áreas de atuação
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                          Escolha o grupo do seu caso — cada módulo mantém o
                          rito próprio.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-1">
                          {(
                            [
                              ["grupos", "Por grupo"],
                              ["lista", "Lista completa"],
                            ] as const
                          ).map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setModoGrade(id)}
                              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                modoGrade === id
                                  ? "bg-facto-gold text-facto-dark shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <label className="relative min-w-0 flex-1 sm:w-64 lg:w-72">
                          <span className="sr-only">Pesquisar área</span>
                          <svg
                            viewBox="0 0 24 24"
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden
                          >
                            <circle cx="11" cy="11" r="6.5" />
                            <path
                              d="M16.2 16.2L21 21"
                              strokeLinecap="round"
                            />
                          </svg>
                          <input
                            type="search"
                            value={buscaArea}
                            onChange={(e) => setBuscaArea(e.target.value)}
                            placeholder="Pesquisar área…"
                            autoComplete="off"
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-facto-gold/50 focus:bg-white/10"
                          />
                        </label>
                        <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-1">
                          {(
                            [
                              ["todas", "Todas"],
                              ["favoritas", "Favoritas"],
                              ["disponiveis", "Disponíveis"],
                            ] as const
                          ).map(([id, label]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setFiltro(id)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                filtro === id
                                  ? "bg-facto-gold text-facto-dark shadow"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10">
                      {modoGrade === "grupos" &&
                      filtro === "todas" &&
                      !buscaArea.trim() ? (
                        <GruposAreasSection
                          areasPorId={areasPorId}
                          favoritos={favoritos}
                          onToggleFavorito={toggleFavorito}
                          previewInterno={previewAreas}
                          preferirFormulario
                          liberada={(id) => areaEstaLiberada(id, gateAreas)}
                          rotuloBloqueio={
                            leigo && !acessoLivre
                              ? "Requer OAB"
                              : !plano && !acessoLivre
                                ? "Contrate um plano"
                                : "Upgrade de plano"
                          }
                        />
                      ) : areasVisiveis.length > 0 ? (
                        <AreasGradeHibrida>
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                            {areasVisiveis.map((area, i) => (
                              <AreaPortalCard
                                key={area.id}
                                area={area}
                                favorito={favoritos.includes(area.id)}
                                onToggleFavorito={() =>
                                  toggleFavorito(area.id)
                                }
                                index={i}
                                previewInterno={previewAreas}
                                preferirFormulario
                                liberadaNoPlano={areaEstaLiberada(
                                  area.id,
                                  gateAreas
                                )}
                                rotuloBloqueio={
                                  leigo && !acessoLivre
                                    ? "Requer OAB"
                                    : !plano && !acessoLivre
                                      ? "Contrate um plano"
                                      : "Upgrade de plano"
                                }
                              />
                            ))}
                          </div>
                        </AreasGradeHibrida>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center text-stone-400">
                          Nenhuma área com esse filtro ou pesquisa.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setFiltro("todas");
                              setBuscaArea("");
                            }}
                            className="text-facto-gold underline-offset-2 hover:underline"
                          >
                            Ver todas
                          </button>
                        </div>
                      )}
                      {!leigo && filtro === "todas" && !buscaArea.trim() ? (
                        <p className="mt-5 text-center">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">
                            Contratos — em breve
                            <span className="ml-2 text-white/35">
                              (minutas; litígio de contrato: Civil)
                            </span>
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </section>
                </>
              )}
            </section>
          ) : null}

          <FluxoFactoSection leigo={leigo} />
        </div>
      </div>

      <JusticaWatermark className="pointer-events-none absolute bottom-4 right-4 z-0 h-[min(40vh,380px)] w-[min(40vh,380px)] opacity-[0.24] md:bottom-8 md:right-8 md:h-[min(45vh,440px)] md:w-[min(45vh,440px)] md:opacity-[0.28]" />
    </div>
  );
}

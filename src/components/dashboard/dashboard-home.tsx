"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AREAS_ATUACAO,
  getAreaById,
  hrefModuloArea,
  type AreaAtuacao,
} from "@/lib/areas-atuacao";
import { getAreaTema } from "@/lib/area-temas";
import {
  carregarFavoritosLocal,
  salvarFavoritosLocal,
} from "@/lib/favoritos-storage";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { AssistenteFactoDestaque } from "@/components/dashboard/assistente-facto-destaque";
import { FluxoFactoSection } from "@/components/dashboard/fluxo-facto-section";
import { areaEstaLiberada } from "@/lib/acesso-areas";
import type { PlanoId } from "@/lib/planos-facto";
import { JusticaWatermark } from "@/components/dashboard/justica-watermark";

type Filtro = "todas" | "favoritas" | "disponiveis";

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function BotaoFavorito({
  ativo,
  onClick,
  label,
  claro = false,
}: {
  ativo: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  claro?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={ativo}
      className={`rounded-full p-2 transition ${
        ativo
          ? "bg-amber-400/20 text-amber-400 hover:bg-amber-400/30"
          : claro
            ? "bg-white/10 text-white/60 hover:bg-white/20 hover:text-amber-300"
            : "text-stone-400 hover:bg-stone-100 hover:text-amber-500"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition ${ativo ? "scale-110" : ""}`}
        fill={ativo ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}

function AreaPortalCard({
  area,
  favorito,
  onToggleFavorito,
  index,
  liberadaNoPlano = true,
  rotuloBloqueio = "Upgrade de plano",
  previewInterno = false,
}: {
  area: AreaAtuacao;
  favorito: boolean;
  onToggleFavorito: () => void;
  index: number;
  liberadaNoPlano?: boolean;
  rotuloBloqueio?: string;
  previewInterno?: boolean;
}) {
  const tema = getAreaTema(area.id);
  const href = hrefModuloArea(area, previewInterno);
  const disponivel = Boolean(href && liberadaNoPlano);

  const cardInner = (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: tema.pattern }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl ${tema.glow}`}
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <AreaIllustration
          areaId={area.id}
          className={`h-24 w-24 opacity-90 transition duration-500 group-hover:scale-110 group-hover:opacity-100 ${tema.accent}`}
        />
        <BotaoFavorito
          claro
          ativo={favorito}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorito();
          }}
          label={
            favorito
              ? `Remover ${area.title} dos favoritos`
              : `Favoritar ${area.title}`
          }
        />
      </div>

      <div className="relative mt-4">
        {!area.available && previewInterno && (
          <span className="mb-2 inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            Preview interno
          </span>
        )}
        {!area.available && !previewInterno && (
          <span className="mb-2 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
            Em breve
          </span>
        )}
        {area.available && !liberadaNoPlano && (
          <span className="mb-2 inline-block rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            {rotuloBloqueio}
          </span>
        )}
        <h3 className="text-xl font-bold text-white">{area.title}</h3>
        {area.law && (
          <p className="mt-1 text-xs font-medium text-white/50">{area.law}</p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/65">
          {area.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tema.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {disponivel && (
        <div className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-white/90 transition group-hover:text-amber-300">
          <span>Entrar no módulo</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}
    </>
  );

  const classes = `group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 shadow-xl transition duration-300 ${tema.gradient} ${
    disponivel
      ? "hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl hover:shadow-black/40 cursor-pointer"
      : "opacity-80"
  }`;

  const style = { animationDelay: `${index * 80}ms` };

  if (disponivel && href) {
    return (
      <Link href={href} className={`${classes} animate-fade-up`} style={style}>
        {cardInner}
      </Link>
    );
  }

  return (
    <div className={`${classes} animate-fade-up`} style={style}>
      {cardInner}
    </div>
  );
}

function FavoritoRapido({
  area,
  onRemover,
  liberadaNoPlano = true,
  previewInterno = false,
}: {
  area: AreaAtuacao;
  onRemover: () => void;
  liberadaNoPlano?: boolean;
  previewInterno?: boolean;
}) {
  const tema = getAreaTema(area.id);
  const inner = (
    <>
      <AreaIllustration
        areaId={area.id}
        className={`h-10 w-10 shrink-0 ${tema.accent}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{area.title}</p>
        {area.law && (
          <p className="truncate text-[11px] text-white/45">{area.law}</p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemover();
        }}
        className="shrink-0 rounded-full p-1 text-amber-400 hover:bg-white/10"
        aria-label={`Remover ${area.title} dos favoritos`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </>
  );

  const cls =
    "flex min-w-[240px] shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition hover:border-facto-gold/40 hover:bg-white/10";

  if (hrefModuloArea(area, previewInterno) && liberadaNoPlano) {
    return (
      <Link href={hrefModuloArea(area, previewInterno)!} className={cls}>
        {inner}
      </Link>
    );
  }

  return <div className={`${cls} opacity-70`}>{inner}</div>;
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
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [buscaArea, setBuscaArea] = useState("");

  useEffect(() => {
    const locais = carregarFavoritosLocal(userId);
    if (favoritosIniciais.length > 0) {
      setFavoritos(favoritosIniciais);
      salvarFavoritosLocal(userId, favoritosIniciais);
    } else if (locais.length > 0) {
      setFavoritos(locais);
    }
  }, [userId, favoritosIniciais]);

  async function persistirFavoritos(novos: string[]) {
    salvarFavoritosLocal(userId, novos);
    setSalvando(true);
    setErroSalvar(false);
    try {
      const res = await fetch("/api/perfil/favoritos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoritos: novos }),
      });
      setErroSalvar(!res.ok);
    } catch {
      setErroSalvar(true);
    } finally {
      setSalvando(false);
    }
  }

  function toggleFavorito(areaId: string) {
    const novos = favoritos.includes(areaId)
      ? favoritos.filter((id) => id !== areaId)
      : [...favoritos, areaId];
    setFavoritos(novos);
    persistirFavoritos(novos);
  }

  const areasFavoritas = favoritos
    .map((id) => getAreaById(id))
    .filter((a): a is AreaAtuacao => Boolean(a));

  const gateAreas = {
    plano,
    tipoUsuario: leigo ? "leigo" : "advogado",
    acessoLivre,
  } as const;

  const areasVisiveis = useMemo(() => {
    let lista = AREAS_ATUACAO;
    if (filtro === "favoritas") {
      lista = AREAS_ATUACAO.filter((a) => favoritos.includes(a.id));
    } else if (filtro === "disponiveis") {
      lista = AREAS_ATUACAO.filter(
        (a) =>
          hrefModuloArea(a, previewAreas) &&
          areaEstaLiberada(a.id, gateAreas)
      );
    }
    const q = buscaArea.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((a) => {
      const tema = getAreaTema(a.id);
      const blob = [
        a.title,
        a.description,
        a.law ?? "",
        ...tema.tags,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [filtro, favoritos, plano, leigo, acessoLivre, previewAreas, buscaArea]);

  const areaJec = getAreaById("jec");

  return (
    <div className="relative overflow-x-clip pb-24">
      <div className="relative z-10">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-10 pt-10 md:px-10 md:pt-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            {saudacao()}, {primeiroNome}
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
      </section>

      <AssistenteFactoDestaque leigo={leigo} />

      {!leigo && (
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-10">
          <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300">
            {favoritos.length} favorito{favoritos.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

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
              Seu cadastro foi feito sem OAB, por isso o FACTO libera o Juizado
              Especial Cível para causas de até 20 salários mínimos nacionais
              (Lei nº 9.099/95). Valores acima desse teto e as demais áreas
              (ainda &quot;em breve&quot;) exigem verificação da OAB.
            </p>
            <Link
              href={areaJec.href!}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-facto-gold px-5 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
            >
              Entrar no módulo <span aria-hidden>→</span>
            </Link>
          </section>
        ) : (
          <>
            {/* Favoritos */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Acesso rápido</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {salvando
                      ? "Salvando..."
                      : erroSalvar
                        ? "Favoritos salvos neste aparelho. Sincronize o perfil para usá-los em outros dispositivos."
                        : "Suas áreas favoritas ficam sempre visíveis aqui."}
                  </p>
                </div>
              </div>

              {areasFavoritas.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {areasFavoritas.map((area) => (
                    <FavoritoRapido
                      key={area.id}
                      area={area}
                      onRemover={() => toggleFavorito(area.id)}
                      liberadaNoPlano={areaEstaLiberada(area.id, gateAreas)}
                      previewInterno={previewAreas}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-5 py-5 text-sm text-stone-500">
                  Favorite uma área com a{" "}
                  <span className="text-amber-400">★</span> nos cards abaixo.
                </div>
              )}
            </section>

            {/* Áreas de atuação */}
            <section className="relative">
              <div className="relative z-10 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-lg font-semibold text-white">Áreas de atuação</h2>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                      <path d="M16.2 16.2L21 21" strokeLinecap="round" />
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
              {areasVisiveis.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {areasVisiveis.map((area, i) => (
                    <AreaPortalCard
                      key={area.id}
                      area={area}
                      favorito={favoritos.includes(area.id)}
                      onToggleFavorito={() => toggleFavorito(area.id)}
                      index={i}
                      previewInterno={previewAreas}
                      liberadaNoPlano={areaEstaLiberada(area.id, gateAreas)}
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
              </div>
            </section>
          </>
        )}

        <FluxoFactoSection leigo={leigo} />
      </div>
      </div>

      <JusticaWatermark className="pointer-events-none absolute bottom-4 right-4 z-0 h-[min(40vh,380px)] w-[min(40vh,380px)] opacity-[0.24] md:bottom-8 md:right-8 md:h-[min(45vh,440px)] md:w-[min(45vh,440px)] md:opacity-[0.28]" />
    </div>
  );
}

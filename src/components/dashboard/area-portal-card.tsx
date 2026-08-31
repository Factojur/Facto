"use client";

import Link from "next/link";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { ROTULO_AREA_BOTAO } from "@/components/dashboard/areas-rede-visual";
import { hrefModuloArea, type AreaAtuacao } from "@/lib/areas-atuacao";
import {
  chatMinutaAreaHabilitada,
  hrefChatMinuta,
} from "@/lib/chat-minuta";

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

export function AreaPortalCard({
  area,
  favorito,
  onToggleFavorito,
  index,
  liberadaNoPlano = true,
  rotuloBloqueio = "Upgrade de plano",
  previewInterno = false,
  /** Catálogo “Preencha manualmente”: abre o formulário, não o assistente. */
  preferirFormulario = false,
}: {
  area: AreaAtuacao;
  favorito: boolean;
  onToggleFavorito: () => void;
  index: number;
  liberadaNoPlano?: boolean;
  rotuloBloqueio?: string;
  previewInterno?: boolean;
  preferirFormulario?: boolean;
}) {
  const hrefModulo = hrefModuloArea(area, previewInterno);
  const hrefChat =
    liberadaNoPlano && chatMinutaAreaHabilitada(area.id)
      ? hrefChatMinuta(area.id, { nova: true })
      : null;
  const hrefPrincipal = preferirFormulario
    ? hrefModulo ?? hrefChat
    : hrefChat ?? hrefModulo;
  const disponivel = Boolean(hrefPrincipal && liberadaNoPlano);
  const mostraLinkSecundario = Boolean(
    disponivel && hrefChat && hrefModulo && hrefPrincipal
  );
  const rotulo = ROTULO_AREA_BOTAO[area.id] ?? area.title;

  const classes = `group relative flex flex-col overflow-hidden rounded-xl border border-facto-gold/35 bg-[#1c1c16]/75 backdrop-blur-[2px] transition duration-300 ${
    disponivel
      ? "hover:border-facto-gold hover:bg-[#1c1c16]/90 hover:shadow-[0_0_32px_rgba(144,139,106,0.4)]"
      : "opacity-75"
  }`;

  const style = { animationDelay: `${index * 60}ms` };

  const corpoCard = (
    <>
      <div className="flex items-center gap-3 px-4 py-4 md:px-5 md:py-5">
        {disponivel && hrefPrincipal ? (
          <Link
            href={hrefPrincipal}
            className="flex min-w-0 flex-1 items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-facto-gold/50"
          >
            <AreaIllustration
              areaId={area.id}
              className="h-10 w-10 shrink-0 text-facto-gold transition duration-300 group-hover:text-[#d4cfa8] group-hover:drop-shadow-[0_0_8px_rgba(144,139,106,0.65)]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold tracking-wide text-facto-gold transition group-hover:text-[#e8e2bc] md:text-lg">
                  {rotulo}
                </h3>
                {!area.available && previewInterno && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-200/90">
                    Preview
                  </span>
                )}
                {!area.available && !previewInterno && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55">
                    Em breve
                  </span>
                )}
                {area.available && !liberadaNoPlano && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-200/90">
                    {rotuloBloqueio}
                  </span>
                )}
                {hrefChat && !preferirFormulario && (
                  <span className="rounded-full border border-facto-gold/25 bg-facto-gold/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-facto-gold/90">
                    Assistente
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/45 transition group-hover:text-white/60 md:text-[13px]">
                {area.description}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <AreaIllustration
              areaId={area.id}
              className="h-10 w-10 shrink-0 text-facto-gold opacity-70"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-facto-gold/70 md:text-lg">
                {rotulo}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-white/40 md:text-[13px]">
                {area.description}
              </p>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 self-start">
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
          {disponivel && (
            <span
              className="text-facto-gold/70 transition duration-300 group-hover:translate-x-0.5 group-hover:text-[#e8e2bc]"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M9 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>

      {mostraLinkSecundario && (
        <div className="border-t border-white/10 bg-black/20 px-4 py-2 md:px-5">
          <Link
            href={preferirFormulario ? hrefChat! : hrefModulo!}
            className="text-xs font-medium text-white/45 underline-offset-2 transition hover:text-facto-gold hover:underline"
          >
            {preferirFormulario ? "Abrir no assistente" : "Formulário completo"}
          </Link>
        </div>
      )}
    </>
  );

  if (disponivel) {
    return (
      <div className={`${classes} animate-fade-up`} style={style}>
        {corpoCard}
      </div>
    );
  }

  return (
    <div className={`${classes} animate-fade-up`} style={style}>
      {corpoCard}
    </div>
  );
}

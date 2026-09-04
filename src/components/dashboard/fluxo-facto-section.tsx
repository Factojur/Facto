"use client";

import { useEffect, useRef } from "react";

const PASSOS = [
  {
    passo: "01",
    titulo: "Conte o caso no chat",
    texto:
      "Relato, voz ou PDF/Word no assistente. A área e a espécie saem da conversa — sem escolher módulo na mão.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v9A2.5 2.5 0 0117.5 17H9l-5 4v-4H6.5A2.5 2.5 0 014 14.5v-9z"
          strokeLinejoin="round"
        />
        <path d="M8 8.5h8M8 12h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    passo: "02",
    titulo: "Confira o plano",
    texto:
      "Partes, fatos, pedidos e teses na aba Plano — sem gastar crédito de peça. Só então peça a minuta.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M4 6h16v12H4V6z" strokeLinejoin="round" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
        <circle cx="16" cy="14" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    passo: "03",
    titulo: "Redija com lastro",
    texto:
      "Minuta (1 crédito): peça no painel com lastro da base FACTO e da jurisprudência anexada ao caso.",
    destaque: true,
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M12 3l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 12l-4.5 2.5 1.5-4.5L6 7.5h4.5L12 3z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    passo: "04",
    titulo: "Exporte e protocolo",
    texto:
      "Word ou PDF timbrado; ajustes pontuais de trecho e checklist final antes de protocolar fora do FACTO.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M8 4h8l4 4v12H8V4z" strokeLinejoin="round" />
        <path d="M16 4v4h4M10 13h6M10 17h4" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function FluxoFactoSection({ leigo = false }: { leigo?: boolean }) {
  const railRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = railRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    let raf = 0;
    const t0 = performance.now();
    const len = path.getTotalLength();

    const tick = (now: number) => {
      const t = ((now - t0) / 1000) * 0.12;
      const u = t % 1;
      const pt = path.getPointAtLength(u * len);
      dot.setAttribute("cx", String(pt.x));
      dot.setAttribute("cy", String(pt.y));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#14140f]/80 p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(144,139,106,0.14),transparent_50%)]"
        aria-hidden
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-facto-gold">
          Como funciona
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
          Relate o caso no chat. Revise a minuta. Protocole.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 md:text-base">
          {leigo
            ? "Chat interativo, pré-visualização automática e redação com lastro — você revisa e protocola no Juizado."
            : "Chat interativo, pré-visualização automática e redação com lastro."}
        </p>

        {/* Trilho conectando as etapas (desktop) */}
        <div className="relative mt-10 hidden xl:block">
          <svg
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[1.65rem] h-3 w-[75%]"
            viewBox="0 0 100 8"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              ref={railRef}
              d="M0 4 H100"
              fill="none"
              stroke="#908b6a"
              strokeWidth="0.6"
              strokeOpacity="0.35"
            />
            <circle
              ref={dotRef}
              r="1.4"
              fill="#c4bf9a"
              className="facto-fluxo-pulse"
            />
          </svg>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:mt-6 xl:grid-cols-4 xl:gap-5">
          {PASSOS.map((item, i) => {
            const destaque = "destaque" in item && item.destaque;
            return (
              <li
                key={item.passo}
                className="animate-fade-up"
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                <article
                  className={`group relative h-full overflow-hidden rounded-2xl border p-5 transition duration-500 md:p-6 ${
                    destaque
                      ? "border-facto-gold/40 bg-facto-gold/[0.07] shadow-[0_0_40px_rgba(144,139,106,0.12)]"
                      : "border-white/10 bg-white/[0.03] hover:border-facto-gold/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className="pointer-events-none absolute -right-1 -top-3 select-none font-mono text-6xl font-bold leading-none text-white/[0.04] transition duration-500 group-hover:text-facto-gold/[0.09]"
                    aria-hidden
                  >
                    {item.passo}
                  </span>

                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition duration-500 ${
                        destaque
                          ? "border-facto-gold/50 bg-facto-gold/15 text-facto-gold shadow-[0_0_20px_rgba(144,139,106,0.35)] facto-fluxo-node"
                          : "border-white/10 bg-[#1c1c16] text-stone-400 group-hover:border-facto-gold/40 group-hover:text-facto-gold"
                      }`}
                      style={{ animationDelay: `${i * 0.4}s` }}
                    >
                      {item.icone}
                    </span>
                    <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-facto-gold/80">
                      {item.passo}
                    </span>
                  </div>

                  <h3 className="relative mt-5 text-base font-semibold text-white md:text-[17px]">
                    {item.titulo}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-stone-500">
                    {item.texto}
                  </p>

                  {i < PASSOS.length - 1 && (
                    <span
                      className="pointer-events-none absolute bottom-4 right-4 hidden text-facto-gold/25 xl:inline"
                      aria-hidden
                    >
                      →
                    </span>
                  )}
                </article>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-center text-sm font-medium tracking-wide text-facto-gold/75 md:text-base">
          {leigo
            ? "Do relato à minuta — com clareza e lastro."
            : "FACTO estrutura. Você decide."}
        </p>
      </div>
    </section>
  );
}

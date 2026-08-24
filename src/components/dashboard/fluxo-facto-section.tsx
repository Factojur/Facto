"use client";

import { useEffect, useRef } from "react";

const PASSOS = [
  {
    passo: "01",
    titulo: "Escolha a área",
    texto:
      "Entre no módulo da sua especialidade ou favorite para acessar com um clique.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M4 10l8-6 8 6v10H4V10z" strokeLinejoin="round" />
        <path d="M9 20v-6h6v6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    passo: "02",
    titulo: "Informe o caso",
    texto:
      "Identificação, fatos e pedidos em três etapas — sem começar do zero.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M8 4h8l2 4v14H6V4h2z" strokeLinejoin="round" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    passo: "03",
    titulo: "Assistente Facto IA",
    texto:
      "A equipe FACTO estrutura fundamentos e a redação forense — você revisa antes de protocolar.",
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
    titulo: "Exporte e revise",
    texto:
      "Documento timbrado em Word ou PDF; confira formatação e conteúdo antes do protocolo.",
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
          Do caso à minuta em 3 etapas, depois o protocolo
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500 md:text-base">
          {leigo
            ? "Fluxo pensado para o Juizado: identifique as partes, narre os fatos e feche os pedidos — o FACTO redige a minuta."
            : "Fluxo pensado para a bancada do advogado e para quem atua no Juizado: identifique, fundamente e peça — o FACTO redige."}
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

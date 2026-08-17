"use client";

import {
  AreasGradeHibrida,
  ROTULO_AREA_BOTAO,
} from "@/components/dashboard/areas-rede-visual";
import { AreaIllustration } from "@/components/dashboard/area-illustration";
import { areasDoCatalogo } from "@/lib/areas-atuacao";

export function DevAreasRedeClient() {
  const areas = areasDoCatalogo();

  return (
    <div className="min-h-screen bg-facto-dark px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-facto-gold/70">
            Dev only · localhost
          </p>
          <h1 className="mt-2 text-2xl font-bold">Áreas — híbrido (mockup)</h1>
          <p className="mt-1 text-sm text-white/50">
            Mesmo estilo do dashboard: cards dourados, circuito animado, glow no
            hover.
          </p>
        </header>

        <AreasGradeHibrida>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {areas.map((a) => (
              <div
                key={a.id}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-facto-gold/35 bg-[#1c1c16]/75 px-4 py-4 transition duration-300 hover:border-facto-gold hover:shadow-[0_0_32px_rgba(144,139,106,0.4)] md:px-5 md:py-5"
              >
                <AreaIllustration
                  areaId={a.id}
                  className="h-10 w-10 shrink-0 text-facto-gold transition group-hover:text-[#d4cfa8]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-facto-gold group-hover:text-[#e8e2bc]">
                    {ROTULO_AREA_BOTAO[a.id] ?? a.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/45">
                    {a.description}
                  </p>
                </div>
                <span className="text-facto-gold/70" aria-hidden>
                  ›
                </span>
              </div>
            ))}
          </div>
        </AreasGradeHibrida>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  GRUPOS_AREAS_DASHBOARD,
  type GrupoAreaDashboard,
} from "@/lib/grupos-areas-dashboard";
import type { AreaAtuacao } from "@/lib/areas-atuacao";
import { AreaPortalCard } from "@/components/dashboard/area-portal-card";

type Props = {
  areasPorId: Map<string, AreaAtuacao>;
  favoritos: string[];
  onToggleFavorito: (areaId: string) => void;
  previewInterno?: boolean;
  liberada: (areaId: string) => boolean;
  rotuloBloqueio: string;
};

function GrupoCard({
  grupo,
  aberto,
  onToggle,
}: {
  grupo: GrupoAreaDashboard;
  aberto: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex w-full flex-col rounded-xl border px-4 py-4 text-left transition duration-300 md:px-5 md:py-5 ${
        aberto
          ? "border-facto-gold bg-[#1c1c16]/95 shadow-[0_0_24px_rgba(144,139,106,0.25)]"
          : "border-facto-gold/35 bg-[#1c1c16]/75 hover:border-facto-gold hover:bg-[#1c1c16]/90"
      }`}
    >
      <h3 className="text-base font-semibold tracking-wide text-facto-gold md:text-lg">
        {grupo.titulo}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/45 md:text-[13px]">
        {grupo.descricao}
      </p>
      <p className="mt-3 text-xs font-medium text-white/50">
        {grupo.areaIds.length === 1
          ? "1 módulo"
          : `${grupo.areaIds.length} módulos`}{" "}
        · {aberto ? "Recolher" : "Escolher área"}
      </p>
    </button>
  );
}

export function GruposAreasSection({
  areasPorId,
  favoritos,
  onToggleFavorito,
  previewInterno = false,
  liberada,
  rotuloBloqueio,
}: Props) {
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        {GRUPOS_AREAS_DASHBOARD.map((grupo) => (
          <GrupoCard
            key={grupo.id}
            grupo={grupo}
            aberto={grupoAberto === grupo.id}
            onToggle={() =>
              setGrupoAberto((atual) => (atual === grupo.id ? null : grupo.id))
            }
          />
        ))}
      </div>

      {grupoAberto ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-sm text-stone-400">
            Escolha o módulo dentro de{" "}
            <span className="font-medium text-white">
              {GRUPOS_AREAS_DASHBOARD.find((g) => g.id === grupoAberto)?.titulo}
            </span>
            . Cada um mantém o rito e as peças corretas para aquele juízo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {GRUPOS_AREAS_DASHBOARD.find((g) => g.id === grupoAberto)
              ?.areaIds.map((id, i) => {
                const area = areasPorId.get(id);
                if (!area) return null;
                return (
                  <AreaPortalCard
                    key={id}
                    area={area}
                    favorito={favoritos.includes(id)}
                    onToggleFavorito={() => onToggleFavorito(id)}
                    index={i}
                    previewInterno={previewInterno}
                    liberadaNoPlano={liberada(id)}
                    rotuloBloqueio={rotuloBloqueio}
                  />
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

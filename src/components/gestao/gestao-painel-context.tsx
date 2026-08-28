"use client";

import { createContext, useContext } from "react";
import type { PapelGestao } from "@/lib/gestao/gestao-types";
import { podeVerHonorariosGestao } from "@/lib/gestao/gestao-permissoes";

type GestaoPainelContextValue = {
  papel: PapelGestao | null;
  podeVerHonorarios: boolean;
  escritorioNome: string | null;
};

const GestaoPainelContext = createContext<GestaoPainelContextValue>({
  papel: null,
  podeVerHonorarios: false,
  escritorioNome: null,
});

export function GestaoPainelProvider({
  papel,
  escritorioNome,
  children,
}: {
  papel: PapelGestao | null;
  escritorioNome: string | null;
  children: React.ReactNode;
}) {
  return (
    <GestaoPainelContext.Provider
      value={{
        papel,
        podeVerHonorarios: podeVerHonorariosGestao(papel),
        escritorioNome,
      }}
    >
      {children}
    </GestaoPainelContext.Provider>
  );
}

export function useGestaoPainel() {
  return useContext(GestaoPainelContext);
}

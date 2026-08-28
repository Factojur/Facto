"use client";

import { createContext, useContext } from "react";
import type { PapelGestao } from "@/lib/gestao/gestao-types";
import { ehAdminGestao } from "@/lib/gestao/gestao-permissoes";

type GestaoPainelContextValue = {
  papel: PapelGestao | null;
  ehAdmin: boolean;
  escritorioNome: string | null;
};

const GestaoPainelContext = createContext<GestaoPainelContextValue>({
  papel: null,
  ehAdmin: false,
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
        ehAdmin: ehAdminGestao(papel),
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

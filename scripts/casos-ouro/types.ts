import type { EspeciePecaJec } from "../../src/lib/jec-especie-peca";

export type CasoOuroJec = {
  id: string;
  tema: string;
  fatosChave: string[];
  contextoLastro: string;
  pecaIaBruta: string;
  jurisComLastro: string[];
  jurisSemLastro: string[];
  tipoAcao: string;
  valorCausaBloco: string;
  tutelaUrgencia?: boolean;
};

/** Lastro + peça completa por área (0 tokens). Fechadas já ficam prontas para quando `available` virar true. */
export type CasoOuroArea = {
  id: string;
  areaId: string;
  tema: string;
  /** Peça sintética completa (endereçamento, fatos, direito, pedidos). */
  pecaIaBruta: string;
  contextoLastro: string;
  jurisComLastro: string[];
  jurisSemLastro: string[];
  leisComLastro?: string[];
  fatosChave?: string[];
  secoesObrigatorias?: string[];
};

/** Espécies JEC além da petição inicial — normalização + lastro. */
export type CasoOuroEspecie = {
  id: string;
  especie: EspeciePecaJec;
  tema: string;
  pecaIaBruta: string;
  secoesObrigatorias: string[];
  contextoLastro: string;
  jurisComLastro: string[];
  jurisSemLastro: string[];
};

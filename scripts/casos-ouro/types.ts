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

/** Lastro de citações para áreas ainda sem geração de peça (0 tokens). */
export type CasoOuroArea = {
  id: string;
  areaId: string;
  tema: string;
  textoPeca: string;
  contextoLastro: string;
  jurisComLastro: string[];
  jurisSemLastro: string[];
  leisComLastro?: string[];
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

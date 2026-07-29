export type EscritorioConfig = {
  usarTimbre: boolean;
  nomeEscritorio: string;
  endereco: string;
  cidadeUf: string;
  telefone: string;
  emailEscritorio: string;
  site?: string;
  logoBase64?: string;
};

export const ESCRITORIO_STORAGE_KEY = "facto-escritorio-config";

export const escritorioConfigVazio: EscritorioConfig = {
  usarTimbre: false,
  nomeEscritorio: "",
  endereco: "",
  cidadeUf: "",
  telefone: "",
  emailEscritorio: "",
  site: "",
  logoBase64: "",
};

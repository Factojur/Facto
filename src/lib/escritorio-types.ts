export type EscritorioConfig = {
  usarTimbre: boolean;
  nomeEscritorio: string;
  endereco: string;
  cidadeUf: string;
  telefone: string;
  emailEscritorio: string;
  site?: string;
  /** Imagem exibida no topo da peça (logo + dados do escritório). */
  cabecalhoBase64?: string;
  /** Imagem exibida no rodapé de cada página. */
  rodapeBase64?: string;
  /** Imagem exibida em marca d'água, atrás do texto. */
  marcaDaguaBase64?: string;
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
  cabecalhoBase64: "",
  rodapeBase64: "",
  marcaDaguaBase64: "",
};

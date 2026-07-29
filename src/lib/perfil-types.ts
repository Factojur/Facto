export type PerfilUsuario = {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  oab_numero: string;
  foto_base64?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
};

export const perfilVazio = (): Omit<PerfilUsuario, "id" | "email"> => ({
  nome_completo: "",
  cpf: "",
  oab_numero: "",
  foto_base64: null,
  telefone: null,
  endereco: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  uf: null,
  cep: null,
});

export type PerfilResumo = Pick<
  PerfilUsuario,
  "nome_completo" | "email" | "foto_base64"
>;

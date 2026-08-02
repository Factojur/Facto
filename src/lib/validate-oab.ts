import { somenteNumeroOab } from "@/lib/formatar-oab";

export type UserRole = "admin" | "teste";

export type OabValidationResult =
  | { valid: true; role?: UserRole }
  | { valid: false; message: string };

const ADMIN_EMAIL = "admin@facto.com";
const ADMIN_PASSWORD = "Deif@8808";
const ADMIN_OAB = "147099";

const TEST_EMAIL = "factoassessoria.jur@gmail.com";
const TEST_PASSWORD = "Deif@8808";
const TEST_OAB = "147099";

const INVALID_MOCK_OAB = "123456";

/**
 * Validação mock da OAB antes do cadastro no Supabase.
 * Aceita UF+número (ex.: SP147099); compara só os dígitos.
 * Substituir por integração real com API da OAB no futuro.
 */
export function validateOabMock(input: {
  email: string;
  senha: string;
  oabNumero: string;
}): OabValidationResult {
  const email = input.email.trim().toLowerCase();
  const oab = somenteNumeroOab(input.oabNumero);

  if (
    email === ADMIN_EMAIL &&
    input.senha === ADMIN_PASSWORD &&
    oab === ADMIN_OAB
  ) {
    return { valid: true, role: "admin" };
  }

  if (
    email === TEST_EMAIL &&
    input.senha === TEST_PASSWORD &&
    oab === TEST_OAB
  ) {
    return { valid: true, role: "teste" };
  }

  if (oab === INVALID_MOCK_OAB) {
    return {
      valid: false,
      message:
        "OAB inválida. Verifique o número informado ou entre em contato com o suporte.",
    };
  }

  return { valid: true };
}

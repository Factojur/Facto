import { Resend } from "resend";

export const REMETENTE_NOREPLY = "FACTO <noreply@factoia.com.br>";
export const REMETENTE_FINANCEIRO =
  "FACTO Financeiro <financeiro@factoia.com.br>";
export const DESTINO_FINANCEIRO = "financeiro@factoia.com.br";

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function serializeResendError(error: unknown): string {
  if (!error) return "erro desconhecido";
  if (typeof error === "object") {
    const e = error as {
      message?: string;
      name?: string;
      statusCode?: number;
    };
    const partes = [e.name, e.statusCode, e.message].filter(
      (p) => p != null && String(p).trim() !== ""
    );
    if (partes.length) return partes.join(" ");
  }
  return String(error);
}

export type StatusEnvioEmail = "enviado" | "falha" | "pulado";

export type ResendSendResult = {
  data?: { id?: string } | null;
  error?: unknown;
};

export function resendIdFromSendResult(result: ResendSendResult): string | null {
  return result.data?.id ?? null;
}

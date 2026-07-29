import { cookies } from "next/headers";

export const COOKIE_SESSAO = "facto_sessao";

export function criarIdSessao(): string {
  return crypto.randomUUID();
}

export async function obterCookieSessao(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_SESSAO)?.value;
}

export function opcoesCookieSessao() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

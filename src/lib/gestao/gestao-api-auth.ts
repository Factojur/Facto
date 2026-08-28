import { NextResponse } from "next/server";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export function gestaoIndisponivel() {
  return NextResponse.json({ error: "FACTO Gestão indisponível." }, { status: 404 });
}

export async function requireGestaoAuth() {
  if (!gestaoHabilitada()) return { error: gestaoIndisponivel() as NextResponse };
  const user = await getUsuarioServidor();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }
  const nome =
    (user.user_metadata?.nome_completo as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Usuário";
  return {
    user,
    email: user.email ?? "",
    nome,
  };
}

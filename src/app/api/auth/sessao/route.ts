import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  COOKIE_SESSAO,
  obterCookieSessao,
  opcoesCookieSessao,
} from "@/lib/sessao-unica";
import {
  registrarSessaoPecasAtiva,
  validarSessaoPecasAtiva,
} from "@/lib/sessao-pecas-server";

async function obterPerfilSessao(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .select("sessao_ativa_id")
    .eq("id", userId)
    .maybeSingle();
}

/** Registra nova sessão ativa de PEÇAS (login dashboard). Gestão não usa esta rota. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const reg = await registrarSessaoPecasAtiva(user.id);
  if (!reg.ok) {
    return NextResponse.json({ error: reg.erro }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_SESSAO, reg.sessaoId, opcoesCookieSessao());
  return response;
}

/** Valida sessão de PEÇAS neste dispositivo. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ valida: false }, { status: 401 });
  }

  const cookieSessao = await obterCookieSessao();
  const { data: profile, error } = await obterPerfilSessao(user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!profile?.sessao_ativa_id) {
    return NextResponse.json({ valida: true, pendente: true });
  }

  const validacao = await validarSessaoPecasAtiva(user.id);
  if (!validacao.ok) {
    return NextResponse.json({ valida: false }, { status: validacao.status });
  }

  if (!cookieSessao) {
    return NextResponse.json({ valida: true, pendente: true });
  }

  return NextResponse.json({ valida: true });
}

/** Remove cookie de sessão no logout. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_SESSAO);
  return response;
}

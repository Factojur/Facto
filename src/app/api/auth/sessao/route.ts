import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  COOKIE_SESSAO,
  criarIdSessao,
  obterCookieSessao,
  opcoesCookieSessao,
} from "@/lib/sessao-unica";

async function obterPerfilSessao(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .select("sessao_ativa_id")
    .eq("id", userId)
    .maybeSingle();
}

/** Registra nova sessão ativa (login ou primeira visita). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const sessaoId = criarIdSessao();
  const { error } = await supabase
    .from("profiles")
    .update({ sessao_ativa_id: sessaoId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_SESSAO, sessaoId, opcoesCookieSessao());
  return response;
}

/** Valida se a sessão deste dispositivo ainda é a ativa. */
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

  if (!cookieSessao || cookieSessao !== profile.sessao_ativa_id) {
    return NextResponse.json({ valida: false }, { status: 401 });
  }

  return NextResponse.json({ valida: true });
}

/** Remove cookie de sessão no logout. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_SESSAO);
  return response;
}

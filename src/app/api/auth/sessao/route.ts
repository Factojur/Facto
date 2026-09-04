import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_SESSAO, opcoesCookieSessao } from "@/lib/sessao-unica";
import {
  registrarSessaoPecasAtiva,
  statusSessaoPecasParaUi,
  validarSessaoPecasAtiva,
} from "@/lib/sessao-pecas-server";

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

  const status = await statusSessaoPecasParaUi(user.id);

  if (status.outraMaquina && !status.valida) {
    // Cookie presente mas de outra sessão — sinaliza conflito sem forçar 401
    // no login (a UI pergunta se assume).
    return NextResponse.json({
      valida: false,
      pendente: true,
      outraMaquina: true,
    });
  }

  if (status.outraMaquina) {
    return NextResponse.json({
      valida: true,
      pendente: true,
      outraMaquina: true,
    });
  }

  if (status.pendente) {
    return NextResponse.json({
      valida: true,
      pendente: true,
      outraMaquina: false,
    });
  }

  const validacao = await validarSessaoPecasAtiva(user.id);
  if (!validacao.ok) {
    return NextResponse.json(
      { valida: false, outraMaquina: true },
      { status: validacao.status }
    );
  }

  return NextResponse.json({
    valida: true,
    pendente: false,
    outraMaquina: false,
  });
}

/** Remove cookie de sessão no logout. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_SESSAO);
  return response;
}

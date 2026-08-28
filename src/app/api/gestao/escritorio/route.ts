import { NextResponse } from "next/server";
import { requireGestaoAuth, requireGestaoAuthMutation } from "@/lib/gestao/gestao-api-auth";
import {
  criarEscritorioGestao,
  listarConvitesAtivos,
  listarMembrosEscritorio,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";
import { rotuloPlanoGestao, limiteColaboradores } from "@/lib/gestao/limites-colaboradores";

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { user } = auth;
  const { escritorio, membro } = await obterContextoGestao(user.id);
  if (!escritorio || !membro) {
    return NextResponse.json({ escritorio: null, membro: null });
  }

  const membros = await listarMembrosEscritorio(escritorio.id);
  const convites = await listarConvitesAtivos(escritorio.id);

  return NextResponse.json({
    escritorio: {
      ...escritorio,
      planoRotulo: rotuloPlanoGestao(escritorio.planoGestao),
      limiteMembros: limiteColaboradores(escritorio.planoGestao),
    },
    membro: {
      ...membro,
      ehAdmin: membro.papel === "admin",
    },
    membros,
    convitesPendentes: convites.length,
  });
}

export async function POST(request: Request) {
  const auth = await requireGestaoAuthMutation(request, "escritorio-post", 10);
  if ("error" in auth && auth.error) return auth.error;

  const body = (await request.json()) as {
    nomeEscritorio?: string;
    oabResponsavel?: string;
  };

  const resultado = await criarEscritorioGestao({
    userId: auth.user.id,
    email: auth.email,
    nomeUsuario: auth.nome,
    nomeEscritorio: String(body.nomeEscritorio ?? ""),
    oabResponsavel: String(body.oabResponsavel ?? ""),
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 });
  }

  return NextResponse.json({ escritorio: resultado.escritorio });
}

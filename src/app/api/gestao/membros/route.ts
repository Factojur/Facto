import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  atualizarPapelMembroGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";
import type { PapelGestao } from "@/lib/gestao/gestao-types";

export async function PATCH(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const body = (await request.json()) as {
    userId?: string;
    papel?: PapelGestao;
  };

  const alvoUserId = String(body.userId ?? "").trim();
  const papel = body.papel;

  if (!alvoUserId) {
    return NextResponse.json({ error: "ID do membro obrigatório." }, { status: 400 });
  }
  if (papel !== "socio" && papel !== "colaborador") {
    return NextResponse.json(
      { error: "Papel inválido. Use sócio ou colaborador." },
      { status: 400 }
    );
  }

  const resultado = await atualizarPapelMembroGestao({
    adminUserId: auth.user.id,
    alvoUserId,
    papel,
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { membro } = await obterContextoGestao(auth.user.id);
  if (!membro) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  return NextResponse.json({ membro });
}

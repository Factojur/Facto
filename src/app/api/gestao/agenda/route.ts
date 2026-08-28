import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  criarEventoAgendaGestao,
  listarAgendaGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const eventos = await listarAgendaGestao(escritorio.id);
  return NextResponse.json({ eventos });
}

export async function POST(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const body = (await request.json()) as {
    titulo?: string;
    inicio?: string;
    fim?: string | null;
    local?: string;
    processoId?: string | null;
  };

  const evento = await criarEventoAgendaGestao(escritorio.id, {
    titulo: String(body.titulo ?? ""),
    inicio: String(body.inicio ?? ""),
    fim: body.fim ?? null,
    local: String(body.local ?? ""),
    processoId: body.processoId ?? null,
    responsavelUserId: auth.user.id,
  });

  return NextResponse.json({ evento });
}

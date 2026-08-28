import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  atualizarPrazoGestao,
  criarPrazoGestao,
  listarPrazosGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const prazos = await listarPrazosGestao(escritorio.id);
  return NextResponse.json({ prazos });
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
    vencimento?: string;
    processoId?: string | null;
  };

  const prazo = await criarPrazoGestao(escritorio.id, {
    titulo: String(body.titulo ?? ""),
    vencimento: String(body.vencimento ?? ""),
    processoId: body.processoId ?? null,
    responsavelUserId: auth.user.id,
  });

  return NextResponse.json({ prazo });
}

export async function PATCH(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const body = (await request.json()) as {
    id?: string;
    concluido?: boolean;
  };

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID do prazo obrigatório." }, { status: 400 });
  }

  const prazo = await atualizarPrazoGestao(escritorio.id, id, {
    concluido: body.concluido,
  });

  if (!prazo) {
    return NextResponse.json({ error: "Prazo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ prazo });
}

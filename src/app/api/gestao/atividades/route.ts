import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  criarAtividadeGestao,
  listarAtividadesGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";

export async function GET(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const processoId = searchParams.get("processoId") ?? undefined;
  const clienteId = searchParams.get("clienteId") ?? undefined;

  const atividades = await listarAtividadesGestao(escritorio.id, {
    processoId,
    clienteId,
  });
  return NextResponse.json({ atividades });
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
    conteudo?: string;
    processoId?: string | null;
    clienteId?: string | null;
  };

  const titulo = String(body.titulo ?? "").trim();
  if (!titulo) {
    return NextResponse.json({ error: "Título obrigatório." }, { status: 400 });
  }

  const atividade = await criarAtividadeGestao(escritorio.id, {
    titulo,
    conteudo: String(body.conteudo ?? ""),
    processoId: body.processoId ?? null,
    clienteId: body.clienteId ?? null,
    criadoPorUserId: auth.user.id,
  });

  return NextResponse.json({ atividade });
}

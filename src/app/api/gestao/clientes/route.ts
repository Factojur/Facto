import { NextResponse } from "next/server";
import { requireGestaoAuth, requireGestaoAuthMutation, respostaErroGestao } from "@/lib/gestao/gestao-api-auth";
import {
  atualizarClienteGestao,
  criarClienteGestao,
  listarClientesGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const clientes = await listarClientesGestao(escritorio.id);
  return NextResponse.json({ clientes });
}

export async function POST(request: Request) {
  const auth = await requireGestaoAuthMutation(request, "clientes-post", 40);
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const body = (await request.json()) as {
    nome?: string;
    email?: string;
    telefone?: string;
    documento?: string;
    notas?: string;
  };

  const nome = String(body.nome ?? "").trim();
  if (!nome) {
    return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
  }

  try {
    const cliente = await criarClienteGestao(escritorio.id, {
      nome,
      email: String(body.email ?? ""),
      telefone: String(body.telefone ?? ""),
      documento: String(body.documento ?? ""),
      notas: String(body.notas ?? ""),
    });
    return NextResponse.json({ cliente });
  } catch (e) {
    const resposta = respostaErroGestao(e);
    if (resposta) return resposta;
    throw e;
  }
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
    nome?: string;
    email?: string;
    telefone?: string;
    documento?: string;
    notas?: string;
  };

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  const cliente = await atualizarClienteGestao(escritorio.id, id, body);
  if (!cliente) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ cliente });
}

import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  atualizarProcessoGestao,
  criarProcessoGestao,
  listarProcessosGestao,
  obterContextoGestao,
  obterProcessoGestao,
} from "@/lib/gestao/gestao-service";
import type {
  PoloClienteGestao,
  StatusHonorarioGestao,
  TipoHonorarioGestao,
} from "@/lib/gestao/gestao-types";

export async function GET(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const processo = await obterProcessoGestao(escritorio.id, id);
    if (!processo) {
      return NextResponse.json({ error: "Processo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ processo });
  }

  const processos = await listarProcessosGestao(escritorio.id);
  return NextResponse.json({ processos });
}

export async function POST(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const body = (await request.json()) as {
    numero?: string;
    cliente?: string;
    clienteId?: string | null;
    area?: string;
    vara?: string;
    comarca?: string;
    tribunal?: string;
    valorCausaCentavos?: number | null;
    poloCliente?: PoloClienteGestao | null;
  };

  const processo = await criarProcessoGestao(escritorio.id, {
    numero: String(body.numero ?? ""),
    cliente: String(body.cliente ?? ""),
    clienteId: body.clienteId ?? null,
    area: String(body.area ?? ""),
    vara: body.vara,
    comarca: body.comarca,
    tribunal: body.tribunal,
    valorCausaCentavos: body.valorCausaCentavos ?? null,
    poloCliente: body.poloCliente ?? null,
    responsavelUserId: auth.user.id,
  });

  return NextResponse.json({ processo });
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
    numero?: string;
    cliente?: string;
    clienteId?: string | null;
    area?: string;
    status?: "ativo" | "arquivado";
    vara?: string;
    comarca?: string;
    tribunal?: string;
    valorCausaCentavos?: number | null;
    poloCliente?: PoloClienteGestao | null;
    honorarioTipo?: TipoHonorarioGestao;
    honorarioValorCentavos?: number | null;
    honorarioPercentual?: number | null;
    honorarioStatus?: StatusHonorarioGestao;
    honorarioObservacao?: string;
    notas?: string;
  };

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
  }

  const { id: _id, ...patch } = body;
  const processo = await atualizarProcessoGestao(escritorio.id, id, patch);
  if (!processo) {
    return NextResponse.json({ error: "Processo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ processo });
}

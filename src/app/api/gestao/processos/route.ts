import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import { podeVerHonorariosGestao, sanitizarProcessoHonorarios } from "@/lib/gestao/gestao-permissoes";
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

  const { escritorio, membro } = await obterContextoGestao(auth.user.id);
  if (!escritorio) {
    return NextResponse.json({ error: "Sem escritório." }, { status: 400 });
  }

  const podeVerHonorarios = podeVerHonorariosGestao(membro?.papel);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const processo = await obterProcessoGestao(escritorio.id, id);
    if (!processo) {
      return NextResponse.json({ error: "Processo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({
      processo: sanitizarProcessoHonorarios(processo, podeVerHonorarios),
      podeVerHonorarios,
    });
  }

  const processos = await listarProcessosGestao(escritorio.id);
  return NextResponse.json({
    processos: processos.map((p) =>
      sanitizarProcessoHonorarios(p, podeVerHonorarios)
    ),
    podeVerHonorarios,
  });
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

  const { escritorio, membro } = await obterContextoGestao(auth.user.id);
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

  const podeVerHonorarios = podeVerHonorariosGestao(membro?.papel);
  const { id: _id, ...patch } = body;

  if (
    !podeVerHonorarios &&
    ("honorarioTipo" in patch ||
      "honorarioValorCentavos" in patch ||
      "honorarioPercentual" in patch ||
      "honorarioStatus" in patch ||
      "honorarioObservacao" in patch)
  ) {
    return NextResponse.json(
      { error: "Honorários visíveis apenas para titular e sócios." },
      { status: 403 }
    );
  }

  const processo = await atualizarProcessoGestao(escritorio.id, id, patch);
  if (!processo) {
    return NextResponse.json({ error: "Processo não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    processo: sanitizarProcessoHonorarios(processo, podeVerHonorarios),
  });
}

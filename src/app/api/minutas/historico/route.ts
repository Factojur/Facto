import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lerSyncNuvemDeMetadata } from "@/lib/sync-nuvem-lgpd";

export const runtime = "nodejs";

const MAX_PECA = 120_000;

async function gateSync() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }
  const status = lerSyncNuvemDeMetadata(user.user_metadata ?? {});
  if (!status.optIn) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Sincronização na nuvem não ativada. Aceite o opt-in LGPD na aba Complementos do assistente.",
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, supabase, user };
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    areaId: String(row.area_id ?? ""),
    titulo: String(row.titulo ?? ""),
    especiePeca: row.especie_peca ? String(row.especie_peca) : null,
    tipoAcao: row.tipo_acao ? String(row.tipo_acao) : null,
    foro: row.foro ? String(row.foro) : null,
    numeroProcesso: row.numero_processo ? String(row.numero_processo) : null,
    resumo: row.resumo ? String(row.resumo) : null,
    geradoPorIA: Boolean(row.gerado_por_ia),
    origem: (row.origem === "formulario" ? "formulario" : "chat") as
      | "chat"
      | "formulario",
    sessaoId: row.sessao_id ? String(row.sessao_id) : null,
    criadoEm: String(row.criado_em ?? ""),
    atualizadoEm: String(row.atualizado_em ?? ""),
  };
}

export async function GET() {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.supabase
    .from("minutas_historico")
    .select(
      "id, area_id, titulo, especie_peca, tipo_acao, foro, numero_processo, resumo, gerado_por_ia, origem, sessao_id, criado_em, atualizado_em"
    )
    .eq("profile_id", gate.user.id)
    .order("atualizado_em", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json(
      {
        error:
          "Histórico na nuvem indisponível. Rode supabase/migration-sync-nuvem-lgpd.sql.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    minutas: (data ?? []).map((r) => mapRow(r as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  let body: {
    areaId?: string;
    titulo?: string;
    especiePeca?: string;
    tipoAcao?: string;
    foro?: string;
    numeroProcesso?: string;
    resumo?: string;
    pecaTexto?: string;
    pecaHtml?: string;
    geradoPorIA?: boolean;
    origem?: string;
    sessaoId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const titulo = String(body.titulo ?? "").trim();
  const areaId = String(body.areaId ?? "").trim();
  if (titulo.length < 3 || !areaId) {
    return NextResponse.json(
      { error: "Título (≥3) e areaId são obrigatórios." },
      { status: 400 }
    );
  }

  const pecaTexto = String(body.pecaTexto ?? "").slice(0, MAX_PECA);
  const pecaHtml = String(body.pecaHtml ?? "").slice(0, MAX_PECA);
  const resumo =
    String(body.resumo ?? "").trim() ||
    pecaTexto.replace(/\s+/g, " ").trim().slice(0, 200);

  const { data, error } = await gate.supabase
    .from("minutas_historico")
    .insert({
      profile_id: gate.user.id,
      area_id: areaId,
      titulo,
      especie_peca: body.especiePeca?.trim() || null,
      tipo_acao: body.tipoAcao?.trim() || null,
      foro: body.foro?.trim() || null,
      numero_processo: body.numeroProcesso?.trim() || null,
      resumo,
      peca_texto: pecaTexto || null,
      peca_html: pecaHtml || null,
      gerado_por_ia: body.geradoPorIA !== false,
      origem: body.origem === "formulario" ? "formulario" : "chat",
      sessao_id: body.sessaoId?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "Não foi possível salvar a minuta na nuvem.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function DELETE(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe id." }, { status: 400 });
  }

  const { error } = await gate.supabase
    .from("minutas_historico")
    .delete()
    .eq("id", id)
    .eq("profile_id", gate.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

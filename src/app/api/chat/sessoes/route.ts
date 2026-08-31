import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lerSyncNuvemDeMetadata } from "@/lib/sync-nuvem-lgpd";

export const runtime = "nodejs";

const MAX_SNAPSHOT = 150_000;

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
            "Sincronização na nuvem não ativada. Aceite o opt-in LGPD no assistente.",
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, supabase, user };
}

function mapRow(row: Record<string, unknown>, comSnapshot = false) {
  const base = {
    id: String(row.id),
    sessaoId: String(row.sessao_id ?? ""),
    titulo: String(row.titulo ?? ""),
    areaId: String(row.area_id ?? ""),
    criadoEm: String(row.criado_em ?? ""),
    atualizadoEm: String(row.atualizado_em ?? ""),
    historicoPecas: Array.isArray(row.historico_pecas) ? row.historico_pecas : [],
  };
  if (!comSnapshot) return base;
  return {
    ...base,
    snapshot: row.snapshot ?? null,
  };
}

export async function GET(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const sessaoId = new URL(request.url).searchParams.get("sessaoId")?.trim();

  if (sessaoId) {
    const { data, error } = await gate.supabase
      .from("chat_sessoes_nuvem")
      .select(
        "id, sessao_id, titulo, area_id, criado_em, atualizado_em, historico_pecas, snapshot"
      )
      .eq("profile_id", gate.user.id)
      .eq("sessao_id", sessaoId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Não foi possível carregar a sessão.", detalhe: error.message },
        { status: 503 }
      );
    }
    if (!data) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      sessao: mapRow(data as Record<string, unknown>, true),
    });
  }

  const { data, error } = await gate.supabase
    .from("chat_sessoes_nuvem")
    .select(
      "id, sessao_id, titulo, area_id, criado_em, atualizado_em, historico_pecas"
    )
    .eq("profile_id", gate.user.id)
    .order("atualizado_em", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json(
      {
        error:
          "Sessões na nuvem indisponíveis. Rode supabase/migration-chat-sessoes-nuvem.sql.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    sessoes: (data ?? []).map((r) => mapRow(r as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  let body: {
    sessaoId?: string;
    titulo?: string;
    areaId?: string;
    snapshot?: unknown;
    historicoPecas?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const sessaoId = String(body.sessaoId ?? "").trim();
  const titulo = String(body.titulo ?? "").trim();
  const areaId = String(body.areaId ?? "").trim();
  if (sessaoId.length < 4 || titulo.length < 2 || !areaId) {
    return NextResponse.json(
      { error: "sessaoId, titulo e areaId são obrigatórios." },
      { status: 400 }
    );
  }

  let snapshot = body.snapshot ?? {};
  const snapshotRaw = JSON.stringify(snapshot);
  if (snapshotRaw.length > MAX_SNAPSHOT) {
    const s = snapshot as Record<string, unknown>;
    snapshot = {
      ...s,
      peca:
        typeof s.peca === "string" ? (s.peca as string).slice(0, 60_000) : "",
      pecaHtml:
        typeof s.pecaHtml === "string"
          ? (s.pecaHtml as string).slice(0, 60_000)
          : "",
    };
  }

  const historicoPecas = Array.isArray(body.historicoPecas)
    ? body.historicoPecas.slice(0, 12)
    : [];

  const { data, error } = await gate.supabase
    .from("chat_sessoes_nuvem")
    .upsert(
      {
        profile_id: gate.user.id,
        sessao_id: sessaoId,
        titulo,
        area_id: areaId,
        snapshot,
        historico_pecas: historicoPecas,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "profile_id,sessao_id" }
    )
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível sincronizar a sessão.", detalhe: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function DELETE(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const sessaoId = new URL(request.url).searchParams.get("sessaoId")?.trim();
  if (!sessaoId) {
    return NextResponse.json({ error: "Informe sessaoId." }, { status: 400 });
  }

  const { error } = await gate.supabase
    .from("chat_sessoes_nuvem")
    .delete()
    .eq("profile_id", gate.user.id)
    .eq("sessao_id", sessaoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

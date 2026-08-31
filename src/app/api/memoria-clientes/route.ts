import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { lerSyncNuvemDeMetadata } from "@/lib/sync-nuvem-lgpd";
import type { PerfilClienteSalvo } from "@/lib/memoria-cliente-local";

export const runtime = "nodejs";

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
  if (!lerSyncNuvemDeMetadata(user.user_metadata ?? {}).optIn) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Opt-in de sync não ativo." }, { status: 403 }),
    };
  }
  return { ok: true as const, supabase, user };
}

function mapPerfil(row: Record<string, unknown>): PerfilClienteSalvo {
  const dados = (row.dados ?? {}) as {
    autores?: PerfilClienteSalvo["autores"];
    reus?: PerfilClienteSalvo["reus"];
  };
  const atualizadoEm = row.atualizado_em
    ? new Date(String(row.atualizado_em)).getTime()
    : Date.now();
  return {
    chave: String(row.chave ?? ""),
    rotulo: String(row.rotulo ?? ""),
    autores: Array.isArray(dados.autores) ? dados.autores : [],
    reus: Array.isArray(dados.reus) ? dados.reus : [],
    atualizadoEm,
  };
}

export async function GET() {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.supabase
    .from("memoria_clientes_nuvem")
    .select("chave, rotulo, dados, atualizado_em")
    .eq("profile_id", gate.user.id)
    .order("atualizado_em", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json(
      {
        error:
          "Memória na nuvem indisponível. Rode supabase/migration-sync-nuvem-lgpd.sql.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    perfis: (data ?? []).map((r) => mapPerfil(r as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  let body: {
    chave?: string;
    rotulo?: string;
    autores?: PerfilClienteSalvo["autores"];
    reus?: PerfilClienteSalvo["reus"];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const chave = String(body.chave ?? "").trim();
  const rotulo = String(body.rotulo ?? "").trim();
  if (chave.length < 3 || rotulo.length < 3) {
    return NextResponse.json({ error: "Chave e rótulo inválidos." }, { status: 400 });
  }

  const { error } = await gate.supabase.from("memoria_clientes_nuvem").upsert(
    {
      profile_id: gate.user.id,
      chave,
      rotulo,
      dados: {
        autores: body.autores ?? [],
        reus: body.reus ?? [],
      },
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "profile_id,chave" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Falha ao salvar memória.", detalhe: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const gate = await gateSync();
  if (!gate.ok) return gate.response;

  const chave = new URL(request.url).searchParams.get("chave")?.trim();
  if (!chave) {
    return NextResponse.json({ error: "Informe chave." }, { status: 400 });
  }

  await gate.supabase
    .from("memoria_clientes_nuvem")
    .delete()
    .eq("profile_id", gate.user.id)
    .eq("chave", chave);

  return NextResponse.json({ ok: true });
}

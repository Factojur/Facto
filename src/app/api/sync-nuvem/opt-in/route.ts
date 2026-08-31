import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  SYNC_NUVEM_VERSAO,
  lerSyncNuvemDeMetadata,
} from "@/lib/sync-nuvem-lgpd";

export const runtime = "nodejs";

async function usuarioLogado() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await usuarioLogado();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const meta = lerSyncNuvemDeMetadata(user.user_metadata ?? {});

  const { error } = await supabase
    .from("profiles")
    .select("sync_nuvem_opt_in, sync_nuvem_versao, sync_nuvem_opt_in_em")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    optIn: meta.optIn,
    versao: meta.versao,
    optInEm: meta.optInEm,
    migrationOk: !error,
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await usuarioLogado();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { confirmar?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.confirmar) {
    return NextResponse.json(
      {
        error:
          "Confirme o consentimento para sincronização na nuvem (LGPD).",
      },
      { status: 400 }
    );
  }

  const optInEm = new Date().toISOString();

  const { error: metaErro } = await supabase.auth.updateUser({
    data: {
      sync_nuvem_opt_in: true,
      sync_nuvem_versao: SYNC_NUVEM_VERSAO,
      sync_nuvem_opt_in_em: optInEm,
    },
  });

  if (metaErro) {
    return NextResponse.json(
      { error: "Não foi possível registrar o consentimento." },
      { status: 500 }
    );
  }

  const { error: perfilErro } = await supabase
    .from("profiles")
    .update({
      sync_nuvem_opt_in: true,
      sync_nuvem_versao: SYNC_NUVEM_VERSAO,
      sync_nuvem_opt_in_em: optInEm,
    })
    .eq("id", user.id);

  if (perfilErro) {
    console.warn("[sync-nuvem] profiles:", perfilErro.message);
  }

  return NextResponse.json({
    ok: true,
    optIn: true,
    versao: SYNC_NUVEM_VERSAO,
    optInEm,
  });
}

export async function DELETE() {
  const { supabase, user } = await usuarioLogado();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await supabase.auth.updateUser({
    data: {
      sync_nuvem_opt_in: false,
      sync_nuvem_versao: null,
      sync_nuvem_opt_in_em: null,
    },
  });

  await supabase
    .from("profiles")
    .update({
      sync_nuvem_opt_in: false,
      sync_nuvem_versao: null,
      sync_nuvem_opt_in_em: null,
    })
    .eq("id", user.id);

  return NextResponse.json({ ok: true, optIn: false });
}

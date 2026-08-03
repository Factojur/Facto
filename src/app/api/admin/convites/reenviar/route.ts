import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-auth";
import { enviarEmailConvite } from "@/lib/email/convite-pago";

/**
 * POST /api/admin/convites/reenviar
 * Reenvia o e-mail de boas-vindas/cadastro de um convite pendente.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Informe o id do convite." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: convite, error } = await admin
      .from("convites_pagos")
      .select("id, email, token, status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!convite) {
      return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
    }
    if (convite.status !== "pendente") {
      return NextResponse.json(
        { error: "Só é possível reenviar convites pendentes." },
        { status: 400 }
      );
    }

    await enviarEmailConvite(convite.email, convite.token);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[admin/convites/reenviar]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error ? erro.message : "Falha ao reenviar convite.",
      },
      { status: 500 }
    );
  }
}

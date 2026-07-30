import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marca um convite de cadastro (gerado após pagamento aprovado) como usado.
 * Chamado pelo formulário de /cadastro logo depois que a conta é criada com
 * sucesso, para impedir que o mesmo link seja reaproveitado por outra
 * pessoa.
 */
export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const token = body.token;
  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    // Sem service role configurada, não há como marcar o convite — mas isso
    // não deve impedir o usuário de seguir para o dashboard, já que a conta
    // já foi criada nesse ponto.
    return NextResponse.json({ ok: true, avisado: "Serviço não configurado." });
  }

  const { data: convite, error } = await admin
    .from("convites_pagos")
    .select("id, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }

  if (convite.status === "usado") {
    return NextResponse.json({ ok: true, jaUsado: true });
  }

  await admin
    .from("convites_pagos")
    .update({ status: "usado", usado_em: new Date().toISOString() })
    .eq("id", convite.id);

  return NextResponse.json({ ok: true });
}

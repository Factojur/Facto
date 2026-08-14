import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Marca um convite como usado. Preferir /api/cadastro (consome na criação).
 * Mantido para reenvio/admin e retries.
 */
export async function POST(request: Request) {
  let body: { token?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const token = body.token?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Serviço não configurado." }, { status: 503 });
  }

  const { data: convite, error } = await admin
    .from("convites_pagos")
    .select("id, status, email")
    .eq("token", token)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }

  if (email && String(convite.email).trim().toLowerCase() !== email) {
    return NextResponse.json({ error: "E-mail não confere com o convite." }, { status: 403 });
  }

  if (convite.status === "usado") {
    return NextResponse.json({ ok: true, jaUsado: true });
  }

  await admin
    .from("convites_pagos")
    .update({ status: "usado", usado_em: new Date().toISOString() })
    .eq("id", convite.id)
    .eq("status", "pendente");

  return NextResponse.json({ ok: true });
}

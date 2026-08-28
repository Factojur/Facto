import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACEITE_TERMOS_VERSAO } from "@/lib/aceite-termos";
import { dentroDoLimite } from "@/lib/rate-limit-memoria";
import { emailDescartavel } from "@/lib/trial";

/**
 * POST /api/gestao/cadastro
 * Conta gratuita só para FACTO Gestão (sem plano de minutas).
 */
export async function POST(request: Request) {
  let body: {
    email?: string;
    senha?: string;
    nomeCompleto?: string;
    termoAceito?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const senha = String(body.senha ?? "");
  const nomeCompleto = String(body.nomeCompleto ?? "").trim();

  if (!email.includes("@") || senha.length < 6 || nomeCompleto.length < 3) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e senha (mínimo 6 caracteres)." },
      { status: 400 }
    );
  }

  if (!body.termoAceito) {
    return NextResponse.json(
      { error: "Aceite os termos de uso e a política de privacidade." },
      { status: 400 }
    );
  }

  if (emailDescartavel(email)) {
    return NextResponse.json(
      { error: "Use um e-mail permanente (não temporário)." },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (
    !dentroDoLimite({
      chave: `gestao-cadastro-ip:${ip}`,
      max: 8,
      janelaMs: 60 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { error: "Muitas tentativas deste IP. Tente mais tarde." },
      { status: 429 }
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Cadastro temporariamente indisponível." },
      { status: 503 }
    );
  }

  const aceitoEm = new Date().toISOString();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome_completo: nomeCompleto,
      aceite_termos_em: aceitoEm,
      aceite_termos_versao: ACEITE_TERMOS_VERSAO,
      origem_cadastro: "gestao",
    },
  });

  if (createErr) {
    const msg = createErr.message.toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return NextResponse.json(
        { error: "Este e-mail já tem conta. Entre em /gestao/login." },
        { status: 409 }
      );
    }
    console.error("[gestao/cadastro]", createErr.message);
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 }
    );
  }

  const userId = created.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Falha ao criar usuário." }, { status: 500 });
  }

  await admin.from("profiles").upsert(
    {
      id: userId,
      nome_completo: nomeCompleto,
      cpf: `pending-${userId}`,
      email,
      tipo_usuario: "leigo",
    },
    { onConflict: "id" }
  );

  return NextResponse.json({
    ok: true,
    redirect: "/gestao/login?cadastro=ok",
  });
}

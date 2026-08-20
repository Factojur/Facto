import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dentroDoLimite } from "@/lib/rate-limit-memoria";
import { TERMO_LEIGO_VERSAO } from "@/lib/termo-leigo";
import {
  areaValidaParaTrial,
  dataFimTrial,
  emailDescartavel,
} from "@/lib/trial";

/**
 * POST /api/trial/cadastro
 * Conta de teste: 1 área · 2 peças · 7 dias · sem OAB.
 */
export async function POST(request: Request) {
  let body: {
    email?: string;
    senha?: string;
    nomeCompleto?: string;
    areaId?: string;
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
  const areaId = String(body.areaId ?? "").trim().toLowerCase();

  if (!email.includes("@") || senha.length < 6 || nomeCompleto.length < 3) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e senha (mínimo 6 caracteres)." },
      { status: 400 }
    );
  }

  if (!body.termoAceito) {
    return NextResponse.json(
      { error: "Aceite os termos para iniciar o teste." },
      { status: 400 }
    );
  }

  if (!areaValidaParaTrial(areaId)) {
    return NextResponse.json(
      { error: "Escolha uma área disponível para o teste." },
      { status: 400 }
    );
  }

  if (emailDescartavel(email)) {
    return NextResponse.json(
      { error: "Use um e-mail permanente (não temporário) para o teste." },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (
    !dentroDoLimite({ chave: `trial-ip:${ip}`, max: 5, janelaMs: 60 * 60 * 1000 })
  ) {
    return NextResponse.json(
      { error: "Muitas tentativas deste IP. Tente mais tarde." },
      { status: 429 }
    );
  }
  if (
    !dentroDoLimite({
      chave: `trial-email:${email}`,
      max: 2,
      janelaMs: 24 * 60 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { error: "Este e-mail já pediu teste recentemente." },
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

  const trialAte = dataFimTrial().toISOString();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: {
      nome_completo: nomeCompleto,
      tipo_usuario: "leigo",
      trial: true,
    },
  });

  const jaExiste =
    createErr?.message?.toLowerCase().includes("already") ||
    createErr?.message?.toLowerCase().includes("registered");

  if (createErr && !jaExiste) {
    console.error("[trial/cadastro]", createErr.message);
    return NextResponse.json(
      { error: "Não foi possível criar a conta de teste." },
      { status: 500 }
    );
  }

  if (jaExiste) {
    return NextResponse.json(
      {
        error: "Este e-mail já possui conta. Faça login — o teste não reabre.",
        codigo: "JA_CADASTRADO",
      },
      { status: 409 }
    );
  }

  const userId = created?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Não foi possível criar a conta de teste." },
      { status: 500 }
    );
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      nome_completo: nomeCompleto,
      email,
      tipo_usuario: "leigo",
      termo_leigo_aceito_em: new Date().toISOString(),
      termo_leigo_versao: TERMO_LEIGO_VERSAO,
      trial_ate: trialAte,
      trial_area_id: areaId,
      trial_pecas_usadas: 0,
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    console.error("[trial/cadastro] profile", profileErr.message);
    return NextResponse.json(
      {
        error:
          "Conta criada, mas o trial não gravou. Confirme a migration-trial.sql no Supabase.",
        codigo: "MIGRATION",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    areaId,
    trialAte,
    redirect: "/login?trial=ok",
  });
}

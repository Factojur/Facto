import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dentroDoLimite } from "@/lib/rate-limit-memoria";
import { TERMO_LEIGO_VERSAO } from "@/lib/termo-leigo";
import { acessoAssinaturaLiberado } from "@/lib/acesso-assinatura";
import {
  areaValidaParaTrial,
  dataFimTrial,
  trialAindaValido,
  type TrialPerfil,
} from "@/lib/trial";

/**
 * Ativa trial na conta Google já autenticada (área + termos).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: {
    areaId?: string;
    termoAceito?: boolean;
    nomeCompleto?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const areaId = String(body.areaId ?? "").trim().toLowerCase();
  const nomeCompleto = String(body.nomeCompleto ?? "").trim();

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

  const email = user.email.trim().toLowerCase();
  if (
    !dentroDoLimite({
      chave: `trial-google:${user.id}`,
      max: 3,
      janelaMs: 24 * 60 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente mais tarde." },
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

  if (await acessoAssinaturaLiberado(email)) {
    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select(
      "id, nome_completo, trial_ate, trial_area_id, trial_pecas_usadas"
    )
    .eq("id", user.id)
    .maybeSingle();

  const trial = perfil as TrialPerfil | null;

  if (trialAindaValido(trial) && trial?.trial_area_id) {
    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  }

  if (perfil?.trial_ate) {
    return NextResponse.json(
      {
        error:
          "Este e-mail já utilizou o teste grátis. Faça login e assine um plano para continuar.",
        codigo: "TRIAL_JA_USADO",
      },
      { status: 409 }
    );
  }

  const nome =
    nomeCompleto.length >= 3
      ? nomeCompleto
      : String(perfil?.nome_completo ?? "").trim() ||
        email.split("@")[0] ||
        "Usuário";

  const trialAte = dataFimTrial().toISOString();
  const campos = {
    nome_completo: nome,
    email,
    tipo_usuario: "leigo" as const,
    termo_leigo_aceito_em: new Date().toISOString(),
    termo_leigo_versao: TERMO_LEIGO_VERSAO,
    trial_ate: trialAte,
    trial_area_id: areaId,
    trial_pecas_usadas: 0,
  };

  if (perfil?.id) {
    const { error: updErr } = await admin
      .from("profiles")
      .update(campos)
      .eq("id", user.id);
    if (updErr) {
      console.error("[trial/ativar-google]", updErr.message);
      return NextResponse.json(
        { error: "Não foi possível ativar o teste." },
        { status: 500 }
      );
    }
  } else {
    const { error: insErr } = await admin.from("profiles").insert({
      id: user.id,
      cpf: `pending-${user.id}`,
      ...campos,
    });
    if (insErr) {
      console.error("[trial/ativar-google] insert", insErr.message);
      return NextResponse.json(
        { error: "Não foi possível ativar o teste." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    areaId,
    trialAte,
    redirect: "/dashboard",
  });
}

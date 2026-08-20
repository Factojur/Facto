import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { acessoAssinaturaLiberado } from "@/lib/acesso-assinatura";
import {
  COOKIE_SESSAO,
  criarIdSessao,
  opcoesCookieSessao,
} from "@/lib/sessao-unica";

function nomeDeMetadata(meta: Record<string, unknown> | undefined): string {
  const candidatos = [
    meta?.nome_completo,
    meta?.full_name,
    meta?.name,
  ];
  for (const c of candidatos) {
    if (typeof c === "string" && c.trim().length >= 2) return c.trim();
  }
  return "";
}

/**
 * Após OAuth Google: garante perfil, registra sessão única e define próximo passo.
 * Body opcional: { intent?: "trial" | "login" }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let intent: "trial" | "login" = "login";
  try {
    const body = (await request.json()) as { intent?: string };
    if (body.intent === "trial") intent = "trial";
  } catch {
    /* sem body */
  }

  const email = user.email.trim().toLowerCase();
  const nomeMeta = nomeDeMetadata(
    user.user_metadata as Record<string, unknown> | undefined
  );

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Auth temporariamente indisponível." },
      { status: 503 }
    );
  }

  const { data: perfilExistente } = await admin
    .from("profiles")
    .select(
      "id, nome_completo, email, trial_ate, trial_area_id, trial_pecas_usadas, sessao_ativa_id"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!perfilExistente) {
    const { error: insErr } = await admin.from("profiles").upsert(
      {
        id: user.id,
        nome_completo: nomeMeta || email.split("@")[0] || "Usuário",
        cpf: `pending-${user.id}`,
        email,
        tipo_usuario: "leigo",
      },
      { onConflict: "id" }
    );
    if (insErr) {
      console.error("[google-bootstrap] profile", insErr.message);
      return NextResponse.json(
        { error: "Não foi possível criar o perfil." },
        { status: 500 }
      );
    }
  } else if (
    nomeMeta &&
    (!perfilExistente.nome_completo ||
      String(perfilExistente.nome_completo).trim().length < 2)
  ) {
    await admin
      .from("profiles")
      .update({ nome_completo: nomeMeta })
      .eq("id", user.id);
  }

  const sessaoId = criarIdSessao();
  const { error: sessaoErr } = await admin
    .from("profiles")
    .update({ sessao_ativa_id: sessaoId })
    .eq("id", user.id);

  if (sessaoErr) {
    return NextResponse.json({ error: sessaoErr.message }, { status: 500 });
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("trial_ate, trial_area_id, trial_pecas_usadas")
    .eq("id", user.id)
    .maybeSingle();

  const liberado = await acessoAssinaturaLiberado(email);

  let redirect = "/dashboard";
  if (liberado) {
    redirect = "/dashboard";
  } else if (perfil?.trial_ate) {
    redirect = "/login?acesso=expirado";
  } else {
    redirect = "/onboarding/trial";
  }

  const response = NextResponse.json({ ok: true, redirect, intent });
  response.cookies.set(COOKIE_SESSAO, sessaoId, opcoesCookieSessao());
  return response;
}

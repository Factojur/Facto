import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { acessoAssinaturaLiberado } from "@/lib/acesso-assinatura";
import { ACEITE_TERMOS_VERSAO, temAceiteTermos } from "@/lib/aceite-termos";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";
import {
  COOKIE_SESSAO,
  obterCookieSessao,
  opcoesCookieSessao,
} from "@/lib/sessao-unica";
import { registrarSessaoPecasAtiva } from "@/lib/sessao-pecas-server";

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
  let destinoGestao = false;
  let assumirSessao = false;
  try {
    const body = (await request.json()) as {
      intent?: string;
      destino?: string;
      assumirSessao?: boolean;
    };
    if (body.intent === "trial") intent = "trial";
    if (body.destino === "gestao") destinoGestao = true;
    if (body.assumirSessao === true) assumirSessao = true;
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

  const { data: perfil } = await admin
    .from("profiles")
    .select("trial_ate, trial_area_id, trial_pecas_usadas")
    .eq("id", user.id)
    .maybeSingle();

  const liberado = await acessoAssinaturaLiberado(email);
  const loginGestao = destinoGestao && gestaoHabilitada();

  if (loginGestao && !temAceiteTermos(user.user_metadata as Record<string, unknown>)) {
    const aceitoEm = new Date().toISOString();
    await supabase.auth.updateUser({
      data: {
        aceite_termos_em: aceitoEm,
        aceite_termos_versao: ACEITE_TERMOS_VERSAO,
        origem_cadastro: "gestao-google",
      },
    });
  }

  let redirect = "/dashboard";
  if (loginGestao) {
    redirect = "/gestao";
  } else if (liberado) {
    redirect = "/dashboard";
  } else if (perfil?.trial_ate) {
    redirect = "/login?acesso=expirado";
  } else {
    redirect = "/onboarding/trial";
  }

  const response = NextResponse.json({ ok: true, redirect, intent });

  if (!loginGestao) {
    const cookieAtual = await obterCookieSessao();
    const sessaoAtiva = perfilExistente?.sessao_ativa_id ?? null;
    const outraMaquina = Boolean(
      sessaoAtiva && cookieAtual !== sessaoAtiva
    );
    if (outraMaquina && !assumirSessao) {
      return NextResponse.json({
        ok: false,
        precisaConfirmarSessao: true,
        redirect: "/dashboard",
      });
    }

    const reg = await registrarSessaoPecasAtiva(user.id);
    if (!reg.ok) {
      return NextResponse.json({ error: reg.erro }, { status: 500 });
    }
    response.cookies.set(COOKIE_SESSAO, reg.sessaoId, opcoesCookieSessao());
  }

  return response;
}

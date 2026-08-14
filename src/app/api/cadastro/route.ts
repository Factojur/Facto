import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateOabMock } from "@/lib/validate-oab";
import { TERMO_LEIGO_VERSAO } from "@/lib/termo-leigo";

/**
 * POST /api/cadastro
 * Cria a conta só com convite pendente (gerado após pagamento MP) e e-mail
 * idêntico ao do convite. O token é marcado como usado nesta mesma chamada.
 */
export async function POST(request: Request) {
  let body: {
    token?: string;
    email?: string;
    senha?: string;
    nomeCompleto?: string;
    cpf?: string;
    souAdvogado?: boolean;
    oabNumero?: string;
    termoAceito?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const token = String(body.token ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const senha = String(body.senha ?? "");
  const nomeCompleto = String(body.nomeCompleto ?? "").trim();
  const cpf = String(body.cpf ?? "").replace(/\D/g, "");
  const souAdvogado = Boolean(body.souAdvogado);
  const oabNumero = souAdvogado ? String(body.oabNumero ?? "").trim() : "";
  let role: string | undefined;

  if (!token || !email.includes("@") || senha.length < 6 || !nomeCompleto || cpf.length < 11) {
    return NextResponse.json(
      { error: "Preencha nome, CPF, e-mail do convite e senha (mínimo 6 caracteres)." },
      { status: 400 }
    );
  }

  if (souAdvogado) {
    const oab = validateOabMock({ email, senha, oabNumero });
    if (!oab.valid) {
      return NextResponse.json({ error: oab.message }, { status: 400 });
    }
    role = oab.role;
  } else if (!body.termoAceito) {
    return NextResponse.json(
      { error: "Você precisa marcar que leu e concorda com os termos para continuar sem OAB." },
      { status: 400 }
    );
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Cadastro temporariamente indisponível. Tente de novo em instantes." },
      { status: 503 }
    );
  }

  const { data: convite, error: conviteErr } = await admin
    .from("convites_pagos")
    .select("id, email, status")
    .eq("token", token)
    .maybeSingle();

  if (conviteErr || !convite) {
    return NextResponse.json(
      { error: "Convite inválido. Use o link enviado após o pagamento." },
      { status: 403 }
    );
  }

  if (convite.status !== "pendente") {
    return NextResponse.json(
      { error: "Este link de cadastro já foi utilizado. Faça login ou peça um novo convite." },
      { status: 403 }
    );
  }

  const emailConvite = String(convite.email ?? "").trim().toLowerCase();
  if (emailConvite !== email) {
    return NextResponse.json(
      { error: "O e-mail precisa ser o mesmo do pagamento. Não é possível cadastrar outro endereço neste convite." },
      { status: 403 }
    );
  }

  const userMetadata: Record<string, string> = {
    nome_completo: nomeCompleto,
    cpf,
    tipo_usuario: souAdvogado ? "advogado" : "leigo",
  };
  if (souAdvogado) userMetadata.oab_numero = oabNumero;
  if (role) userMetadata.role = role;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  const jaExiste =
    createErr?.message?.toLowerCase().includes("already") ||
    createErr?.message?.toLowerCase().includes("registered");

  if (createErr && !jaExiste) {
    console.error("[cadastro] createUser", createErr.message);
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente de novo." },
      { status: 500 }
    );
  }

  const userId = created?.user?.id;
  if (!jaExiste && !userId) {
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente de novo." },
      { status: 500 }
    );
  }

  if (userId) {
    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        nome_completo: nomeCompleto,
        cpf,
        email,
        oab_numero: souAdvogado ? oabNumero : null,
        tipo_usuario: souAdvogado ? "advogado" : "leigo",
        termo_leigo_aceito_em: souAdvogado ? null : new Date().toISOString(),
        termo_leigo_versao: souAdvogado ? null : TERMO_LEIGO_VERSAO,
      },
      { onConflict: "id" }
    );
    if (profileErr) {
      console.error("[cadastro] profile", profileErr.message);
    }
  }

  const agora = new Date().toISOString();
  const { data: consumido } = await admin
    .from("convites_pagos")
    .update({ status: "usado", usado_em: agora })
    .eq("id", convite.id)
    .eq("status", "pendente")
    .select("id")
    .maybeSingle();

  if (!consumido && !jaExiste) {
    console.warn("[cadastro] convite já consumido em corrida", convite.id);
  }

  if (jaExiste) {
    return NextResponse.json(
      {
        error: "Este e-mail já possui conta. Entre com sua senha — o link de cadastro não pode ser reutilizado.",
        codigo: "JA_CADASTRADO",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}

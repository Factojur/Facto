import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmailRedefinirSenha } from "@/lib/email/redefinir-senha";
import { getSiteUrl } from "@/lib/site-url";

/**
 * POST /api/auth/esqueci-senha
 * Gera link de recovery no Supabase e envia e-mail via Resend (suporte@).
 * Sempre responde sucesso genérico para não enumerar contas.
 */
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim().toLowerCase() ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Informe um e-mail válido." },
      { status: 400 }
    );
  }

  const mensagemOk =
    "Se este e-mail estiver cadastrado, enviaremos as instruções para redefinir a senha em instantes.";

  try {
    const admin = createAdminClient();
    const redirectTo = `${getSiteUrl()}/redefinir-senha`;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      // Conta inexistente ou erro — resposta neutra
      console.warn(
        "[esqueci-senha]",
        error?.message ?? "sem action_link"
      );
      return NextResponse.json({ ok: true, mensagem: mensagemOk });
    }

    // Preferimos o action_link do Supabase (já traz token).
    // Garante redirect para nossa página de redefinição.
    let link = data.properties.action_link;
    try {
      const u = new URL(link);
      u.searchParams.set("redirect_to", redirectTo);
      link = u.toString();
    } catch {
      /* mantém link original */
    }

    await enviarEmailRedefinirSenha({ email, link });
  } catch (erro) {
    console.error("[esqueci-senha]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Não foi possível enviar o e-mail. Tente novamente.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, mensagem: mensagemOk });
}

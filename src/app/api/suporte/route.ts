import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  enviarEmailSuporte,
  isAssuntoSuporte,
} from "@/lib/email/suporte";

/**
 * POST /api/suporte
 * Envia mensagem do formulário para suporte@ ou contato@ conforme o assunto.
 * Usa e-mail/telefone da conta logada (sem campos manuais no form).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const dados = body as { assunto?: unknown; mensagem?: unknown };
  if (!isAssuntoSuporte(dados.assunto)) {
    return NextResponse.json(
      { error: "Selecione um assunto válido." },
      { status: 400 }
    );
  }

  const mensagem =
    typeof dados.mensagem === "string" ? dados.mensagem.trim() : "";
  if (mensagem.length < 10) {
    return NextResponse.json(
      { error: "Descreva a situação com pelo menos 10 caracteres." },
      { status: 400 }
    );
  }
  if (mensagem.length > 8000) {
    return NextResponse.json(
      { error: "Mensagem longa demais (máx. 8000 caracteres)." },
      { status: 400 }
    );
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("nome_completo, telefone")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const resultado = await enviarEmailSuporte({
      assunto: dados.assunto,
      mensagem,
      emailUsuario: user.email,
      nomeUsuario: (perfil?.nome_completo as string | null) ?? null,
      telefoneUsuario: (perfil?.telefone as string | null) ?? null,
    });

    return NextResponse.json({
      ok: true,
      destino: resultado.destino,
      mensagem:
        "Mensagem enviada. Em breve a equipe do FACTO responderá no e-mail da sua conta.",
    });
  } catch (erro) {
    console.error("[api/suporte]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Não foi possível enviar a mensagem.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/perfil/senha
 * Exige senha atual; atualiza a senha da sessão logada.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let senhaAtual = "";
  let senhaNova = "";
  let senhaNovaConfirmacao = "";
  try {
    const body = (await request.json()) as {
      senhaAtual?: string;
      senhaNova?: string;
      senhaNovaConfirmacao?: string;
    };
    senhaAtual = body.senhaAtual ?? "";
    senhaNova = body.senhaNova ?? "";
    senhaNovaConfirmacao = body.senhaNovaConfirmacao ?? "";
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!senhaAtual || !senhaNova) {
    return NextResponse.json(
      { error: "Informe a senha atual e a nova senha." },
      { status: 400 }
    );
  }

  if (senhaNova.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  if (senhaNova !== senhaNovaConfirmacao) {
    return NextResponse.json(
      { error: "A confirmação da nova senha não confere." },
      { status: 400 }
    );
  }

  if (senhaNova === senhaAtual) {
    return NextResponse.json(
      { error: "A nova senha deve ser diferente da atual." },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json(
      { error: "Configuração de autenticação incompleta." },
      { status: 500 }
    );
  }

  const verifier = createSupabaseClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: authErr } = await verifier.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  });

  if (authErr) {
    return NextResponse.json(
      { error: "Senha atual incorreta." },
      { status: 400 }
    );
  }

  await verifier.auth.signOut();

  const { error: updErr } = await supabase.auth.updateUser({
    password: senhaNova,
  });

  if (updErr) {
    return NextResponse.json(
      { error: updErr.message || "Não foi possível alterar a senha." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    mensagem: "Senha alterada com sucesso.",
  });
}

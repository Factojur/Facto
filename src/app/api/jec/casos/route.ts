import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { podePersistirCasosNaNuvem } from "@/lib/emails-persistencia-casos";
import type { FaseCasoJec } from "@/lib/jec-caso-types";

export const runtime = "nodejs";

async function usuarioAutorizado() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !podePersistirCasosNaNuvem(user.email)) {
    return { supabase, user: null as null };
  }
  return { supabase, user };
}

/** Lista / cria casos na nuvem — só contas de teste/admin. */
export async function GET() {
  const { supabase, user } = await usuarioAutorizado();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("jec_casos")
    .select("*")
    .eq("profile_id", user.id)
    .order("atualizado_em", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error:
          "Tabela de casos indisponível. Rode supabase/migration-jec-casos.sql no projeto.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ casos: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user } = await usuarioAutorizado();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let body: {
    titulo?: string;
    numeroProcesso?: string;
    foro?: string;
    polo?: string;
    faseAtual?: FaseCasoJec;
    resumoFatos?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const titulo = String(body.titulo ?? "").trim();
  if (titulo.length < 3) {
    return NextResponse.json(
      { error: "Título com pelo menos 3 caracteres." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("jec_casos")
    .insert({
      profile_id: user.id,
      titulo,
      numero_processo: String(body.numeroProcesso ?? "").trim() || null,
      foro: String(body.foro ?? "").trim() || null,
      polo: body.polo === "reu" ? "reu" : "autor",
      fase_atual: body.faseAtual ?? "pre_acao",
      resumo_fatos: String(body.resumoFatos ?? "").trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          "Não foi possível salvar na nuvem. Confira se a migration jec_casos foi aplicada.",
        detalhe: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ caso: data });
}

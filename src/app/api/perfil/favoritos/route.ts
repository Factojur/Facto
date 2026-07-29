import { NextResponse } from "next/server";
import { filtrarFavoritosValidos } from "@/lib/areas-atuacao";
import { createClient } from "@/lib/supabase/server";

async function salvarFavoritosPerfil(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  favoritos: string[]
) {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ areas_favoritas: favoritos })
    .eq("id", userId);

  if (!profileError) {
    return { ok: true as const };
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: { areas_favoritas: favoritos },
  });

  if (metaError) {
    return {
      ok: false as const,
      error: profileError.message || metaError.message,
    };
  }

  return { ok: true as const, viaMetadados: true };
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { favoritos?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.favoritos)) {
    return NextResponse.json(
      { error: "Campo favoritos deve ser um array." },
      { status: 400 }
    );
  }

  const favoritos = filtrarFavoritosValidos(
    body.favoritos.filter((id): id is string => typeof id === "string")
  );

  const resultado = await salvarFavoritosPerfil(supabase, user.id, favoritos);

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ favoritos });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("areas_favoritas")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata?.areas_favoritas;
  const bruto =
    profile?.areas_favoritas ??
    (Array.isArray(meta) ? meta : undefined);

  return NextResponse.json({
    favoritos: filtrarFavoritosValidos(bruto),
  });
}

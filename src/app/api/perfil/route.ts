import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CAMPOS_PERFIL_EXTRA,
  erroColunaAusente,
  extrairPerfilDados,
  mesclarPerfil,
  separarAtualizacao,
  type PerfilDadosExtra,
} from "@/lib/perfil-merge";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error && !erroColunaAusente(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Autocorreção: remove foto que ficou presa em user_metadata antes desta
  // correção — esse dado infla o cookie de sessão e pode travar o site (431).
  const metaRaw = user.user_metadata?.perfil_dados;
  if (
    metaRaw &&
    typeof metaRaw === "object" &&
    "foto_base64" in (metaRaw as Record<string, unknown>)
  ) {
    const { foto_base64: _remover, ...resto } = metaRaw as Record<
      string,
      unknown
    >;
    await supabase.auth.updateUser({
      data: { ...user.user_metadata, perfil_dados: resto },
    });
  }

  return NextResponse.json({
    perfil: mesclarPerfil(user.id, user.email ?? "", data, user.user_metadata),
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { base, extra } = separarAtualizacao(body);

  if (extra.foto_base64 && extra.foto_base64.length > 250_000) {
    return NextResponse.json(
      { error: "A foto é grande demais. Use uma imagem menor." },
      { status: 400 }
    );
  }

  let profileRow: Record<string, unknown> | null = null;

  const atualizacaoCompleta: Record<string, string | null> = { ...base };
  for (const campo of CAMPOS_PERFIL_EXTRA) {
    if (campo in extra) {
      atualizacaoCompleta[campo] = extra[campo] ?? null;
    }
  }

  const { data: dataCompleta, error: erroCompleto } = await supabase
    .from("profiles")
    .update(atualizacaoCompleta)
    .eq("id", user.id)
    .select("*")
    .single();

  if (!erroCompleto && dataCompleta) {
    profileRow = dataCompleta;
  } else if (erroCompleto && erroColunaAusente(erroCompleto.message)) {
    const { data: dataBase, error: erroBase } = await supabase
      .from("profiles")
      .update(base)
      .eq("id", user.id)
      .select("*")
      .single();

    if (erroBase) {
      return NextResponse.json({ error: erroBase.message }, { status: 500 });
    }

    profileRow = dataBase;

    const metaAtual = extrairPerfilDados(user.user_metadata);
    // foto_base64 nunca vai para user_metadata: infla o cookie de sessão do
    // Supabase e pode travar o site inteiro com erro 431.
    const { foto_base64: _fotoIgnorada, ...extraSemFoto } = extra;
    const perfilDados: PerfilDadosExtra = { ...metaAtual, ...extraSemFoto };

    const metaPayload: Record<string, unknown> = {
      ...user.user_metadata,
      perfil_dados: perfilDados,
    };
    // Remove qualquer resquício de foto salva antes desta correção.
    delete metaPayload.foto_base64;

    if (base.nome_completo) {
      metaPayload.nome_completo = base.nome_completo;
    }

    const { error: metaErro } = await supabase.auth.updateUser({
      data: metaPayload,
    });

    if (metaErro) {
      return NextResponse.json({ error: metaErro.message }, { status: 500 });
    }

    const {
      data: { user: userAtualizado },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      perfil: mesclarPerfil(
        user.id,
        user.email ?? "",
        profileRow,
        userAtualizado?.user_metadata
      ),
      viaMetadados: true,
      fotoNaoSalva: Boolean(extra.foto_base64),
    });
  } else if (erroCompleto) {
    return NextResponse.json({ error: erroCompleto.message }, { status: 500 });
  }

  if (base.nome_completo) {
    await supabase.auth.updateUser({
      data: { nome_completo: base.nome_completo },
    });
  }

  return NextResponse.json({
    perfil: mesclarPerfil(user.id, user.email ?? "", profileRow, {
      ...user.user_metadata,
      perfil_dados: extra,
    }),
  });
}

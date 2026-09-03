import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import { resumirEstiloEscritorio } from "@/lib/ia/resumir-estilo-escritorio";
import {
  codificarEstiloComPreset,
  decodificarEstiloPerfil,
  presetEstiloPorId,
  rotuloEstiloAtivo,
} from "@/lib/estilo-presets-facto";
import { resumoEstiloParaPrompt } from "@/lib/estilo-presets-facto";

export const runtime = "nodejs";
export const maxDuration = 60;

type AmostraIn = {
  nome?: string;
  mimeType?: string;
  base64?: string;
};

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
    .select("estilo_resumo, estilo_atualizado_em, estilo_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  if (error && !/estilo_resumo|column/i.test(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = data?.estilo_resumo ?? null;
  const optIn = Boolean(data?.estilo_opt_in);
  const { presetId, resumo } = decodificarEstiloPerfil(raw);

  return NextResponse.json({
    resumo: resumo || null,
    presetId: presetId ?? null,
    rotuloAtivo: rotuloEstiloAtivo(raw, optIn),
    atualizadoEm: data?.estilo_atualizado_em ?? null,
    optIn,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: {
    optIn?: boolean;
    amostras?: AmostraIn[];
    limpar?: boolean;
    presetId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (body.limpar) {
    const { error } = await supabase
      .from("profiles")
      .update({
        estilo_resumo: null,
        estilo_atualizado_em: null,
        estilo_opt_in: false,
      })
      .eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, resumo: null, rotuloAtivo: null });
  }

  if (body.presetId) {
    const preset = presetEstiloPorId(String(body.presetId).trim());
    if (!preset) {
      return NextResponse.json({ error: "Preset de estilo inválido." }, { status: 400 });
    }
    const agora = new Date().toISOString();
    const encoded = codificarEstiloComPreset(preset.id, preset.resumo);
    const { error } = await supabase
      .from("profiles")
      .update({
        estilo_resumo: encoded,
        estilo_atualizado_em: agora,
        estilo_opt_in: true,
      })
      .eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      resumo: preset.resumo,
      presetId: preset.id,
      rotuloAtivo: preset.rotulo,
      atualizadoEm: agora,
    });
  }

  if (!body.optIn) {
    return NextResponse.json(
      { error: "Marque a autorização para usar amostras no seu estilo de redação." },
      { status: 400 }
    );
  }

  const amostras = Array.isArray(body.amostras) ? body.amostras.slice(0, 3) : [];
  if (amostras.length < 1) {
    return NextResponse.json(
      { error: "Envie de 1 a 3 peças suas (Word ou PDF)." },
      { status: 400 }
    );
  }

  const textos: string[] = [];
  for (const a of amostras) {
    const nome = String(a.nome ?? "amostra").trim();
    const mimeType = String(a.mimeType ?? "application/pdf").trim();
    const base64 = String(a.base64 ?? "").trim();
    if (!base64) continue;

    const buf = Buffer.from(base64, "base64");
    if (buf.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
      return NextResponse.json(
        { error: `“${nome}” é grande demais (máx. 8 MB).` },
        { status: 400 }
      );
    }
    const mimeOk =
      mimeType in TIPOS_ARQUIVO_ACEITOS ||
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      nome.endsWith(".pdf") ||
      nome.endsWith(".docx");
    if (!mimeOk) {
      return NextResponse.json(
        { error: `“${nome}”: use PDF ou Word (.docx).` },
        { status: 400 }
      );
    }

    try {
      const texto = await extrairTextoDeArquivo(buf, mimeType);
      if (texto.trim().length >= 200) textos.push(texto.trim());
    } catch {
      return NextResponse.json(
        { error: `Não foi possível ler “${nome}”. Envie PDF com texto ou .docx.` },
        { status: 400 }
      );
    }
  }

  if (textos.length < 1) {
    return NextResponse.json(
      { error: "Nenhuma amostra com texto legível. Evite PDF só imagem." },
      { status: 400 }
    );
  }

  const analise = await resumirEstiloEscritorio(textos);
  if (!analise.ok) {
    return NextResponse.json({ error: analise.erro }, { status: 422 });
  }

  const agora = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      estilo_resumo: analise.resumo,
      estilo_atualizado_em: agora,
      estilo_opt_in: true,
    })
    .eq("id", user.id);

  if (error) {
    if (/estilo_resumo|column/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "Perfil de estilo ainda não habilitado no banco. Rode supabase/migration-perfil-estilo.sql.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    resumo: analise.resumo,
    atualizadoEm: agora,
  });
}

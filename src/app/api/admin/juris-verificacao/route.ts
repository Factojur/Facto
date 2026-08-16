import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-auth";
import {
  aprovarVerificacao,
  rejeitarVerificacao,
} from "@/lib/juris-provedores/salvar-na-base";

export const runtime = "nodejs";

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

export async function GET(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pendente";

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("juris_verificacao")
    .select(
      "id, titulo, ementa, tribunal, data_julgado, url, numero_processo, relator, fonte, status, aviso_duplicidade, motivo_aviso, similar_titulo, usuario_origem, criado_em, revisado_em, base_conhecimento_id, prioridade, escolhido_usuario"
    )
    .eq("status", status)
    .order("prioridade", { ascending: false })
    .order("criado_em", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message.includes("juris_verificacao")
            ? "Rode supabase/migration-juris-verificacao.sql no SQL Editor."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ itens: data ?? [] });
}

export async function POST(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let body: {
    id?: string;
    acao?: string;
    motivo?: string;
    confirmarDuplicidade?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  const acao = String(body.acao ?? "").trim();
  if (!id || !["aprovar", "rejeitar"].includes(acao)) {
    return NextResponse.json(
      { error: "Informe id e acao (aprovar|rejeitar)." },
      { status: 400 }
    );
  }

  if (acao === "aprovar") {
    const r = await aprovarVerificacao(id, user.id, {
      confirmarDuplicidade: Boolean(body.confirmarDuplicidade),
    });
    if (r.precisaConfirmacao) {
      return NextResponse.json(
        {
          precisaConfirmacao: true,
          error: r.erro,
          similarTitulo: r.similarTitulo,
        },
        { status: 409 }
      );
    }
    if (!r.ok) {
      return NextResponse.json({ error: r.erro }, { status: 400 });
    }
    return NextResponse.json({ ok: true, baseId: r.baseId });
  }

  const r = await rejeitarVerificacao(id, user.id, body.motivo);
  if (!r.ok) {
    return NextResponse.json({ error: r.erro }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

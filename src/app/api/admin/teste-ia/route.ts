import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarPecaTeste } from "@/lib/ia/gerar-fundamentacao-teste";

const EMAIL_ADMIN = "admin@facto.com";

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== EMAIL_ADMIN) return null;
  return user;
}

export async function POST(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const tipoAcao = String(body?.tipoAcao ?? "").trim();
  const fatosFicticios = String(body?.fatosFicticios ?? "").trim();

  if (!tipoAcao || !fatosFicticios) {
    return NextResponse.json(
      { error: "Tipo de ação e fatos (fictícios) são obrigatórios." },
      { status: 400 }
    );
  }

  const resultado = await gerarPecaTeste({ tipoAcao, fatosFicticios });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 });
  }

  return NextResponse.json(resultado);
}

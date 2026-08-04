import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarPreferenciaPacoteExtra } from "@/lib/mercadopago/pacotes-extras";
import { pacoteExtraPorId, type PacoteExtraId } from "@/lib/planos-facto";
import { obterResumoCotaUsuario } from "@/lib/cota-pecas-server";

/**
 * Checkout avulso (Checkout Pro) — não cria assinatura.
 * Body: { pacoteId: "extra-50" | "extra-100" }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { pacoteId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const pacoteId = body.pacoteId as PacoteExtraId | undefined;
  if (!pacoteId || !pacoteExtraPorId(pacoteId)) {
    return NextResponse.json(
      { error: "Pacote inválido. Use extra-50 ou extra-100." },
      { status: 400 }
    );
  }

  const cota = await obterResumoCotaUsuario({
    userId: user.id,
    email: user.email,
  });

  if (!cota.trackingAtivo) {
    return NextResponse.json(
      {
        error:
          "Pacotes extras exigem assinatura ativa. Assine um plano antes de comprar créditos avulsos.",
      },
      { status: 403 }
    );
  }

  try {
    const { initPoint, preferenceId } = await criarPreferenciaPacoteExtra({
      pacoteId,
      userId: user.id,
      email: user.email,
    });
    return NextResponse.json({ initPoint, preferenceId, pacoteId });
  } catch (erro) {
    console.error("[pacotes-extras/checkout]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao criar checkout no Mercado Pago.",
      },
      { status: 502 }
    );
  }
}

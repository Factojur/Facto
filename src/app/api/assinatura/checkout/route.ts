import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { criarPreapprovalAssinatura } from "@/lib/mercadopago/assinatura-checkout";
import {
  ehPlanoCheckout,
  type PlanoCheckoutId,
} from "@/lib/planos-facto";

/**
 * Checkout de assinatura logado — preapproval MP com token userId.
 * Body: { planoId: PlanoCheckoutId }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: { planoId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const planoId = body.planoId;
  if (!planoId || !ehPlanoCheckout(planoId)) {
    return NextResponse.json(
      { error: "Plano inválido para checkout." },
      { status: 400 }
    );
  }

  try {
    const { initPoint, preapprovalId } = await criarPreapprovalAssinatura({
      planoId: planoId as PlanoCheckoutId,
      userId: user.id,
      email: user.email,
    });
    return NextResponse.json({
      initPoint,
      preapprovalId,
      planoId,
    });
  } catch (erro) {
    console.error("[assinatura/checkout]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao criar assinatura no Mercado Pago.",
      },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin-auth";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";
import { PLANO_JEC } from "@/lib/planos-facto";

/**
 * POST /api/admin/emails/teste-compra
 * Body: { email: string, valor?: number }
 *
 * Simula o fluxo pós-compra (e-mails financeiro + convite) SEM Mercado Pago
 * e SEM criar assinatura. Usa mpPaymentId único `teste:…` para passar na
 * idempotência do log.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { email?: string; valor?: number };
  try {
    body = (await request.json()) as { email?: string; valor?: number };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Informe um e-mail de destino para o teste." },
      { status: 400 }
    );
  }

  const valor =
    typeof body.valor === "number" && Number.isFinite(body.valor)
      ? body.valor
      : PLANO_JEC.preco;

  const mpPaymentId = `teste:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  try {
    const admin = createAdminClient();
    const resultado = await garantirConviteEEmailsPosCompra(admin, {
      email,
      mpPaymentId,
      valor,
    });

    return NextResponse.json({
      ok: true,
      modo: "teste_sem_cobranca",
      email,
      valor,
      mpPaymentId,
      ...resultado,
      dica:
        "Confira as caixas do destinatário e financeiro@factoia.com.br, o SMS de alerta (se Twilio estiver configurado) e o log abaixo. Convite só sai se o e-mail ainda não tiver perfil.",
    });
  } catch (erro) {
    console.error("[admin/emails/teste-compra]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha no teste de e-mails da compra.",
      },
      { status: 500 }
    );
  }
}

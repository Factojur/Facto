import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapearAssinaturaParaUI } from "@/lib/assinatura-format";
import { buscarAssinaturaDoEmail } from "@/lib/mercadopago/buscar-assinatura-email";

/**
 * GET /api/assinatura — assinatura ativa do usuário logado (senão a mais recente).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await buscarAssinaturaDoEmail(admin, user.email);

    if (error) {
      console.error("[api/assinatura]", error);
      return NextResponse.json(
        { error: "Não foi possível carregar a assinatura." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ assinatura: null });
    }

    return NextResponse.json({
      assinatura: mapearAssinaturaParaUI(data),
    });
  } catch (erro) {
    console.error("[api/assinatura]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao consultar assinatura.",
      },
      { status: 500 }
    );
  }
}

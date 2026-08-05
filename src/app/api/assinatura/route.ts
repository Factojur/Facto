import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapearAssinaturaParaUI, type AssinaturaDb } from "@/lib/assinatura-format";

/**
 * GET /api/assinatura — assinatura mais recente do usuário logado.
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
    const { data, error } = await admin
      .from("assinaturas")
      .select(
        "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento"
      )
      .ilike("email", user.email)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

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
      assinatura: mapearAssinaturaParaUI(data as AssinaturaDb),
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

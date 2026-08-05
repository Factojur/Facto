import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { executarSincronizarCompras } from "@/lib/mercadopago/sincronizar-compras-job";

/**
 * POST /api/admin/sincronizar-compras
 * Dispara na hora o mesmo job do cron (MP -> assinaturas + e-mails).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const resultado = await executarSincronizarCompras();
    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[admin/sincronizar-compras]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error ? erro.message : "Falha ao sincronizar compras.",
      },
      { status: 500 }
    );
  }
}

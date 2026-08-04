import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obterResumoCotaUsuario } from "@/lib/cota-pecas-server";

/**
 * GET /api/cota — saldo de peças do ciclo atual.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const cota = await obterResumoCotaUsuario({
    userId: user.id,
    email: user.email,
  });

  return NextResponse.json({ cota });
}

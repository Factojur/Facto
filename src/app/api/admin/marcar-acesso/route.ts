import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { marcarAcessoAdminAgora } from "@/lib/admin-avisos";

/** POST /api/admin/marcar-acesso — admin confirma que viu as compras recentes. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await marcarAcessoAdminAgora();
  return NextResponse.json({ ok: true });
}

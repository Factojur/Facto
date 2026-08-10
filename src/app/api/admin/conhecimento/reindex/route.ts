import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { reindexarBaseConhecimento } from "@/lib/ia/indexar-conhecimento";

export const runtime = "nodejs";
export const maxDuration = 120;

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

/** POST — reindexa embeddings da base (admin). Body: { forcar?: boolean, limite?: number } */
export async function POST(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  let body: { forcar?: boolean; limite?: number } = {};
  try {
    body = await request.json();
  } catch {
    /* opcional */
  }

  const resultado = await reindexarBaseConhecimento({
    forcar: Boolean(body.forcar),
    limite: Number(body.limite) > 0 ? Number(body.limite) : 200,
  });

  return NextResponse.json({ ok: true, ...resultado });
}

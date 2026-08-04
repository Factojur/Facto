import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACEITE_TERMOS_VERSAO } from "@/lib/aceite-termos";

/**
 * Registra aceite de Termos + Privacidade:
 * - user_metadata (bloqueio do modal)
 * - tabela aceites_termos (checklist do admin)
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const aceitoEm = new Date().toISOString();
  const nome =
    (user.user_metadata?.nome_completo as string | undefined)?.trim() || null;
  const email = user.email ?? null;

  const { error: metaErro } = await supabase.auth.updateUser({
    data: {
      aceite_termos_em: aceitoEm,
      aceite_termos_versao: ACEITE_TERMOS_VERSAO,
    },
  });

  if (metaErro) {
    return NextResponse.json(
      { error: "Não foi possível registrar o aceite." },
      { status: 500 }
    );
  }

  try {
    const admin = createAdminClient();
    const { error: tabelaErro } = await admin.from("aceites_termos").upsert(
      {
        user_id: user.id,
        email,
        nome,
        versao: ACEITE_TERMOS_VERSAO,
        aceito_em: aceitoEm,
        confirmado: true,
      },
      { onConflict: "user_id,versao" }
    );

    if (tabelaErro) {
      console.error("[aceite-termos] falha ao gravar tabela:", tabelaErro.message);
      // Metadata já salvou — usuário segue; admin pode ver depois que a migration rodar.
    }
  } catch (e) {
    console.error("[aceite-termos] admin client:", e);
  }

  return NextResponse.json({
    ok: true,
    aceito_em: aceitoEm,
    versao: ACEITE_TERMOS_VERSAO,
  });
}

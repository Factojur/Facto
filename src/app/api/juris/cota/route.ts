import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obterCotaJurisUsuario } from "@/lib/juris-provedores/juris-cota";
import {
  jurisprudenciaServiceConfigurado,
  JURIS_BUSCAS_POR_USUARIO_MES,
} from "@/lib/juris-provedores/jurisprudencia-service";

export const runtime = "nodejs";

/** GET — saldo discreto de buscas externas (ex.: 4/15 no mês), sem consumir. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const ativo = jurisprudenciaServiceConfigurado();
  if (!ativo) {
    return NextResponse.json({
      ativo: false,
      usadas: 0,
      limite: JURIS_BUSCAS_POR_USUARIO_MES,
      restantes: JURIS_BUSCAS_POR_USUARIO_MES,
    });
  }

  const cota = await obterCotaJurisUsuario(user.id);
  return NextResponse.json({
    ativo: true,
    usadas: cota.usadas,
    limite: cota.limite,
    restantes: cota.restantes,
    ciclo: cota.ciclo,
  });
}

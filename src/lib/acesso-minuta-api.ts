/**
 * Gate de plano/área nas APIs da minuta.
 * O middleware não cobre /api — cada rota precisa conferir.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { resolverAcessoConta, type AcessoContaResolvido } from "@/lib/emails-acesso-livre";
import { normalizarAreaIdMinuta, type AreaIdMinuta } from "@/lib/minuta-modulo";
import { getPlanoAtivoServidor } from "@/lib/sessao-servidor";
import type { User } from "@supabase/supabase-js";

export type AcessoMinutaOk = {
  ok: true;
  user: User;
  areaId: AreaIdMinuta;
  acesso: AcessoContaResolvido;
};

export type AcessoMinutaErro = {
  ok: false;
  response: NextResponse;
};

export async function exigirAcessoAreaMinuta(
  areaIdRaw?: string | null
): Promise<AcessoMinutaOk | AcessoMinutaErro> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  const areaId = normalizarAreaIdMinuta(areaIdRaw);
  let tipoUsuario =
    (user.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo_usuario")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;
  } catch {
    /* metadata */
  }

  const planoDb = await getPlanoAtivoServidor(user.email);
  const acesso = resolverAcessoConta(user.email, planoDb, tipoUsuario);
  if (
    !areaAbertaParaCliente(areaId, {
      plano: acesso.plano,
      tipoUsuario: acesso.tipoUsuario,
    })
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Este módulo não está disponível no seu plano." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user, areaId, acesso };
}

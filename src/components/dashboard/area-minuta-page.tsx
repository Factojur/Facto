/**
 * Rotas /dashboard/<area> — não alimentam o chat.
 * Catálogo e assistente são independentes; o workspace vive em /dashboard.
 */

import { redirect, notFound } from "next/navigation";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { resolverAcessoConta } from "@/lib/emails-acesso-livre";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import {
  getUsuarioServidor,
  getPerfilServidor,
  getPlanoAtivoServidor,
} from "@/lib/sessao-servidor";

/** Valida acesso à área e leva à home do assistente (sem ?area=). */
export async function redirecionarAreaParaChat(
  areaId: AreaIdMinuta
): Promise<never> {
  const user = await getUsuarioServidor();

  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";

  if (user) {
    const profile = await getPerfilServidor(user.id);
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;
  }

  const planoDb = user ? await getPlanoAtivoServidor(user.email) : null;
  const acesso = resolverAcessoConta(user?.email, planoDb, tipoUsuario);

  if (
    !areaAbertaParaCliente(areaId, {
      plano: acesso.plano,
      tipoUsuario: acesso.tipoUsuario,
    })
  ) {
    notFound();
  }

  redirect("/dashboard#assistente-workspace");
}

/** @deprecated use redirecionarAreaParaChat */
export async function AreaMinutaPage({
  areaId,
}: {
  areaId: AreaIdMinuta;
}): Promise<never> {
  return redirecionarAreaParaChat(areaId);
}

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JecForm } from "@/components/dashboard/jec-form";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import {
  getUsuarioServidor,
  getPerfilServidor,
  getPlanoAtivoServidor,
} from "@/lib/sessao-servidor";

export async function AreaMinutaPage({ areaId }: { areaId: AreaIdMinuta }) {
  const user = await getUsuarioServidor();
  const acessoLivre = isEmailAcessoLivre(user?.email);

  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";

  if (user) {
    const profile = await getPerfilServidor(user.id);
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;
  }

  const plano = user ? await getPlanoAtivoServidor(user.email) : null;

  if (
    !areaAbertaParaCliente(areaId, {
      plano,
      tipoUsuario,
      acessoLivre,
    })
  ) {
    notFound();
  }

  const leigo = tipoUsuario === "leigo" && !acessoLivre && areaId === "jec";

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Carregando formulário…</div>
      }
    >
      <JecForm leigo={leigo} areaId={areaId} />
    </Suspense>
  );
}

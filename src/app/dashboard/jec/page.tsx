import { Suspense } from "react";
import { JecForm } from "@/components/dashboard/jec-form";
import { resolverAcessoConta } from "@/lib/emails-acesso-livre";
import { getUsuarioServidor, getPerfilServidor } from "@/lib/sessao-servidor";

export default async function JecDashboardPage() {
  const user = await getUsuarioServidor();

  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";

  if (user) {
    const profile = await getPerfilServidor(user.id);
    if (profile?.tipo_usuario) {
      tipoUsuario = profile.tipo_usuario;
    }
  }

  const acesso = resolverAcessoConta(user?.email, null, tipoUsuario);

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Carregando formulário…</div>
      }
    >
      <JecForm leigo={acesso.leigo} />
    </Suspense>
  );
}

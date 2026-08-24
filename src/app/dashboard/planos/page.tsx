import {
  getUsuarioServidor,
  getPerfilServidor,
  getPlanoAtivoServidor,
} from "@/lib/sessao-servidor";
import { resolverAcessoConta } from "@/lib/emails-acesso-livre";
import { PlanosDashboardClient } from "@/components/dashboard/planos-dashboard-client";

export default async function PlanosPage() {
  const user = await getUsuarioServidor();
  const profile = user ? await getPerfilServidor(user.id) : null;
  const planoDb = user ? await getPlanoAtivoServidor(user.email) : null;
  const tipoUsuario =
    (profile?.tipo_usuario as string | undefined) ??
    (user?.user_metadata?.tipo_usuario as string | undefined) ??
    "advogado";
  const acesso = resolverAcessoConta(user?.email, planoDb, tipoUsuario);

  return <PlanosDashboardClient planoInicial={acesso.plano} />;
}

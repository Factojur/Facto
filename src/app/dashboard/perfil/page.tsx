import { mesclarPerfil } from "@/lib/perfil-merge";
import { PerfilForm } from "@/components/dashboard/perfil-form";
import { getUsuarioServidor, getPerfilServidor } from "@/lib/sessao-servidor";

export default async function PerfilPage() {
  const user = await getUsuarioServidor();
  const profile = await getPerfilServidor(user!.id);

  const perfil = mesclarPerfil(
    user!.id,
    user!.email ?? "",
    profile,
    user!.user_metadata
  );

  return <PerfilForm perfilInicial={perfil} />;
}

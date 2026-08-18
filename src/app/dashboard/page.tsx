import { createClient } from "@/lib/supabase/server";
import { filtrarFavoritosValidos } from "@/lib/areas-atuacao";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";
import { isEmailPreviewAreas } from "@/lib/emails-preview-areas";
import {
  getUsuarioServidor,
  getPerfilServidor,
  getPlanoAtivoServidor,
} from "@/lib/sessao-servidor";

export default async function DashboardPage() {
  const user = await getUsuarioServidor();

  let nome =
    (user?.user_metadata?.nome_completo as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Advogado";
  let favoritos: string[] = [];
  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  const acessoLivre = isEmailAcessoLivre(user?.email);

  if (user) {
    const profile = await getPerfilServidor(user.id);

    if (profile?.nome_completo) {
      nome = profile.nome_completo;
    }
    if (profile?.tipo_usuario) {
      tipoUsuario = profile.tipo_usuario;
    }
    favoritos = filtrarFavoritosValidos(profile?.areas_favoritas);

    if (favoritos.length === 0) {
      const meta = user.user_metadata?.areas_favoritas;
      if (Array.isArray(meta)) {
        favoritos = filtrarFavoritosValidos(meta);
      }
    }
  }

  const plano = user ? await getPlanoAtivoServidor(user.email) : null;

  return (
    <DashboardHome
      nome={nome}
      userId={user!.id}
      favoritosIniciais={favoritos}
      leigo={tipoUsuario === "leigo" && !acessoLivre}
      plano={plano}
      acessoLivre={acessoLivre}
      previewAreas={isEmailPreviewAreas(user?.email)}
    />
  );
}

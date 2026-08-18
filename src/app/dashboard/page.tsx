import { createClient } from "@/lib/supabase/server";
import { filtrarFavoritosValidos } from "@/lib/areas-atuacao";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { resolverAcessoConta } from "@/lib/emails-acesso-livre";
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

  const planoDb = user ? await getPlanoAtivoServidor(user.email) : null;
  const acesso = resolverAcessoConta(user?.email, planoDb, tipoUsuario);

  return (
    <DashboardHome
      nome={nome}
      userId={user!.id}
      favoritosIniciais={favoritos}
      leigo={acesso.leigo}
      plano={acesso.plano}
      acessoLivre={acesso.cotasIlimitadas}
      previewAreas={isEmailPreviewAreas(user?.email)}
    />
  );
}

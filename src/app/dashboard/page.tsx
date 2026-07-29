import { createClient } from "@/lib/supabase/server";
import { filtrarFavoritosValidos } from "@/lib/areas-atuacao";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nome =
    (user?.user_metadata?.nome_completo as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Advogado";
  let favoritos: string[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome_completo, areas_favoritas")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.nome_completo) {
      nome = profile.nome_completo;
    }
    favoritos = filtrarFavoritosValidos(profile?.areas_favoritas);

    if (favoritos.length === 0) {
      const meta = user.user_metadata?.areas_favoritas;
      if (Array.isArray(meta)) {
        favoritos = filtrarFavoritosValidos(meta);
      }
    }
  }

  return (
    <DashboardHome
      nome={nome}
      userId={user!.id}
      favoritosIniciais={favoritos}
    />
  );
}

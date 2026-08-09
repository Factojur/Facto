import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { filtrarFavoritosValidos } from "@/lib/areas-atuacao";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import type { PlanoId } from "@/lib/planos-facto";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

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
  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  let plano: PlanoId | null = null;
  const acessoLivre = isEmailAcessoLivre(user?.email);

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nome_completo, areas_favoritas, tipo_usuario")
      .eq("id", user.id)
      .maybeSingle();

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

    try {
      const admin = createAdminClient();
      const email = user.email?.trim().toLowerCase();
      if (email) {
        const { data: ass } = await admin
          .from("assinaturas")
          .select("plano, status, acesso_valido_ate")
          .ilike("email", email)
          .order("criado_em", { ascending: false })
          .limit(5);
        const agora = Date.now();
        const ativa = (ass ?? []).find((a) => {
          const ate = a.acesso_valido_ate
            ? new Date(a.acesso_valido_ate).getTime()
            : null;
          if (a.status === "authorized" && ate === null) return true;
          return ate !== null && ate > agora;
        });
        if (
          ativa?.plano === "jec" ||
          ativa?.plano === "mensal" ||
          ativa?.plano === "pro" ||
          ativa?.plano === "anual" ||
          ativa?.plano === "pro_anual"
        ) {
          plano = ativa.plano;
        }
      }
    } catch {
      /* sem assinaturas / admin */
    }
  }

  return (
    <DashboardHome
      nome={nome}
      userId={user!.id}
      favoritosIniciais={favoritos}
      leigo={tipoUsuario === "leigo" && !acessoLivre}
      plano={plano}
      acessoLivre={acessoLivre}
    />
  );
}

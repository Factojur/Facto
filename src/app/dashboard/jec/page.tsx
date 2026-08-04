import { createClient } from "@/lib/supabase/server";
import { JecForm } from "@/components/dashboard/jec-form";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

export default async function JecDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo_usuario")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tipo_usuario) {
      tipoUsuario = profile.tipo_usuario;
    }
  }

  const acessoLivre = isEmailAcessoLivre(user?.email);
  const leigo = tipoUsuario === "leigo" && !acessoLivre;

  return <JecForm leigo={leigo} />;
}

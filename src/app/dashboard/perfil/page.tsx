import { createClient } from "@/lib/supabase/server";
import { mesclarPerfil } from "@/lib/perfil-merge";
import { PerfilForm } from "@/components/dashboard/perfil-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  const perfil = mesclarPerfil(
    user!.id,
    user!.email ?? "",
    profile,
    user!.user_metadata
  );

  return <PerfilForm perfilInicial={perfil} />;
}

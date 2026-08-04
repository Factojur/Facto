import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { mesclarPerfil } from "@/lib/perfil-merge";
import { temAceiteTermos } from "@/lib/aceite-termos";
import type { PerfilResumo } from "@/lib/perfil-types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const merged = mesclarPerfil(
    user.id,
    user.email ?? "",
    profile,
    user.user_metadata
  );

  const perfil: PerfilResumo = {
    nome_completo: merged.nome_completo,
    email: merged.email,
    foto_base64: merged.foto_base64,
  };

  const precisaAceiteTermos = !temAceiteTermos(
    user.user_metadata as Record<string, unknown> | undefined
  );

  return (
    <>
      <SessionGuard />
      <DashboardLayoutClient
        perfil={perfil}
        precisaAceiteTermos={precisaAceiteTermos}
      >
        {children}
      </DashboardLayoutClient>
    </>
  );
}

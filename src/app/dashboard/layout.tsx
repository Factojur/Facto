import { redirect } from "next/navigation";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { mesclarPerfil } from "@/lib/perfil-merge";
import { temAceiteTermos } from "@/lib/aceite-termos";
import type { PerfilResumo } from "@/lib/perfil-types";
import { getUsuarioServidor, getPerfilServidor } from "@/lib/sessao-servidor";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUsuarioServidor();

  if (!user) {
    redirect("/login");
  }

  const profile = await getPerfilServidor(user.id);

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

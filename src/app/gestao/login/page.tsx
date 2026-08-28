import { redirect } from "next/navigation";
import { GestaoLoginLanding } from "@/components/gestao/gestao-login-landing";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function GestaoLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string }>;
}) {
  const params = await searchParams;
  const convite = params.convite?.trim() ?? "";

  const user = await getUsuarioServidor();
  if (user) {
    redirect(
      convite ? `/gestao/entrar?convite=${encodeURIComponent(convite)}` : "/gestao"
    );
  }

  return <GestaoLoginLanding convite={convite || undefined} />;
}

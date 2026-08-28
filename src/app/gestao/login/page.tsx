import { redirect } from "next/navigation";
import { GestaoLoginLanding } from "@/components/gestao/gestao-login-landing";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function GestaoLoginPage() {
  const user = await getUsuarioServidor();
  if (user) {
    redirect("/gestao");
  }

  return <GestaoLoginLanding />;
}

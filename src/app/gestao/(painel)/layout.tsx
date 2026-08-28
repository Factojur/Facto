import { redirect } from "next/navigation";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

/** Área autenticada do painel (processos, prazos, agenda…). */
export default async function GestaoPainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUsuarioServidor();
  if (!user) {
    redirect("/gestao/login");
  }

  return <>{children}</>;
}

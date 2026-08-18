import { redirect } from "next/navigation";
import { JecCasosLista } from "@/components/dashboard/jec-casos-lista";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function JecCasosPage() {
  const user = await getUsuarioServidor();
  if (!user) redirect("/login");

  return <JecCasosLista emailUsuario={user.email ?? ""} />;
}

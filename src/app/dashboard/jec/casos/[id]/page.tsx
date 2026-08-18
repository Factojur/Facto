import { redirect } from "next/navigation";
import { JecCasoDetalhe } from "@/components/dashboard/jec-caso-detalhe";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function JecCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUsuarioServidor();
  if (!user) redirect("/login");

  return (
    <JecCasoDetalhe casoId={id} emailUsuario={user.email ?? ""} />
  );
}

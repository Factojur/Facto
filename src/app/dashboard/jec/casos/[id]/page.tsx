import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JecCasoDetalhe } from "@/components/dashboard/jec-caso-detalhe";

export default async function JecCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <JecCasoDetalhe casoId={id} emailUsuario={user.email ?? ""} />
  );
}

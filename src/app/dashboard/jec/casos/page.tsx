import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JecCasosLista } from "@/components/dashboard/jec-casos-lista";

export default async function JecCasosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <JecCasosLista emailUsuario={user.email ?? ""} />;
}

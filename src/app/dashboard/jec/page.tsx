import { redirect } from "next/navigation";

/** Rota legado /dashboard/jec — assistente unificado em /dashboard (sem vínculo de área). */
export default function JecDashboardPage() {
  redirect("/dashboard#assistente-workspace");
}

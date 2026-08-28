import { redirect } from "next/navigation";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";

/** Raiz /gestao — só verifica se o módulo está habilitado (dev / flag). */
export default function GestaoRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!gestaoHabilitada()) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

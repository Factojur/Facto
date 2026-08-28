import { redirect } from "next/navigation";
import { GestaoPainelProvider } from "@/components/gestao/gestao-painel-context";
import { obterContextoGestao } from "@/lib/gestao/gestao-service";
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

  const { escritorio, membro } = await obterContextoGestao(user.id);

  return (
    <GestaoPainelProvider
      papel={membro?.papel ?? null}
      escritorioNome={escritorio?.nome ?? null}
    >
      {children}
    </GestaoPainelProvider>
  );
}

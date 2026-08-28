import { GestaoProcessoDetalhe } from "@/components/gestao/gestao-processo-detalhe";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { obterContextoGestao } from "@/lib/gestao/gestao-service";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function GestaoProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUsuarioServidor();
  if (!user) return null;

  const { escritorio } = await obterContextoGestao(user.id);
  const { id } = await params;

  return (
    <GestaoShell
      titulo="Pasta do processo"
      subtitulo="Dados, honorários, prazos e anotações"
      escritorioNome={escritorio?.nome}
    >
      <GestaoProcessoDetalhe processoId={id} />
    </GestaoShell>
  );
}

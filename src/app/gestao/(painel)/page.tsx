import Link from "next/link";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoDashboard } from "@/components/gestao/gestao-dashboard";
import {
  CriarEscritorioForm,
  EntrarConviteForm,
} from "@/components/gestao/gestao-onboarding";
import { montarResumoGestaoDashboard } from "@/lib/gestao/gestao-dashboard-stats";
import { podeVerHonorariosGestao } from "@/lib/gestao/gestao-permissoes";
import {
  listarAgendaGestao,
  listarClientesGestao,
  listarPrazosGestao,
  listarProcessosGestao,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";
import { getUsuarioServidor } from "@/lib/sessao-servidor";
import { FactoLogo } from "@/components/brand/facto-logo";

export default async function GestaoHomePage() {
  const user = await getUsuarioServidor();
  if (!user) return null;

  const { escritorio, membro } = await obterContextoGestao(user.id);
  const nomeUsuario =
    (user.user_metadata?.nome_completo as string | undefined) ??
    user.email?.split("@")[0] ??
    "";

  if (!escritorio || !membro) {
    return (
      <div className="min-h-screen bg-stone-950 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <FactoLogo variant="icon" size="sm" />
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-facto-gold">
              FACTO Gestão
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Configure o escritório
            </h1>
            <p className="mt-2 max-w-md text-sm text-stone-400">
              Crie um escritório novo (titular) ou entre com o convite que o
              administrador enviou.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <CriarEscritorioForm />
            <EntrarConviteForm />
          </div>
          <p className="mt-8 text-center text-xs text-stone-600">
            <Link href="/gestao/login" className="text-stone-500 hover:text-facto-gold">
              ← Voltar à apresentação
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const [processos, prazos, eventos, clientes] = await Promise.all([
    listarProcessosGestao(escritorio.id),
    listarPrazosGestao(escritorio.id),
    listarAgendaGestao(escritorio.id),
    listarClientesGestao(escritorio.id),
  ]);

  const resumo = montarResumoGestaoDashboard({
    processos,
    prazos,
    eventos,
    clientes,
    incluirHonorarios: podeVerHonorariosGestao(membro.papel),
  });

  return (
    <GestaoShell
      titulo="Visão geral"
      subtitulo={`${escritorio.nome} · painel do dia`}
      escritorioNome={escritorio.nome}
      nomeUsuario={nomeUsuario}
      papel={membro.papel}
    >
      <GestaoDashboard
        resumo={resumo}
        nomeUsuario={nomeUsuario}
        podeVerHonorarios={podeVerHonorariosGestao(membro.papel)}
      />
    </GestaoShell>
  );
}

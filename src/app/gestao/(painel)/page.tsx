import Link from "next/link";
import { GestaoShell } from "@/components/gestao/gestao-shell";
import { GestaoDashboard } from "@/components/gestao/gestao-dashboard";
import { CriarEscritorioForm } from "@/components/gestao/gestao-onboarding";
import { GestaoOnboardingGate } from "@/components/gestao/gestao-onboarding-gate";
import { montarResumoGestaoDashboard } from "@/lib/gestao/gestao-dashboard-stats";
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
        <GestaoOnboardingGate />
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-center text-center">
            <FactoLogo variant="icon" size="sm" />
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-facto-gold">
              FACTO Gestão
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white">
              Configure o escritório
            </h1>
            <p className="mt-2 max-w-md text-sm text-stone-400">
              Primeiro acesso gratuito. Depois de criado, acesse em{" "}
              <strong className="text-stone-300">/gestao/login</strong>.
            </p>
          </div>
          <div className="mt-10">
            <CriarEscritorioForm />
          </div>
          <p className="mt-8 text-center text-xs text-stone-500">
            Colaborador ou estagiário?{" "}
            <Link href="/gestao/login" className="text-stone-400 hover:text-facto-gold">
              Entrar com convite
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
  });

  return (
    <GestaoShell
      titulo="Visão geral"
      subtitulo={`${escritorio.nome} · painel do dia`}
      escritorioNome={escritorio.nome}
      nomeUsuario={nomeUsuario}
      papel={membro.papel}
    >
      <GestaoDashboard resumo={resumo} nomeUsuario={nomeUsuario} />
    </GestaoShell>
  );
}

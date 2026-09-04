"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FactoLogo } from "@/components/brand/facto-logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SessaoOutraMaquinaDialog } from "@/components/auth/sessao-outra-maquina-dialog";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { PLANO_TRIAL } from "@/lib/planos-facto";

async function registrarSessaoAtiva(): Promise<{ ok: boolean; erro?: string }> {
  try {
    const res = await fetch("/api/auth/sessao", { method: "POST" });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      return { ok: false, erro: data?.error ?? "Falha ao registrar sessão." };
    }
    return { ok: true };
  } catch {
    return { ok: false, erro: "Falha de rede ao registrar sessão." };
  }
}

type StatusSessao = {
  valida?: boolean;
  pendente?: boolean;
  outraMaquina?: boolean;
};

async function lerStatusSessao(): Promise<{
  statusHttp: number;
  data: StatusSessao | null;
}> {
  const check = await fetch("/api/auth/sessao", { cache: "no-store" });
  const data = check.ok
    ? ((await check.json()) as StatusSessao)
    : check.status === 200 || check.status === 401
      ? ((await check.json().catch(() => null)) as StatusSessao | null)
      : null;
  return { statusHttp: check.status, data };
}

function precisaConfirmarOutraMaquina(
  statusHttp: number,
  data: StatusSessao | null
): boolean {
  if (data?.outraMaquina) return true;
  if (statusHttp === 401) return true;
  return false;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conflitoSessao, setConflitoSessao] = useState(false);
  const [assumindoSessao, setAssumindoSessao] = useState(false);
  const [manteveOutro, setManteveOutro] = useState(false);
  const trialOk = searchParams.get("trial") === "ok";
  const sessaoEncerrada = searchParams.get("sessao") === "encerrada";
  const acessoExpirado = searchParams.get("acesso") === "expirado";
  const oauthErro = searchParams.get("oauth");

  useEffect(() => {
    async function preparar() {
      if (sessaoEncerrada || acessoExpirado) {
        await supabase.auth.signOut();
        setCheckingSession(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { statusHttp, data } = await lerStatusSessao();
        if (precisaConfirmarOutraMaquina(statusHttp, data)) {
          setConflitoSessao(true);
          setCheckingSession(false);
          return;
        }
        if (statusHttp === 200 && data?.pendente) {
          const reg = await registrarSessaoAtiva();
          if (!reg.ok) {
            setError(reg.erro ?? "Não foi possível validar a sessão.");
            setCheckingSession(false);
            return;
          }
        }
        window.location.assign("/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    void preparar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, sessaoEncerrada, acessoExpirado]);

  async function abrirNesteComputador() {
    setAssumindoSessao(true);
    setError(null);
    const reg = await registrarSessaoAtiva();
    if (!reg.ok) {
      setError(reg.erro ?? "Não foi possível abrir a sessão aqui.");
      setAssumindoSessao(false);
      return;
    }
    window.location.assign("/dashboard");
  }

  async function manterNoOutroDispositivo() {
    setAssumindoSessao(true);
    await fetch("/api/auth/sessao", { method: "DELETE" }).catch(() => null);
    await supabase.auth.signOut();
    setConflitoSessao(false);
    setManteveOutro(true);
    setAssumindoSessao(false);
    setCheckingSession(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setManteveOutro(false);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const senha = String(form.get("senha"));

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError) {
      setError(getAuthErrorMessage(loginError.message));
      setLoading(false);
      return;
    }

    const { statusHttp, data } = await lerStatusSessao();
    if (precisaConfirmarOutraMaquina(statusHttp, data)) {
      setConflitoSessao(true);
      setLoading(false);
      return;
    }

    const reg = await registrarSessaoAtiva();
    if (!reg.ok) {
      setError(reg.erro ?? "Não foi possível registrar a sessão.");
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-full items-center justify-center bg-facto-dark">
        <p className="text-stone-400">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-facto-dark px-4 py-12">
      <SessaoOutraMaquinaDialog
        aberto={conflitoSessao}
        carregando={assumindoSessao}
        onAbrirAqui={() => void abrirNesteComputador()}
        onManterOutro={() => void manterNoOutroDispositivo()}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <FactoLogo variant="stacked" size="md" />
          <h1 className="mt-6 text-3xl font-bold text-white">Entrar</h1>
          <p className="mt-2 text-sm text-stone-400">
            Acesse o assistente e gere peças no padrão forense
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-800 bg-stone-900/90 p-8 shadow-xl shadow-black/30"
        >
          {sessaoEncerrada && (
            <div className="mb-4 rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
              Esta conta passou a ser usada em outro computador. Você pode
              entrar de novo aqui — vamos perguntar se deseja assumir esta
              máquina ou manter a outra aberta. Casos e preferências salvos
              permanecem intactos.
            </div>
          )}

          {manteveOutro && (
            <div className="mb-4 rounded-lg border border-stone-600 bg-stone-800/60 px-4 py-3 text-sm text-stone-300">
              Ok — o FACTO continua no outro dispositivo. Quando quiser usar
              neste computador, entre novamente e escolha “Abrir neste
              computador”.
            </div>
          )}

          {trialOk && (
            <div className="mb-4 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
              Conta de teste criada. Entre com o e-mail e a senha — no dashboard,
              abra o assistente e use suas {PLANO_TRIAL.pecasPorMes} peças na
              área escolhida.
            </div>
          )}

          {acessoExpirado && (
            <div className="mb-4 rounded-lg border border-amber-800/60 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
              Sua assinatura do FACTO expirou, foi cancelada ou esta conta não
              tem plano ativo. Renove ou pague um plano para continuar.{" "}
              <Link href="/#precos" className="font-semibold underline">
                Ver planos
              </Link>
            </div>
          )}

          {oauthErro && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {oauthErro}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <GoogleSignInButton intent="login" className="mb-4" />

          <div className="mb-4 flex items-center gap-3 text-xs text-stone-500">
            <span className="h-px flex-1 bg-stone-700" />
            ou com e-mail
            <span className="h-px flex-1 bg-stone-700" />
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-stone-300"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="joao@escritorio.com.br"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-stone-300"
                >
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs font-medium text-facto-gold hover:text-[#a39a78]"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                className="w-full rounded-lg border border-stone-700 bg-stone-800 px-4 py-2.5 text-white placeholder-stone-500 outline-none focus:border-facto-gold focus:ring-1 focus:ring-facto-gold"
                placeholder="Sua senha"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-facto-gold py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="mt-6 text-center text-sm text-stone-400">
            Não tem conta?{" "}
            <Link
              href="/trial"
              className="font-medium text-facto-gold hover:text-[#a39a78]"
            >
              Criar conta / teste grátis
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-facto-dark">
          <p className="text-stone-400">Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

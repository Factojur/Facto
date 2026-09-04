"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { SessaoOutraMaquinaDialog } from "@/components/auth/sessao-outra-maquina-dialog";
import { createClient } from "@/lib/supabase/client";

function CompletarOAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const [conflito, setConflito] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [redirectAlvo, setRedirectAlvo] = useState("/dashboard");

  const intent =
    searchParams.get("intent") === "trial" ? "trial" : "login";
  const destino =
    searchParams.get("destino") === "gestao" ? "gestao" : undefined;

  async function bootstrap(assumirSessao: boolean) {
    const res = await fetch("/api/auth/google-bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, destino, assumirSessao }),
    });
    const data = (await res.json()) as {
      redirect?: string;
      error?: string;
      precisaConfirmarSessao?: boolean;
      ok?: boolean;
    };
    return { res, data };
  }

  useEffect(() => {
    async function rodar() {
      try {
        const { res, data } = await bootstrap(false);
        if (data.precisaConfirmarSessao) {
          setRedirectAlvo(data.redirect ?? "/dashboard");
          setConflito(true);
          return;
        }
        if (!res.ok) {
          setErro(data.error ?? "Falha ao concluir o login Google.");
          return;
        }
        window.location.assign(data.redirect ?? "/dashboard");
      } catch {
        setErro("Falha de rede ao concluir o login Google.");
      }
    }
    void rodar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  async function abrirAqui() {
    setCarregando(true);
    setErro(null);
    try {
      const { res, data } = await bootstrap(true);
      if (!res.ok || data.precisaConfirmarSessao) {
        setErro(data.error ?? "Não foi possível abrir a sessão neste computador.");
        setCarregando(false);
        return;
      }
      window.location.assign(data.redirect ?? redirectAlvo);
    } catch {
      setErro("Falha de rede ao abrir a sessão.");
      setCarregando(false);
    }
  }

  async function manterOutro() {
    setCarregando(true);
    const supabase = createClient();
    await fetch("/api/auth/sessao", { method: "DELETE" }).catch(() => null);
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-facto-dark px-4">
      <SessaoOutraMaquinaDialog
        aberto={conflito}
        carregando={carregando}
        onAbrirAqui={() => void abrirAqui()}
        onManterOutro={() => void manterOutro()}
      />
      <FactoLogo variant="stacked" size="md" />
      {erro ? (
        <div className="mt-8 max-w-md text-center">
          <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {erro}
          </p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-facto-gold hover:underline"
          >
            Voltar ao login
          </a>
        </div>
      ) : conflito ? (
        <p className="mt-8 text-sm text-stone-400">
          Sessão em outro dispositivo — escolha abaixo.
        </p>
      ) : (
        <p className="mt-8 text-sm text-stone-400">Concluindo acesso Google…</p>
      )}
    </div>
  );
}

export default function AuthCompletarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-facto-dark">
          <p className="text-stone-400">Carregando…</p>
        </div>
      }
    >
      <CompletarOAuth />
    </Suspense>
  );
}

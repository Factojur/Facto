"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";

function CompletarOAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function rodar() {
      const intent =
        searchParams.get("intent") === "trial" ? "trial" : "login";
      const destino =
        searchParams.get("destino") === "gestao" ? "gestao" : undefined;
      try {
        const res = await fetch("/api/auth/google-bootstrap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent, destino }),
        });
        const data = (await res.json()) as {
          redirect?: string;
          error?: string;
        };
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
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-facto-dark px-4">
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

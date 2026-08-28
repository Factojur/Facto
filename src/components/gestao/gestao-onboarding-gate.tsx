"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * No onboarding do titular: se a API já enxerga escritório (ex.: persistência
 * em nuvem), redireciona para o painel sem exigir novo cadastro.
 */
export function GestaoOnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const res = await fetch("/api/gestao/escritorio");
      if (!ativo || !res.ok) return;
      const data = (await res.json()) as { escritorio?: { id: string } | null };
      if (data.escritorio?.id) {
        router.replace("/gestao");
        router.refresh();
      }
    })();
    return () => {
      ativo = false;
    };
  }, [router]);

  return null;
}

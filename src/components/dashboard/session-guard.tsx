"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SessionGuard() {
  const router = useRouter();
  const supabase = createClient();
  const registrando = useRef(false);

  useEffect(() => {
    async function validarOuRegistrar() {
      if (registrando.current) return;

      try {
        const res = await fetch("/api/auth/sessao", { cache: "no-store" });

        if (res.status === 401) {
          await supabase.auth.signOut();
          window.location.assign("/login?sessao=encerrada");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.pendente && !registrando.current) {
            registrando.current = true;
            await fetch("/api/auth/sessao", { method: "POST" });
            registrando.current = false;
          }
        }
      } catch {
        // Falha de rede — tenta novamente no próximo ciclo
      }
    }

    validarOuRegistrar();
    const interval = setInterval(validarOuRegistrar, 20_000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}

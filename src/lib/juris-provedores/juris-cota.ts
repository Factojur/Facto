/**
 * Cota mensal de buscas no Jurisprudências.ai por usuário FACTO.
 * Ciclo = mês civil em America/Sao_Paulo (renova no dia 1).
 * A coluna `dia` da tabela guarda o 1º dia do mês (chave do ciclo).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { JURIS_BUSCAS_POR_USUARIO_MES } from "@/lib/juris-provedores/jurisprudencia-service";

/** Primeiro dia do mês corrente em SP, como YYYY-MM-DD. */
export function cicloMensalSaoPaulo(ref: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(ref);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${y}-${m}-01`;
}

export type StatusCotaJuris = {
  usadas: number;
  limite: number;
  restantes: number;
  podeBuscarExterno: boolean;
  /** YYYY-MM-DD = 1º dia do mês do ciclo. */
  ciclo: string;
};

export async function obterCotaJurisUsuario(
  userId: string
): Promise<StatusCotaJuris> {
  const admin = createAdminClient();
  const ciclo = cicloMensalSaoPaulo();
  const { data } = await admin
    .from("juris_busca_cota")
    .select("consultas")
    .eq("user_id", userId)
    .eq("dia", ciclo)
    .maybeSingle();

  const usadas = Number(data?.consultas ?? 0);
  const limite = JURIS_BUSCAS_POR_USUARIO_MES;
  const restantes = Math.max(0, limite - usadas);
  return {
    usadas,
    limite,
    restantes,
    podeBuscarExterno: restantes > 0,
    ciclo,
  };
}

/** Incrementa a cota do mês. Não incrementa se já esgotou. */
export async function consumirCotaJurisUsuario(
  userId: string
): Promise<StatusCotaJuris & { consumida: boolean }> {
  const atual = await obterCotaJurisUsuario(userId);
  if (!atual.podeBuscarExterno) {
    return { ...atual, consumida: false };
  }

  const admin = createAdminClient();
  const ciclo = atual.ciclo;
  const nova = atual.usadas + 1;

  const { error } = await admin.from("juris_busca_cota").upsert(
    {
      user_id: userId,
      dia: ciclo,
      consultas: nova,
    },
    { onConflict: "user_id,dia" }
  );

  if (error) {
    console.error("[juris_busca_cota]", error.message);
    return {
      usadas: atual.usadas,
      limite: atual.limite,
      restantes: atual.restantes,
      podeBuscarExterno: true,
      ciclo,
      consumida: true,
    };
  }

  return {
    usadas: nova,
    limite: atual.limite,
    restantes: Math.max(0, atual.limite - nova),
    podeBuscarExterno: nova < atual.limite,
    ciclo,
    consumida: true,
  };
}

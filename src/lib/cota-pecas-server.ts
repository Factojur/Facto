/**
 * Cota mensal de peças FACTO (plano + extras do ciclo).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  cicloAtualSaoPaulo,
  limiteDoPlano,
  montarResumoCota,
  type PlanoCota,
  type ResumoCota,
} from "@/lib/cota-pecas";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

type Admin = ReturnType<typeof createAdminClient>;

async function planoDoEmail(admin: Admin, email: string): Promise<PlanoCota> {
  const { data } = await admin
    .from("assinaturas")
    .select("plano, status, acesso_valido_ate")
    .ilike("email", email)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const agora = Date.now();
  const ate = data.acesso_valido_ate
    ? new Date(data.acesso_valido_ate).getTime()
    : null;
  const ativo =
    (data.status === "authorized" && (ate === null || ate > agora)) ||
    (data.status === "canceled" && ate !== null && ate > agora);
  if (!ativo) return null;
  if (
    data.plano === "pro_anual" ||
    data.plano === "anual" ||
    data.plano === "mensal" ||
    data.plano === "pro" ||
    data.plano === "jec"
  ) {
    return data.plano;
  }
  return null;
}

/**
 * Lê (ou cria) a linha do ciclo atual. Se a tabela não existir, retorna
 * resumo sem tracking (fail-open) para não derrubar o produto.
 */
export async function obterResumoCotaUsuario(opcoes: {
  userId: string;
  email: string;
}): Promise<ResumoCota> {
  const ciclo = cicloAtualSaoPaulo();

  // Admin / contas de teste: ilimitado, sem consumir cota
  if (isEmailAcessoLivre(opcoes.email)) {
    return montarResumoCota({
      plano: null,
      usadas: 0,
      extras: 0,
      ciclo,
      trackingAtivo: false,
    });
  }

  try {
    const admin = createAdminClient();
    const plano = await planoDoEmail(admin, opcoes.email);

    const { data, error } = await admin
      .from("cota_pecas_ciclo")
      .select("usadas, extras")
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo)
      .maybeSingle();

    if (error) {
      console.warn("[cota] leitura falhou (fail-open):", error.message);
      return montarResumoCota({
        plano,
        usadas: 0,
        extras: 0,
        ciclo,
        trackingAtivo: false,
      });
    }

    return montarResumoCota({
      plano,
      usadas: data?.usadas ?? 0,
      extras: data?.extras ?? 0,
      ciclo,
      trackingAtivo: limiteDoPlano(plano) != null,
    });
  } catch (erro) {
    console.warn("[cota] exceção (fail-open):", erro);
    return montarResumoCota({
      plano: null,
      usadas: 0,
      extras: 0,
      ciclo,
      trackingAtivo: false,
    });
  }
}

/**
 * Só consulta saldo — não consome.
 */
export async function verificarSaldoCota(opcoes: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; cota: ResumoCota }
  | { ok: false; motivo: "esgotada"; cota: ResumoCota }
> {
  const cota = await obterResumoCotaUsuario(opcoes);
  if (cota.trackingAtivo && cota.esgotada) {
    return { ok: false, motivo: "esgotada", cota };
  }
  return { ok: true, cota };
}

/**
 * Consome 1 peça se houver saldo. Retorna resumo atualizado ou erro de cota.
 */
export async function consumirUmaPeca(opcoes: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; cota: ResumoCota }
  | { ok: false; motivo: "esgotada"; cota: ResumoCota }
  | { ok: false; motivo: "erro"; cota: ResumoCota }
> {
  const antes = await obterResumoCotaUsuario(opcoes);

  // Sem plano / sem tracking: não bloqueia (admin, legado, pré-migration)
  if (!antes.trackingAtivo) {
    return { ok: true, cota: antes };
  }

  if (antes.esgotada) {
    return { ok: false, motivo: "esgotada", cota: antes };
  }

  try {
    const admin = createAdminClient();
    const ciclo = antes.ciclo;

    const { data: atual } = await admin
      .from("cota_pecas_ciclo")
      .select("usadas, extras")
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo)
      .maybeSingle();

    if (!atual) {
      const { error: insErr } = await admin.from("cota_pecas_ciclo").insert({
        user_id: opcoes.userId,
        ciclo,
        usadas: 1,
        extras: 0,
        analises: 0,
      });
      if (insErr) {
        console.warn("[cota] insert falhou (fail-open):", insErr.message);
        return { ok: true, cota: antes };
      }
    } else {
      const { error: updErr } = await admin
        .from("cota_pecas_ciclo")
        .update({
          usadas: (atual.usadas ?? 0) + 1,
          atualizado_em: new Date().toISOString(),
        })
        .eq("user_id", opcoes.userId)
        .eq("ciclo", ciclo);
      if (updErr) {
        console.warn("[cota] update falhou (fail-open):", updErr.message);
        return { ok: true, cota: antes };
      }
    }

    const depois = await obterResumoCotaUsuario(opcoes);
    return { ok: true, cota: depois };
  } catch (erro) {
    console.warn("[cota] consumir exceção (fail-open):", erro);
    return { ok: true, cota: antes };
  }
}

/** Credita pacote extra (webhook MP). */
export async function creditarExtras(opcoes: {
  userId: string;
  email: string;
  quantidade: number;
}): Promise<ResumoCota> {
  const admin = createAdminClient();
  const ciclo = cicloAtualSaoPaulo();
  const q = Math.max(0, Math.floor(opcoes.quantidade));

  const { data: atual } = await admin
    .from("cota_pecas_ciclo")
    .select("usadas, extras")
    .eq("user_id", opcoes.userId)
    .eq("ciclo", ciclo)
    .maybeSingle();

  if (!atual) {
    await admin.from("cota_pecas_ciclo").insert({
      user_id: opcoes.userId,
      ciclo,
      usadas: 0,
      extras: q,
      analises: 0,
    });
  } else {
    await admin
      .from("cota_pecas_ciclo")
      .update({
        extras: (atual.extras ?? 0) + q,
        atualizado_em: new Date().toISOString(),
      })
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo);
  }

  return obterResumoCotaUsuario(opcoes);
}

/**
 * Lê contagem de análises do ciclo (fail-open → 0).
 */
export async function obterContagemAnalises(opcoes: {
  userId: string;
}): Promise<number> {
  const ciclo = cicloAtualSaoPaulo();
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("cota_pecas_ciclo")
      .select("analises")
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo)
      .maybeSingle();
    if (error) return 0;
    return Number(data?.analises ?? 0);
  } catch {
    return 0;
  }
}

/**
 * Registra 1 análise de processo no ciclo (métrica operacional).
 * Não consome cota de peça. Fail-open se a coluna ainda não existir.
 * Rate-limit suave: ~60 análises/mês por usuário (anti-abuso).
 */
export const LIMITE_ANALISES_CICLO = 60;

export async function registrarUmaAnalise(opcoes: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; analises: number }
  | { ok: false; motivo: "limite"; analises: number }
> {
  if (isEmailAcessoLivre(opcoes.email)) {
    return { ok: true, analises: 0 };
  }

  const ciclo = cicloAtualSaoPaulo();

  try {
    const admin = createAdminClient();
    const { data: atual, error } = await admin
      .from("cota_pecas_ciclo")
      .select("usadas, extras, analises")
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo)
      .maybeSingle();

    if (error) {
      console.warn("[analises] leitura falhou (fail-open):", error.message);
      return { ok: true, analises: 0 };
    }

    const usadasAnalises = Number(atual?.analises ?? 0);
    if (usadasAnalises >= LIMITE_ANALISES_CICLO) {
      return { ok: false, motivo: "limite", analises: usadasAnalises };
    }

    if (!atual) {
      const { error: insErr } = await admin.from("cota_pecas_ciclo").insert({
        user_id: opcoes.userId,
        ciclo,
        usadas: 0,
        extras: 0,
        analises: 1,
      });
      if (insErr) {
        console.warn("[analises] insert falhou (fail-open):", insErr.message);
        return { ok: true, analises: 0 };
      }
      return { ok: true, analises: 1 };
    }

    const { error: updErr } = await admin
      .from("cota_pecas_ciclo")
      .update({
        analises: usadasAnalises + 1,
        atualizado_em: new Date().toISOString(),
      })
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo);

    if (updErr) {
      console.warn("[analises] update falhou (fail-open):", updErr.message);
      return { ok: true, analises: usadasAnalises };
    }

    return { ok: true, analises: usadasAnalises + 1 };
  } catch (erro) {
    console.warn("[analises] exceção (fail-open):", erro);
    return { ok: true, analises: 0 };
  }
}

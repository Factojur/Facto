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

type LinhaCota = {
  encontrada: boolean;
  usadas: number;
  extras: number;
  analises: number;
  extrasAnalises: number;
  sonnetRedacoes: number;
};

async function lerLinhaCota(
  admin: Admin,
  userId: string,
  ciclo: string
): Promise<{ ok: true } & LinhaCota | { ok: false; erro: string }> {
  const comSonnet = await admin
    .from("cota_pecas_ciclo")
    .select("usadas, extras, analises, extras_analises, sonnet_redacoes")
    .eq("user_id", userId)
    .eq("ciclo", ciclo)
    .maybeSingle();

  if (!comSonnet.error) {
    const row = comSonnet.data as {
      usadas?: number;
      extras?: number;
      analises?: number;
      extras_analises?: number;
      sonnet_redacoes?: number;
    } | null;
    return {
      ok: true,
      encontrada: Boolean(comSonnet.data),
      usadas: Number(row?.usadas ?? 0),
      extras: Number(row?.extras ?? 0),
      analises: Number(row?.analises ?? 0),
      extrasAnalises: Number(row?.extras_analises ?? 0),
      sonnetRedacoes: Number(row?.sonnet_redacoes ?? 0),
    };
  }

  const comExtras = await admin
    .from("cota_pecas_ciclo")
    .select("usadas, extras, analises, extras_analises")
    .eq("user_id", userId)
    .eq("ciclo", ciclo)
    .maybeSingle();

  if (!comExtras.error) {
    return {
      ok: true,
      encontrada: Boolean(comExtras.data),
      usadas: Number(comExtras.data?.usadas ?? 0),
      extras: Number(comExtras.data?.extras ?? 0),
      analises: Number(comExtras.data?.analises ?? 0),
      extrasAnalises: Number(
        (comExtras.data as { extras_analises?: number } | null)?.extras_analises ?? 0
      ),
      sonnetRedacoes: 0,
    };
  }

  const semExtras = await admin
    .from("cota_pecas_ciclo")
    .select("usadas, extras, analises")
    .eq("user_id", userId)
    .eq("ciclo", ciclo)
    .maybeSingle();

  if (semExtras.error) {
    return { ok: false, erro: semExtras.error.message };
  }

  return {
    ok: true,
    encontrada: Boolean(semExtras.data),
    usadas: Number(semExtras.data?.usadas ?? 0),
    extras: Number(semExtras.data?.extras ?? 0),
    analises: Number(semExtras.data?.analises ?? 0),
    extrasAnalises: 0,
    sonnetRedacoes: 0,
  };
}

async function planoDoEmail(admin: Admin, email: string): Promise<PlanoCota> {
  const { data } = await admin
    .from("assinaturas")
    .select("plano, status, acesso_valido_ate")
    .ilike("email", email)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    const agora = Date.now();
    const ate = data.acesso_valido_ate
      ? new Date(data.acesso_valido_ate).getTime()
      : null;
    const ativo =
      (data.status === "authorized" && (ate === null || ate > agora)) ||
      (data.status === "canceled" && ate !== null && ate > agora);
    if (
      ativo &&
      (data.plano === "pro_anual" ||
        data.plano === "anual" ||
        data.plano === "mensal" ||
        data.plano === "pro" ||
        data.plano === "jec" ||
        data.plano === "escritorio_s" ||
        data.plano === "escritorio_m" ||
        data.plano === "escritorio_s_anual" ||
        data.plano === "escritorio_m_anual")
    ) {
      return data.plano;
    }
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("trial_ate")
    .ilike("email", email)
    .maybeSingle();
  if (
    perfil?.trial_ate &&
    new Date(perfil.trial_ate).getTime() > Date.now()
  ) {
    return "trial";
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

    const linha = await lerLinhaCota(admin, opcoes.userId, ciclo);
    if (!linha.ok) {
      console.warn("[cota] leitura falhou (fail-open):", linha.erro);
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
      usadas: linha.usadas,
      extras: linha.extras,
      analisesUsadas: linha.analises,
      extrasAnalises: linha.extrasAnalises,
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
    const linha = await lerLinhaCota(admin, opcoes.userId, ciclo);
    if (!linha.ok) return 0;
    return linha.analises;
  } catch {
    return 0;
  }
}

/** Credita pacote extra de análises (webhook MP). */
export async function creditarExtrasAnalises(opcoes: {
  userId: string;
  email: string;
  quantidade: number;
}): Promise<ResumoCota> {
  const admin = createAdminClient();
  const ciclo = cicloAtualSaoPaulo();
  const q = Math.max(0, Math.floor(opcoes.quantidade));
  const linha = await lerLinhaCota(admin, opcoes.userId, ciclo);

  if (!linha.ok || !linha.encontrada) {
    const insertCom = await admin.from("cota_pecas_ciclo").insert({
      user_id: opcoes.userId,
      ciclo,
      usadas: 0,
      extras: 0,
      analises: 0,
      extras_analises: q,
    });
    if (insertCom.error) {
      await admin.from("cota_pecas_ciclo").insert({
        user_id: opcoes.userId,
        ciclo,
        usadas: 0,
        extras: 0,
        analises: 0,
      });
      console.warn(
        "[analises] extras_analises ausente na insert; rode migration-extras-analises.sql"
      );
    }
    return obterResumoCotaUsuario(opcoes);
  }

  const upd = await admin
    .from("cota_pecas_ciclo")
    .update({
      extras_analises: linha.extrasAnalises + q,
      atualizado_em: new Date().toISOString(),
    })
    .eq("user_id", opcoes.userId)
    .eq("ciclo", ciclo);

  if (upd.error) {
    console.warn("[analises] crédito extras falhou:", upd.error.message);
  }

  return obterResumoCotaUsuario(opcoes);
}

/**
 * Legado: antes debitava 1 análise. Entrada não consome mais cota —
 * mantido como no-op seguro para callers antigos / admin.
 */
export async function registrarUmaAnalise(opcoes: {
  userId: string;
  email: string;
}): Promise<
  | { ok: true; analises: number; cota: ResumoCota }
  | { ok: false; motivo: "limite"; analises: number; cota: ResumoCota }
> {
  const cota = await obterResumoCotaUsuario(opcoes);
  return { ok: true, analises: cota.analisesUsadas, cota };
}

/** Contagem de redações Sonnet no ciclo (fail-open → 0). */
export async function obterContagemSonnet(opcoes: {
  userId: string;
}): Promise<number> {
  const ciclo = cicloAtualSaoPaulo();
  try {
    const admin = createAdminClient();
    const linha = await lerLinhaCota(admin, opcoes.userId, ciclo);
    if (!linha.ok) return 0;
    return linha.sonnetRedacoes;
  } catch {
    return 0;
  }
}

/** Incrementa contador Sonnet após redação bem-sucedida (fail-open). */
export async function registrarUmaRedacaoSonnet(opcoes: {
  userId: string;
}): Promise<number> {
  const ciclo = cicloAtualSaoPaulo();
  try {
    const admin = createAdminClient();
    const linha = await lerLinhaCota(admin, opcoes.userId, ciclo);
    if (!linha.ok) return 0;

    if (!linha.encontrada) {
      const { error } = await admin.from("cota_pecas_ciclo").insert({
        user_id: opcoes.userId,
        ciclo,
        usadas: 0,
        extras: 0,
        analises: 0,
        sonnet_redacoes: 1,
      });
      if (error) {
        console.warn("[sonnet] insert falhou (fail-open):", error.message);
        return 0;
      }
      return 1;
    }

    const proximo = linha.sonnetRedacoes + 1;
    const { error } = await admin
      .from("cota_pecas_ciclo")
      .update({
        sonnet_redacoes: proximo,
        atualizado_em: new Date().toISOString(),
      })
      .eq("user_id", opcoes.userId)
      .eq("ciclo", ciclo);

    if (error) {
      console.warn("[sonnet] update falhou (fail-open):", error.message);
      return linha.sonnetRedacoes;
    }
    return proximo;
  } catch (erro) {
    console.warn("[sonnet] exceção (fail-open):", erro);
    return 0;
  }
}

/**
 * Avisos do painel /admin: disco Supabase + compras desde o último acesso.
 */

import { createAdminClient } from "@/lib/supabase/admin";

const CHAVE_ULTIMO_ACESSO = "ultimo_acesso";

/** Limite Free = 500 MB; Pro incluso = 8 GB. Override: SUPABASE_DB_LIMIT_MB. */
export function limiteDatabaseMb(): number {
  const env = Number(process.env.SUPABASE_DB_LIMIT_MB);
  if (Number.isFinite(env) && env > 0) return env;
  const plano = (process.env.SUPABASE_PLAN ?? "free").toLowerCase();
  if (plano === "pro" || plano === "team" || plano === "enterprise") {
    return 8 * 1024;
  }
  return 500;
}

export type StatusDisco = "ok" | "atencao" | "critico" | "desconhecido";

export type InfoDiscoSupabase = {
  bytes: number | null;
  usadosMb: number | null;
  limiteMb: number;
  percentual: number | null;
  status: StatusDisco;
  rotuloPlano: string;
};

export async function obterInfoDiscoSupabase(): Promise<InfoDiscoSupabase> {
  const limiteMb = limiteDatabaseMb();
  const plano = (process.env.SUPABASE_PLAN ?? "free").toLowerCase();
  const rotuloPlano =
    plano === "pro"
      ? "Pro (8 GB incluso)"
      : plano === "team"
        ? "Team"
        : plano === "enterprise"
          ? "Enterprise"
          : "Free (500 MB)";

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("admin_database_size_bytes");
    if (error || data == null) {
      return {
        bytes: null,
        usadosMb: null,
        limiteMb,
        percentual: null,
        status: "desconhecido",
        rotuloPlano,
      };
    }
    const bytes = Number(data);
    const usadosMb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
    const percentual = Math.min(
      100,
      Math.round((usadosMb / limiteMb) * 1000) / 10
    );
    let status: StatusDisco = "ok";
    if (percentual >= 90) status = "critico";
    else if (percentual >= 70) status = "atencao";
    return { bytes, usadosMb, limiteMb, percentual, status, rotuloPlano };
  } catch {
    return {
      bytes: null,
      usadosMb: null,
      limiteMb,
      percentual: null,
      status: "desconhecido",
      rotuloPlano,
    };
  }
}

export async function lerUltimoAcessoAdmin(): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("admin_meta")
      .select("valor")
      .eq("chave", CHAVE_ULTIMO_ACESSO)
      .maybeSingle();
    if (error || !data) return null;
    const em = (data.valor as { em?: string } | null)?.em;
    return typeof em === "string" && em ? em : null;
  } catch {
    return null;
  }
}

/** Grava o acesso atual e devolve o timestamp anterior (para o recorte). */
export async function marcarAcessoAdminAgora(): Promise<string | null> {
  const anterior = await lerUltimoAcessoAdmin();
  const agora = new Date().toISOString();
  try {
    const admin = createAdminClient();
    await admin.from("admin_meta").upsert(
      {
        chave: CHAVE_ULTIMO_ACESSO,
        valor: { em: agora },
        atualizado_em: agora,
      },
      { onConflict: "chave" }
    );
  } catch (e) {
    console.warn("[admin_meta] falha ao gravar último acesso:", e);
  }
  return anterior;
}

export type StatusEmailCompra =
  | "enviado"
  | "falha"
  | "parcial"
  | "sem_registro";

export type CompraDesdeUltimoAcesso = {
  id: string;
  email: string;
  valor: number | null;
  plano: string | null;
  pagoEm: string | null;
  emailFinanceiro: StatusEmailCompra;
  emailConvite: StatusEmailCompra;
};

function statusDosEventos(
  eventos: Array<{ status: string | null }>
): StatusEmailCompra {
  if (eventos.length === 0) return "sem_registro";
  const temEnviado = eventos.some((e) => e.status === "enviado");
  const temFalha = eventos.some((e) => e.status === "falha");
  if (temEnviado && temFalha) return "parcial";
  if (temEnviado) return "enviado";
  if (temFalha) return "falha";
  return "sem_registro";
}

/**
 * Compras desde `desdeIso` (ou últimas 48h se null).
 * Usa assinaturas authorized/pending (webhook/sync) — não depende só de
 * `pagamentos`, que muitas vezes não é gravado quando o webhook falha.
 */
export async function listarComprasDesde(desdeIso: string | null): Promise<{
  desdeIso: string;
  compras: CompraDesdeUltimoAcesso[];
}> {
  const desde =
    desdeIso ??
    new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("assinaturas")
      .select("id, email, valor, plano, status, criado_em, atualizado_em")
      .in("status", ["authorized", "pending"])
      .or(`criado_em.gte.${desde},atualizado_em.gte.${desde}`)
      .order("atualizado_em", { ascending: false })
      .limit(40);

    if (error) {
      console.warn("[admin compras]", error.message);
      return { desdeIso: desde, compras: [] };
    }

    const linhas = (data ?? []) as Array<{
      id: string;
      email: string | null;
      valor: number | string | null;
      plano: string | null;
      criado_em: string | null;
      atualizado_em: string | null;
    }>;

    type Ev = {
      tipo: string | null;
      status: string | null;
      destinatario: string | null;
      assunto: string | null;
    };
    const { data: evData } = await admin
      .from("email_eventos")
      .select("tipo, status, destinatario, assunto")
      .in("tipo", ["financeiro_compra", "convite", "alerta_sms_compra"])
      .gte("criado_em", desde)
      .order("criado_em", { ascending: false })
      .limit(300);
    const eventos = (evData ?? []) as Ev[];

    const compras: CompraDesdeUltimoAcesso[] = linhas.map((l) => {
      const email = (l.email ?? "").trim();
      const emailLow = email.toLowerCase();
      const relacionados = eventos.filter((e) => {
        const dest = (e.destinatario ?? "").toLowerCase();
        const assunto = (e.assunto ?? "").toLowerCase();
        if (emailLow && dest === emailLow) return true;
        if (emailLow && assunto.includes(emailLow)) return true;
        return false;
      });
      return {
        id: l.id,
        email: email || "(sem e-mail no cadastro — sync/webhook incompleto)",
        valor: l.valor === null ? null : Number(l.valor),
        plano: l.plano ?? null,
        pagoEm: l.atualizado_em ?? l.criado_em,
        emailFinanceiro: statusDosEventos(
          relacionados.filter((e) => e.tipo === "financeiro_compra")
        ),
        emailConvite: statusDosEventos(
          relacionados.filter((e) => e.tipo === "convite")
        ),
      };
    });

    return { desdeIso: desde, compras };
  } catch (e) {
    console.warn("[admin compras]", e);
    return { desdeIso: desde, compras: [] };
  }
}

export function rotuloStatusEmail(s: StatusEmailCompra): string {
  switch (s) {
    case "enviado":
      return "Enviado";
    case "falha":
      return "Falha";
    case "parcial":
      return "Parcial";
    default:
      return "Sem registro";
  }
}

/** true se não houve webhook MP real nas últimas `horas`. */
export async function webhookMpSilencioso(horas = 24): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const desde = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin
      .from("webhook_eventos_mp")
      .select("id, mp_id, erro")
      .gte("recebido_em", desde)
      .order("recebido_em", { ascending: false })
      .limit(30);
    if (error) return false;
    const reais = (data ?? []).filter((w) => {
      const id = String(w.mp_id ?? "");
      if (!id || id === "123456" || id === "123456789") return false;
      if (String(w.erro ?? "").toLowerCase().includes("simulação")) return false;
      return true;
    });
    return reais.length === 0;
  } catch {
    return false;
  }
}

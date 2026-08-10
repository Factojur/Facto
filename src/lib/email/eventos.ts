import { createAdminClient } from "@/lib/supabase/admin";

export type TipoEmailEvento =
  | "suporte"
  | "convite"
  | "financeiro_compra"
  | "financeiro_cancelamento"
  | "alerta_sms_compra";

export type StatusEmailEvento = "enviado" | "falha";

/**
 * Registra envio/falha de e-mail para o painel admin.
 * Se a tabela ainda não existir, só registra no console (não quebra o fluxo).
 */
export async function registrarEmailEvento(opcoes: {
  tipo: TipoEmailEvento;
  status: StatusEmailEvento;
  destinatario?: string | null;
  assunto?: string | null;
  erro?: string | null;
  userId?: string | null;
  metadados?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("email_eventos").insert({
      tipo: opcoes.tipo,
      status: opcoes.status,
      destinatario: opcoes.destinatario ?? null,
      assunto: opcoes.assunto ?? null,
      erro: opcoes.erro ?? null,
      user_id: opcoes.userId ?? null,
      metadados: opcoes.metadados ?? null,
    });
    if (error) {
      console.warn("[email_eventos]", error.message);
    }
  } catch (erro) {
    console.warn(
      "[email_eventos]",
      erro instanceof Error ? erro.message : erro
    );
  }

  if (opcoes.status === "falha") {
    console.error(
      `[email ${opcoes.tipo}] falha → ${opcoes.destinatario ?? "?"}:`,
      opcoes.erro
    );
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureMessage(
        `Falha e-mail ${opcoes.tipo}: ${opcoes.erro ?? "desconhecido"}`,
        {
          level: "error",
          tags: { email_tipo: opcoes.tipo },
          extra: {
            destinatario: opcoes.destinatario,
            assunto: opcoes.assunto,
            metadados: opcoes.metadados,
          },
        }
      );
    } catch {
      // Sentry ausente / DSN vazio — ignora.
    }
  }
}

/**
 * Idempotência de envio por tipo + mpPaymentId (metadados JSON).
 * Opcionalmente filtra por destinatário (ex.: só a confirmação ao cliente).
 * Se a tabela/consulta falhar, assume que ainda não enviou (permite retry).
 */
export async function emailJaEnviadoParaPagamento(
  tipo: TipoEmailEvento,
  mpPaymentId: string,
  destinatario?: string
): Promise<boolean> {
  if (!mpPaymentId) return false;
  try {
    const admin = createAdminClient();
    let query = admin
      .from("email_eventos")
      .select("id")
      .eq("tipo", tipo)
      .eq("status", "enviado")
      .contains("metadados", { mpPaymentId })
      .limit(1);

    if (destinatario) {
      query = query.ilike("destinatario", destinatario);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.warn("[email_eventos] idempotência:", error.message);
      return false;
    }
    return Boolean(data?.id);
  } catch {
    return false;
  }
}

const LIMITE_SUPORTE = 5;
const JANELA_SUPORTE_MS = 60 * 60 * 1000; // 1 h

/** Anti-spam: no máximo 5 mensagens de suporte por usuário/hora. */
export async function verificarLimiteSuporte(
  userId: string
): Promise<{ ok: true } | { ok: false; retryAfterMin: number }> {
  try {
    const admin = createAdminClient();
    const desde = new Date(Date.now() - JANELA_SUPORTE_MS).toISOString();
    const { count, error } = await admin
      .from("email_eventos")
      .select("id", { count: "exact", head: true })
      .eq("tipo", "suporte")
      .eq("user_id", userId)
      .gte("criado_em", desde);

    if (error) {
      // Tabela ausente → não bloqueia o usuário.
      console.warn("[rate-limit suporte]", error.message);
      return { ok: true };
    }

    if ((count ?? 0) >= LIMITE_SUPORTE) {
      return { ok: false, retryAfterMin: 60 };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

/**
 * Anti-spam para formulário público (sem login):
 * no máximo 3 mensagens/hora pelo e-mail informado (aparece no assunto).
 */
export async function verificarLimiteSuportePublico(
  email: string
): Promise<{ ok: true } | { ok: false; retryAfterMin: number }> {
  const remetente = email.trim().toLowerCase();
  if (!remetente) return { ok: true };
  try {
    const admin = createAdminClient();
    const desde = new Date(Date.now() - JANELA_SUPORTE_MS).toISOString();
    const { count, error } = await admin
      .from("email_eventos")
      .select("id", { count: "exact", head: true })
      .eq("tipo", "suporte")
      .ilike("assunto", `%${remetente}%`)
      .gte("criado_em", desde);

    if (error) {
      console.warn("[rate-limit suporte publico]", error.message);
      return { ok: true };
    }

    if ((count ?? 0) >= 3) {
      return { ok: false, retryAfterMin: 60 };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

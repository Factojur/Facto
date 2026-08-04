/**
 * Pacotes extras avulsos (Checkout Pro preference + crédito no webhook).
 * Não é assinatura — cobrança única.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { chamarMercadoPago } from "@/lib/mercadopago/client";
import { cicloAtualSaoPaulo } from "@/lib/cota-pecas";
import { creditarExtras } from "@/lib/cota-pecas-server";
import { getSiteUrl } from "@/lib/site-url";
import {
  montarExternalReferenceExtra,
  pacoteExtraPorId,
  pacoteExtraPorValor,
  parseExternalReferenceExtra,
  type PacoteExtra,
  type PacoteExtraId,
} from "@/lib/planos-facto";

type Admin = ReturnType<typeof createAdminClient>;

type PreferenciaMp = {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
};

export function identificarPacoteDoPagamento(opcoes: {
  valor?: number | null;
  externalReference?: string | null;
  metadata?: Record<string, unknown> | null;
}): { pacote: PacoteExtra; userIdHint: string | null } | null {
  const metaId =
    typeof opcoes.metadata?.facto_pacote === "string"
      ? opcoes.metadata.facto_pacote
      : null;
  const metaUser =
    typeof opcoes.metadata?.facto_user_id === "string"
      ? opcoes.metadata.facto_user_id
      : null;

  const porMeta = metaId ? pacoteExtraPorId(metaId) : null;
  if (porMeta) {
    return { pacote: porMeta, userIdHint: metaUser };
  }

  const porRef = parseExternalReferenceExtra(opcoes.externalReference);
  if (porRef) {
    return { pacote: porRef.pacote, userIdHint: porRef.userId ?? metaUser };
  }

  const porValor = pacoteExtraPorValor(opcoes.valor ?? null);
  if (porValor) {
    return { pacote: porValor, userIdHint: metaUser };
  }

  return null;
}

async function resolverUserId(
  admin: Admin,
  opcoes: { userIdHint: string | null; email: string }
): Promise<string | null> {
  if (opcoes.userIdHint) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", opcoes.userIdHint)
      .maybeSingle();
    if (data?.id) return data.id as string;

    try {
      const { data: authData, error } = await admin.auth.admin.getUserById(
        opcoes.userIdHint
      );
      if (!error && authData.user?.id) return authData.user.id;
    } catch {
      /* segue para e-mail */
    }
  }

  const email = opcoes.email.trim().toLowerCase();
  const { data: porPerfil } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (porPerfil?.id) return porPerfil.id as string;

  const { data: porAssinatura } = await admin
    .from("assinaturas")
    .select("profile_id")
    .ilike("email", email)
    .not("profile_id", "is", null)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (porAssinatura?.profile_id) {
    return porAssinatura.profile_id as string;
  }

  return null;
}

/**
 * Credita extras após payment approved. Idempotente por mp_payment_id.
 */
export async function processarPagamentoPacoteExtra(opcoes: {
  mpPaymentId: string;
  email: string;
  valor: number | null;
  externalReference?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<
  | { ok: true; pecas: number; pacoteId: PacoteExtraId; jaProcessado?: boolean }
  | { ok: false; motivo: string }
> {
  const identificado = identificarPacoteDoPagamento({
    valor: opcoes.valor,
    externalReference: opcoes.externalReference,
    metadata: opcoes.metadata,
  });
  if (!identificado) {
    return { ok: false, motivo: "nao_e_pacote_extra" };
  }

  const admin = createAdminClient();
  const ciclo = cicloAtualSaoPaulo();

  const { data: existente } = await admin
    .from("pagamentos_extras")
    .select("id")
    .eq("mp_payment_id", opcoes.mpPaymentId)
    .maybeSingle();

  if (existente) {
    return {
      ok: true,
      pecas: identificado.pacote.pecas,
      pacoteId: identificado.pacote.id,
      jaProcessado: true,
    };
  }

  const userId = await resolverUserId(admin, {
    userIdHint: identificado.userIdHint,
    email: opcoes.email,
  });

  if (!userId) {
    console.error(
      "[pacotes-extras] pagamento aprovado sem usuário FACTO; mp_payment_id=",
      opcoes.mpPaymentId,
      "email=",
      opcoes.email
    );
    return { ok: false, motivo: "usuario_nao_encontrado" };
  }

  const { error: insErr } = await admin.from("pagamentos_extras").insert({
    mp_payment_id: opcoes.mpPaymentId,
    user_id: userId,
    email: opcoes.email.trim().toLowerCase(),
    pacote_id: identificado.pacote.id,
    pecas: identificado.pacote.pecas,
    valor: opcoes.valor,
    ciclo,
  });

  if (insErr) {
    // Corrida: outro worker inseriu o mesmo payment
    if (insErr.code === "23505") {
      return {
        ok: true,
        pecas: identificado.pacote.pecas,
        pacoteId: identificado.pacote.id,
        jaProcessado: true,
      };
    }
    console.error("[pacotes-extras] insert pagamentos_extras:", insErr.message);
    return { ok: false, motivo: "erro_persistencia" };
  }

  await creditarExtras({
    userId,
    email: opcoes.email,
    quantidade: identificado.pacote.pecas,
  });

  console.info("[pacotes-extras] crédito ok", {
    mpPaymentId: opcoes.mpPaymentId,
    userId,
    pacote: identificado.pacote.id,
    pecas: identificado.pacote.pecas,
    ciclo,
  });

  return {
    ok: true,
    pecas: identificado.pacote.pecas,
    pacoteId: identificado.pacote.id,
  };
}

/** Cria preferência Checkout Pro (pagamento único). */
export async function criarPreferenciaPacoteExtra(opcoes: {
  pacoteId: PacoteExtraId;
  userId: string;
  email: string;
}): Promise<{ initPoint: string; preferenceId: string }> {
  const pacote = pacoteExtraPorId(opcoes.pacoteId);
  if (!pacote) {
    throw new Error("Pacote inválido.");
  }

  const site = getSiteUrl();
  const externalReference = montarExternalReferenceExtra(
    pacote.id,
    opcoes.userId
  );

  const body = {
    items: [
      {
        id: pacote.id,
        title: `FACTO ${pacote.rotulo} — peças extras`,
        description:
          "Créditos avulsos de peças jurídicas no ciclo atual (não é assinatura).",
        quantity: 1,
        currency_id: "BRL",
        unit_price: pacote.preco,
      },
    ],
    payer: {
      email: opcoes.email,
    },
    external_reference: externalReference,
    metadata: {
      facto_pacote: pacote.id,
      facto_user_id: opcoes.userId,
      facto_tipo: "pacote_extra",
    },
    back_urls: {
      success: `${site}/dashboard/perfil?extra=ok`,
      failure: `${site}/dashboard/perfil?extra=erro`,
      pending: `${site}/dashboard/perfil?extra=pendente`,
    },
    auto_return: "approved",
    statement_descriptor: "FACTO PECAS",
    notification_url: `${site}/api/webhooks/mercadopago`,
  };

  const preferencia = (await chamarMercadoPago("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(body),
  })) as PreferenciaMp;

  const initPoint = preferencia.init_point?.trim();
  if (!initPoint || !preferencia.id) {
    throw new Error("Mercado Pago não retornou init_point da preferência.");
  }

  return { initPoint, preferenceId: preferencia.id };
}

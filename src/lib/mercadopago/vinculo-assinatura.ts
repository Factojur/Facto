/**
 * Resolve conta FACTO a partir do token da preapproval (external_reference / metadata).
 * Prioridade: token userId ≫ e-mail do pagador MP.
 */

import type { createAdminClient } from "@/lib/supabase/admin";
import {
  ehPlanoCheckout,
  parseExternalReferenceUpgrade,
  type PlanoCheckoutId,
  type PlanoId,
} from "@/lib/planos-facto";

type Admin = ReturnType<typeof createAdminClient>;

export type VinculoAssinatura = {
  profileId: string | null;
  /** E-mail da conta FACTO (acesso/cota) — não o do cartão, se divergirem. */
  accountEmail: string | null;
  planoFromToken: PlanoCheckoutId | null;
};

function planoDeMetadata(
  metadata: Record<string, unknown> | null | undefined
): PlanoCheckoutId | null {
  const raw = metadata?.facto_plano;
  if (typeof raw === "string" && ehPlanoCheckout(raw)) return raw;
  return null;
}

function userIdDeMetadata(
  metadata: Record<string, unknown> | null | undefined
): string | null {
  const raw = metadata?.facto_user_id;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/**
 * Encerra trial no perfil após assinatura autorizada (mesma conta).
 */
export async function encerrarTrialDoPerfil(
  admin: Admin,
  profileId: string
): Promise<void> {
  const { error } = await admin
    .from("profiles")
    .update({
      trial_ate: null,
      trial_pecas_usadas: 0,
    })
    .eq("id", profileId);
  if (error) {
    console.warn("[vinculo-assinatura] falha ao encerrar trial", profileId, error.message);
  }
}

export async function resolverVinculoAssinatura(
  admin: Admin,
  opcoes: {
    externalReference?: string | null;
    metadata?: Record<string, unknown> | null;
    payerEmail?: string | null;
  }
): Promise<VinculoAssinatura> {
  const porRef = parseExternalReferenceUpgrade(opcoes.externalReference ?? null);
  const userIdHint = porRef?.userId ?? userIdDeMetadata(opcoes.metadata);
  const planoFromToken =
    porRef?.plano ?? planoDeMetadata(opcoes.metadata) ?? null;

  if (userIdHint) {
    const { data: perfil } = await admin
      .from("profiles")
      .select("id, email")
      .eq("id", userIdHint)
      .maybeSingle();

    if (perfil?.id) {
      const accountEmail =
        typeof perfil.email === "string" && perfil.email.includes("@")
          ? perfil.email.trim().toLowerCase()
          : null;
      return {
        profileId: perfil.id as string,
        accountEmail,
        planoFromToken,
      };
    }

    try {
      const { data: authData, error } = await admin.auth.admin.getUserById(
        userIdHint
      );
      if (!error && authData.user?.id) {
        const authEmail = authData.user.email?.trim().toLowerCase() ?? null;
        if (authEmail) {
          const { data: porEmail } = await admin
            .from("profiles")
            .select("id, email")
            .ilike("email", authEmail)
            .maybeSingle();
          if (porEmail?.id) {
            return {
              profileId: porEmail.id as string,
              accountEmail: authEmail,
              planoFromToken,
            };
          }
        }
        return {
          profileId: authData.user.id,
          accountEmail: authEmail,
          planoFromToken,
        };
      }
    } catch {
      /* segue e-mail pagador */
    }
  }

  const payer = opcoes.payerEmail?.trim().toLowerCase() ?? null;
  if (payer?.includes("@")) {
    const { data: perfil } = await admin
      .from("profiles")
      .select("id, email")
      .ilike("email", payer)
      .maybeSingle();
    if (perfil?.id) {
      return {
        profileId: perfil.id as string,
        accountEmail:
          typeof perfil.email === "string"
            ? perfil.email.trim().toLowerCase()
            : payer,
        planoFromToken,
      };
    }
    return { profileId: null, accountEmail: payer, planoFromToken };
  }

  return { profileId: null, accountEmail: null, planoFromToken };
}

export function planoEfetivoAssinatura(
  inferido: PlanoId | null,
  token: PlanoCheckoutId | null
): PlanoId | null {
  return token ?? inferido;
}

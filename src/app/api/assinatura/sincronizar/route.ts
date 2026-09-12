import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sincronizarAssinaturaPorEmail,
  upsertAssinaturaDePreapproval,
  type PreapprovalMp,
} from "@/lib/mercadopago/sincronizar-assinatura";
import { chamarMercadoPago } from "@/lib/mercadopago/client";
import { buscarAssinaturaDoUsuario } from "@/lib/mercadopago/buscar-assinatura-email";
import { mapearAssinaturaParaUI } from "@/lib/assinatura-format";
import { acessoAssinaturaLiberado } from "@/lib/acesso-assinatura";
import { encerrarTrialDoPerfil } from "@/lib/mercadopago/vinculo-assinatura";
import { garantirConviteEEmailsPosCompra } from "@/lib/mercadopago/pos-compra";

/**
 * POST /api/assinatura/sincronizar
 * Após retorno do MP (upgrade=ok): puxa preapproval do MP e libera acesso na hora.
 * Body opcional: { preapprovalId?: string } (salvo no checkout via sessionStorage).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let preapprovalIdHint: string | null = null;
  try {
    const body = (await request.json()) as { preapprovalId?: string };
    if (typeof body.preapprovalId === "string" && body.preapprovalId.trim()) {
      preapprovalIdHint = body.preapprovalId.trim();
    }
  } catch {
    /* body vazio ok */
  }

  try {
    const admin = createAdminClient();
    let sync = null as Awaited<
      ReturnType<typeof sincronizarAssinaturaPorEmail>
    >;

    if (preapprovalIdHint) {
      try {
        const pre = (await chamarMercadoPago(
          `/preapproval/${preapprovalIdHint}`
        )) as PreapprovalMp;
        if (pre?.id) {
          sync = await upsertAssinaturaDePreapproval(admin, {
            ...pre,
            payer_email: user.email,
          });
        }
      } catch (erro) {
        console.warn(
          "[assinatura/sincronizar] preapprovalId hint",
          preapprovalIdHint,
          erro
        );
      }
    }

    if (!sync || sync.status !== "authorized") {
      sync = await sincronizarAssinaturaPorEmail(admin, user.email);
    }

    if (!sync || sync.status !== "authorized") {
      try {
        const data = (await chamarMercadoPago(
          `/preapproval/search?limit=50&offset=0`
        )) as { results?: PreapprovalMp[] };
        const hit = (data.results ?? []).find((p) => {
          const ref = String(p.external_reference ?? "");
          const meta = p.metadata as Record<string, unknown> | null | undefined;
          return ref.includes(user.id) || meta?.facto_user_id === user.id;
        });
        if (hit?.id) {
          sync = await upsertAssinaturaDePreapproval(admin, {
            ...hit,
            payer_email: user.email,
          });
        }
      } catch (erro) {
        console.warn("[assinatura/sincronizar] scan por userId", erro);
      }
    }

    if (sync?.preapprovalId) {
      await admin
        .from("assinaturas")
        .update({
          profile_id: user.id,
          email: user.email.trim().toLowerCase(),
          atualizado_em: new Date().toISOString(),
        })
        .eq("mp_preapproval_id", sync.preapprovalId);

      if (sync.status === "authorized") {
        await encerrarTrialDoPerfil(admin, user.id);
        await garantirConviteEEmailsPosCompra(admin, {
          email: user.email,
          mpPaymentId: sync.mpPaymentId ?? `preapproval:${sync.preapprovalId}`,
          valor: sync.valor,
          plano: sync.plano,
          atrasoConviteMinutos: 0,
        }).catch((e) =>
          console.warn("[assinatura/sincronizar] pós-compra", e)
        );
      }
    }

    const { data } = await buscarAssinaturaDoUsuario(admin, {
      email: user.email,
      userId: user.id,
    });

    const liberado = await acessoAssinaturaLiberado(user.email, user.id);

    const res = NextResponse.json({
      ok: true,
      sync,
      liberado,
      assinatura: data ? mapearAssinaturaParaUI(data) : null,
    });

    if (liberado) {
      res.cookies.set("facto_acesso_ok", "1", {
        path: "/",
        maxAge: 300,
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return res;
  } catch (erro) {
    console.error("[assinatura/sincronizar]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao sincronizar assinatura.",
      },
      { status: 502 }
    );
  }
}

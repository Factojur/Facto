import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelarPreapprovalMercadoPago } from "@/lib/mercadopago/client";
import {
  mapearAssinaturaParaUI,
  montarUpdateCancelamentoCliente,
  type AssinaturaDb,
} from "@/lib/assinatura-format";

/**
 * POST /api/assinatura/cancelar
 * Cancela a preapproval no Mercado Pago e espelha o status no banco
 * (mesmas regras do webhook: CDC 7 dias vs fim de ciclo).
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("assinaturas")
      .select(
        "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento"
      )
      .eq("email", user.email)
      .in("status", ["authorized", "paused", "pending"])
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[api/assinatura/cancelar]", error);
      return NextResponse.json(
        { error: "Não foi possível localizar a assinatura." },
        { status: 500 }
      );
    }

    if (!row?.mp_preapproval_id) {
      return NextResponse.json(
        {
          error:
            "Nenhuma assinatura ativa encontrada para esta conta. Se você assinou com outro e-mail, fale com o suporte.",
        },
        { status: 404 }
      );
    }

    const assinatura = row as AssinaturaDb;

    // 1) Cancela no Mercado Pago (irreversível — para cobranças futuras)
    await cancelarPreapprovalMercadoPago(assinatura.mp_preapproval_id);

    // 2) Espelha no banco imediatamente (webhook também sincroniza depois)
    const update = montarUpdateCancelamentoCliente(assinatura);
    const { data: atualizada, error: updateError } = await admin
      .from("assinaturas")
      .update(update)
      .eq("id", assinatura.id)
      .select(
        "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento"
      )
      .single();

    if (updateError) {
      console.error("[api/assinatura/cancelar] update", updateError);
      // MP já cancelou; avisa mas não falha totalmente
      return NextResponse.json({
        ok: true,
        aviso:
          "Assinatura cancelada no Mercado Pago. A sincronização no FACTO pode levar alguns minutos via webhook.",
        assinatura: mapearAssinaturaParaUI({
          ...assinatura,
          ...update,
          acesso_valido_ate:
            update.acesso_valido_ate ?? assinatura.acesso_valido_ate,
        }),
        motivo: update.motivo_encerramento,
      });
    }

    const ui = mapearAssinaturaParaUI(atualizada as AssinaturaDb);
    const cdc = update.motivo_encerramento === "arrependimento_cdc";

    return NextResponse.json({
      ok: true,
      assinatura: ui,
      motivo: update.motivo_encerramento,
      mensagem: cdc
        ? "Cancelamento concluído dentro do prazo de 7 dias (CDC). O acesso foi encerrado. O estorno do valor, quando aplicável, segue as regras do Mercado Pago / meio de pagamento."
        : `Cancelamento concluído. Não haverá renovação. Seu acesso permanece até ${ui.proximaCobrancaLabel === "Não haverá novas cobranças" ? "o fim do ciclo já pago" : ui.proximaCobrancaLabel}.`,
    });
  } catch (erro) {
    console.error("[api/assinatura/cancelar]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao cancelar no Mercado Pago.",
      },
      { status: 500 }
    );
  }
}

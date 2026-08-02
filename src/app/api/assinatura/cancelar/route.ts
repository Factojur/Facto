import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { executarCancelamentoNoMercadoPago } from "@/lib/mercadopago/cancelar-assinatura";
import {
  mapearAssinaturaParaUI,
  montarUpdateCancelamentoCliente,
  type AssinaturaDb,
} from "@/lib/assinatura-format";

/**
 * POST /api/assinatura/cancelar
 *
 * ≤ 7 dias do pagamento inicial (CDC): cancela recorrência + estorna pagamento.
 * > 7 dias: só cancela recorrência; acesso segue até o fim do ciclo pago.
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

    // 1–4) MP: decide CDC, cancela preapproval e, se CDC, estorna
    const mp = await executarCancelamentoNoMercadoPago({
      mpPreapprovalId: assinatura.mp_preapproval_id,
      dataInicio: assinatura.data_inicio,
    });

    // Espelha status no banco (webhook também sincroniza depois)
    const update = montarUpdateCancelamentoCliente(
      assinatura,
      mp.dentroPrazoCdc
    );
    const { data: atualizada, error: updateError } = await admin
      .from("assinaturas")
      .update(update)
      .eq("id", assinatura.id)
      .select(
        "id, mp_preapproval_id, email, plano, status, data_inicio, acesso_valido_ate, motivo_encerramento, data_cancelamento"
      )
      .single();

    // Marca fatura local como refunded quando o estorno CDC deu certo
    if (mp.estorno?.sucesso && mp.estorno.invoiceId) {
      await admin
        .from("pagamentos")
        .update({ status: "refunded" })
        .eq("mp_payment_id", mp.estorno.invoiceId);
    }

    const ui = mapearAssinaturaParaUI(
      (atualizada as AssinaturaDb | null) ?? {
        ...assinatura,
        ...update,
        acesso_valido_ate:
          update.acesso_valido_ate ?? assinatura.acesso_valido_ate,
      }
    );

    if (updateError) {
      console.error("[api/assinatura/cancelar] update", updateError);
    }

    const mensagem = montarMensagemCancelamento(mp, ui.proximaCobrancaLabel);

    return NextResponse.json({
      ok: true,
      assinatura: ui,
      motivo: update.motivo_encerramento,
      dentroPrazoCdc: mp.dentroPrazoCdc,
      estorno: mp.estorno,
      aviso: updateError
        ? "Assinatura cancelada no Mercado Pago. A sincronização no FACTO pode levar alguns minutos via webhook."
        : mp.estorno?.sucesso === false
          ? mp.estorno.aviso
          : undefined,
      mensagem,
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

function montarMensagemCancelamento(
  mp: Awaited<ReturnType<typeof executarCancelamentoNoMercadoPago>>,
  proximaCobrancaLabel: string
): string {
  if (!mp.dentroPrazoCdc) {
    const ate =
      proximaCobrancaLabel === "Não haverá novas cobranças"
        ? "o fim do ciclo já pago"
        : proximaCobrancaLabel;
    return `Cancelamento concluído. Não haverá renovação. Seu acesso permanece até ${ate}.`;
  }

  if (mp.estorno?.sucesso) {
    return "Cancelamento concluído dentro do prazo de 7 dias (CDC). O valor foi estornado no Mercado Pago e o acesso foi encerrado.";
  }

  return (
    mp.estorno?.aviso ??
    "Cancelamento concluído dentro do prazo de 7 dias (CDC). O acesso foi encerrado; o estorno precisa ser concluído pelo suporte."
  );
}

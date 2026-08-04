import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  executarCancelamentoNoMercadoPago,
  marcarPagamentosLocaisRefunded,
} from "@/lib/mercadopago/cancelar-assinatura";
import { enviarEmailsCancelamentoAssinatura } from "@/lib/email/cancelamento-assinatura";
import {
  mapearAssinaturaParaUI,
  montarUpdateCancelamentoCliente,
  type AssinaturaDb,
} from "@/lib/assinatura-format";
import type { PagamentoInicialAssinatura } from "@/lib/mercadopago/client";

/**
 * POST /api/assinatura/cancelar
 *
 * ≤ 7 dias do pagamento inicial (CDC): cancela recorrência + estorna pagamento.
 * > 7 dias: só cancela recorrência; acesso segue até o fim do ciclo pago.
 * Em ambos os casos, financeiro@ notifica a equipe e o cliente.
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
      .ilike("email", user.email)
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

    const pagamentoFallback = await buscarPagamentoLocalFallback(
      admin,
      assinatura.id
    );

    // 1–4) MP: decide CDC, cancela preapproval e, se CDC, estorna
    const mp = await executarCancelamentoNoMercadoPago({
      mpPreapprovalId: assinatura.mp_preapproval_id,
      dataInicio: assinatura.data_inicio,
      pagamentoFallback,
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

    if (mp.estorno?.sucesso) {
      await marcarPagamentosLocaisRefunded(admin, {
        paymentId: mp.estorno.paymentId,
        invoiceId: mp.estorno.invoiceId,
      });
    }

    const assinaturaFinal: AssinaturaDb =
      (atualizada as AssinaturaDb | null) ?? {
        ...assinatura,
        ...update,
        acesso_valido_ate:
          update.acesso_valido_ate ?? assinatura.acesso_valido_ate,
      };

    const ui = mapearAssinaturaParaUI(assinaturaFinal);

    if (updateError) {
      console.error("[api/assinatura/cancelar] update", updateError);
    }

    // E-mails via financeiro@ (não bloqueia a resposta se o envio falhar)
    await enviarEmailsCancelamentoAssinatura({
      emailCliente: user.email,
      plano: assinatura.plano,
      dentroPrazoCdc: mp.dentroPrazoCdc,
      estornoSucesso: mp.dentroPrazoCdc
        ? (mp.estorno?.sucesso ?? null)
        : null,
      acessoValidoAte: assinaturaFinal.acesso_valido_ate,
      mpPreapprovalId: assinatura.mp_preapproval_id,
    });

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

type AdminClient = ReturnType<typeof createAdminClient>;

/** Primeiro pagamento local aprovado da assinatura (mais antigo). */
async function buscarPagamentoLocalFallback(
  admin: AdminClient,
  assinaturaId: string
): Promise<PagamentoInicialAssinatura | null> {
  const { data } = await admin
    .from("pagamentos")
    .select("mp_payment_id, status, pago_em")
    .eq("assinatura_id", assinaturaId)
    .in("status", ["approved", "processed", "accredited"])
    .order("pago_em", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data?.mp_payment_id) return null;

  return {
    invoiceId: String(data.mp_payment_id),
    paymentId: String(data.mp_payment_id),
    debitDate: (data.pago_em as string | null) ?? null,
    status: (data.status as string) ?? "approved",
  };
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

  // Mensagem ao cliente: prazo suave (cartão/Pix). Detalhe técnico do estorno
  // fica no e-mail interno financeiro@ e no campo `aviso` da API.
  return "Cancelamento concluído dentro do prazo de 7 dias. O acesso foi encerrado; o estorno deve ser creditado em até 30 dias, conforme o meio de pagamento.";
}

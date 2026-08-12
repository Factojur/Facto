/**
 * Orquestra cancelamento de assinatura no Mercado Pago:
 * - sempre cancela a recorrência (preapproval);
 * - se ≤ 7 dias do pagamento inicial (CDC), também estorna o pagamento.
 */

import { dentroPrazoArrependimentoCdc } from "@/lib/assinatura-format";
import {
  buscarPagamentoInicialAprovado,
  cancelarPreapprovalMercadoPago,
  chaveIdempotenciaEstornoCdc,
  estornarPagamentoMercadoPago,
  resolverIdPagamentoParaEstorno,
  type PagamentoInicialAssinatura,
} from "@/lib/mercadopago/client";

export type ResultadoEstorno = {
  tentado: boolean;
  sucesso: boolean;
  paymentId?: string;
  invoiceId?: string;
  refundId?: string | number;
  aviso?: string;
};

export type ResultadoCancelamentoMp = {
  preapprovalCancelada: boolean;
  dentroPrazoCdc: boolean;
  /** Data usada para o cálculo dos 7 dias (pagamento inicial ou data_inicio). */
  dataReferenciaCdc: string | null;
  pagamentoInicial: PagamentoInicialAssinatura | null;
  estorno: ResultadoEstorno | null;
};

/**
 * Tenta estornar o pagamento inicial (CDC). Idempotente via X-Idempotency-Key.
 * Usado pelo cancelamento no app e pelo webhook quando a preapproval vira canceled.
 */
export async function tentarEstornoCdc(opcoes: {
  mpPreapprovalId: string;
  /** Fallback local (ex.: linha em `pagamentos`) quando o search do MP falha. */
  pagamentoFallback?: PagamentoInicialAssinatura | null;
}): Promise<{
  pagamentoInicial: PagamentoInicialAssinatura | null;
  estorno: ResultadoEstorno;
}> {
  let pagamentoInicial: PagamentoInicialAssinatura | null = null;
  try {
    pagamentoInicial = await buscarPagamentoInicialAprovado(
      opcoes.mpPreapprovalId
    );
  } catch (erro) {
    console.error(
      "[cancelar-assinatura] falha ao buscar pagamento inicial no MP",
      erro
    );
  }

  if (!pagamentoInicial?.paymentId && opcoes.pagamentoFallback?.paymentId) {
    pagamentoInicial = opcoes.pagamentoFallback;
  }

  if (!pagamentoInicial?.paymentId) {
    return {
      pagamentoInicial,
      estorno: {
        tentado: true,
        sucesso: false,
        aviso:
          "Assinatura cancelada no prazo CDC, mas não há pagamento aprovado no Mercado Pago para estornar automaticamente. O suporte precisa concluir o reembolso.",
      },
    };
  }

  // Linhas antigas em `pagamentos` podiam guardar o id da fatura
  // (authorized_payment) em vez do payment.id — resolve antes do estorno.
  const paymentId = await resolverIdPagamentoParaEstorno(
    pagamentoInicial.paymentId
  );
  pagamentoInicial = { ...pagamentoInicial, paymentId };

  try {
    const refund = await estornarPagamentoMercadoPago(paymentId, {
      idempotencyKey: chaveIdempotenciaEstornoCdc(paymentId),
    });

    return {
      pagamentoInicial,
      estorno: {
        tentado: true,
        sucesso: true,
        paymentId: pagamentoInicial.paymentId,
        invoiceId: pagamentoInicial.invoiceId,
        refundId: refund?.id,
      },
    };
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : "Falha desconhecida no estorno.";

    // Pagamento já estornado / status refunded — trata como sucesso operacional.
    if (/already_refunded|refunded|409/i.test(mensagem)) {
      return {
        pagamentoInicial,
        estorno: {
          tentado: true,
          sucesso: true,
          paymentId: pagamentoInicial.paymentId,
          invoiceId: pagamentoInicial.invoiceId,
          aviso: "Pagamento já constava como estornado no Mercado Pago.",
        },
      };
    }

    console.error("[cancelar-assinatura] falha no estorno CDC", erro);
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(erro, {
        tags: { fluxo: "estorno_cdc" },
        extra: {
          mpPreapprovalId: opcoes.mpPreapprovalId,
          paymentId: pagamentoInicial.paymentId,
        },
      });
    } catch {
      // Sentry ausente — ignora.
    }

    return {
      pagamentoInicial,
      estorno: {
        tentado: true,
        sucesso: false,
        paymentId: pagamentoInicial.paymentId,
        invoiceId: pagamentoInicial.invoiceId,
        aviso: `Assinatura cancelada, mas o estorno automático falhou: ${mensagem}`,
      },
    };
  }
}

/**
 * 1) Descobre o pagamento inicial aprovado (se houver).
 * 2) Decide CDC pelos dias desde esse pagamento (fallback: data_inicio).
 * 3) Cancela a preapproval.
 * 4) Se CDC: estorna o payment.id no Mercado Pago.
 *
 * O cancelamento da recorrência não é revertido se o estorno falhar —
 * nesse caso devolvemos aviso para o suporte tratar o reembolso.
 */
export async function executarCancelamentoNoMercadoPago(opcoes: {
  mpPreapprovalId: string;
  dataInicio: string | null;
  pagamentoFallback?: PagamentoInicialAssinatura | null;
}): Promise<ResultadoCancelamentoMp> {
  const { mpPreapprovalId, dataInicio, pagamentoFallback } = opcoes;

  let pagamentoInicial: PagamentoInicialAssinatura | null = null;
  try {
    pagamentoInicial = await buscarPagamentoInicialAprovado(mpPreapprovalId);
  } catch (erro) {
    console.error(
      "[cancelar-assinatura] falha ao buscar pagamento inicial",
      erro
    );
  }

  if (!pagamentoInicial?.paymentId && pagamentoFallback?.paymentId) {
    pagamentoInicial = pagamentoFallback;
  }

  const dataReferenciaCdc = pagamentoInicial?.debitDate ?? dataInicio;
  const dentroPrazoCdc = dentroPrazoArrependimentoCdc(dataReferenciaCdc);

  const { cancelado: preapprovalCancelada, statusMp } =
    await cancelarPreapprovalMercadoPago(mpPreapprovalId);
  if (!preapprovalCancelada) {
    console.error(
      "[cancelar-assinatura] preapproval ainda ativa no MP após cancelamento",
      mpPreapprovalId,
      statusMp
    );
  }

  if (!dentroPrazoCdc) {
    return {
      preapprovalCancelada,
      dentroPrazoCdc: false,
      dataReferenciaCdc,
      pagamentoInicial,
      estorno: null,
    };
  }

  const { pagamentoInicial: pagamentoUsado, estorno } = await tentarEstornoCdc({
    mpPreapprovalId,
    pagamentoFallback: pagamentoInicial,
  });

  return {
    preapprovalCancelada,
    dentroPrazoCdc: true,
    dataReferenciaCdc,
    pagamentoInicial: pagamentoUsado,
    estorno,
  };
}

/** Espelha estorno no banco local (payment.id e/ou invoice id legados). */
export async function marcarPagamentosLocaisRefunded(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: { from: (table: string) => any },
  ids: { paymentId?: string; invoiceId?: string }
): Promise<void> {
  const candidatos = [ids.paymentId, ids.invoiceId].filter(
    (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
  );

  for (const mpPaymentId of candidatos) {
    const { error } = await admin
      .from("pagamentos")
      .update({ status: "refunded" })
      .eq("mp_payment_id", mpPaymentId);
    if (error) {
      console.error(
        "[cancelar-assinatura] falha ao marcar pagamento refunded",
        mpPaymentId,
        error
      );
    }
  }
}


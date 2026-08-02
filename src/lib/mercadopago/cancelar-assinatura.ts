/**
 * Orquestra cancelamento de assinatura no Mercado Pago:
 * - sempre cancela a recorrência (preapproval);
 * - se ≤ 7 dias do pagamento inicial (CDC), também estorna o pagamento.
 */

import { dentroPrazoArrependimentoCdc } from "@/lib/assinatura-format";
import {
  buscarPagamentoInicialAprovado,
  cancelarPreapprovalMercadoPago,
  estornarPagamentoMercadoPago,
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
}): Promise<ResultadoCancelamentoMp> {
  const { mpPreapprovalId, dataInicio } = opcoes;

  let pagamentoInicial: PagamentoInicialAssinatura | null = null;
  try {
    pagamentoInicial = await buscarPagamentoInicialAprovado(mpPreapprovalId);
  } catch (erro) {
    console.error(
      "[cancelar-assinatura] falha ao buscar pagamento inicial",
      erro
    );
  }

  const dataReferenciaCdc = pagamentoInicial?.debitDate ?? dataInicio;
  const dentroPrazoCdc = dentroPrazoArrependimentoCdc(dataReferenciaCdc);

  await cancelarPreapprovalMercadoPago(mpPreapprovalId);

  if (!dentroPrazoCdc) {
    return {
      preapprovalCancelada: true,
      dentroPrazoCdc: false,
      dataReferenciaCdc,
      pagamentoInicial,
      estorno: null,
    };
  }

  if (!pagamentoInicial?.paymentId) {
    return {
      preapprovalCancelada: true,
      dentroPrazoCdc: true,
      dataReferenciaCdc,
      pagamentoInicial,
      estorno: {
        tentado: true,
        sucesso: false,
        aviso:
          "Assinatura cancelada no prazo CDC, mas não há pagamento aprovado no Mercado Pago para estornar automaticamente. O suporte precisa concluir o reembolso.",
      },
    };
  }

  try {
    const refund = await estornarPagamentoMercadoPago(
      pagamentoInicial.paymentId,
      {
        idempotencyKey: `facto-cdc-refund-${pagamentoInicial.paymentId}`,
      }
    );

    return {
      preapprovalCancelada: true,
      dentroPrazoCdc: true,
      dataReferenciaCdc,
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
        preapprovalCancelada: true,
        dentroPrazoCdc: true,
        dataReferenciaCdc,
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
    return {
      preapprovalCancelada: true,
      dentroPrazoCdc: true,
      dataReferenciaCdc,
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

/**
 * Helpers de apresentação e regras de cancelamento de assinatura FACTO.
 */

export const PRAZO_ARREPENDIMENTO_CDC_DIAS = 7;
const DIA_EM_MS = 24 * 60 * 60 * 1000;

export type AssinaturaDb = {
  id: string;
  mp_preapproval_id: string;
  email: string | null;
  plano: "jec" | "mensal" | "pro" | "anual" | "pro_anual" | null;
  status: "pending" | "authorized" | "paused" | "canceled";
  data_inicio: string | null;
  acesso_valido_ate: string | null;
  motivo_encerramento: string | null;
  data_cancelamento: string | null;
};

export type AssinaturaResumoUI = {
  planoLabel: string;
  statusLabel: string;
  status: "ativo" | "cancelado" | "pausado" | "pendente";
  proximaCobrancaLabel: string;
  podeCancelar: boolean;
  mensagemAcesso?: string | null;
};

function formatarDataPt(iso: string | null | undefined): string {
  if (!iso) return "A definir";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "A definir";
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function rotuloPlano(plano: AssinaturaDb["plano"]): string {
  if (plano === "pro_anual") return "Plano Completo Pro Anual";
  if (plano === "anual") return "Plano Completo Anual";
  if (plano === "pro") return "Plano Completo Pro";
  if (plano === "mensal") return "Plano Completo";
  if (plano === "jec") return "Plano JEC";
  return "Plano FACTO";
}

export function mapearAssinaturaParaUI(row: AssinaturaDb): AssinaturaResumoUI {
  const planoLabel = rotuloPlano(row.plano);
  const statusDb = String(row.status ?? "").toLowerCase();

  if (statusDb === "canceled" || statusDb === "cancelled") {
    return {
      planoLabel,
      statusLabel: "Cancelado",
      status: "cancelado",
      proximaCobrancaLabel: "Não haverá novas cobranças",
      podeCancelar: false,
      mensagemAcesso: row.acesso_valido_ate
        ? `Acesso liberado até ${formatarDataPt(row.acesso_valido_ate)}.`
        : "Acesso encerrado.",
    };
  }

  if (row.status === "paused") {
    return {
      planoLabel,
      statusLabel: "Pausado",
      status: "pausado",
      proximaCobrancaLabel: formatarDataPt(row.acesso_valido_ate),
      podeCancelar: true,
      mensagemAcesso: null,
    };
  }

  if (row.status === "pending") {
    return {
      planoLabel,
      statusLabel: "Pendente",
      status: "pendente",
      proximaCobrancaLabel: formatarDataPt(row.acesso_valido_ate),
      podeCancelar: true,
      mensagemAcesso: "Aguardando confirmação do pagamento.",
    };
  }

  return {
    planoLabel,
    statusLabel: "Ativo",
    status: "ativo",
    proximaCobrancaLabel: formatarDataPt(row.acesso_valido_ate),
    podeCancelar: true,
    mensagemAcesso: row.acesso_valido_ate
      ? `Próxima cobrança / ciclo vigente até ${formatarDataPt(row.acesso_valido_ate)}.`
      : null,
  };
}

export function dentroPrazoArrependimentoCdc(
  dataInicio: string | null | undefined
): boolean {
  if (!dataInicio) return false;
  const inicio = new Date(dataInicio).getTime();
  if (Number.isNaN(inicio)) return false;
  return (Date.now() - inicio) / DIA_EM_MS <= PRAZO_ARREPENDIMENTO_CDC_DIAS;
}

/**
 * Campos a gravar no banco após cancelamento local (espelha o webhook).
 * `dentroPrazoCdc` pode vir calculado a partir do pagamento inicial no MP;
 * se omitido, usa `data_inicio` da assinatura.
 */
export function montarUpdateCancelamentoCliente(
  row: AssinaturaDb,
  dentroPrazoCdc = dentroPrazoArrependimentoCdc(row.data_inicio)
): {
  status: "canceled";
  data_cancelamento: string;
  motivo_encerramento: "arrependimento_cdc" | "cancelado_pelo_cliente";
  acesso_valido_ate?: string;
  atualizado_em: string;
} {
  const agora = new Date().toISOString();

  if (dentroPrazoCdc) {
    return {
      status: "canceled",
      data_cancelamento: agora,
      motivo_encerramento: "arrependimento_cdc",
      // 1s no passado para o middleware negar acesso imediatamente
      acesso_valido_ate: new Date(Date.now() - 1000).toISOString(),
      atualizado_em: agora,
    };
  }

  return {
    status: "canceled",
    data_cancelamento: agora,
    motivo_encerramento: "cancelado_pelo_cliente",
    atualizado_em: agora,
  };
}

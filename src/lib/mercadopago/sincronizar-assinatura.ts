/**
 * Sincroniza preapprovals do Mercado Pago -> tabela assinaturas.
 * Rede de seguranca quando o webhook atrasa ou nao chega.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buscarEmailPagadorPreapproval,
  buscarPagamentoInicialAprovado,
  chamarMercadoPago,
} from "@/lib/mercadopago/client";
import {
  PRECO_CHEQUE_ANUAL,
  PRECO_CHEQUE_JEC,
  PRECO_CHEQUE_MENSAL,
  PRECO_CHEQUE_PRO,
  PRECO_CHEQUE_PRO_ANUAL,
  inferirPlanoPorTexto,
  planoPorValor,
  type PlanoId,
} from "@/lib/planos-facto";

type AdminClient = ReturnType<typeof createAdminClient>;

const DIA_EM_MS = 24 * 60 * 60 * 1000;
const DURACAO_CICLO_DIAS: Record<
  "jec" | "mensal" | "pro" | "anual" | "pro_anual",
  number
> = {
  jec: 30,
  mensal: 30,
  pro: 30,
  anual: 365,
  pro_anual: 365,
};

export type PreapprovalMp = {
  id: string;
  status?: string;
  payer_email?: string | null;
  reason?: string | null;
  date_created?: string | null;
  auto_recurring?: {
    transaction_amount?: number | string | null;
    frequency?: number;
    frequency_type?: string;
  } | null;
};

export type SyncAssinaturaResultado = {
  preapprovalId: string;
  email: string | null;
  status: string | null;
  plano: PlanoId | null;
  valor: number | null;
  mpPaymentId: string | null;
  upserted: boolean;
};

function parseValor(raw: unknown): number | null {
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function inferirPlano(
  valor: number | null,
  frequencyType: string | undefined,
  frequency: number | undefined,
  reason?: string | null
): PlanoId | null {
  const porNome = inferirPlanoPorTexto(reason);
  if (porNome) return porNome;

  if (frequencyType === "months" && frequency === 12) {
    const porValor = planoPorValor(valor);
    if (porValor === "pro_anual" || porValor === "anual") return porValor;
    if (typeof valor === "number") {
      if (Math.abs(valor - PRECO_CHEQUE_PRO_ANUAL) < 2) return "pro_anual";
      if (Math.abs(valor - PRECO_CHEQUE_ANUAL) < 2) return "anual";
    }
    return "anual";
  }
  if (frequencyType === "months" && frequency === 1) {
    const porValor = planoPorValor(valor);
    if (
      porValor === "jec" ||
      porValor === "mensal" ||
      porValor === "pro"
    ) {
      return porValor;
    }
    if (typeof valor === "number") {
      if (Math.abs(valor - PRECO_CHEQUE_JEC) < 1) return "jec";
      if (Math.abs(valor - PRECO_CHEQUE_PRO) < 1) return "pro";
      if (Math.abs(valor - PRECO_CHEQUE_MENSAL) < 1) return "mensal";
    }
    return "mensal";
  }
  if (typeof valor === "number") {
    if (Math.abs(valor - PRECO_CHEQUE_PRO_ANUAL) < 2) return "pro_anual";
    if (Math.abs(valor - PRECO_CHEQUE_ANUAL) < 2) return "anual";
  }
  return planoPorValor(valor);
}

export async function buscarPreapprovalsPorEmail(
  email: string
): Promise<PreapprovalMp[]> {
  const qs = new URLSearchParams({
    payer_email: email.trim().toLowerCase(),
    limit: "20",
    offset: "0",
  });
  const data = (await chamarMercadoPago(
    `/preapproval/search?${qs.toString()}`
  )) as { results?: PreapprovalMp[] };
  return Array.isArray(data?.results) ? data.results : [];
}

export async function buscarPreapprovalsRecentes(
  status: "authorized" | "cancelled" | "canceled" | "pending" = "authorized",
  limit = 30
): Promise<PreapprovalMp[]> {
  const qs = new URLSearchParams({
    status: status === "canceled" ? "cancelled" : status,
    limit: String(limit),
    offset: "0",
  });
  try {
    const data = (await chamarMercadoPago(
      `/preapproval/search?${qs.toString()}`
    )) as { results?: PreapprovalMp[] };
    return Array.isArray(data?.results) ? data.results : [];
  } catch (erro) {
    console.warn("[sincronizar-assinatura] search status=", status, erro);
    return [];
  }
}

export async function upsertAssinaturaDePreapproval(
  admin: AdminClient,
  preapproval: PreapprovalMp
): Promise<SyncAssinaturaResultado> {
  const id = String(preapproval.id);
  const statusRaw = (preapproval.status ?? "").toLowerCase();
  let status = statusRaw === "cancelled" ? "canceled" : statusRaw;
  let email = preapproval.payer_email?.trim().toLowerCase() || null;
  if (email && !email.includes("@")) email = null;
  if (!email) {
    try {
      email = await buscarEmailPagadorPreapproval(
        id,
        preapproval.payer_email
      );
    } catch {
      /* ignore */
    }
  }
  const valor = parseValor(preapproval.auto_recurring?.transaction_amount);
  const plano = inferirPlano(
    valor,
    preapproval.auto_recurring?.frequency_type,
    preapproval.auto_recurring?.frequency,
    preapproval.reason
  );

  let profileId: string | null = null;
  if (email) {
    const { data: perfil } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    profileId = perfil?.id ?? null;
  }

  const { data: existente } = await admin
    .from("assinaturas")
    .select(
      "id, status, acesso_valido_ate, data_inicio, motivo_encerramento, email"
    )
    .eq("mp_preapproval_id", id)
    .maybeSingle();

  if (existente?.status === "canceled" && status === "authorized") {
    console.warn(
      "[sincronizar-assinatura] MP ainda authorized; mantendo canceled local",
      id
    );
    status = "canceled";
  }

  if (!email && typeof existente?.email === "string" && existente.email.trim()) {
    email = existente.email.trim().toLowerCase();
  }

  const dataInicio =
    preapproval.date_created ?? existente?.data_inicio ?? null;

  const dados: Record<string, unknown> = {
    mp_preapproval_id: id,
    profile_id: profileId,
    plano,
    valor,
    status,
    data_inicio: dataInicio,
    atualizado_em: new Date().toISOString(),
  };
  if (email) dados.email = email;

  if (
    status === "authorized" &&
    existente?.status !== "canceled" &&
    !existente?.acesso_valido_ate &&
    dataInicio &&
    plano
  ) {
    dados.acesso_valido_ate = new Date(
      new Date(dataInicio).getTime() + DURACAO_CICLO_DIAS[plano] * DIA_EM_MS
    ).toISOString();
  }

  if (status === "canceled") {
    if (existente?.status !== "canceled") {
      dados.data_cancelamento = new Date().toISOString();
      if (!existente?.motivo_encerramento) {
        dados.motivo_encerramento = "cancelado_pelo_cliente";
      }
    }
    const motivo = (existente?.motivo_encerramento as string | null) ?? null;
    const ateExistente = existente?.acesso_valido_ate
      ? new Date(existente.acesso_valido_ate as string).getTime()
      : 0;
    const manterAteFimCiclo =
      motivo === "cancelado_pelo_cliente" && ateExistente > Date.now();
    if (!manterAteFimCiclo) {
      dados.acesso_valido_ate = new Date(Date.now() - 1000).toISOString();
      if (!motivo || motivo === "arrependimento_cdc") {
        dados.motivo_encerramento = motivo ?? "cancelado_pelo_cliente";
      }
    }
  }

  await admin.from("assinaturas").upsert(dados, {
    onConflict: "mp_preapproval_id",
  });

  let mpPaymentId: string | null = null;
  try {
    const pag = await buscarPagamentoInicialAprovado(id);
    mpPaymentId = pag?.paymentId ?? null;
  } catch {
    /* fatura pode ainda nao existir */
  }
  if (!mpPaymentId) mpPaymentId = `preapproval:${id}`;

  return {
    preapprovalId: id,
    email,
    status,
    plano,
    valor,
    mpPaymentId,
    upserted: true,
  };
}

export async function sincronizarAssinaturaPorEmail(
  admin: AdminClient,
  email: string
): Promise<SyncAssinaturaResultado | null> {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm) return null;

  const { data: local } = await admin
    .from("assinaturas")
    .select(
      "id, mp_preapproval_id, email, valor, status, plano, acesso_valido_ate"
    )
    .ilike("email", emailNorm)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (local?.mp_preapproval_id && local.status === "authorized") {
    let mpPaymentId: string | null = null;
    try {
      const pag = await buscarPagamentoInicialAprovado(
        local.mp_preapproval_id as string
      );
      mpPaymentId = pag?.paymentId ?? null;
    } catch {
      /* ignore */
    }
    if (!mpPaymentId) {
      mpPaymentId = `preapproval:${local.mp_preapproval_id}`;
    }
    const valor =
      typeof local.valor === "number"
        ? local.valor
        : typeof local.valor === "string"
          ? parseFloat(local.valor)
          : null;
    return {
      preapprovalId: local.mp_preapproval_id as string,
      email: emailNorm,
      status: local.status as string,
      plano: (local.plano as SyncAssinaturaResultado["plano"]) ?? null,
      valor: typeof valor === "number" && !Number.isNaN(valor) ? valor : null,
      mpPaymentId,
      upserted: false,
    };
  }

  let results: PreapprovalMp[] = [];
  try {
    results = await buscarPreapprovalsPorEmail(emailNorm);
  } catch (erro) {
    console.warn("[sincronizar-assinatura] search por e-mail falhou", emailNorm, erro);
  }

  const preferidos = [...results].sort((a, b) => {
    const rank = (s?: string) =>
      s === "authorized" ? 0 : s === "pending" ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });

  for (const pre of preferidos) {
    if (!pre.id) continue;
    const sync = await upsertAssinaturaDePreapproval(admin, pre);
    if (sync.status === "authorized" || sync.status === "pending") {
      return sync;
    }
  }

  if (preferidos[0]?.id) {
    return upsertAssinaturaDePreapproval(admin, preferidos[0]);
  }

  return null;
}

export async function sincronizarPreapprovalsRecentesDoMp(
  admin: AdminClient
): Promise<SyncAssinaturaResultado[]> {
  const resultados: SyncAssinaturaResultado[] = [];
  const desde = Date.now() - 14 * DIA_EM_MS;

  for (const pre of await buscarPreapprovalsRecentes("authorized", 40)) {
    const criado = pre.date_created
      ? new Date(pre.date_created).getTime()
      : Date.now();
    if (criado < desde) continue;
    try {
      resultados.push(await upsertAssinaturaDePreapproval(admin, pre));
    } catch (erro) {
      console.warn("[sincronizar-assinatura] falha upsert", pre.id, erro);
    }
  }

  for (const pre of await buscarPreapprovalsRecentes("cancelled", 20)) {
    const criado = pre.date_created
      ? new Date(pre.date_created).getTime()
      : Date.now();
    if (criado < desde) continue;
    try {
      resultados.push(await upsertAssinaturaDePreapproval(admin, pre));
    } catch (erro) {
      console.warn("[sincronizar-assinatura] falha sync cancelada", pre.id, erro);
    }
  }

  return resultados;
}

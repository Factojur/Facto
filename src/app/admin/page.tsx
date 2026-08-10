import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { EMAIL_ADMIN, isAdminEmail } from "@/lib/admin-auth";
import {
  lerUltimoAcessoAdmin,
  listarComprasDesde,
  obterInfoDiscoSupabase,
  rotuloStatusEmail,
  type CompraDesdeUltimoAcesso,
  type InfoDiscoSupabase,
  type StatusEmailCompra,
} from "@/lib/admin-avisos";
import { BotaoMarcarComprasVistas } from "@/components/admin/botao-marcar-compras-vistas";

const PERIODOS = {
  mensal: { label: "Último mês", dias: 30 },
  semestral: { label: "Últimos 6 meses", dias: 182 },
  anual: { label: "Últimos 12 meses", dias: 365 },
} as const;

type PeriodoKey = keyof typeof PERIODOS;

type PagamentoRecente = {
  id: string;
  valor: number | null;
  status: string | null;
  pago_em: string | null;
  email: string | null;
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string | null) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarDataHora(data: string | null) {
  if (!data) return "—";
  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function classeStatusEmail(s: StatusEmailCompra): string {
  if (s === "enviado") return "text-emerald-400";
  if (s === "falha") return "text-red-400";
  if (s === "parcial") return "text-amber-300";
  return "text-stone-500";
}

function BannerDisco({ disco }: { disco: InfoDiscoSupabase }) {
  if (disco.status === "desconhecido") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-stone-400">
        <p className="font-medium text-stone-300">Disco Supabase</p>
        <p className="mt-1">
          Não foi possível ler o tamanho do banco (rode{" "}
          <code className="text-facto-gold">migration-admin-avisos.sql</code>
          ). Limite configurado: {disco.limiteMb} MB ({disco.rotuloPlano}).
        </p>
      </div>
    );
  }

  const tom =
    disco.status === "critico"
      ? "border-red-500/40 bg-red-500/10 text-red-100"
      : disco.status === "atencao"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";

  const titulo =
    disco.status === "critico"
      ? "Disco Supabase — crítico"
      : disco.status === "atencao"
        ? "Disco Supabase — atenção"
        : "Disco Supabase — OK";

  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${tom}`}>
      <p className="font-semibold">{titulo}</p>
      <p className="mt-1 opacity-90">
        {disco.usadosMb} MB usados de {disco.limiteMb} MB ({disco.percentual}
        %) · {disco.rotuloPlano}. Ajuste{" "}
        <code className="opacity-80">SUPABASE_PLAN</code> /{" "}
        <code className="opacity-80">SUPABASE_DB_LIMIT_MB</code> no ambiente se
        o plano for outro.
      </p>
    </div>
  );
}

function CardComprasDesdeAcesso({
  desdeIso,
  primeiroAcesso,
  compras,
}: {
  desdeIso: string;
  primeiroAcesso: boolean;
  compras: CompraDesdeUltimoAcesso[];
}) {
  if (compras.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-stone-400">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-medium text-stone-300">
            Compras desde o último acesso
          </p>
          {!primeiroAcesso && <BotaoMarcarComprasVistas />}
        </div>
        <p className="mt-1">
          Nenhuma compra aprovada{" "}
          {primeiroAcesso
            ? "nas últimas 48h (ainda sem “último acesso” registrado — use Marcar como vistas após conferir)."
            : `desde ${formatarDataHora(desdeIso)}.`}
        </p>
        {primeiroAcesso && (
          <div className="mt-3">
            <BotaoMarcarComprasVistas />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-facto-gold/30 bg-facto-gold/[0.07] px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-facto-gold">
          {compras.length} compra{compras.length !== 1 ? "s" : ""} desde o
          último acesso
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-stone-500">
            {primeiroAcesso
              ? "Janela: últimas 48h"
              : `Desde ${formatarDataHora(desdeIso)}`}
            {" · "}
            <Link
              href="/admin/emails"
              className="underline hover:text-stone-300"
            >
              ver e-mails
            </Link>
          </p>
          <BotaoMarcarComprasVistas />
        </div>
      </div>
      <p className="mt-1 text-xs text-stone-400">
        Confira se o e-mail de pagamento e o convite saíram corretamente. Depois
        clique em “Marcar como vistas”.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/20 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-2 font-medium">Quando</th>
              <th className="px-3 py-2 font-medium">Cliente</th>
              <th className="px-3 py-2 font-medium">Plano</th>
              <th className="px-3 py-2 font-medium text-right">Valor</th>
              <th className="px-3 py-2 font-medium">E-mail pgto</th>
              <th className="px-3 py-2 font-medium">Convite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-stone-300">
            {compras.map((c) => (
              <tr key={c.id}>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-400">
                  {formatarDataHora(c.pagoEm)}
                </td>
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2 capitalize text-stone-400">
                  {c.plano ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {c.valor !== null ? formatarMoeda(c.valor) : "—"}
                </td>
                <td
                  className={`px-3 py-2 text-xs font-medium ${classeStatusEmail(c.emailFinanceiro)}`}
                >
                  {rotuloStatusEmail(c.emailFinanceiro)}
                </td>
                <td
                  className={`px-3 py-2 text-xs font-medium ${classeStatusEmail(c.emailConvite)}`}
                >
                  {rotuloStatusEmail(c.emailConvite)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const { periodo: periodoParam } = await searchParams;
  const periodo: PeriodoKey =
    periodoParam && periodoParam in PERIODOS
      ? (periodoParam as PeriodoKey)
      : "mensal";
  const { dias } = PERIODOS[periodo];

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  let tabelasProntas = true;
  let faturamentoPeriodo = 0;
  let faturamentoTotal = 0;
  let pagamentosRecentes: PagamentoRecente[] = [];
  let ativos = 0;
  let pausados = 0;
  let cancelados = 0;
  let naoRenovaram = 0;
  let totalHistorico = 0;

  const [disco, acessoAnterior] = await Promise.all([
    obterInfoDiscoSupabase(),
    lerUltimoAcessoAdmin(),
  ]);
  const { desdeIso, compras } = await listarComprasDesde(acessoAnterior);
  const primeiroAcesso = !acessoAnterior;

  try {
    const admin = createAdminClient();

    const [
      pagamentosResp,
      faturamentoTotalResp,
      ativosResp,
      pausadosResp,
      canceladosResp,
      naoRenovaramResp,
      totalResp,
    ] = await Promise.all([
      admin
        .from("pagamentos")
        .select("id, valor, status, pago_em, assinaturas(email)")
        .eq("status", "approved")
        .gte("pago_em", desde.toISOString())
        .order("pago_em", { ascending: false }),
      admin.from("pagamentos").select("valor").eq("status", "approved"),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("status", "authorized"),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("status", "paused"),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled")
        .in("motivo_encerramento", [
          "cancelado_pelo_cliente",
          "arrependimento_cdc",
        ]),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("motivo_encerramento", "pagamento_recusado"),
      admin.from("assinaturas").select("id", { count: "exact", head: true }),
    ]);

    if (pagamentosResp.error) throw pagamentosResp.error;
    if (faturamentoTotalResp.error) throw faturamentoTotalResp.error;

    const linhas = (pagamentosResp.data ?? []) as unknown as Array<{
      id: string;
      valor: number | string | null;
      status: string | null;
      pago_em: string | null;
      assinaturas: { email: string | null } | null;
    }>;

    faturamentoPeriodo = linhas.reduce(
      (soma, item) => soma + Number(item.valor ?? 0),
      0
    );
    faturamentoTotal = (faturamentoTotalResp.data ?? []).reduce(
      (soma, item) =>
        soma + Number((item as { valor: number | string | null }).valor ?? 0),
      0
    );
    pagamentosRecentes = linhas.slice(0, 20).map((item) => ({
      id: item.id,
      valor: item.valor === null ? null : Number(item.valor),
      status: item.status,
      pago_em: item.pago_em,
      email: item.assinaturas?.email ?? null,
    }));

    ativos = ativosResp.count ?? 0;
    pausados = pausadosResp.count ?? 0;
    cancelados = canceladosResp.count ?? 0;
    naoRenovaram = naoRenovaramResp.count ?? 0;
    totalHistorico = totalResp.count ?? 0;
  } catch {
    tabelasProntas = false;
  }

  if (!tabelasProntas) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-facto-dark px-6 py-16 text-center">
        <FactoLogo variant="stacked" size="sm" className="mx-auto" />
        <h1 className="mt-8 text-2xl font-bold text-white">
          Painel financeiro ainda não configurado
        </h1>
        <p className="mt-4 max-w-md text-stone-400">
          Faltam alguns passos de configuração para este painel funcionar:
          rodar a migration{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-facto-gold">
            supabase/migration-assinaturas.sql
          </code>{" "}
          no Supabase SQL Editor e adicionar{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-facto-gold">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          no{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-facto-gold">
            .env.local
          </code>
          .
        </p>
        <Link
          href="/dashboard"
          className="mt-8 rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
        >
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-facto-dark px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <FactoLogo variant="horizontal" size="sm" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              Painel financeiro
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Visível apenas para {EMAIL_ADMIN}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/uso-pecas"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              Uso de peças
            </Link>
            <Link
              href="/admin/convites"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              Convites
            </Link>
            <Link
              href="/admin/emails"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              E-mails
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              ← Voltar ao dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <BannerDisco disco={disco} />
          <CardComprasDesdeAcesso
            desdeIso={desdeIso}
            primeiroAcesso={primeiroAcesso}
            compras={compras}
          />
        </div>

        <div className="mt-8 flex gap-2">
          {(Object.keys(PERIODOS) as PeriodoKey[]).map((chave) => (
            <Link
              key={chave}
              href={`/admin?periodo=${chave}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                chave === periodo
                  ? "bg-facto-gold text-facto-dark"
                  : "border border-white/15 text-stone-300 hover:border-facto-gold/50 hover:text-white"
              }`}
            >
              {PERIODOS[chave].label}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardKpi
            titulo="Faturamento total (todo o período)"
            valor={formatarMoeda(faturamentoTotal)}
            destaque
          />
          <CardKpi
            titulo={`Faturamento — ${PERIODOS[periodo].label.toLowerCase()}`}
            valor={formatarMoeda(faturamentoPeriodo)}
          />
          <CardKpi titulo="Assinantes ativos" valor={String(ativos)} />
          <CardKpi titulo="Assinantes pausados" valor={String(pausados)} />
          <CardKpi
            titulo="Cancelaram a assinatura"
            valor={String(cancelados)}
          />
          <CardKpi
            titulo="Não renovaram (pagamento falhou)"
            valor={String(naoRenovaram)}
          />
          <CardKpi
            titulo="Total de contas já criadas"
            valor={String(totalHistorico)}
          />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white">
            Pagamentos recentes no período
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pagamentosRecentes.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-stone-500"
                    >
                      Nenhum pagamento registrado neste período ainda.
                    </td>
                  </tr>
                )}
                {pagamentosRecentes.map((pagamento) => (
                  <tr key={pagamento.id} className="text-stone-300">
                    <td className="px-4 py-3">
                      {formatarData(pagamento.pago_em)}
                    </td>
                    <td className="px-4 py-3">{pagamento.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {pagamento.valor !== null
                        ? formatarMoeda(pagamento.valor)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {pagamento.status ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardKpi({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque
          ? "border-facto-gold/40 bg-facto-gold/[0.08]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {titulo}
      </p>
      <p
        className={`mt-2 text-2xl font-bold ${
          destaque ? "text-facto-gold" : "text-white"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

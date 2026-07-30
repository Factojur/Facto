import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";

const EMAIL_ADMIN = "admin@facto.com";

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O middleware já bloqueia quem não é admin, mas checamos de novo aqui —
  // esta página nunca deve confiar só numa camada de proteção.
  if (!user || user.email !== EMAIL_ADMIN) {
    redirect("/dashboard");
  }

  const { periodo: periodoParam } = await searchParams;
  const periodo: PeriodoKey =
    periodoParam && periodoParam in PERIODOS ? (periodoParam as PeriodoKey) : "mensal";
  const { dias } = PERIODOS[periodo];

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  let tabelasProntas = true;
  let faturamentoPeriodo = 0;
  let pagamentosRecentes: PagamentoRecente[] = [];
  let ativos = 0;
  let pausados = 0;
  let cancelados = 0;
  let naoRenovaram = 0;
  let totalHistorico = 0;

  try {
    const admin = createAdminClient();

    const [
      pagamentosResp,
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
      admin.from("assinaturas").select("id", { count: "exact", head: true }).eq("status", "authorized"),
      admin.from("assinaturas").select("id", { count: "exact", head: true }).eq("status", "paused"),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled")
        .eq("motivo_encerramento", "cancelado_pelo_cliente"),
      admin
        .from("assinaturas")
        .select("id", { count: "exact", head: true })
        .eq("motivo_encerramento", "pagamento_recusado"),
      admin.from("assinaturas").select("id", { count: "exact", head: true }),
    ]);

    if (pagamentosResp.error) throw pagamentosResp.error;

    const linhas = (pagamentosResp.data ?? []) as unknown as Array<{
      id: string;
      valor: number | string | null;
      status: string | null;
      pago_em: string | null;
      assinaturas: { email: string | null } | null;
    }>;

    faturamentoPeriodo = linhas.reduce((soma, item) => soma + Number(item.valor ?? 0), 0);
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
          no <code className="rounded bg-white/10 px-1.5 py-0.5 text-facto-gold">.env.local</code>.
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
            <h1 className="mt-4 text-2xl font-bold text-white">Painel financeiro</h1>
            <p className="mt-1 text-sm text-stone-500">
              Visível apenas para {EMAIL_ADMIN}.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
          >
            ← Voltar ao dashboard
          </Link>
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
            titulo={`Faturamento — ${PERIODOS[periodo].label.toLowerCase()}`}
            valor={formatarMoeda(faturamentoPeriodo)}
            destaque
          />
          <CardKpi titulo="Assinantes ativos" valor={String(ativos)} />
          <CardKpi titulo="Assinantes pausados" valor={String(pausados)} />
          <CardKpi titulo="Cancelaram a assinatura" valor={String(cancelados)} />
          <CardKpi titulo="Não renovaram (pagamento falhou)" valor={String(naoRenovaram)} />
          <CardKpi titulo="Total de contas já criadas" valor={String(totalHistorico)} />
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
                    <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                      Nenhum pagamento registrado neste período ainda.
                    </td>
                  </tr>
                )}
                {pagamentosRecentes.map((pagamento) => (
                  <tr key={pagamento.id} className="text-stone-300">
                    <td className="px-4 py-3">{formatarData(pagamento.pago_em)}</td>
                    <td className="px-4 py-3">{pagamento.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      {pagamento.valor !== null ? formatarMoeda(pagamento.valor) : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{pagamento.status ?? "—"}</td>
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
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{titulo}</p>
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

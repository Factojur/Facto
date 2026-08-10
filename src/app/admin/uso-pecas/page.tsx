import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { EMAIL_ADMIN, isAdminEmail } from "@/lib/admin-auth";
import {
  cicloAtualLocal,
  estimarCustoAnalises,
  estimarCustoGemini,
  formatarBrl,
  formatarUsd,
  listarCiclosMensais,
  rotuloCiclo,
} from "@/lib/custo-gemini-pecas";

type PerfilRow = {
  id: string;
  email: string | null;
  nome_completo: string | null;
  created_at: string | null;
  tipo_usuario: string | null;
};

type CotaRow = {
  user_id: string;
  ciclo: string;
  usadas: number;
  extras: number;
  analises?: number | null;
};

type AssinaturaRow = {
  email: string | null;
  plano: string | null;
  status: string | null;
  criado_em?: string | null;
  acesso_valido_ate?: string | null;
};

type ClienteUso = {
  id: string;
  email: string;
  nome: string;
  cadastro: string | null;
  tipo: string;
  plano: string;
  pecasPeriodo: number;
  extrasPeriodo: number;
  analisesPeriodo: number;
  ciclosComUso: number;
  custoPecasUsd: number;
  custoPecasBrl: number;
  custoAnalisesUsd: number;
  custoAnalisesBrl: number;
  custoUsd: number;
  custoBrl: number;
};

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function primeiroCicloDoCadastro(createdAt: string | null): string {
  if (!createdAt) return "1970-01";
  const d = new Date(createdAt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminUsoPecasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; ciclo?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const periodo =
    params.periodo === "3m" ||
    params.periodo === "6m" ||
    params.periodo === "tudo" ||
    params.periodo === "ciclo"
      ? params.periodo
      : "mes";
  const cicloParam = (params.ciclo ?? "").trim();
  const busca = (params.q ?? "").trim().toLowerCase();

  const cicloAtual = cicloAtualLocal();
  let tabelaPronta = true;
  let clientes: ClienteUso[] = [];
  let ciclosDisponiveis: string[] = [cicloAtual];
  const estimativaUnitaria = estimarCustoGemini(1);
  const estimativaAnalise = estimarCustoAnalises(1);

  try {
    const admin = createAdminClient();

    const [perfisResp, cotasResp, assinaturasResp] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, nome_completo, created_at, tipo_usuario")
        .order("created_at", { ascending: false }),
      admin.from("cota_pecas_ciclo").select("user_id, ciclo, usadas, extras, analises"),
      admin
        .from("assinaturas")
        .select("email, plano, status, criado_em, acesso_valido_ate")
        .order("criado_em", { ascending: false }),
    ]);

    if (perfisResp.error) throw perfisResp.error;
    if (cotasResp.error) throw cotasResp.error;

    const perfis = (perfisResp.data ?? []) as PerfilRow[];
    const cotas = (cotasResp.data ?? []) as CotaRow[];
    const assinaturas = (assinaturasResp.data ?? []) as AssinaturaRow[];

    const planoPorEmail = new Map<string, string>();
    const agora = Date.now();
    for (const a of assinaturas) {
      const em = a.email?.trim().toLowerCase();
      if (!em || planoPorEmail.has(em)) continue;
      const ate = a.acesso_valido_ate
        ? new Date(a.acesso_valido_ate).getTime()
        : null;
      const ativo =
        (a.status === "authorized" && (ate === null || ate > agora)) ||
        (a.status === "canceled" && ate !== null && ate > agora);
      if (ativo && a.plano) {
        planoPorEmail.set(em, a.plano);
      } else if (a.plano) {
        planoPorEmail.set(em, `${a.plano} (${a.status ?? "—"})`);
      }
    }

    const cotasPorUser = new Map<string, CotaRow[]>();
    for (const c of cotas) {
      const lista = cotasPorUser.get(c.user_id) ?? [];
      lista.push(c);
      cotasPorUser.set(c.user_id, lista);
    }

    const cadastros = perfis
      .map((p) => p.created_at)
      .filter(Boolean) as string[];
    const maisAntigo =
      cadastros.length > 0
        ? cadastros.reduce((a, b) => (a < b ? a : b))
        : new Date().toISOString();
    ciclosDisponiveis = listarCiclosMensais(maisAntigo).reverse();

    const ciclosFiltroAjustado = (() => {
      if (periodo === "tudo") return null;
      if (periodo === "ciclo" && cicloParam) return new Set([cicloParam]);
      if (periodo === "3m" || periodo === "6m") {
        const n = periodo === "3m" ? 3 : 6;
        const todos = listarCiclosMensais(
          new Date(new Date().getFullYear() - 2, 0, 1).toISOString()
        );
        return new Set(todos.slice(-n));
      }
      return new Set([cicloAtual]);
    })();

    clientes = perfis
      .map((p) => {
        const email = (p.email ?? "").trim();
        const primeiroCiclo = primeiroCicloDoCadastro(p.created_at);
        const linhas = (cotasPorUser.get(p.id) ?? []).filter((c) => {
          if (c.ciclo < primeiroCiclo) return false;
          if (!ciclosFiltroAjustado) return true;
          return ciclosFiltroAjustado.has(c.ciclo);
        });

        const pecasPeriodo = linhas.reduce(
          (acc, c) => acc + (c.usadas ?? 0),
          0
        );
        const extrasPeriodo = linhas.reduce(
          (acc, c) => acc + (c.extras ?? 0),
          0
        );
        const analisesPeriodo = linhas.reduce(
          (acc, c) => acc + (c.analises ?? 0),
          0
        );
        const custoPecas = estimarCustoGemini(pecasPeriodo);
        const custoAnalises = estimarCustoAnalises(analisesPeriodo);

        return {
          id: p.id,
          email: email || "—",
          nome: p.nome_completo?.trim() || email.split("@")[0] || "—",
          cadastro: p.created_at,
          tipo: p.tipo_usuario ?? "—",
          plano: planoPorEmail.get(email.toLowerCase()) ?? "sem plano",
          pecasPeriodo,
          extrasPeriodo,
          analisesPeriodo,
          ciclosComUso: linhas.filter(
            (c) => (c.usadas ?? 0) > 0 || (c.analises ?? 0) > 0
          ).length,
          custoPecasUsd: custoPecas.usd,
          custoPecasBrl: custoPecas.brl,
          custoAnalisesUsd: custoAnalises.usd,
          custoAnalisesBrl: custoAnalises.brl,
          custoUsd:
            Math.round((custoPecas.usd + custoAnalises.usd) * 100) / 100,
          custoBrl:
            Math.round((custoPecas.brl + custoAnalises.brl) * 100) / 100,
        } satisfies ClienteUso;
      })
      .filter((c) => {
        if (!busca) return true;
        return (
          c.email.toLowerCase().includes(busca) ||
          c.nome.toLowerCase().includes(busca)
        );
      })
      .sort((a, b) => b.pecasPeriodo - a.pecasPeriodo);
  } catch {
    tabelaPronta = false;
  }

  const totalPecas = clientes.reduce((a, c) => a + c.pecasPeriodo, 0);
  const totalAnalises = clientes.reduce((a, c) => a + c.analisesPeriodo, 0);
  const totalCustoPecas = estimarCustoGemini(totalPecas);
  const totalCustoAnalises = estimarCustoAnalises(totalAnalises);
  const totalCustoUsd =
    Math.round((totalCustoPecas.usd + totalCustoAnalises.usd) * 100) / 100;
  const totalCustoBrl =
    Math.round((totalCustoPecas.brl + totalCustoAnalises.brl) * 100) / 100;
  const comUso = clientes.filter(
    (c) => c.pecasPeriodo > 0 || c.analisesPeriodo > 0
  ).length;

  const pill = (id: string, label: string, href: string, ativo: boolean) => (
    <Link
      key={id}
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        ativo
          ? "bg-facto-gold text-facto-dark"
          : "border border-white/15 text-stone-300 hover:border-facto-gold/40 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const qsBase = (extra: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (busca) sp.set("q", busca);
    for (const [k, v] of Object.entries(extra)) {
      if (v) sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div className="min-h-screen bg-facto-dark text-stone-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FactoLogo variant="horizontal" size="sm" />
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin" className="text-stone-400 hover:text-white">
              Financeiro
            </Link>
            <Link
              href="/dashboard"
              className="text-stone-400 hover:text-white"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold text-white">
          Uso de peças por cliente
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-400">
          Checklist mensal desde o cadastro de cada cliente. Custo Gemini
          estimado: ~{formatarUsd(estimativaUnitaria.usdPorPeca)}/peça e ~
          {formatarUsd(estimativaAnalise.usdPorAnalise)}/análise (câmbio ≈ R${" "}
          {estimativaUnitaria.cambio.toFixed(2)}) — ainda sem medição de tokens
          por request. Análises de processo não cobram o cliente.
        </p>
        <p className="mt-1 text-xs text-stone-500">
          Visível apenas para {EMAIL_ADMIN}.
        </p>

        {!tabelaPronta ? (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Não foi possível ler{" "}
            <code className="text-facto-gold">cota_pecas_ciclo</code> /{" "}
            <code className="text-facto-gold">profiles</code>. Confirme a
            migration e a{" "}
            <code className="text-facto-gold">SUPABASE_SERVICE_ROLE_KEY</code>.
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {pill(
                "mes",
                `Mês atual (${rotuloCiclo(cicloAtual)})`,
                `/admin/uso-pecas${qsBase({ periodo: "mes" })}`,
                periodo === "mes"
              )}
              {pill(
                "3m",
                "Últimos 3 meses",
                `/admin/uso-pecas${qsBase({ periodo: "3m" })}`,
                periodo === "3m"
              )}
              {pill(
                "6m",
                "Últimos 6 meses",
                `/admin/uso-pecas${qsBase({ periodo: "6m" })}`,
                periodo === "6m"
              )}
              {pill(
                "tudo",
                "Desde o cadastro (tudo)",
                `/admin/uso-pecas${qsBase({ periodo: "tudo" })}`,
                periodo === "tudo"
              )}
            </div>

            <form
              method="get"
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <input type="hidden" name="periodo" value="ciclo" />
              <div>
                <label
                  htmlFor="ciclo"
                  className="mb-1 block text-xs font-medium text-stone-500"
                >
                  Mês específico
                </label>
                <select
                  id="ciclo"
                  name="ciclo"
                  defaultValue={
                    periodo === "ciclo" && cicloParam
                      ? cicloParam
                      : cicloAtual
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-facto-gold/50"
                >
                  {ciclosDisponiveis.map((c) => (
                    <option key={c} value={c} className="bg-stone-900">
                      {rotuloCiclo(c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="q"
                  className="mb-1 block text-xs font-medium text-stone-500"
                >
                  Buscar cliente
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={busca}
                  placeholder="nome ou e-mail"
                  className="w-56 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-stone-600 focus:border-facto-gold/50"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-facto-gold px-4 py-2 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
              >
                Filtrar
              </button>
            </form>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Peças no período
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {totalPecas}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {comUso} cliente{comUso !== 1 ? "s" : ""} com uso
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Análises no período
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {totalAnalises}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  grátis para o usuário
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Custo Gemini (est.)
                </p>
                <p className="mt-2 text-3xl font-bold text-facto-gold">
                  {formatarUsd(totalCustoUsd)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  ≈ {formatarBrl(totalCustoBrl)} · peças{" "}
                  {formatarUsd(totalCustoPecas.usd)} + análises{" "}
                  {formatarUsd(totalCustoAnalises.usd)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Clientes listados
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {clientes.length}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  após filtros / busca
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Cadastro</th>
                    <th className="px-4 py-3 font-medium">Plano</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Peças
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Extras
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Análises
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Gemini (est.)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-300">
                  {clientes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-stone-500"
                      >
                        Nenhum cliente neste filtro.
                      </td>
                    </tr>
                  ) : (
                    clientes.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{c.nome}</p>
                          <p className="text-xs text-stone-500">{c.email}</p>
                          <p className="text-[10px] uppercase tracking-wide text-stone-600">
                            {c.tipo}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-stone-400">
                          {formatarData(c.cadastro)}
                        </td>
                        <td className="px-4 py-3 text-stone-400">{c.plano}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white">
                          {c.pecasPeriodo}
                          {c.ciclosComUso > 1 && (
                            <span className="block text-[10px] font-normal text-stone-600">
                              {c.ciclosComUso} meses c/ uso
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-stone-400">
                          {c.extrasPeriodo}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {c.analisesPeriodo}
                          {c.analisesPeriodo > 0 && (
                            <span className="block text-[10px] text-stone-600">
                              ≈ {formatarUsd(c.custoAnalisesUsd)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-facto-gold">
                            {formatarUsd(c.custoUsd)}
                          </span>
                          <span className="block text-[10px] text-stone-600">
                            ≈ {formatarBrl(c.custoBrl)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

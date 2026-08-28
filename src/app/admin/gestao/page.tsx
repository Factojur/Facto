import Link from "next/link";
import { redirect } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";
import { listarPainelAdminGestao } from "@/lib/gestao/gestao-persistencia";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminGestaoPage() {
  const user = await getUsuarioServidor();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const painel = await listarPainelAdminGestao();

  return (
    <div className="min-h-full bg-facto-dark px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <FactoLogo variant="horizontal" size="sm" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              FACTO Gestão — usuários
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Escritórios e membros cadastrados no módulo gratuito de gestão.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-stone-300 hover:text-white"
            >
              ← Painel financeiro
            </Link>
            <Link
              href="/gestao"
              className="rounded-lg border border-facto-gold/40 px-3 py-2 text-sm text-facto-gold"
            >
              Abrir gestão
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Escritórios
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {painel.totalEscritorios}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Membros (vínculos)
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {painel.totalMembros}
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">Escritório</th>
                <th className="px-4 py-3">Titular</th>
                <th className="px-4 py-3">OAB</th>
                <th className="px-4 py-3">Membros</th>
                <th className="px-4 py-3">Processos</th>
                <th className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-stone-300">
              {painel.escritorios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                    Nenhum escritório cadastrado ainda.
                  </td>
                </tr>
              ) : (
                painel.escritorios.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium text-white">{e.nome}</td>
                    <td className="px-4 py-3">{e.adminEmail}</td>
                    <td className="px-4 py-3">{e.oabResponsavel}</td>
                    <td className="px-4 py-3">{e.membros}</td>
                    <td className="px-4 py-3">{e.processos}</td>
                    <td className="px-4 py-3">{formatarData(e.criadoEm)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";
import { ACEITE_TERMOS_VERSAO } from "@/lib/aceite-termos";

type AceiteRow = {
  id: string;
  email: string | null;
  nome: string | null;
  versao: string;
  aceito_em: string;
  confirmado: boolean;
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function AdminAceitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  let tabelaPronta = true;
  let aceites: AceiteRow[] = [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("aceites_termos")
      .select("id, email, nome, versao, aceito_em, confirmado")
      .order("aceito_em", { ascending: false })
      .limit(200);

    if (error) throw error;
    aceites = (data ?? []) as AceiteRow[];
  } catch {
    tabelaPronta = false;
  }

  const daVersaoAtual = aceites.filter((a) => a.versao === ACEITE_TERMOS_VERSAO);

  return (
    <div className="min-h-screen bg-facto-dark text-stone-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FactoLogo variant="horizontal" size="sm" />
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin" className="text-stone-400 hover:text-white">
              Financeiro
            </Link>
            <Link href="/dashboard" className="text-stone-400 hover:text-white">
              ← Dashboard
            </Link>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold text-white">
          Aceites — Termos e Privacidade
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          Checklist dos usuários que confirmaram o aceite. Versão atual:{" "}
          <span className="font-medium text-stone-200">{ACEITE_TERMOS_VERSAO}</span>
          {tabelaPronta && (
            <>
              {" "}
              · {daVersaoAtual.length} na versão atual · {aceites.length} no
              total
            </>
          )}
        </p>

        {!tabelaPronta ? (
          <div className="mt-8 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Tabela ainda não criada. Execute no SQL Editor do Supabase o arquivo{" "}
            <code className="rounded bg-black/30 px-1">
              supabase/migration-aceites-termos.sql
            </code>
            .
          </div>
        ) : aceites.length === 0 ? (
          <p className="mt-8 text-sm text-stone-400">
            Nenhum aceite registrado ainda.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-stone-700">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-700 bg-stone-900/80 text-xs uppercase tracking-wide text-stone-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Confirmado</th>
                  <th className="px-4 py-3 font-medium">Data / hora</th>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Versão</th>
                </tr>
              </thead>
              <tbody>
                {aceites.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-stone-800/80 last:border-0 hover:bg-stone-900/50"
                  >
                    <td className="px-4 py-3">
                      {a.confirmado ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                          <span aria-hidden>✓</span> Sim
                        </span>
                      ) : (
                        <span className="text-amber-400">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-200">
                      {formatarDataHora(a.aceito_em)}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {a.nome?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
                      {a.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          a.versao === ACEITE_TERMOS_VERSAO
                            ? "text-stone-200"
                            : "text-stone-500"
                        }
                      >
                        {a.versao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

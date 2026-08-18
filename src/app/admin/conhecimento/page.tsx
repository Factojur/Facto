import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { ConhecimentoManager } from "@/components/admin/conhecimento-manager";

const EMAIL_ADMIN = "admin@facto.com";

export default async function ConhecimentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== EMAIL_ADMIN) {
    redirect("/dashboard");
  }

  let tabelaPronta = true;
  let totalDb = 0;

  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("base_conhecimento")
      .select("*", { count: "exact", head: true });
    totalDb = count ?? 0;
  } catch {
    tabelaPronta = false;
  }

  if (!tabelaPronta) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-facto-dark px-6 py-16 text-center">
        <FactoLogo variant="stacked" size="sm" className="mx-auto" />
        <h1 className="mt-8 text-2xl font-bold text-white">
          Base de conhecimento ainda não configurada
        </h1>
        <p className="mt-4 max-w-md text-stone-400">
          Falta rodar a migration{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-facto-gold">
            supabase/migration-base-conhecimento.sql
          </code>{" "}
          no Supabase SQL Editor.
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
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <FactoLogo variant="horizontal" size="sm" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              Base de Conhecimento Jurídico
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Fundação do sistema de Inteligência Jurídica (RAG). Visível
              apenas para {EMAIL_ADMIN}.
            </p>
            <p className="mt-2 text-sm text-facto-gold/90">
              Total no banco: <strong>{totalDb}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              ← Financeiro
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <ConhecimentoManager itensIniciais={[]} totalDb={totalDb} />
        </div>
      </div>
    </div>
  );
}

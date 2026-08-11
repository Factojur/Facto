import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { ConhecimentoManager } from "@/components/admin/conhecimento-manager";

const EMAIL_ADMIN = "admin@facto.com";
/** PostgREST/Supabase limita ~1000 linhas por request — paginar. */
const PAGE = 1000;

type ItemConhecimento = {
  id: string;
  titulo: string;
  categoria: string;
  texto: string;
  criado_em: string;
  arquivo_nome?: string | null;
  arquivo_path?: string | null;
  arquivo_tipo?: string | null;
  arquivo_url?: string | null;
};

async function carregarTodosItens(
  admin: ReturnType<typeof createAdminClient>
): Promise<{ itens: ItemConhecimento[]; totalDb: number }> {
  const { count: totalDb } = await admin
    .from("base_conhecimento")
    .select("*", { count: "exact", head: true });

  const bruto: Omit<ItemConhecimento, "arquivo_url">[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await admin
      .from("base_conhecimento")
      .select(
        "id, titulo, categoria, texto, criado_em, arquivo_nome, arquivo_path, arquivo_tipo"
      )
      .order("criado_em", { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) throw error;
    if (!data?.length) break;
    bruto.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const itens = await Promise.all(
    bruto.map(async (item) => {
      if (!item.arquivo_path) return { ...item, arquivo_url: null };

      const { data: signed } = await admin.storage
        .from("base-conhecimento")
        .createSignedUrl(item.arquivo_path, 60 * 10);

      return { ...item, arquivo_url: signed?.signedUrl ?? null };
    })
  );

  return { itens, totalDb: totalDb ?? itens.length };
}

export default async function ConhecimentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== EMAIL_ADMIN) {
    redirect("/dashboard");
  }

  let tabelaPronta = true;
  let itens: ItemConhecimento[] = [];
  let totalDb = 0;

  try {
    const admin = createAdminClient();
    const carregado = await carregarTodosItens(admin);
    itens = carregado.itens;
    totalDb = carregado.totalDb;
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
              {itens.length !== totalDb
                ? ` · listados nesta tela: ${itens.length}`
                : null}
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
          <ConhecimentoManager itensIniciais={itens} totalDb={totalDb} />
        </div>
      </div>
    </div>
  );
}

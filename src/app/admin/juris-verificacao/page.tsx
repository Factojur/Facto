import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";
import { JurisVerificacaoManager } from "@/components/admin/juris-verificacao-manager";

export default async function JurisVerificacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-full bg-facto-dark px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FactoLogo variant="icon" size="sm" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Admin
              </p>
              <h1 className="text-2xl font-bold text-white">
                Verificação de julgados
              </h1>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <Link
              href="/admin/conhecimento"
              className="text-stone-400 underline-offset-2 hover:text-white hover:underline"
            >
              Base definitiva
            </Link>
            <Link
              href="/admin"
              className="text-stone-400 underline-offset-2 hover:text-white hover:underline"
            >
              Painel
            </Link>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-stone-400">
          Julgados do Jurisprudências.ai e scrapes de tribunais (ex.: TJSP)
          entram aqui antes da base definitiva. Itens escolhidos pelo usuário na
          peça aparecem com prioridade. Duplicatas exatas são bloqueadas;
          possíveis duplicidades sobem com aviso.
        </p>

        <div className="mt-8">
          <JurisVerificacaoManager />
        </div>
      </div>
    </div>
  );
}

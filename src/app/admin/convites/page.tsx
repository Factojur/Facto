import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";
import { ConvitesAdminClient } from "@/components/admin/convites-admin-client";

export default async function AdminConvitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  let tabelaPronta = true;
  let convites: {
    id: string;
    email: string;
    status: string;
    token: string;
    mp_payment_id: string | null;
    criado_em: string;
    usado_em: string | null;
  }[] = [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("convites_pagos")
      .select("id, email, status, token, mp_payment_id, criado_em, usado_em")
      .order("criado_em", { ascending: false })
      .limit(100);
    if (error) throw error;
    convites = data ?? [];
  } catch {
    tabelaPronta = false;
  }

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
              href="/admin/emails"
              className="text-stone-400 hover:text-white"
            >
              E-mails
            </Link>
            <Link
              href="/dashboard"
              className="text-stone-400 hover:text-white"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-bold text-white">
          Convites de cadastro
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-400">
          Lista dos tokens gerados após pagamento. Se o Resend falhar, use
          <strong className="font-medium text-stone-300"> Reenviar e-mail</strong>{" "}
          nos pendentes (noreply → link de cadastro).
        </p>

        {!tabelaPronta ? (
          <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Não foi possível ler <code>convites_pagos</code>. Confira a
            service role e a migration no Supabase.
          </p>
        ) : (
          <ConvitesAdminClient iniciais={convites} />
        )}
      </div>
    </div>
  );
}

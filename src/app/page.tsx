import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FactoLogo } from "@/components/brand/facto-logo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-facto-dark px-4 py-16">
      <main className="w-full max-w-lg text-center">
        <FactoLogo variant="stacked" size="lg" showTagline className="mx-auto" />
        <h1 className="mt-10 text-4xl font-bold text-white sm:text-5xl">
          Gerador de peças jurídicas
        </h1>
        <p className="mt-4 text-lg text-stone-400">
          Crie petições, contratos e documentos jurídicos com inteligência
          artificial. Feito para advogados.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-facto-gold px-8 py-3 font-semibold text-facto-dark transition hover:bg-[#a39a78]"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg border border-stone-600 px-8 py-3 font-semibold text-white transition hover:border-facto-gold hover:bg-stone-900"
          >
            Criar conta
          </Link>
        </div>
      </main>
    </div>
  );
}

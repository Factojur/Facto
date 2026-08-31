import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { CadastroForm } from "@/components/cadastro/cadastro-form";
import { validarConvite } from "@/lib/convites";
import { PLANO_TRIAL } from "@/lib/planos-facto";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const convite = await validarConvite(token);

  if (!convite || !token) {
    return (
      <div className="relative flex min-h-full items-center justify-center bg-facto-dark px-4 py-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.14),transparent_60%)]"
          aria-hidden
        />
        <div className="relative w-full max-w-md text-center">
          <FactoLogo variant="stacked" size="md" className="mx-auto" />
          <h1 className="mt-8 text-2xl font-bold text-white">
            Como criar sua conta
          </h1>
          <p className="mt-4 text-stone-400">
            Quer experimentar antes? Inicie o{" "}
            <strong className="text-stone-200">teste grátis</strong> (e-mail ou
            Google) — 1 área, {PLANO_TRIAL.pecasPorMes} peças no assistente, 7
            dias.
          </p>
          <p className="mt-3 text-stone-400">
            Já comprou um plano e ainda não tem conta? Use o link do e-mail de
            boas-vindas (só quem paga{" "}
            <strong className="text-stone-200">sem conta prévia</strong> recebe
            esse convite).
          </p>
          <p className="mt-3 text-sm text-stone-500">
            Já tem conta (teste ou assinatura)? Entre com o mesmo e-mail. Se
            pagou e o e-mail não chegou, confira o spam ou fale com o suporte.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/trial"
              className="rounded-lg bg-facto-gold px-6 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
            >
              Iniciar teste grátis
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
            >
              Já tenho conta
            </Link>
            <Link
              href="/suporte?motivo=cadastro"
              className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
            >
              Suporte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CadastroForm
      emailConvite={convite.email}
      token={token}
      plano={convite.plano}
    />
  );
}

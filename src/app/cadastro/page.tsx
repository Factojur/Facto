import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";
import { CadastroForm } from "@/components/cadastro/cadastro-form";
import { validarConvite } from "@/lib/convites";

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
            Cadastro por convite
          </h1>
          <p className="mt-4 text-stone-400">
            A criação de conta no FACTO é liberada automaticamente após a
            confirmação do pagamento de um dos planos. Você vai receber um
            e-mail com o link de cadastro assim que o pagamento for aprovado.
          </p>
          <p className="mt-4 text-sm text-stone-500">
            Já pagou e não recebeu o e-mail? Confira a caixa de spam ou fale
            com o suporte — vamos conferir o pagamento e reenviar o convite.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/suporte?motivo=cadastro"
              className="rounded-lg bg-facto-gold px-6 py-2.5 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
            >
              Falar com o suporte
            </Link>
            <Link
              href="/#precos"
              className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
            >
              Ver planos
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <CadastroForm emailConvite={convite.email} token={token} />;
}

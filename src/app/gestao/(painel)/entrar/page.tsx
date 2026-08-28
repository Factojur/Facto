import { redirect } from "next/navigation";
import { EntrarConviteForm } from "@/components/gestao/gestao-onboarding";
import { obterContextoGestao } from "@/lib/gestao/gestao-service";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function GestaoEntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string }>;
}) {
  const user = await getUsuarioServidor();
  if (!user) {
    redirect("/gestao/login");
  }

  const { escritorio } = await obterContextoGestao(user.id);
  if (escritorio) {
    redirect("/gestao");
  }

  const params = await searchParams;
  const token = params.convite ?? "";

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-12">
      <div className="mx-auto max-w-md">
        <p className="text-center text-xs uppercase tracking-wider text-facto-gold">
          FACTO Gestão
        </p>
        <h1 className="mt-2 text-center text-xl font-semibold text-white">
          Entrar no escritório
        </h1>
        <div className="mt-8">
          <EntrarConviteForm tokenInicial={token} />
        </div>
      </div>
    </div>
  );
}

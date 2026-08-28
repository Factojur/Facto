import { redirect } from "next/navigation";
import { FactoLogo } from "@/components/brand/facto-logo";
import { GestaoCadastroForm } from "@/components/gestao/gestao-cadastro-form";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export default async function GestaoCadastroPage() {
  const user = await getUsuarioServidor();
  if (user) {
    redirect("/gestao");
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-12 text-stone-100">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <FactoLogo variant="stacked" size="sm" />
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-facto-gold">
            FACTO Gestão
          </p>
        </div>
        <GestaoCadastroForm />
      </div>
    </div>
  );
}

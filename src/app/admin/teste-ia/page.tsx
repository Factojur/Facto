import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FactoLogo } from "@/components/brand/facto-logo";
import { TesteIaForm } from "@/components/admin/teste-ia-form";
import { geminiConfigurado } from "@/lib/ia/gemini-client";

const EMAIL_ADMIN = "admin@facto.com";

export default async function TesteIaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== EMAIL_ADMIN) {
    redirect("/dashboard");
  }

  const configurado = geminiConfigurado();

  return (
    <div className="min-h-full bg-facto-dark px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <FactoLogo variant="horizontal" size="sm" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              Teste de geração por IA (sandbox)
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Camada gratuita, só com casos fictícios. Visível apenas para {EMAIL_ADMIN}.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/conhecimento"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-stone-300 transition hover:border-facto-gold/50 hover:text-white"
            >
              ← Base de Conhecimento
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
          {configurado ? (
            <TesteIaForm />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-stone-400">
              <p className="font-semibold text-white">
                Falta configurar a chave da Gemini API neste ambiente.
              </p>
              <p className="mt-2 text-stone-500">
                Em <strong className="font-medium text-stone-300">localhost</strong>, a chave
                fica no <code className="rounded bg-white/10 px-1 py-0.5">.env.local</code>.
                Em <strong className="font-medium text-stone-300">produção (factoia.com.br)</strong>,
                ela precisa estar nas Environment Variables da Vercel — o{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">.env.local</code> não sobe no deploy.
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                <li>
                  Acesse{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-facto-gold hover:underline"
                  >
                    Google AI Studio
                  </a>{" "}
                  e copie/crie uma chave (gratuita).
                </li>
                <li>
                  <strong className="font-medium text-stone-300">Local:</strong> cole em{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">GEMINI_API_KEY=...</code> no{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">.env.local</code> e reinicie{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">npm run dev</code>.
                </li>
                <li>
                  <strong className="font-medium text-stone-300">Produção:</strong> Vercel → projeto{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">facto</code> → Settings →
                  Environment Variables → adicione{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5">GEMINI_API_KEY</code> (Production)
                  → Redeploy.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

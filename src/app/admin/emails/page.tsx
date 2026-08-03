import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";

export default async function AdminEmailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  let tabelaPronta = true;
  let eventos: {
    id: string;
    tipo: string;
    status: string;
    destinatario: string | null;
    assunto: string | null;
    erro: string | null;
    criado_em: string;
  }[] = [];
  let falhas = 0;

  try {
    const admin = createAdminClient();
    const desde = new Date();
    desde.setDate(desde.getDate() - 14);

    const [lista, falhasResp] = await Promise.all([
      admin
        .from("email_eventos")
        .select("id, tipo, status, destinatario, assunto, erro, criado_em")
        .order("criado_em", { ascending: false })
        .limit(80),
      admin
        .from("email_eventos")
        .select("id", { count: "exact", head: true })
        .eq("status", "falha")
        .gte("criado_em", desde.toISOString()),
    ]);

    if (lista.error) throw lista.error;
    eventos = lista.data ?? [];
    falhas = falhasResp.count ?? 0;
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
              href="/admin/convites"
              className="text-stone-400 hover:text-white"
            >
              Convites
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
          Log de e-mails
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-400">
          Observabilidade dos envios Resend (suporte, convite, financeiro).
          Falhas nos últimos 14 dias:{" "}
          <strong className="text-facto-gold">{falhas}</strong>.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-400">
          <p className="font-medium text-stone-300">Infra de e-mail (checklist)</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
            <li>
              Vercel: <code className="text-stone-300">NEXT_PUBLIC_SITE_URL=https://factoia.com.br</code>
            </li>
            <li>
              Vercel (opcional):{" "}
              <code className="text-stone-300">
                RESEND_FROM_FINANCEIRO=FACTO Financeiro &lt;financeiro@factoia.com.br&gt;
              </code>
            </li>
            <li>
              Cloudflare DNS — DMARC (TXT em <code>_dmarc</code>):{" "}
              <code className="text-stone-300">
                v=DMARC1; p=none; rua=mailto:financeiro@factoia.com.br; fo=1
              </code>{" "}
              (comece com p=none; depois endureça para quarantine/reject).
            </li>
            <li>
              Execute no Supabase o SQL{" "}
              <code className="text-stone-300">migration-email-eventos.sql</code>{" "}
              se esta lista estiver vazia/indisponível.
            </li>
          </ul>
        </div>

        {!tabelaPronta ? (
          <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Tabela <code>email_eventos</code> indisponível. Rode a migration no
            SQL Editor do Supabase.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Quando</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Destino</th>
                  <th className="px-4 py-3 font-medium">Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {eventos.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-stone-500"
                    >
                      Nenhum evento ainda. Os próximos envios aparecerão aqui.
                    </td>
                  </tr>
                )}
                {eventos.map((e) => (
                  <tr key={e.id} className="align-top text-stone-300">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-stone-500">
                      {new Date(e.criado_em).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-xs">{e.tipo}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          e.status === "falha"
                            ? "text-red-300"
                            : "text-emerald-300"
                        }
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{e.destinatario ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {e.erro || e.assunto || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

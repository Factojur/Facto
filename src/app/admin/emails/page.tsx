import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FactoLogo } from "@/components/brand/facto-logo";
import { isAdminEmail } from "@/lib/admin-auth";
import { ReenviarCompraEmailForm } from "@/components/admin/reenviar-compra-email-form";
import { TesteCompraEmailForm } from "@/components/admin/teste-compra-email-form";
import { SincronizarComprasButton } from "@/components/admin/sincronizar-compras-button";
import { rotuloTipoEmail } from "@/lib/email/eventos";

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
    metadados: Record<string, unknown> | null;
  }[] = [];
  let falhas = 0;
  let webhooks: {
    id: string;
    topico: string | null;
    mp_id: string | null;
    processado: boolean;
    erro: string | null;
    recebido_em: string;
  }[] = [];

  try {
    const admin = createAdminClient();
    const desde = new Date();
    desde.setDate(desde.getDate() - 14);

    const [lista, falhasResp, webhooksResp] = await Promise.all([
      admin
        .from("email_eventos")
        .select("id, tipo, status, destinatario, assunto, erro, criado_em, metadados")
        .order("criado_em", { ascending: false })
        .limit(80),
      admin
        .from("email_eventos")
        .select("id", { count: "exact", head: true })
        .eq("status", "falha")
        .gte("criado_em", desde.toISOString()),
      admin
        .from("webhook_eventos_mp")
        .select("id, topico, mp_id, processado, erro, recebido_em")
        .order("recebido_em", { ascending: false })
        .limit(20),
    ]);

    if (lista.error) throw lista.error;
    eventos = lista.data ?? [];
    falhas = falhasResp.count ?? 0;
    if (!webhooksResp.error) {
      webhooks = webhooksResp.data ?? [];
    }
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

        <SincronizarComprasButton />

        <TesteCompraEmailForm emailInicial="" />

        <ReenviarCompraEmailForm emailInicial="" />

        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100/90">
          <p className="font-medium text-red-100">
            Atenção: webhook do Mercado Pago
          </p>
          <p className="mt-2 text-xs leading-relaxed text-red-100/80">
            Se compras no MP não geram e-mail automático, confira no painel MP →
            Webhooks se a URL{" "}
            <code className="text-red-50">
              https://factoia.com.br/api/webhooks/mercadopago
            </code>{" "}
            está ativa com os tópicos{" "}
            <code className="text-red-50">subscription_preapproval</code>,{" "}
            <code className="text-red-50">
              subscription_authorized_payment
            </code>{" "}
            e <code className="text-red-50">payment</code>, na{" "}
            <strong className="font-medium">mesma aplicação</strong> dos links
            mpago.la. Enquanto isso, use &quot;Sincronizar MP agora&quot; abaixo
            para disparar financeiro + convite.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-amber-100/90">
          <p className="font-medium text-amber-100">
            Envio automático (como funciona)
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-100/80">
            <li>
              Webhook MP → e-mails na hora (financeiro@ + confirmação ao cliente
              + convite noreply se não houver perfil) + push ntfy ao admin, se{" "}
              <code className="text-amber-50">NTFY_TOPIC</code> estiver na
              Vercel.
            </li>
            <li>
              Rede de segurança: cron diário na Vercel (Hobby) + botão
              &quot;Sincronizar MP agora&quot; abaixo. O caminho principal
              continua sendo o webhook do Mercado Pago.
            </li>
            <li>
              IDs <code className="text-amber-50">123456</code> /{" "}
              <code className="text-amber-50">123456789</code> no log são{" "}
              <strong className="font-medium">teste do painel MP</strong>, não
              compra real.
            </li>
            <li>
              No Mercado Pago → Sua integração → Webhooks, ative:{" "}
              <code className="text-amber-50">subscription_preapproval</code>,{" "}
              <code className="text-amber-50">
                subscription_authorized_payment
              </code>{" "}
              e <code className="text-amber-50">payment</code>, URL{" "}
              <code className="text-amber-50">
                https://factoia.com.br/api/webhooks/mercadopago
              </code>
              . O Access Token da Vercel deve ser da{" "}
              <strong className="font-medium">mesma conta</strong> dos links
              mpago.la.
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-stone-400">
          <p className="font-medium text-stone-300">
            Últimos webhooks Mercado Pago
          </p>
          {webhooks.length === 0 ? (
            <p className="mt-2 text-xs text-amber-200/90">
              Nenhum evento em <code>webhook_eventos_mp</code>. Se houve compra e
              esta lista está vazia, o Mercado Pago não está batendo em{" "}
              <code>/api/webhooks/mercadopago</code> (URL/secret no painel MP).
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-stone-500">
                  <tr>
                    <th className="py-1 pr-3 font-medium">Quando</th>
                    <th className="py-1 pr-3 font-medium">Tópico</th>
                    <th className="py-1 pr-3 font-medium">ID</th>
                    <th className="py-1 pr-3 font-medium">OK</th>
                    <th className="py-1 font-medium">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-stone-400">
                  {webhooks.map((w) => (
                    <tr key={w.id}>
                      <td className="py-1.5 pr-3 whitespace-nowrap">
                        {new Date(w.recebido_em).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-1.5 pr-3">{w.topico ?? "—"}</td>
                      <td className="py-1.5 pr-3 font-mono">
                        {w.mp_id ?? "—"}
                      </td>
                      <td className="py-1.5 pr-3">
                        {w.processado ? "sim" : "não"}
                      </td>
                      <td className="py-1.5 text-amber-200/80">
                        {w.erro ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                    <td className="px-4 py-3 text-xs">{rotuloTipoEmail(e.tipo, e.destinatario)}</td>
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
                    <td className="px-4 py-3 text-xs">
                      {e.destinatario ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-500">
                      {e.erro || e.assunto || "—"}
                      {typeof e.metadados?.resendId === "string" &&
                      e.metadados.resendId ? (
                        <span className="mt-1 block font-mono text-[10px] text-stone-600">
                          Resend {e.metadados.resendId}
                        </span>
                      ) : null}
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

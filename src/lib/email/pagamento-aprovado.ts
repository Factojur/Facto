import {
  emailJaEnviadoParaPagamento,
  registrarEmailEvento,
} from "@/lib/email/eventos";
import {
  planoPorValor,
  rotuloPlano,
  type PlanoId,
} from "@/lib/planos-facto";
import { htmlLogoEmail } from "@/lib/email/marca";
import {
  DESTINO_FINANCEIRO,
  REMETENTE_FINANCEIRO,
  REMETENTE_NOREPLY,
  getResend,
  serializeResendError,
  type StatusEnvioEmail,
} from "@/lib/email/resend-client";

function formatarValor(valor: number | null | undefined): string {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function rotuloPlanoEmail(
  plano: PlanoId | null | undefined,
  valor: number | null | undefined
): string {
  const porId = rotuloPlano(plano);
  if (porId !== "—") return porId;
  return rotuloPlano(planoPorValor(
    typeof valor === "number" && !Number.isNaN(valor) ? valor : null
  ));
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlAvisoInterno(opcoes: {
  emailCliente: string;
  valor: number | null | undefined;
  mpPaymentId: string;
  plano?: PlanoId | null;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:24px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#908b6a;">FACTO · FINANCEIRO</div>
      <h1 style="margin:12px 0 0;font-size:18px;">Nova compra aprovada</h1>
      <p style="margin:16px 0 8px;font-size:14px;line-height:1.5;">
        <strong>Cliente:</strong> ${escaparHtml(opcoes.emailCliente)}<br />
        <strong>Plano:</strong> ${escaparHtml(rotuloPlanoEmail(opcoes.plano, opcoes.valor))}<br />
        <strong>Valor:</strong> ${escaparHtml(formatarValor(opcoes.valor))}<br />
        <strong>ID Mercado Pago:</strong> ${escaparHtml(opcoes.mpPaymentId)}
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#78716c;">
        O convite de cadastro (noreply@) é enviado em seguida, se o cliente ainda não tiver conta.
      </p>
    </div>
  </body>
</html>`;
}

function htmlConfirmacaoCliente(opcoes: {
  valor: number | null | undefined;
  /** true = já tem perfil (trial/upgrade); não promete e-mail de convite */
  temConta?: boolean;
}): string {
  const ano = new Date().getFullYear();
  const corpo = opcoes.temConta
    ? `Seu plano foi liberado na conta FACTO vinculada a este e-mail. Entre em <strong style="color:#e7e5e4;">factoia.com.br/login</strong> com o mesmo e-mail para continuar.`
    : `Em instantes você receberá outro e-mail (remetente noreply) com o link para criar sua conta no FACTO.`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#1c1c16;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1c16;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#242420;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td style="padding:36px 40px 8px;text-align:center;">
                ${htmlLogoEmail({ heightPx: 56 })}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 40px 0;text-align:center;">
                <span style="display:inline-block;background-color:rgba(144,139,106,0.14);color:#908b6a;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:6px 14px;border-radius:999px;">
                  Financeiro
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.35;">
                  Pagamento aprovado
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 40px 0;text-align:center;">
                <p style="margin:0;color:#a8a29e;font-size:15px;line-height:1.6;">
                  Confirmamos o recebimento do seu pagamento
                  ${
                    typeof opcoes.valor === "number"
                      ? `no valor de <strong style="color:#e7e5e4;">${escaparHtml(formatarValor(opcoes.valor))}</strong>`
                      : ""
                  }.
                  ${corpo}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 36px;text-align:center;">
                <p style="margin:0;color:#6b6b63;font-size:12px;line-height:1.6;">
                  Dúvidas sobre cobrança? Responda este e-mail ou escreva para
                  financeiro@factoia.com.br.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;color:#57534e;font-size:12px;">
            © ${ano} FACTO. Todos os direitos reservados.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Após compra aprovada:
 * 1) avisa a equipe em financeiro@
 * 2) confirma o pagamento ao cliente (remetente financeiro@)
 *
 * Cada destino é idempotente: se um já foi enviado e o outro falhou,
 * o retry só reenvia o que falta.
 */
export async function enviarEmailsFinanceiroCompra(opcoes: {
  emailCliente: string;
  valor?: number | null;
  mpPaymentId: string;
  plano?: PlanoId | null;
  /** Ignora idempotência (reenvio admin quando o 1º “enviado” não chegou). */
  forcar?: boolean;
  /** Cliente já tem perfil — não promete e-mail de convite. */
  temConta?: boolean;
}): Promise<{ admin: StatusEnvioEmail; cliente: StatusEnvioEmail }> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[email financeiro] RESEND_API_KEY não configurada; e-mails financeiros não enviados."
    );
    await registrarEmailEvento({
      tipo: "financeiro_compra",
      status: "falha",
      destinatario: opcoes.emailCliente,
      assunto: "Pagamento aprovado — FACTO",
      erro: "RESEND_API_KEY ausente",
      metadados: { mpPaymentId: opcoes.mpPaymentId, plano: opcoes.plano ?? null },
    });
    return { admin: "falha", cliente: "falha" };
  }

  const fromCliente =
    process.env.RESEND_FROM_FINANCEIRO?.trim() || REMETENTE_FINANCEIRO;
  const fromInterno =
    process.env.RESEND_FROM_EMAIL?.trim() || REMETENTE_NOREPLY;

  const envios: {
    papel: "admin" | "cliente";
    from: string;
    destinatario: string;
    subject: string;
    html: string;
    replyTo?: string;
  }[] = [];

  let admin: StatusEnvioEmail = "pulado";
  let cliente: StatusEnvioEmail = "pulado";

  const adminJaEnviado =
    !opcoes.forcar &&
    (await emailJaEnviadoParaPagamento(
      "financeiro_compra",
      opcoes.mpPaymentId,
      DESTINO_FINANCEIRO
    ));
  if (!adminJaEnviado) {
    envios.push({
      papel: "admin",
      from: fromInterno,
      destinatario: DESTINO_FINANCEIRO,
      subject: `[FACTO] Compra aprovada — ${opcoes.emailCliente}`,
      html: htmlAvisoInterno({
        emailCliente: opcoes.emailCliente,
        valor: opcoes.valor ?? null,
        mpPaymentId: opcoes.mpPaymentId,
        plano: opcoes.plano,
      }),
      replyTo: DESTINO_FINANCEIRO,
    });
  }

  const clienteJaEnviado =
    !opcoes.forcar &&
    (await emailJaEnviadoParaPagamento(
      "financeiro_compra",
      opcoes.mpPaymentId,
      opcoes.emailCliente
    ));
  if (!clienteJaEnviado) {
    envios.push({
      papel: "cliente",
      from: fromCliente,
      destinatario: opcoes.emailCliente,
      subject: "Pagamento aprovado — FACTO",
      html: htmlConfirmacaoCliente({
        valor: opcoes.valor ?? null,
        temConta: Boolean(opcoes.temConta),
      }),
      replyTo: DESTINO_FINANCEIRO,
    });
  }

  if (envios.length === 0) return { admin, cliente };

  for (const envio of envios) {
    try {
      const { data, error } = await resend.emails.send({
        from: envio.from,
        to: envio.destinatario,
        subject: envio.subject,
        html: envio.html,
        ...(envio.replyTo ? { replyTo: envio.replyTo } : {}),
        tags: [{ name: "tipo", value: "financeiro_compra" }],
      });

      if (error || !data?.id) {
        const status: StatusEnvioEmail = "falha";
        if (envio.papel === "admin") admin = status;
        else cliente = status;
        await registrarEmailEvento({
          tipo: "financeiro_compra",
          status: "falha",
          destinatario: envio.destinatario,
          assunto: envio.subject,
          erro: serializeResendError(error) || "Resend retornou sem id",
          metadados: {
            mpPaymentId: opcoes.mpPaymentId,
            resendId: data?.id ?? null,
          },
        });
        continue;
      }

      if (envio.papel === "admin") admin = "enviado";
      else cliente = "enviado";
      await registrarEmailEvento({
        tipo: "financeiro_compra",
        status: "enviado",
        destinatario: envio.destinatario,
        assunto: envio.subject,
        metadados: {
          mpPaymentId: opcoes.mpPaymentId,
          resendId: data.id,
        },
      });
    } catch (erro) {
      if (envio.papel === "admin") admin = "falha";
      else cliente = "falha";
      await registrarEmailEvento({
        tipo: "financeiro_compra",
        status: "falha",
        destinatario: envio.destinatario,
        assunto: envio.subject,
        erro: serializeResendError(erro),
        metadados: { mpPaymentId: opcoes.mpPaymentId },
      });
    }
  }

  return { admin, cliente };
}

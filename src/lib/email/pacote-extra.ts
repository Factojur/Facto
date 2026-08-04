import { Resend } from "resend";
import {
  emailJaEnviadoParaPagamento,
  registrarEmailEvento,
} from "@/lib/email/eventos";

const REMETENTE_FINANCEIRO =
  "FACTO Financeiro <financeiro@factoia.com.br>";
const DESTINO_FINANCEIRO = "financeiro@factoia.com.br";

function formatarValor(valor: number | null | undefined): string {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
  pecas: number;
  pacoteRotulo: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:24px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#908b6a;">FACTO · FINANCEIRO</div>
      <h1 style="margin:12px 0 0;font-size:18px;">Pacote extra aprovado</h1>
      <p style="margin:16px 0 8px;font-size:14px;line-height:1.5;">
        <strong>Cliente:</strong> ${escaparHtml(opcoes.emailCliente)}<br />
        <strong>Pacote:</strong> ${escaparHtml(opcoes.pacoteRotulo)} (+${opcoes.pecas} peças)<br />
        <strong>Valor:</strong> ${escaparHtml(formatarValor(opcoes.valor))}<br />
        <strong>ID Mercado Pago:</strong> ${escaparHtml(opcoes.mpPaymentId)}
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#78716c;">
        Compra avulsa — créditos no ciclo atual. Sem e-mail de boas-vindas/convite.
      </p>
    </div>
  </body>
</html>`;
}

function htmlConfirmacaoCliente(opcoes: {
  valor: number | null | undefined;
  pecas: number;
  pacoteRotulo: string;
}): string {
  const ano = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#1c1c16;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1c16;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#242420;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td style="padding:36px 40px 8px;text-align:center;">
                <span style="display:inline-block;font-size:24px;font-weight:800;letter-spacing:0.08em;color:#908b6a;">FACTO</span>
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
                  Compra de peças extras confirmada
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 40px 0;text-align:center;">
                <p style="margin:0;color:#a8a29e;font-size:15px;line-height:1.6;">
                  Recebemos o pagamento
                  ${
                    typeof opcoes.valor === "number"
                      ? `de <strong style="color:#e7e5e4;">${escaparHtml(formatarValor(opcoes.valor))}</strong>`
                      : ""
                  }
                  referente ao pacote <strong style="color:#e7e5e4;">${escaparHtml(opcoes.pacoteRotulo)}</strong>.
                  Em seguida, <strong style="color:#e7e5e4;">+${opcoes.pecas} peças</strong> serão creditadas na sua conta no ciclo atual.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 0;text-align:center;">
                <p style="margin:0;color:#78716c;font-size:13px;line-height:1.6;">
                  Acompanhe o uso em <strong style="color:#a8a29e;">Perfil → Gerenciamento de assinatura</strong>.
                  Os créditos extras não acumulam para o próximo mês.
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
 * Compra avulsa de pacote extra:
 * - aviso interno financeiro@
 * - confirmação ao cliente (sem e-mail de boas-vindas / convite)
 */
export async function enviarEmailsFinanceiroPacoteExtra(opcoes: {
  emailCliente: string;
  valor?: number | null;
  mpPaymentId: string;
  pecas: number;
  pacoteRotulo: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[email pacote-extra] RESEND_API_KEY não configurada; e-mails não enviados."
    );
    await registrarEmailEvento({
      tipo: "financeiro_compra",
      status: "falha",
      destinatario: opcoes.emailCliente,
      assunto: "Peças extras confirmadas — FACTO",
      erro: "RESEND_API_KEY ausente",
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        tipoCompra: "pacote_extra",
      },
    });
    return;
  }

  const from =
    process.env.RESEND_FROM_FINANCEIRO?.trim() || REMETENTE_FINANCEIRO;
  const resend = new Resend(apiKey);

  const envios: {
    destinatario: string;
    subject: string;
    html: string;
    replyTo?: string;
  }[] = [];

  const adminJa = await emailJaEnviadoParaPagamento(
    "financeiro_compra",
    opcoes.mpPaymentId,
    DESTINO_FINANCEIRO
  );
  if (!adminJa) {
    envios.push({
      destinatario: DESTINO_FINANCEIRO,
      subject: `[FACTO] Pacote extra — ${opcoes.emailCliente}`,
      html: htmlAvisoInterno({
        emailCliente: opcoes.emailCliente,
        valor: opcoes.valor ?? null,
        mpPaymentId: opcoes.mpPaymentId,
        pecas: opcoes.pecas,
        pacoteRotulo: opcoes.pacoteRotulo,
      }),
    });
  }

  const clienteJa = await emailJaEnviadoParaPagamento(
    "financeiro_compra",
    opcoes.mpPaymentId,
    opcoes.emailCliente
  );
  if (!clienteJa) {
    envios.push({
      destinatario: opcoes.emailCliente,
      subject: "Peças extras confirmadas — FACTO",
      html: htmlConfirmacaoCliente({
        valor: opcoes.valor ?? null,
        pecas: opcoes.pecas,
        pacoteRotulo: opcoes.pacoteRotulo,
      }),
      replyTo: DESTINO_FINANCEIRO,
    });
  }

  for (const envio of envios) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: envio.destinatario,
        subject: envio.subject,
        html: envio.html,
        ...(envio.replyTo ? { replyTo: envio.replyTo } : {}),
      });

      if (error) {
        await registrarEmailEvento({
          tipo: "financeiro_compra",
          status: "falha",
          destinatario: envio.destinatario,
          assunto: envio.subject,
          erro: error.message,
          metadados: {
            mpPaymentId: opcoes.mpPaymentId,
            tipoCompra: "pacote_extra",
          },
        });
        continue;
      }

      await registrarEmailEvento({
        tipo: "financeiro_compra",
        status: "enviado",
        destinatario: envio.destinatario,
        assunto: envio.subject,
        metadados: {
          mpPaymentId: opcoes.mpPaymentId,
          tipoCompra: "pacote_extra",
        },
      });
    } catch (erro) {
      await registrarEmailEvento({
        tipo: "financeiro_compra",
        status: "falha",
        destinatario: envio.destinatario,
        assunto: envio.subject,
        erro: erro instanceof Error ? erro.message : String(erro),
        metadados: {
          mpPaymentId: opcoes.mpPaymentId,
          tipoCompra: "pacote_extra",
        },
      });
    }
  }
}

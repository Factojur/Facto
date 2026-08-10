import { Resend } from "resend";
import { registrarEmailEvento } from "@/lib/email/eventos";
import { htmlLogoEmail } from "@/lib/email/marca";

const REMETENTE_SUPORTE = "FACTO Suporte <suporte@factoia.com.br>";

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function montarHtmlReset(link: string): string {
  const ano = new Date().getFullYear();
  const href = escaparHtml(link);

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
                  Redefinir senha
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.35;">
                  Pedido de nova senha
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 40px 0;text-align:center;">
                <p style="margin:0;color:#a8a29e;font-size:15px;line-height:1.6;">
                  Recebemos um pedido para redefinir a senha da sua conta no FACTO.
                  Clique no botão abaixo. O link expira em pouco tempo por segurança.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;text-align:center;">
                <a
                  href="${href}"
                  style="display:inline-block;background-color:#908b6a;color:#1c1c16;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;"
                >
                  Escolher nova senha
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 28px;text-align:center;">
                <p style="margin:0;color:#78716c;font-size:12px;line-height:1.5;">
                  Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá a mesma.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                <p style="margin:0;color:#57534e;font-size:11px;">
                  FACTO · suporte@factoia.com.br · ${ano}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function enviarEmailRedefinirSenha(opcoes: {
  email: string;
  link: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const remetente =
    process.env.RESEND_FROM_SUPORTE?.trim() || REMETENTE_SUPORTE;

  if (!apiKey) {
    console.warn(
      "[email reset] RESEND_API_KEY ausente; link gerado:",
      opcoes.link
    );
    await registrarEmailEvento({
      tipo: "suporte",
      status: "falha",
      destinatario: opcoes.email,
      assunto: "Redefina sua senha — FACTO",
      erro: "RESEND_API_KEY ausente",
      metadados: { fluxo: "redefinir_senha" },
    });
    throw new Error(
      "Envio de e-mail não configurado. Tente novamente mais tarde."
    );
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: remetente,
    to: opcoes.email,
    subject: "Redefina sua senha — FACTO",
    html: montarHtmlReset(opcoes.link),
  });

  if (error) {
    await registrarEmailEvento({
      tipo: "suporte",
      status: "falha",
      destinatario: opcoes.email,
      assunto: "Redefina sua senha — FACTO",
      erro: error.message,
      metadados: { fluxo: "redefinir_senha" },
    });
    throw new Error(error.message);
  }

  await registrarEmailEvento({
    tipo: "suporte",
    status: "enviado",
    destinatario: opcoes.email,
    assunto: "Redefina sua senha — FACTO",
    metadados: { fluxo: "redefinir_senha", resendId: data?.id ?? null },
  });
}

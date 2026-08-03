import { Resend } from "resend";
import { registrarEmailEvento } from "@/lib/email/eventos";
import { getSiteUrl } from "@/lib/site-url";

const REMETENTE_NOREPLY = "FACTO <noreply@factoia.com.br>";

function montarHtmlBoasVindas(link: string): string {
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
                  Boas-vindas
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.35;">
                  Sua conta está liberada
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 40px 0;text-align:center;">
                <p style="margin:0;color:#a8a29e;font-size:15px;line-height:1.6;">
                  Bem-vindo ao FACTO. Seu acesso foi liberado. Clique no botão
                  abaixo para criar sua conta e começar a redigir peças com
                  inteligência artificial.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;text-align:center;">
                <a
                  href="${link}"
                  style="display:inline-block;background-color:#908b6a;color:#1c1c16;font-weight:700;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:8px;"
                >
                  Criar minha conta
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 36px;text-align:center;">
                <p style="margin:0;color:#6b6b63;font-size:12px;line-height:1.6;">
                  Se o botão não funcionar, copie e cole este link no navegador:<br />
                  <a href="${link}" style="color:#908b6a;word-break:break-all;">${link}</a>
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
 * Boas-vindas + link de cadastro (remetente noreply@).
 * O comprovante financeiro vai em paralelo por financeiro@.
 */
export async function enviarEmailConvite(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const remetente =
    process.env.RESEND_FROM_EMAIL?.trim() || REMETENTE_NOREPLY;
  const siteUrl = getSiteUrl();
  const link = `${siteUrl}/cadastro?token=${token}`;
  const assunto = "Bem-vindo ao FACTO — crie sua conta";

  if (!apiKey) {
    console.warn(
      "[email convite] RESEND_API_KEY não configurada; e-mail não enviado. Link gerado:",
      link
    );
    await registrarEmailEvento({
      tipo: "convite",
      status: "falha",
      destinatario: email,
      assunto,
      erro: "RESEND_API_KEY ausente",
      metadados: { link },
    });
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: remetente,
    to: email,
    subject: assunto,
    html: montarHtmlBoasVindas(link),
  });

  if (error) {
    await registrarEmailEvento({
      tipo: "convite",
      status: "falha",
      destinatario: email,
      assunto,
      erro: error.message,
      metadados: { link },
    });
    throw new Error(`Falha ao enviar e-mail via Resend: ${error.message}`);
  }

  await registrarEmailEvento({
    tipo: "convite",
    status: "enviado",
    destinatario: email,
    assunto,
    metadados: { link },
  });
}

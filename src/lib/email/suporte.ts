import { Resend } from "resend";
import {
  destinoPorAssunto,
  type AssuntoSuporte,
} from "@/lib/email/suporte-assuntos";

export type { AssuntoSuporte } from "@/lib/email/suporte-assuntos";
export {
  ASSUNTOS_SUPORTE,
  DESTINO_POR_ASSUNTO,
  destinoPorAssunto,
  isAssuntoSuporte,
} from "@/lib/email/suporte-assuntos";

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function montarHtmlSuporte(opcoes: {
  assunto: AssuntoSuporte;
  mensagem: string;
  emailUsuario: string;
  nomeUsuario: string | null;
  telefoneUsuario: string | null;
}): string {
  const mensagemHtml = escaparHtml(opcoes.mensagem).replace(/\n/g, "<br />");
  const nome = opcoes.nomeUsuario?.trim() || "—";
  const telefone = opcoes.telefoneUsuario?.trim() || "—";

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;">
            <tr>
              <td style="padding:24px 28px 8px;">
                <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#908b6a;">FACTO</div>
                <h1 style="margin:12px 0 0;font-size:18px;color:#1c1917;">Nova mensagem de suporte</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;font-size:14px;color:#44403c;line-height:1.5;">
                <p style="margin:0 0 8px;"><strong>Assunto:</strong> ${escaparHtml(opcoes.assunto)}</p>
                <p style="margin:0 0 8px;"><strong>Nome:</strong> ${escaparHtml(nome)}</p>
                <p style="margin:0 0 8px;"><strong>E-mail:</strong> ${escaparHtml(opcoes.emailUsuario)}</p>
                <p style="margin:0 0 16px;"><strong>Telefone:</strong> ${escaparHtml(telefone)}</p>
                <p style="margin:0 0 8px;"><strong>Mensagem:</strong></p>
                <div style="padding:14px 16px;background:#fafaf9;border-radius:8px;border:1px solid #e7e5e4;">
                  ${mensagemHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;font-size:12px;color:#78716c;">
                Responda este e-mail para falar diretamente com o usuário (Reply-To).
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Envia a mensagem do formulário de suporte via Resend,
 * roteando por assunto para suporte@ ou contato@.
 */
export async function enviarEmailSuporte(opcoes: {
  assunto: AssuntoSuporte;
  mensagem: string;
  emailUsuario: string;
  nomeUsuario?: string | null;
  telefoneUsuario?: string | null;
}): Promise<{ id?: string; destino: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "FACTO <noreply@factoia.com.br>";
  const destino = destinoPorAssunto(opcoes.assunto);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: destino,
    replyTo: opcoes.emailUsuario,
    subject: `[FACTO Suporte] ${opcoes.assunto} — ${opcoes.emailUsuario}`,
    html: montarHtmlSuporte({
      assunto: opcoes.assunto,
      mensagem: opcoes.mensagem,
      emailUsuario: opcoes.emailUsuario,
      nomeUsuario: opcoes.nomeUsuario ?? null,
      telefoneUsuario: opcoes.telefoneUsuario ?? null,
    }),
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar e-mail de suporte.");
  }

  return { id: data?.id, destino };
}

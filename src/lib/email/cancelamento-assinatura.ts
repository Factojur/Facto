import { Resend } from "resend";
import { rotuloPlano, type AssinaturaDb } from "@/lib/assinatura-format";
import { registrarEmailEvento } from "@/lib/email/eventos";

const REMETENTE_FINANCEIRO =
  "FACTO Financeiro <financeiro@factoia.com.br>";
const DESTINO_FINANCEIRO = "financeiro@factoia.com.br";

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarDataPt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function htmlAvisoInterno(opcoes: {
  emailCliente: string;
  planoLabel: string;
  dentroPrazoCdc: boolean;
  estornoSucesso: boolean | null;
  acessoValidoAte: string | null;
  mpPreapprovalId: string;
}): string {
  const regime = opcoes.dentroPrazoCdc
    ? opcoes.estornoSucesso
      ? "CDC (≤ 7 dias) com estorno"
      : "CDC (≤ 7 dias) — verificar estorno"
    : "Fora do CDC — acesso até o fim do ciclo pago";

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:24px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;color:#908b6a;">FACTO · FINANCEIRO</div>
      <h1 style="margin:12px 0 0;font-size:18px;">Cancelamento de assinatura</h1>
      <p style="margin:16px 0 8px;font-size:14px;line-height:1.5;">
        <strong>Cliente:</strong> ${escaparHtml(opcoes.emailCliente)}<br />
        <strong>Plano:</strong> ${escaparHtml(opcoes.planoLabel)}<br />
        <strong>Regime:</strong> ${escaparHtml(regime)}<br />
        <strong>Acesso até:</strong> ${escaparHtml(formatarDataPt(opcoes.acessoValidoAte))}<br />
        <strong>Preapproval MP:</strong> ${escaparHtml(opcoes.mpPreapprovalId)}
      </p>
    </div>
  </body>
</html>`;
}

function htmlCliente(opcoes: {
  planoLabel: string;
  dentroPrazoCdc: boolean;
  estornoSucesso: boolean | null;
  acessoValidoAte: string | null;
}): string {
  const ano = new Date().getFullYear();
  let corpo: string;
  if (opcoes.dentroPrazoCdc) {
    corpo = opcoes.estornoSucesso
      ? "Seu cancelamento foi concluído dentro do prazo de 7 dias (CDC). A cobrança recorrente foi encerrada, o valor foi estornado no Mercado Pago e o acesso ao FACTO foi finalizado."
      : "Seu cancelamento foi concluído dentro do prazo de 7 dias (CDC). A cobrança recorrente foi encerrada e o acesso ao FACTO foi finalizado. Se o estorno ainda não aparecer na fatura, nossa equipe financeira acompanha a conclusão.";
  } else {
    const ate = formatarDataPt(opcoes.acessoValidoAte);
    corpo =
      ate !== "—"
        ? `Seu cancelamento foi concluído. Não haverá novas cobranças. Seu acesso permanece liberado até <strong style="color:#e7e5e4;">${escaparHtml(ate)}</strong>.`
        : "Seu cancelamento foi concluído. Não haverá novas cobranças. Seu acesso permanece até o fim do ciclo já pago.";
  }

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
                  Assinatura cancelada
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 40px 0;text-align:center;">
                <p style="margin:0;color:#a8a29e;font-size:15px;line-height:1.6;">
                  ${corpo}
                </p>
                <p style="margin:16px 0 0;color:#a8a29e;font-size:14px;line-height:1.6;">
                  Plano: ${escaparHtml(opcoes.planoLabel)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 36px;text-align:center;">
                <p style="margin:0;color:#6b6b63;font-size:12px;line-height:1.6;">
                  Dúvidas? Responda este e-mail ou escreva para financeiro@factoia.com.br.
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
 * Após cancelamento efetivado: avisa financeiro@ e confirma ao cliente.
 */
export async function enviarEmailsCancelamentoAssinatura(opcoes: {
  emailCliente: string;
  plano: AssinaturaDb["plano"];
  dentroPrazoCdc: boolean;
  estornoSucesso: boolean | null;
  acessoValidoAte: string | null;
  mpPreapprovalId: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[email cancelamento] RESEND_API_KEY não configurada; e-mails não enviados."
    );
    await registrarEmailEvento({
      tipo: "financeiro_cancelamento",
      status: "falha",
      destinatario: opcoes.emailCliente,
      assunto: "Assinatura cancelada — FACTO",
      erro: "RESEND_API_KEY ausente",
      metadados: { mpPreapprovalId: opcoes.mpPreapprovalId },
    });
    return;
  }

  const from =
    process.env.RESEND_FROM_FINANCEIRO?.trim() || REMETENTE_FINANCEIRO;
  const planoLabel = rotuloPlano(opcoes.plano);
  const resend = new Resend(apiKey);

  const resultados = await Promise.allSettled([
    resend.emails.send({
      from,
      to: DESTINO_FINANCEIRO,
      subject: `[FACTO] Cancelamento — ${opcoes.emailCliente}`,
      html: htmlAvisoInterno({
        emailCliente: opcoes.emailCliente,
        planoLabel,
        dentroPrazoCdc: opcoes.dentroPrazoCdc,
        estornoSucesso: opcoes.estornoSucesso,
        acessoValidoAte: opcoes.acessoValidoAte,
        mpPreapprovalId: opcoes.mpPreapprovalId,
      }),
    }),
    resend.emails.send({
      from,
      to: opcoes.emailCliente,
      replyTo: DESTINO_FINANCEIRO,
      subject: "Assinatura cancelada — FACTO",
      html: htmlCliente({
        planoLabel,
        dentroPrazoCdc: opcoes.dentroPrazoCdc,
        estornoSucesso: opcoes.estornoSucesso,
        acessoValidoAte: opcoes.acessoValidoAte,
      }),
    }),
  ]);

  const destinos = [DESTINO_FINANCEIRO, opcoes.emailCliente];
  for (let i = 0; i < resultados.length; i++) {
    const resultado = resultados[i]!;
    const destinatario = destinos[i]!;
    if (resultado.status === "rejected") {
      const erro =
        resultado.reason instanceof Error
          ? resultado.reason.message
          : String(resultado.reason);
      await registrarEmailEvento({
        tipo: "financeiro_cancelamento",
        status: "falha",
        destinatario,
        erro,
        metadados: { mpPreapprovalId: opcoes.mpPreapprovalId },
      });
      continue;
    }
    if (resultado.value.error) {
      await registrarEmailEvento({
        tipo: "financeiro_cancelamento",
        status: "falha",
        destinatario,
        erro: resultado.value.error.message,
        metadados: { mpPreapprovalId: opcoes.mpPreapprovalId },
      });
      continue;
    }
    await registrarEmailEvento({
      tipo: "financeiro_cancelamento",
      status: "enviado",
      destinatario,
      metadados: { mpPreapprovalId: opcoes.mpPreapprovalId },
    });
  }
}

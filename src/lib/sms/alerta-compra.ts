/**
 * Alerta SMS ao admin quando uma compra MP é aprovada.
 * Provedor: Twilio (REST, sem SDK).
 *
 * Env:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_FROM_NUMBER (E.164, ex.: +1… capaz de SMS para BR)
 * - ALERTA_COMPRA_SMS_PARA (default +5511985036364)
 */

import {
  emailJaEnviadoParaPagamento,
  registrarEmailEvento,
} from "@/lib/email/eventos";

const DESTINO_PADRAO = "+5511985036364";

function formatarValor(valor: number | null | undefined): string {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function destinoAlerta(): string {
  const env = process.env.ALERTA_COMPRA_SMS_PARA?.trim();
  return env || DESTINO_PADRAO;
}

function twilioConfigurado(): {
  sid: string;
  token: string;
  from: string;
} | null {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!sid || !token || !from) return null;
  return { sid, token, from };
}

/**
 * Dispara SMS de alerta (idempotente por mpPaymentId).
 * Nunca lança — falhas só vão para log / email_eventos.
 */
export async function enviarSmsAlertaCompra(opcoes: {
  emailCliente: string;
  valor: number | null | undefined;
  mpPaymentId: string;
  tipoCompra?: "assinatura" | "pacote_extra";
}): Promise<{ ok: boolean; motivo?: string }> {
  const to = destinoAlerta();
  const cfg = twilioConfigurado();

  if (!cfg) {
    console.warn(
      "[sms alerta-compra] Twilio não configurado (TWILIO_ACCOUNT_SID / AUTH_TOKEN / FROM_NUMBER); SMS não enviado."
    );
    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "falha",
      destinatario: to,
      assunto: "SMS alerta compra",
      erro: "Twilio não configurado",
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        emailCliente: opcoes.emailCliente,
        tipoCompra: opcoes.tipoCompra ?? "assinatura",
      },
    });
    return { ok: false, motivo: "twilio_ausente" };
  }

  const ja = await emailJaEnviadoParaPagamento(
    "alerta_sms_compra",
    opcoes.mpPaymentId
  );
  if (ja) {
    return { ok: true, motivo: "ja_enviado" };
  }

  const valorTxt = formatarValor(opcoes.valor);
  const tipo =
    opcoes.tipoCompra === "pacote_extra" ? "pacote extra" : "assinatura";
  const body =
    `FACTO: compra ${tipo} aprovada ${valorTxt}. ` +
    `Cliente: ${opcoes.emailCliente}. ` +
    `Confira /admin/emails e reenvie se o e-mail falhou. ` +
    `MP:${opcoes.mpPaymentId}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`;
    const auth = Buffer.from(`${cfg.sid}:${cfg.token}`).toString("base64");
    const form = new URLSearchParams({
      To: to,
      From: cfg.from,
      Body: body.slice(0, 1500),
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const raw = (await res.json().catch(() => ({}))) as {
      sid?: string;
      status?: string;
      message?: string;
      code?: number;
      error_message?: string;
    };

    if (!res.ok) {
      const erro =
        raw.message ||
        raw.error_message ||
        `Twilio HTTP ${res.status}`;
      console.error("[sms alerta-compra] falha Twilio", {
        status: res.status,
        code: raw.code,
        erro,
      });
      await registrarEmailEvento({
        tipo: "alerta_sms_compra",
        status: "falha",
        destinatario: to,
        assunto: "SMS alerta compra",
        erro,
        metadados: {
          mpPaymentId: opcoes.mpPaymentId,
          emailCliente: opcoes.emailCliente,
          twilioCode: raw.code ?? null,
        },
      });
      return { ok: false, motivo: "falha_twilio" };
    }

    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "enviado",
      destinatario: to,
      assunto: "SMS alerta compra",
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        emailCliente: opcoes.emailCliente,
        twilioSid: raw.sid ?? null,
        twilioStatus: raw.status ?? null,
        tipoCompra: opcoes.tipoCompra ?? "assinatura",
      },
    });

    console.info("[sms alerta-compra] enviado", {
      to,
      twilioSid: raw.sid,
      mpPaymentId: opcoes.mpPaymentId,
    });
    return { ok: true };
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : String(erro);
    console.error("[sms alerta-compra]", msg);
    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "falha",
      destinatario: to,
      assunto: "SMS alerta compra",
      erro: msg,
      metadados: { mpPaymentId: opcoes.mpPaymentId },
    });
    return { ok: false, motivo: "excecao" };
  }
}

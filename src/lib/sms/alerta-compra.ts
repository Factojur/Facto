/**
 * Alerta push ao admin quando uma compra MP é aprovada.
 * Provedor: ntfy.sh (HTTP POST; grátis).
 *
 * Env:
 * - NTFY_TOPIC (obrigatório; tópico inscrito no app/web ntfy)
 * - NTFY_BASE_URL (opcional; default https://ntfy.sh)
 *
 * Continua registrando em email_eventos como tipo `alerta_sms_compra`
 * (nome legado do enum / painel admin).
 */

import {
  emailJaEnviadoParaPagamento,
  registrarEmailEvento,
} from "@/lib/email/eventos";

function formatarValor(valor: number | null | undefined): string {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function ntfyConfigurado(): { base: string; topic: string } | null {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return null;
  const base = (
    process.env.NTFY_BASE_URL?.trim() || "https://ntfy.sh"
  ).replace(/\/$/, "");
  return { base, topic };
}

/**
 * Dispara alerta push (idempotente por mpPaymentId).
 * Nunca lança — falhas só vão para log / email_eventos.
 */
export async function enviarSmsAlertaCompra(opcoes: {
  emailCliente: string;
  valor: number | null | undefined;
  mpPaymentId: string;
  tipoCompra?: "assinatura" | "pacote_extra";
}): Promise<{ ok: boolean; motivo?: string }> {
  const cfg = ntfyConfigurado();

  if (!cfg) {
    console.warn(
      "[alerta-compra] NTFY_TOPIC não configurado; alerta push não enviado."
    );
    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "falha",
      destinatario: "ntfy:não-configurado",
      assunto: "Alerta compra (ntfy)",
      erro: "NTFY_TOPIC não configurado",
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        emailCliente: opcoes.emailCliente,
        tipoCompra: opcoes.tipoCompra ?? "assinatura",
        provedor: "ntfy",
      },
    });
    return { ok: false, motivo: "ntfy_ausente" };
  }

  const destinatario = `ntfy:${cfg.topic}`;

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
    `Compra ${tipo} aprovada ${valorTxt}. ` +
    `Cliente: ${opcoes.emailCliente}. ` +
    `Confira /admin/emails. MP:${opcoes.mpPaymentId}`;

  try {
    const url = `${cfg.base}/${encodeURIComponent(cfg.topic)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Title: "FACTO — compra aprovada",
        Priority: "high",
        Tags: "moneybag",
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: body.slice(0, 3900),
    });

    if (!res.ok) {
      const texto = await res.text().catch(() => "");
      const erro = `ntfy HTTP ${res.status}${texto ? `: ${texto.slice(0, 200)}` : ""}`;
      console.error("[alerta-compra] falha ntfy", { status: res.status, erro });
      await registrarEmailEvento({
        tipo: "alerta_sms_compra",
        status: "falha",
        destinatario,
        assunto: "Alerta compra (ntfy)",
        erro,
        metadados: {
          mpPaymentId: opcoes.mpPaymentId,
          emailCliente: opcoes.emailCliente,
          provedor: "ntfy",
        },
      });
      return { ok: false, motivo: "falha_ntfy" };
    }

    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "enviado",
      destinatario,
      assunto: "Alerta compra (ntfy)",
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        emailCliente: opcoes.emailCliente,
        tipoCompra: opcoes.tipoCompra ?? "assinatura",
        provedor: "ntfy",
      },
    });

    console.info("[alerta-compra] ntfy enviado", {
      topic: cfg.topic,
      mpPaymentId: opcoes.mpPaymentId,
    });
    return { ok: true };
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : String(erro);
    console.error("[alerta-compra]", msg);
    await registrarEmailEvento({
      tipo: "alerta_sms_compra",
      status: "falha",
      destinatario,
      assunto: "Alerta compra (ntfy)",
      erro: msg,
      metadados: {
        mpPaymentId: opcoes.mpPaymentId,
        provedor: "ntfy",
      },
    });
    return { ok: false, motivo: "excecao" };
  }
}

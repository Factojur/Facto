import { NextResponse } from "next/server";
import { executarSincronizarCompras } from "@/lib/mercadopago/sincronizar-compras-job";

/**
 * Cron (Vercel Hobby): 1x/dia (15:00 UTC).
 * Hobby: so 1 cron/dia (nao permite a cada 5 min). Use webhook MP + botao admin, ou Pro.
 *
 * Auth: Authorization Bearer CRON_SECRET ou x-cron-secret.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization") ?? "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  } else if (bearer !== secret && headerSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const resultado = await executarSincronizarCompras();
    return NextResponse.json(resultado);
  } catch (erro) {
    console.error("[cron sincronizar-compras]", erro);
    return NextResponse.json(
      { error: erro instanceof Error ? erro.message : String(erro) },
      { status: 500 }
    );
  }
}

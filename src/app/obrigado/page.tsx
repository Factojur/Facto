import Link from "next/link";
import { FactoLogo } from "@/components/brand/facto-logo";

/**
 * Retorno pós-pagamento para visitante (planos estáticos mpago.la).
 * Configure back_url dos planos no Mercado Pago para:
 *   https://factoia.com.br/obrigado
 */
export default function ObrigadoPage() {
  return (
    <div className="relative flex min-h-full items-center justify-center bg-facto-dark px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(144,139,106,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md text-center">
        <FactoLogo variant="stacked" size="md" className="mx-auto" />
        <h1 className="mt-8 text-2xl font-bold text-white">
          Pagamento recebido
        </h1>
        <p className="mt-4 text-stone-400 leading-relaxed">
          Em instantes você recebe no e-mail do pagamento a confirmação e o{" "}
          <strong className="text-stone-200">link para criar sua conta</strong>{" "}
          (noreply@). Use o mesmo e-mail da compra.
        </p>
        <p className="mt-3 text-sm text-stone-500 leading-relaxed">
          Já tinha conta (teste grátis)? Entre com o mesmo e-mail — o plano
          libera automaticamente após a confirmação.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-facto-gold px-6 py-3 text-sm font-semibold text-facto-dark transition hover:bg-[#a39a78]"
          >
            Ir para o login
          </Link>
          <Link
            href="/suporte"
            className="rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-facto-gold/50 hover:bg-white/5"
          >
            Preciso de ajuda
          </Link>
        </div>
        <p className="mt-6 text-xs text-stone-600">
          Não chegou o e-mail? Confira spam e aguarde alguns minutos. Se
          persistir, use o suporte com o e-mail da compra.
        </p>
      </div>
    </div>
  );
}

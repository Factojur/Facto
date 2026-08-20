import Link from "next/link";
import {
  PLANO_JEC,
  PLANO_MENSAL,
  PLANO_TRIAL,
} from "@/lib/planos-facto";

type Props = {
  id?: string;
  /** Peças já usadas no teste (ex.: 2/2). */
  usoLabel?: string | null;
};

/**
 * Banner quando o teste grátis acaba as minutas (não oferece pacote extra).
 */
export function TrialEsgotadoBanner({
  id = "trial-esgotado",
  usoLabel,
}: Props) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-facto-gold/40 bg-gradient-to-br from-amber-50 via-stone-50 to-white shadow-lg shadow-amber-900/10"
    >
      <div className="relative px-5 py-5 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
          Teste concluído
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
          Suas {PLANO_TRIAL.pecasPorMes} minutas de teste acabaram
        </h3>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
          {usoLabel ? `${usoLabel}. ` : ""}
          Para continuar gerando sem marca d’água e com cota mensal, escolha um
          plano. Parte no Juizado → {PLANO_JEC.rotulo}. Advogado com OAB →{" "}
          {PLANO_MENSAL.rotulo} (ou Pro).
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/?aba=comecar#precos"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Ver plano JEC · {PLANO_JEC.rotuloPreco}/mês
          </Link>
          <Link
            href="/?aba=advogado#precos"
            className="inline-flex items-center justify-center rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-amber-50 transition hover:bg-stone-700"
          >
            Ver planos para advogado
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          O export do teste continua com marca d’água. Assinatura ativa remove a
          marca e libera a cota do plano.
        </p>
      </div>
    </section>
  );
}

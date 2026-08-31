import Link from "next/link";

/** Aviso quando Word/PDF estão bloqueados no trial. */
export function ExportacaoTrialUpsell({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950 ${className}`}
    >
      <strong>Teste grátis:</strong> você vê a peça completa aqui. Exportação Word/PDF
      protocolável (timbre e formatação forense) nos{" "}
      <Link href="/dashboard/planos" className="font-semibold underline">
        planos pagos
      </Link>
      . Use <strong>Copiar texto</strong> só para conferência manual.
    </p>
  );
}

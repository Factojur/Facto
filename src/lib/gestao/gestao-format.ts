/** Valores monetários em centavos (inteiro). */

export function formatarMoeda(centavos: number | null | undefined): string {
  if (centavos == null || Number.isNaN(centavos)) return "—";
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function parseMoedaParaCentavos(texto: string): number | null {
  const limpo = texto
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (!limpo) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function formatarPercentual(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(valor)) return "—";
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

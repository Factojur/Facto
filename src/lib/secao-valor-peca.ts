/**
 * Metadados da seção de valor por espécie (título na peça + rótulo no formulário).
 * A formatação forense permanece a mesma; só mudam título e texto do parágrafo.
 */

export type VarianteSecaoValor =
  | "causa"
  | "reconvencao"
  | "contraposto"
  | "reparacao"
  | "beneficio";

export function varianteDaTituloSecao(tituloSecao: string): VarianteSecaoValor {
  const t = tituloSecao.toUpperCase();
  if (t.includes("RECONVEN")) return "reconvencao";
  if (t.includes("CONTRAPOSTO")) return "contraposto";
  if (t.includes("REPARA") || t.includes("INDENIZ")) return "reparacao";
  if (t.includes("BENEF") || t.includes("PEDIDO")) return "beneficio";
  return "causa";
}

export function rotuloFormularioValor(tituloSecao: string): string {
  switch (varianteDaTituloSecao(tituloSecao)) {
    case "reconvencao":
      return "Valor da reconvenção (opcional)";
    case "contraposto":
      return "Valor do pedido contraposto (opcional)";
    case "reparacao":
      return "Valor da reparação / indenização (opcional)";
    case "beneficio":
      return "Valor do pedido / benefício (opcional)";
    default:
      return "Valores da causa (opcional)";
  }
}

export function textoAjudaFormularioValor(tituloSecao: string): string {
  switch (varianteDaTituloSecao(tituloSecao)) {
    case "reconvencao":
      return "Opcional. Se preencher, a soma entra na seção DO VALOR DA RECONVENÇÃO sem alteração.";
    case "contraposto":
      return "Opcional. Se preencher, a soma entra na seção do pedido contraposto sem alteração.";
    case "reparacao":
      return "Opcional. Valor da composição civil dos danos (arts. 72 e 74 da Lei 9.099/95). Se deixar em branco, o sistema usa valores citados nos fatos.";
    case "beneficio":
      return "Opcional. Valor econômico do pedido (competência / custas). Se deixar em branco, o sistema infere dos fatos.";
    default:
      return "Opcional. Se preencher manualmente, a soma entra na peça sem alteração. Se deixar em branco, o sistema usa os valores citados nos fatos.";
  }
}

/** Parágrafo determinístico da seção de valor (sem discriminar itens). */
export function fraseValorSecao(
  tituloSecao: string,
  totalFormatado?: string,
  totalPorExtenso?: string
): string {
  const variante = varianteDaTituloSecao(tituloSecao);
  const sujeito =
    variante === "reconvencao"
      ? "reconvenção"
      : variante === "contraposto"
        ? "pedido contraposto"
        : variante === "reparacao"
          ? "reparação civil dos danos"
          : variante === "beneficio"
            ? "pedido"
            : "causa";
  const placeholder =
    variante === "reconvencao"
      ? "[VALOR DA RECONVENÇÃO]"
      : variante === "contraposto"
        ? "[VALOR DO PEDIDO CONTRAPOSTO]"
        : variante === "reparacao"
          ? "[VALOR DA REPARAÇÃO]"
          : variante === "beneficio"
            ? "[VALOR DO PEDIDO]"
            : "[VALOR DA CAUSA]";
  const finalidade =
    variante === "reparacao"
      ? "para fins de homologação e execução do acordo"
      : variante === "beneficio"
        ? "para fins de alçada e custas"
        : variante === "reconvencao" || variante === "contraposto"
          ? "para fins de alçada e custas"
          : "para fins de alçada e competência";

  if (!totalFormatado || !totalPorExtenso) {
    return `Dá-se à ${sujeito} o valor de R$ ${placeholder} ([valor por extenso]), ${finalidade}.`;
  }
  return `Dá-se à ${sujeito} o valor de ${totalFormatado} (${totalPorExtenso}), ${finalidade}.`;
}

export const RE_TITULO_SECAO_VALOR =
  /DO VALOR (?:DA CAUSA|DA RECONVENÇÃO|DO PEDIDO CONTRAPOSTO|DA REPARAÇÃO|DO PEDIDO)/i;

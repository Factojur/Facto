/**
 * Cálculo exato de valores monetários para a peça (Danos Materiais e Danos
 * Morais). Tudo é somado em centavos (inteiros) para nunca sofrer com
 * imprecisão de ponto flutuante — a IA nunca recalcula esses números, apenas
 * recebe o resultado já pronto.
 */

export type ItemValor = {
  id: string;
  descricao: string;
  valor: string;
};

export type CategoriaValorId = "danosMateriais" | "danosMorais";

export const CATEGORIAS_VALOR: { id: CategoriaValorId; label: string }[] = [
  { id: "danosMateriais", label: "Danos Materiais e/ou Restituições" },
  { id: "danosMorais", label: "Danos Morais" },
];

export function itemValorVazio(): ItemValor {
  return {
    id: Math.random().toString(36).slice(2),
    descricao: "",
    valor: "",
  };
}

/** Converte "1.234,56", "1234,56", "1234.56" ou "1234" em centavos (inteiro). */
export function centavosDeTexto(valorTexto: string): number {
  const limpo = valorTexto.trim();
  if (!limpo) return 0;

  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;

  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) return 0;

  return Math.round(numero * 100);
}

export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function somarItens(itens: ItemValor[]): number {
  return itens.reduce((total, item) => total + centavosDeTexto(item.valor), 0);
}

export type ResumoValorCausa = {
  categorias: {
    id: CategoriaValorId;
    label: string;
    itens: { descricao: string; centavos: number }[];
    subtotalCentavos: number;
  }[];
  totalCentavos: number;
  totalFormatado: string;
  totalPorExtenso: string;
};

export function calcularResumoValorCausa(
  itensPorCategoria: Record<CategoriaValorId, ItemValor[]>
): ResumoValorCausa {
  const categorias = CATEGORIAS_VALOR.map(({ id, label }) => {
    const itensBrutos = itensPorCategoria[id] ?? [];
    const itens = itensBrutos
      .filter((i) => i.descricao.trim() || i.valor.trim())
      .map((i) => ({
        descricao: i.descricao.trim() || "Item sem descrição",
        centavos: centavosDeTexto(i.valor),
      }));
    const subtotalCentavos = itens.reduce((s, i) => s + i.centavos, 0);
    return { id, label, itens, subtotalCentavos };
  });

  const totalCentavos = categorias.reduce((s, c) => s + c.subtotalCentavos, 0);

  return {
    categorias,
    totalCentavos,
    totalFormatado: formatarCentavos(totalCentavos),
    totalPorExtenso: valorPorExtenso(totalCentavos),
  };
}

const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];
const DEZ_A_DEZENOVE = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function centenaPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];

  if (c > 0) partes.push(CENTENAS[c]);

  if (resto > 0) {
    let parteResto: string;
    if (resto < 10) parteResto = UNIDADES[resto];
    else if (resto < 20) parteResto = DEZ_A_DEZENOVE[resto - 10];
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      parteResto = u === 0 ? DEZENAS[d] : `${DEZENAS[d]} e ${UNIDADES[u]}`;
    }
    partes.push(partes.length ? `e ${parteResto}` : parteResto);
  }

  return partes.join(" ");
}

const ESCALAS = [
  { valor: 1_000_000_000, singular: "bilhão", plural: "bilhões" },
  { valor: 1_000_000, singular: "milhão", plural: "milhões" },
  { valor: 1_000, singular: "mil", plural: "mil" },
] as const;

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";

  let resto = n;
  const grupos: { qtd: number; escala: (typeof ESCALAS)[number] | null }[] = [];

  for (const escala of ESCALAS) {
    const qtd = Math.floor(resto / escala.valor);
    if (qtd > 0) {
      grupos.push({ qtd, escala });
      resto -= qtd * escala.valor;
    }
  }
  if (resto > 0 || grupos.length === 0) {
    grupos.push({ qtd: resto, escala: null });
  }

  const palavras = grupos.map(({ qtd, escala }) => {
    if (!escala) return centenaPorExtenso(qtd);
    if (escala.valor === 1_000) {
      return qtd === 1 ? "mil" : `${centenaPorExtenso(qtd)} mil`;
    }
    return `${centenaPorExtenso(qtd)} ${qtd === 1 ? escala.singular : escala.plural}`;
  });

  if (palavras.length === 1) return palavras[0];

  const ultimo = grupos[grupos.length - 1];
  const usaE =
    !ultimo.escala || (ultimo.qtd < 100 && ultimo.qtd > 0) || ultimo.qtd % 100 === 0;

  const cabeca = palavras.slice(0, -1).join(", ");
  const cauda = palavras[palavras.length - 1];

  return usaE ? `${cabeca} e ${cauda}` : `${cabeca}, ${cauda}`;
}

/** Escreve um valor em reais (a partir de centavos) por extenso, em português. */
export function valorPorExtenso(centavos: number): string {
  const reais = Math.floor(Math.abs(centavos) / 100);
  const centavosResto = Math.abs(centavos) % 100;

  const partesReais = reais > 0
    ? `${inteiroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`
    : "";
  const partesCentavos = centavosResto > 0
    ? `${inteiroPorExtenso(centavosResto)} ${centavosResto === 1 ? "centavo" : "centavos"}`
    : "";

  if (partesReais && partesCentavos) return `${partesReais} e ${partesCentavos}`;
  if (partesReais) return partesReais;
  if (partesCentavos) return partesCentavos;
  return "zero reais";
}

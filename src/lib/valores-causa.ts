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

const RE_MOEDA =
  /R\$\s*([\d.]+,\d{2}|\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2}|\d+)/gi;

function contextoAoRedor(texto: string, inicio: number, fim: number): string {
  return texto.slice(Math.max(0, inicio - 80), Math.min(texto.length, fim + 80));
}

/**
 * Infere valor da causa a partir do relato quando o formulário não preencheu.
 * Heurística: danos materiais + danos morais; ou "valor da causa"; sem inventar.
 */
export function inferirResumoValorCausaDosFatos(
  fatos: string
): ResumoValorCausa | null {
  const texto = fatos.replace(/\s+/g, " ").trim();
  if (!texto) return null;

  let materiais = 0;
  let morais = 0;
  let valorCausaExplicito = 0;

  let m: RegExpExecArray | null;
  RE_MOEDA.lastIndex = 0;
  while ((m = RE_MOEDA.exec(texto)) !== null) {
    const centavos = centavosDeTexto(m[1] ?? "");
    if (centavos <= 0) continue;
    const ini = m.index;
    const fim = m.index + m[0].length;
    const perto = texto.slice(Math.max(0, ini - 40), Math.min(texto.length, fim + 50)).toLowerCase();
    const ctx = contextoAoRedor(texto, ini, fim).toLowerCase();

    if (/valor\s+da\s+causa|d[aá]-se\s+[aà]\s+causa|al[cç]ada/.test(perto) ||
        /valor\s+da\s+causa|d[aá]-se\s+[aà]\s+causa/.test(ctx)) {
      valorCausaExplicito = Math.max(valorCausaExplicito, centavos);
      continue;
    }

    const moralPerto = /dano\s*moral|danos\s*morais/.test(perto);
    const materialPerto =
      /dano\s*material|danos\s*materiais|restitui[cç][aã]o|preju[ií]zo|totalizando|montante/.test(
        perto
      );

    if (moralPerto && !materialPerto) {
      morais = Math.max(morais, centavos);
      continue;
    }
    if (materialPerto && !moralPerto) {
      materiais = Math.max(materiais, centavos);
      continue;
    }
    if (moralPerto && materialPerto) {
      // Ambíguo no mesmo trecho: o maior tipicamente é material se >= 5k e houver outro valor
      if (centavos >= 500_000) materiais = Math.max(materiais, centavos);
      else morais = Math.max(morais, centavos);
      continue;
    }

    if (/dano\s*moral|danos\s*morais/.test(ctx)) {
      morais = Math.max(morais, centavos);
      continue;
    }
    if (
      /dano\s*material|danos\s*materiais|restitui|preju[ií]zo|montante|totalizando/.test(
        ctx
      ) &&
      (centavos >= 300_000 || /total|montante|soma|restitui|preju[ií]zo/.test(ctx))
    ) {
      materiais = Math.max(materiais, centavos);
    }
  }

  let total = 0;
  const categorias: ResumoValorCausa["categorias"] = [];

  if (valorCausaExplicito > 0 && materiais === 0 && morais === 0) {
    total = valorCausaExplicito;
    categorias.push({
      id: "danosMateriais",
      label: "Danos Materiais e/ou Restituições",
      itens: [{ descricao: "Valor da causa (inferido do relato)", centavos: total }],
      subtotalCentavos: total,
    });
    categorias.push({
      id: "danosMorais",
      label: "Danos Morais",
      itens: [],
      subtotalCentavos: 0,
    });
  } else {
    if (materiais > 0) {
      categorias.push({
        id: "danosMateriais",
        label: "Danos Materiais e/ou Restituições",
        itens: [{ descricao: "Valor inferido do relato", centavos: materiais }],
        subtotalCentavos: materiais,
      });
      total += materiais;
    } else {
      categorias.push({
        id: "danosMateriais",
        label: "Danos Materiais e/ou Restituições",
        itens: [],
        subtotalCentavos: 0,
      });
    }
    if (morais > 0) {
      categorias.push({
        id: "danosMorais",
        label: "Danos Morais",
        itens: [{ descricao: "Valor inferido do relato", centavos: morais }],
        subtotalCentavos: morais,
      });
      total += morais;
    } else {
      categorias.push({
        id: "danosMorais",
        label: "Danos Morais",
        itens: [],
        subtotalCentavos: 0,
      });
    }
  }

  if (total <= 0) return null;

  return {
    categorias,
    totalCentavos: total,
    totalFormatado: formatarCentavos(total),
    totalPorExtenso: valorPorExtenso(total),
  };
}

/** Converte centavos para campo R$ do formulário. */
export function centavosParaCampoValor(centavos: number): string {
  if (centavos <= 0) return "";
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Aplica resumo inferido aos itens editáveis do formulário. */
export function resumoInferidoParaFormulario(
  resumo: ResumoValorCausa
): Record<CategoriaValorId, ItemValor[]> {
  const out: Record<CategoriaValorId, ItemValor[]> = {
    danosMateriais: [],
    danosMorais: [],
  };
  for (const cat of resumo.categorias) {
    out[cat.id] = cat.itens
      .filter((i) => i.centavos > 0)
      .map((i) => ({
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `item-${Math.random().toString(36).slice(2)}`,
        descricao: i.descricao,
        valor: centavosParaCampoValor(i.centavos),
      }));
  }
  return out;
}

export function formularioValoresEstaVazio(
  itens: Record<CategoriaValorId, ItemValor[]>
): boolean {
  return CATEGORIAS_VALOR.every(({ id }) => {
    const lista = itens[id] ?? [];
    return lista.every((i) => !i.descricao.trim() && !i.valor.trim());
  });
}

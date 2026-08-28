/**
 * Referência de honorários para negociação — não é tabela OAB oficial
 * nem recomendação vinculante. Sem fluxo de caixa / recebimentos.
 */

export type FaixaHonorarioSugerido = {
  minimoCentavos: number;
  sugeridoCentavos: number;
  maximoCentavos: number;
  nota: string;
};

function areaNormalizada(area: string): string {
  return area
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function faixaFixa(
  min: number,
  sug: number,
  max: number,
  nota: string
): FaixaHonorarioSugerido {
  return {
    minimoCentavos: min,
    sugeridoCentavos: sug,
    maximoCentavos: max,
    nota,
  };
}

function faixaPercentual(
  valorCausaCentavos: number,
  minPct: number,
  sugPct: number,
  maxPct: number,
  pisoCentavos: number,
  nota: string
): FaixaHonorarioSugerido {
  const calc = (pct: number) =>
    Math.max(pisoCentavos, Math.round((valorCausaCentavos * pct) / 100));
  return {
    minimoCentavos: calc(minPct),
    sugeridoCentavos: calc(sugPct),
    maximoCentavos: calc(maxPct),
    nota,
  };
}

export function sugerirHonorario(params: {
  area: string;
  valorCausaCentavos: number | null;
}): FaixaHonorarioSugerido {
  const area = areaNormalizada(params.area);
  const causa = params.valorCausaCentavos ?? 0;

  if (area.includes("trabalh")) {
    if (causa > 0) {
      return faixaPercentual(
        causa,
        10,
        20,
        30,
        250_000,
        "Trabalhista: referência usual de 10–30% sobre o proveito econômico ou valor da causa — ajuste ao risco e fase."
      );
    }
    return faixaFixa(
      200_000,
      350_000,
      600_000,
      "Trabalhista sem valor da causa: faixa fixa típica para reclamação / defesa em 1ª instância."
    );
  }

  if (area.includes("penal") || area.includes("criminal")) {
    return faixaFixa(
      3_000_00,
      6_000_00,
      15_000_00,
      "Penal: honorários por fase (defesa preliminar, instrução, recursos) — valor de referência por atuação."
    );
  }

  if (area.includes("famil")) {
    return faixaFixa(
      2_000_00,
      4_500_00,
      9_000_00,
      "Família: alimentos, guarda e divórcio costumam ter honorários fixos ou por etapa."
    );
  }

  if (area.includes("consumidor") || area.includes("jec")) {
    if (causa > 0 && causa <= 200_000_0) {
      return faixaFixa(
        800_00,
        1_500_00,
        3_000_00,
        "Demandas de menor complexidade / Juizado: honorários moderados em relação ao teto."
      );
    }
    if (causa > 0) {
      return faixaPercentual(
        causa,
        8,
        12,
        18,
        1_500_00,
        "Consumidor com valor relevante: percentual sobre a causa com piso de referência."
      );
    }
    return faixaFixa(800_00, 1_500_00, 3_500_00, "Consumidor sem valor informado.");
  }

  if (area.includes("tribut")) {
    return faixaFixa(
      4_000_00,
      8_000_00,
      20_000_00,
      "Tributário: complexidade e risco fiscal elevam a faixa — negocie por fase."
    );
  }

  if (causa > 0) {
    return faixaPercentual(
      causa,
      8,
      15,
      22,
      2_000_00,
      "Cível e demais áreas: referência de 8–22% sobre o valor da causa (art. 85 CPC como parâmetro de mercado)."
    );
  }

  return faixaFixa(
    2_000_00,
    4_000_00,
    10_000_00,
    "Informe o valor da causa para uma sugestão mais precisa."
  );
}

export function calcularHonorarioContratado(processo: {
  honorarioTipo: string;
  honorarioValorCentavos: number | null;
  honorarioPercentual: number | null;
  valorCausaCentavos: number | null;
}): number | null {
  if (processo.honorarioTipo === "pro_bono") return 0;
  if (processo.honorarioTipo === "a_definir") return null;
  if (processo.honorarioTipo === "fixo" || processo.honorarioTipo === "mensal") {
    return processo.honorarioValorCentavos;
  }
  if (processo.honorarioTipo === "percentual" && processo.valorCausaCentavos != null) {
    const pct = processo.honorarioPercentual ?? 0;
    return Math.round((processo.valorCausaCentavos * pct) / 100);
  }
  return processo.honorarioValorCentavos;
}

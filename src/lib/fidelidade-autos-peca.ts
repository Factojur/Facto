/**
 * Fidelidade aos autos na redação — 0 tokens.
 * Extrai sinais rígidos (filho/filha, etc.) e corrige generalização masculina.
 */

export type SinaisFidelidadeAutos = {
  filha: boolean;
  filho: boolean;
  /** Só um dos sexos aparece nos autos → força o gênero na peça. */
  soFilha: boolean;
  soFilho: boolean;
};

export function extrairSinaisFidelidadeAutos(
  texto: string | null | undefined
): SinaisFidelidadeAutos {
  // "não filho" / "não filha" no relato de calibração não conta como presença.
  const t = String(texto ?? "")
    .replace(/\bn[aã]o\s+filh[oa]s?\b/gi, " ")
    .replace(/\bfilh[oa]s?\s*\(\s*n[aã]o\s+filh[oa]s?\s*\)/gi, " ");
  const filha = /\bfilhas?\b/i.test(t);
  const filho = /\bfilhos?\b/i.test(t);
  return {
    filha,
    filho,
    soFilha: filha && !filho,
    soFilho: filho && !filha,
  };
}

/** Bloco curto para o system/user da redação. */
export function blocoPromptFidelidadeAutos(
  sinais: SinaisFidelidadeAutos
): string | null {
  if (sinais.soFilha) {
    return [
      "FIDELIDADE AOS AUTOS (obrigatório):",
      "- Nos autos há FILHA (não filho). Use filha / a menor / alimentanda — NUNCA generalize para filho/o menor/alimentando.",
      "- Não invente irmão, sexo diverso nem percentual de alimentos sem lastro nos autos ou na base.",
    ].join("\n");
  }
  if (sinais.soFilho) {
    return [
      "FIDELIDADE AOS AUTOS (obrigatório):",
      "- Nos autos há FILHO (não filha). Use filho / o menor / alimentando — NUNCA generalize para filha/a menor/alimentanda.",
      "- Não invente irmã, sexo diverso nem percentual de alimentos sem lastro nos autos ou na base.",
    ].join("\n");
  }
  if (sinais.filha && sinais.filho) {
    return [
      "FIDELIDADE AOS AUTOS (obrigatório):",
      "- Há filho e filha nos autos — preserve cada um no gênero correto; não colapse tudo no masculino.",
    ].join("\n");
  }
  return null;
}

/**
 * Corrige generalização masculina quando os autos só trazem filha (e vice-versa).
 * Cirúrgico: não altera "filho" em abstrato de doutrina sem artigo definido.
 */
export function aplicarFidelidadeGeneroParentesco(
  peca: string,
  sinais: SinaisFidelidadeAutos
): string {
  if (sinais.soFilha) {
    return peca
      .replace(/\bo\s+filho\b/gi, "a filha")
      .replace(/\bdo\s+filho\b/gi, "da filha")
      .replace(/\bao\s+filho\b/gi, "à filha")
      .replace(/\bno\s+filho\b/gi, "na filha")
      .replace(/\bpelo\s+filho\b/gi, "pela filha")
      .replace(/\bfilho\s+menor\b/gi, "filha menor")
      .replace(/\bo\s+menor\b/gi, "a menor")
      .replace(/\bdo\s+menor\b/gi, "da menor")
      .replace(/\bao\s+menor\b/gi, "à menor")
      .replace(/\bno\s+menor\b/gi, "na menor")
      .replace(/\bpelo\s+menor\b/gi, "pela menor")
      .replace(/\balimentando\b/gi, "alimentanda")
      .replace(
        /\b(alimentos?\s+(?:devidos?\s+)?(?:ao|do|para\s+o)\s+)filho\b/gi,
        "$1filha"
      );
  }
  if (sinais.soFilho) {
    return peca
      .replace(/\ba\s+filha\b/gi, "o filho")
      .replace(/\bda\s+filha\b/gi, "do filho")
      .replace(/\bà\s+filha\b/gi, "ao filho")
      .replace(/\bna\s+filha\b/gi, "no filho")
      .replace(/\bpela\s+filha\b/gi, "pelo filho")
      .replace(/\bfilha\s+menor\b/gi, "filho menor")
      .replace(/\ba\s+menor\b/gi, "o menor")
      .replace(/\bda\s+menor\b/gi, "do menor")
      .replace(/\bà\s+menor\b/gi, "ao menor")
      .replace(/\bna\s+menor\b/gi, "no menor")
      .replace(/\bpela\s+menor\b/gi, "pelo menor")
      .replace(/\balimentanda\b/gi, "alimentando")
      .replace(
        /\b(alimentos?\s+(?:devidos?\s+)?(?:à|da|para\s+a)\s+)filha\b/gi,
        "$1filho"
      );
  }
  return peca;
}

/**
 * Autos já trazem especialidade explícita da vara?
 * Ex.: "1ª Vara Cível", "Vara de Família" — sem isso, não inventar no texto.
 */
export function autosTemEspecialidadeVara(
  texto: string | null | undefined
): boolean {
  const t = String(texto ?? "");
  return (
    /\b\d{1,3}\s*[ªºo°]?\s*vara\s+(?:c[ií]vel|criminal|federal|da\s+fazenda|do\s+trabalho|de\s+fam[ií]lia)/i.test(
      t
    ) ||
    /\bvara\s+(?:c[ií]vel|criminal|federal|da\s+fazenda|do\s+trabalho|de\s+fam[ií]lia)\b/i.test(
      t
    ) ||
    /\bjuizado\s+especial\s+(?:c[ií]vel|criminal|federal)\b/i.test(t)
  );
}

/**
 * Remove especialidade inventada ("1ª Vara Cível") quando os autos só dizem "1ª Vara".
 * Não altera Juizado Especial Cível / Justiça do Trabalho (órgãos, não especialidade vazada).
 */
export function aplicarFidelidadeEspecialidadeVara(
  peca: string,
  fatos: string | null | undefined
): string {
  if (autosTemEspecialidadeVara(fatos)) return peca;
  return peca
    .replace(
      /(\d{1,3}\s*[ªºo°]?\s*VARA)\s+C[IÍ]VEL\b/gi,
      "$1"
    )
    .replace(
      /(\d{1,3}\s*[ªºo°]?\s*VARA)\s+DE\s+FAM[IÍ]LIA(?:\s+E\s+SUCESS[OÕ]ES)?\b/gi,
      "$1"
    )
    .replace(
      /(\d{1,3}\s*[ªºo°]?\s*VARA)\s+CRIMINAL\b/gi,
      "$1"
    )
    .replace(
      /\bDA\s+(\d{1,3})\s*[ªºo°]?\s*VARA\s+C[IÍ]VEL\b/gi,
      "DA $1ª VARA"
    );
}

/** Placeholders de valor que a IA deixa ilegíveis para protocolo. */
export function limparPlaceholdersValorCausa(texto: string): string {
  return texto
    .replace(
      /R\$\s*\(\s*\[?[^\])\n]{0,80}(?:valor|extenso)[^\])\n]{0,40}\]?\s*\)/gi,
      "R$ …"
    )
    .replace(/R\$\s*\(\s*__+\s*\)/gi, "R$ …")
    .replace(/\[\s*valor\s+(?:da\s+causa|por\s+extenso)[^\]]*\]/gi, "…")
    .replace(/\(\s*valor\s+por\s+extenso\s*\)/gi, "…");
}

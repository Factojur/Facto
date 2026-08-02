/**
 * Parse e formatação de OAB no padrão FACTO: OAB/UF 147099
 * Aceita entradas como SP147099, SP 147099, SP-147099, 147099/SP, OAB/SP 147099.
 */

const UFS_VALIDAS = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

export type OabParseada = {
  uf: string;
  numero: string;
};

/** Extrai UF + número de uma OAB digitada pelo usuário. */
export function parseOabBruta(raw: string): OabParseada | null {
  if (!raw?.trim()) return null;

  const compacto = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^OAB[:\/]?/, "");

  // SP147099 | SP-147099 | SP/147099
  let m = compacto.match(/^([A-Z]{2})[/\-]?(\d{4,8})$/);
  if (m && UFS_VALIDAS.has(m[1]!)) {
    return { uf: m[1]!, numero: m[2]! };
  }

  // 147099SP | 147099/SP | 147099-SP
  m = compacto.match(/^(\d{4,8})[/\-]?([A-Z]{2})$/);
  if (m && UFS_VALIDAS.has(m[2]!)) {
    return { uf: m[2]!, numero: m[1]! };
  }

  return null;
}

/**
 * Formata para assinatura forense: "OAB/SP 147099".
 * Se só houver número, usa ufFallback (ex.: UF da comarca).
 */
export function formatarOabAssinatura(
  raw?: string | null,
  ufFallback?: string | null
): string {
  const parsed = parseOabBruta(raw ?? "");
  if (parsed) {
    return `OAB/${parsed.uf} ${parsed.numero}`;
  }

  const numero = (raw ?? "").replace(/\D/g, "");
  const uf = ufFallback?.trim().toUpperCase();
  if (uf && UFS_VALIDAS.has(uf) && numero) {
    return `OAB/${uf} ${numero}`;
  }
  if (numero) {
    return `OAB/[UF] ${numero}`;
  }
  return "OAB/[UF] [Número]";
}

/** Só o número (dígitos), para validação mock / comparação. */
export function somenteNumeroOab(raw: string): string {
  const parsed = parseOabBruta(raw);
  if (parsed) return parsed.numero;
  return raw.replace(/\D/g, "");
}

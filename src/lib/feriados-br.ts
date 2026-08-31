/**
 * Feriados nacionais (Brasil) + estaduais comuns (SP como referência).
 * Usado na estimativa de prazo — não substitui contagem oficial do tribunal.
 */

function chaveData(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Domingo de Páscoa (Meeus/Jones/Butcher). */
function pascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes, dia, 12, 0, 0);
}

function addDias(base: Date, n: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

function feriadosNacionais(ano: number): Set<string> {
  const p = pascoa(ano);
  const fixos = [
    `${ano}-01-01`,
    `${ano}-04-21`,
    `${ano}-05-01`,
    `${ano}-09-07`,
    `${ano}-10-12`,
    `${ano}-11-02`,
    `${ano}-11-15`,
    `${ano}-11-20`,
    `${ano}-12-25`,
  ];
  const moveis = [
    chaveData(addDias(p, -48)), // segunda Carnaval (aprox.)
    chaveData(addDias(p, -47)),
    chaveData(addDias(p, -2)), // Sexta-feira Santa
    chaveData(p),
    chaveData(addDias(p, 60)), // Corpus Christi
  ];
  return new Set([...fixos, ...moveis]);
}

/** Feriados estaduais mais usados no produto (SP + RJ + MG). */
function feriadosEstaduais(ano: number, uf?: string): Set<string> {
  const u = (uf ?? "").trim().toUpperCase();
  const out = new Set<string>();
  if (u === "SP") {
    out.add(`${ano}-07-09`); // Revolução Constitucionalista
    out.add(`${ano}-11-20`); // já nacional desde 2024
  }
  if (u === "RJ") {
    out.add(`${ano}-04-23`); // São Jorge
    out.add(`${ano}-11-20`);
  }
  if (u === "MG") {
    out.add(`${ano}-04-21`); // Tiradentes (também nacional)
  }
  return out;
}

const cache = new Map<string, Set<string>>();

function setFeriadosAno(ano: number, uf?: string): Set<string> {
  const key = `${ano}:${uf ?? "BR"}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const merged = new Set([
    ...feriadosNacionais(ano),
    ...feriadosEstaduais(ano, uf),
  ]);
  cache.set(key, merged);
  return merged;
}

export function ehFeriadoBr(data: Date, uf?: string): boolean {
  const dow = data.getDay();
  if (dow === 0 || dow === 6) return true;
  const set = setFeriadosAno(data.getFullYear(), uf);
  return set.has(chaveData(data));
}

export function ehDiaUtilBr(data: Date, uf?: string): boolean {
  return !ehFeriadoBr(data, uf);
}

/** Soma dias úteis excluindo sáb/dom e feriados nacionais (+ UF quando informada). */
export function somarDiasUteisComFeriados(
  inicio: Date,
  dias: number,
  uf?: string
): Date {
  const cur = new Date(inicio.getTime());
  let restantes = dias;
  while (restantes > 0) {
    cur.setDate(cur.getDate() + 1);
    if (ehDiaUtilBr(cur, uf)) restantes -= 1;
  }
  return cur;
}

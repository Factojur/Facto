/**
 * Estimativa de prazo a partir de data no relato + espécie da peça.
 * Dias úteis: seg–sex + feriados nacionais (e estaduais quando UF informada).
 * Contagem especial do tribunal não entra — conferir no processo.
 */

import {
  somarDiasUteisComFeriados,
} from "@/lib/feriados-br";

const DATA_BR = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g;

const GATILHOS_PRAZO =
  /intimad[oa]|intima[cç][aã]o|publicad[oa]|publica[cç][aã]o|cita[cç][aã]o|citad[oa]|disponibiliza[cç][aã]o|decis[aã]o|senten[cç]a|despacho/i;

/** Dias úteis típicos por espécie (conferir no caso concreto). */
const PRAZO_DIAS_UTEIS: Record<string, number> = {
  contestacao: 15,
  "pedido-contraposto": 15,
  replica: 15,
  "recurso-inominado": 10,
  "contrarrazoes-inominado": 10,
  "agravo-instrumento": 15,
  embargos: 5,
  "resposta-acusacao": 10,
  "defesa-preliminar": 10,
  apelacao: 15,
  "contrarrazoes-apelacao": 15,
};

function parseDataBr(d: string, m: string, a: string): Date | null {
  const dia = Number(d);
  const mes = Number(m) - 1;
  let ano = Number(a);
  if (ano < 100) ano += 2000;
  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano))
    return null;
  const dt = new Date(ano, mes, dia, 12, 0, 0);
  if (
    dt.getFullYear() !== ano ||
    dt.getMonth() !== mes ||
    dt.getDate() !== dia
  ) {
    return null;
  }
  return dt;
}

function formatarDataBr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}


/** Última data próxima de gatilho de prazo no texto. */
export function extrairDataReferenciaPrazo(texto: string): Date | null {
  const t = texto.replace(/\s+/g, " ");
  let melhor: Date | null = null;
  let m: RegExpExecArray | null;
  const re = new RegExp(DATA_BR.source, "g");
  while ((m = re.exec(t)) !== null) {
    const idx = m.index;
    const contexto = t.slice(Math.max(0, idx - 80), idx + 40);
    if (!GATILHOS_PRAZO.test(contexto)) continue;
    const dt = parseDataBr(m[1], m[2], m[3]);
    if (!dt) continue;
    if (!melhor || dt > melhor) melhor = dt;
  }
  return melhor;
}

export type DicaPrazo = {
  dataReferencia: string;
  dataLimite: string;
  diasUteis: number;
  aviso: string;
};

/** Extrai UF de texto tipo "Campinas/SP" ou "Comarca de São Paulo - SP". */
export function extrairUfDoTexto(texto: string): string | undefined {
  const m = texto.match(/\b([A-Za-z]{2})\s*$/i) ?? texto.match(/[-–/]\s*([A-Za-z]{2})\b/i);
  const uf = m?.[1]?.trim().toUpperCase();
  if (!uf || !/^[A-Z]{2}$/.test(uf)) return undefined;
  return uf;
}

export function sugerirPrazoDaPeca(params: {
  fatos: string;
  especiePeca: string;
  foro?: string;
  uf?: string;
}): DicaPrazo | null {
  const dias = PRAZO_DIAS_UTEIS[params.especiePeca];
  if (!dias) return null;
  const ref = extrairDataReferenciaPrazo(params.fatos);
  if (!ref) return null;
  const uf =
    params.uf?.trim().toUpperCase() ||
    extrairUfDoTexto(params.foro ?? "") ||
    extrairUfDoTexto(params.fatos);
  const limite = somarDiasUteisComFeriados(ref, dias, uf);
  const ufTxt = uf ? ` (feriados nacionais + ${uf})` : " (feriados nacionais)";
  return {
    dataReferencia: formatarDataBr(ref),
    dataLimite: formatarDataBr(limite),
    diasUteis: dias,
    aviso: `Com base em ${formatarDataBr(ref)} no relato: prazo estimado até ${formatarDataBr(limite)} (${dias} dias úteis${ufTxt}). Contagem especial do tribunal não entra — confira no processo.`,
  };
}

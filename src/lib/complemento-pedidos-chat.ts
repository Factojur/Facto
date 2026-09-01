/**
 * Complementos curtos no chat — pedidos novos sem requalificar partes.
 */

import { extrairPedidosDoRelato } from "@/lib/organizar-caso-local";
import { inferirEspecieDaArea } from "@/lib/peca-especie-area";

function norm(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

/** Turno curto que só acrescenta pedido — não deve ir para qualificação/fatos. */
export function pareceComplementoSomentePedidos(
  texto: string,
  casoJaOrganizado: boolean
): boolean {
  if (!casoJaOrganizado) return false;
  const t = texto.trim();
  if (t.length < 8 || t.length > 320) return false;

  const n = norm(t);
  const pedeAlgo =
    /\b(tamb[eé]m|inclu(a|ir)|quero|pede|acrescente|adiciona|coloca)\b/.test(
      n
    ) &&
    /\b(pedido|multa|astreintes|tutela|danos|justi[cç]a\s+gratuita|liminar|restabelec|indeniza|obriga[cç][aã]o|proced[eê]ncia)\b/.test(
      n
    );

  const narraFatoNovo =
    /\b(no dia|em \d{2}\/\d{2}|foi preso|contrato|sou\s+[a-z]|cpf\s*\d|r[eé]u\s+[a-z]|cliente\s+[a-z]{3,})\b/i.test(
      t
    );

  return pedeAlgo && !narraFatoNovo;
}

export function extrairPedidosComplemento(
  texto: string,
  areaId: string,
  tipoAcao: string,
  fatos: string
): string[] {
  const especie =
    inferirEspecieDaArea(areaId, tipoAcao || "Petição", fatos, null) ||
    "peticao-inicial";
  const doRelato = extrairPedidosDoRelato(texto, especie);
  const extras: string[] = [];

  const n = norm(texto);
  if (/multa\s+di[aá]ria|astreintes/.test(n)) {
    extras.push(
      "Fixação de multa diária (astreintes) em caso de descumprimento"
    );
  }
  if (/\binvers[aã]o\s+do\s+onus\b/.test(n)) {
    extras.push("Inversão do ônus da prova");
  }
  if (/\bjusti[cç]a\s+gratuita\b|\bgratuidade\b/.test(n)) {
    extras.push("Concessão dos benefícios da justiça gratuita");
  }

  const merged = [...doRelato, ...extras];
  const unicos: string[] = [];
  for (const p of merged) {
    const t = p.trim();
    if (!t) continue;
    if (!unicos.some((u) => norm(u) === norm(t))) unicos.push(t);
  }
  return unicos;
}

export function mesclarPedidosEstado(
  atuais: string[],
  novos: string[]
): string[] {
  const out = [...atuais.filter(Boolean)];
  for (const p of novos) {
    const t = p.trim();
    if (!t) continue;
    if (!out.some((u) => norm(u) === norm(t))) out.push(t);
  }
  return out;
}

/**
 * Critérios FACTO: quando anexar vs quando redigir a peça no preview.
 */

import type { EstadoCasoChat } from "@/lib/chat-minuta";

/** Pedido explícito de minuta (modo planejado / reforço). */
export function pedidoExplicitoRedacao(texto: string): boolean {
  return /\b(redij|elabore|escreva|fa[cç]a|gere|gerar|monte|prepare|minuta|pe[cç]a|peti[cç][aã]o|contest|agravo|embargos|recurso\s+inominado|habeas|mandado\s+de\s+seguran[cç]a)\b/i.test(
    texto.trim()
  );
}

/**
 * Confirmação de que o advogado já mudou o toggle Chat→Minuta
 * (ex.: "já alterei", "já estou no minuta") — deve disparar redação real.
 */
export function confirmouModoMinuta(texto: string): boolean {
  const t = texto.trim();
  if (!t || t.length > 160) return false;
  return (
    /\b(j[aá]\s+(alterei|mudei|troquei|selecionei|estive|estou)|alterei\s+(para\s+)?(o\s+)?modo|mudei\s+para\s+(o\s+)?minuta|modo\s+minuta\s+(ligado|ativo)|pronto\s*,?\s*pode\s+(gerar|redig))\b/i.test(
      t
    ) || /^j[aá]\s+alterei\.?$/i.test(t)
  );
}

/**
 * Lastro mínimo para uma peça “completa” no preview:
 * relato/OCR útil — limiar mais baixo se parecer documento ou já houver partes/processo/espécie.
 */
export function casoTemLastroMinimoParaPeca(estado: EstadoCasoChat): boolean {
  const bruto = estado.fatos;
  const fatos = bruto.replace(/\s+/g, " ").trim();
  if (fatos.length < 80) return false;

  const pareceDocumento =
    /---\s*p[aá]gina\s+\d+/i.test(bruto) ||
    /\[documento:|fls\.?\s*\d+|processo\s+n[ºo°.]/i.test(bruto) ||
    /excelent[ií]ssim|ju[ií]zo|vara\s|tribunal/i.test(bruto);

  const temParte =
    estado.autoresNomes.some((n) => n.trim().length >= 2) ||
    estado.reusNomes.some((n) => n.trim().length >= 2);
  const temProcesso = Boolean(estado.comarca.numeroProcesso?.trim());
  const temEspecie =
    Boolean(estado.especiePeca?.trim()) || Boolean(estado.tipoAcao?.trim());

  if (fatos.length >= 350) return true;
  if (pareceDocumento && fatos.length >= 100) return true;
  if ((temParte || temProcesso) && fatos.length >= 120) return true;
  if (temEspecie && fatos.length >= 140) return true;
  return false;
}

/**
 * Só o modo Minuta entrega peça. Instantâneo gera após o plano;
 * Planejado gera quando há lastro mínimo (peça completa) ou pedido explícito.
 */
export function deveEntregarPecaAposPlano(input: {
  papel: "chat" | "minuta";
  modo: "instantaneo" | "planejado";
  estado: EstadoCasoChat;
  textoUsuario?: string;
}): boolean {
  if (input.papel !== "minuta") return false;
  if (!casoTemLastroMinimoParaPeca(input.estado)) return false;
  if (input.modo === "instantaneo") return true;
  const t = input.textoUsuario?.trim() ?? "";
  if (!t || pedidoExplicitoRedacao(t) || confirmouModoMinuta(t)) return true;
  return casoTemLastroMinimoParaPeca(input.estado);
}

/**
 * Dispara redação real (cota) sem passar pela conversa que alucina “peça pronta”.
 */
export function deveDispararRedacaoImediata(input: {
  papel: "chat" | "minuta";
  forcarMinuta?: boolean;
  textoUsuario?: string;
  estado: EstadoCasoChat;
}): boolean {
  if (input.forcarMinuta) return casoTemLastroMinimoParaPeca(input.estado);
  if (input.papel !== "minuta") return false;
  if (!casoTemLastroMinimoParaPeca(input.estado)) return false;
  const t = input.textoUsuario?.trim() ?? "";
  if (!t) return false;
  return pedidoExplicitoRedacao(t) || confirmouModoMinuta(t);
}

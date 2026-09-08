/**
 * Critérios FACTO: quando anexar vs quando gerar o preview da peça (1 crédito).
 */

import type { EstadoCasoChat } from "@/lib/chat-minuta";

/** Pedido de redação no texto — NÃO debita sozinho; só convida ao Gerar preview. */
export function pedidoExplicitoRedacao(texto: string): boolean {
  const t = texto.trim();
  if (!t) return false;

  // Negação: "não redija", "ainda não quero a redação" — não força Peça.
  if (
    /\b(n[aã]o\s+(quero\s+)?(a\s+)?(redi|elabore|escreva|gere|gerar|minuta|pe[cç]a|reda|preview)|ainda\s+n[aã]o\s+quero\s+(a\s+)?reda|sem\s+redigir)/i.test(
      t
    )
  ) {
    return false;
  }

  // "monte/prepare o plano" organiza o caso — não é pedido de peça.
  if (
    /\b(monte|prepare)\s+(o\s+)?plano\b/i.test(t) &&
    !/\b(redi[gj]\w*|elabore\w*|escreva|gere|gerar|minuta|preview)\b/i.test(t)
  ) {
    return false;
  }

  const verboRedacao =
    /\b(redi[gj]\w*|elabore\w*|escreva|fa[cç]a|gere|gerar|monte|prepare|minuta|preview)\b/i.test(
      t
    );
  // Relato longo citando "petição"/"peça" sem verbo de redação → Assistente organiza.
  if (!verboRedacao) {
    if (t.length > 160) return false;
    return /\b(contest\w*|agravo\w*|embargos|recurso\s+inominado|habeas|mandado\s+de\s+seguran[cç]a)\b/i.test(
      t
    );
  }

  return /\b(redi[gj]\w*|elabore\w*|escreva|fa[cç]a|gere|gerar|monte|prepare|minuta|pe[cç]a|peti[cç][aã]o|preview|contest\w*|agravo\w*|embargos|recurso\s+inominado|habeas|mandado\s+de\s+seguran[cç]a)\b/i.test(
    t
  );
}

/**
 * Confirmação explícita de gerar o preview (1 crédito) —
 * "gerar preview", "montar a peça", "já alterei", "pronto, pode gerar".
 */
export function confirmouGerarPreview(texto: string): boolean {
  const t = texto.trim();
  if (!t || t.length > 200) return false;
  return (
    /\b(gerar?\s+(o\s+)?preview|montar?\s+(a\s+)?pe[cç]a|confirmo\s+(a\s+)?gera|pode\s+gerar(\s+o\s+preview)?|j[aá]\s+(alterei|mudei|troquei|selecionei|estive|estou)|alterei\s+(para\s+)?(o\s+)?modo|mudei\s+para\s+(o\s+)?(minuta|pe[cç]a)|modo\s+(minuta|pe[cç]a)\s+(ligado|ativo)|pronto\s*,?\s*pode\s+(gerar|redig|montar))\b/i.test(
      t
    ) || /^j[aá]\s+alterei\.?$/i.test(t)
  );
}

/** @deprecated use confirmouGerarPreview */
export function confirmouModoMinuta(texto: string): boolean {
  return confirmouGerarPreview(texto);
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

/** Copy do gate quando o caso já tem lastro (Assistente, sem debitar). */
export function mensagemGateGerarPreview(): string {
  return [
    "Com o que você passou, a equipe já fecha a peça.",
    "Quer acrescentar algo ou **gerar o preview** (1 crédito)?",
    "Use o botão **Gerar preview** / **Montar a peça**, ou diga *gerar preview*.",
  ].join(" ");
}

/**
 * Peça no preview só sobe com CTA explícito (`entregarPeca` / Gerar preview).
 * Não debita só por estar no modo Peça ou por lastro.
 */
export function deveEntregarPecaAposPlano(_input: {
  papel: "chat" | "minuta";
  modo: "instantaneo" | "planejado";
  estado: EstadoCasoChat;
  textoUsuario?: string;
}): boolean {
  return false;
}

/**
 * Dispara redação real (cota) só com Gerar preview / confirmação explícita.
 */
export function deveDispararRedacaoImediata(input: {
  papel: "chat" | "minuta";
  forcarMinuta?: boolean;
  textoUsuario?: string;
  estado: EstadoCasoChat;
}): boolean {
  if (!casoTemLastroMinimoParaPeca(input.estado)) return false;
  if (input.forcarMinuta) return true;
  const t = input.textoUsuario?.trim() ?? "";
  if (!t) return false;
  return confirmouGerarPreview(t);
}

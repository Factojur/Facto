export const ASSUNTOS_SUPORTE = [
  "Dúvida",
  "Problema Técnico",
  "Sugestão de Melhoria",
  "Financeiro",
] as const;

export type AssuntoSuporte = (typeof ASSUNTOS_SUPORTE)[number];

/** Problema Técnico e Financeiro → suporte@; Dúvida e Sugestão → contato@. */
export const DESTINO_POR_ASSUNTO: Record<AssuntoSuporte, string> = {
  "Problema Técnico": "suporte@factoia.com.br",
  Financeiro: "suporte@factoia.com.br",
  Dúvida: "contato@factoia.com.br",
  "Sugestão de Melhoria": "contato@factoia.com.br",
};

export function isAssuntoSuporte(valor: unknown): valor is AssuntoSuporte {
  return (
    typeof valor === "string" &&
    (ASSUNTOS_SUPORTE as readonly string[]).includes(valor)
  );
}

export function destinoPorAssunto(assunto: AssuntoSuporte): string {
  return DESTINO_POR_ASSUNTO[assunto];
}

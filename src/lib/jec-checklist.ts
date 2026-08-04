/**
 * Checklist mínimo antes de gerar a peça (orientação na UI).
 */

export type ItemChecklistJec = {
  id: string;
  label: string;
  ok: boolean;
  bloqueante: boolean;
};

export function montarChecklistJec(opcoes: {
  tipoSelecionado: string;
  fatos: string;
  reusCount: number;
  comarcaForo: string;
  temValor: boolean;
  /** true enquanto o Assistente ainda não definiu o tipo de ação. */
  assistentePendente?: boolean;
}): ItemChecklistJec[] {
  const fatosOk = opcoes.fatos.trim().length >= 40;
  const tipoOk =
    Boolean(opcoes.tipoSelecionado.trim()) && !opcoes.assistentePendente;
  const reusOk = opcoes.reusCount > 0;
  const comarcaOk = opcoes.comarcaForo.trim().length >= 12;

  return [
    {
      id: "tipo",
      label: opcoes.assistentePendente
        ? "Assistente Facto: analisar os fatos e definir a ação"
        : "Tipo de ação definido",
      ok: tipoOk,
      bloqueante: true,
    },
    {
      id: "fatos",
      label: "Narração dos fatos (mín. ~40 caracteres)",
      ok: fatosOk,
      bloqueante: true,
    },
    {
      id: "reus",
      label: "Pelo menos um réu qualificado",
      ok: reusOk,
      bloqueante: true,
    },
    {
      id: "comarca",
      label: "Foro / Juizado (endereçamento)",
      ok: comarcaOk,
      bloqueante: false,
    },
    {
      id: "valores",
      label: "Valores da causa (recomendado)",
      ok: opcoes.temValor,
      bloqueante: false,
    },
  ];
}

export function podeGerarPeca(itens: ItemChecklistJec[]): boolean {
  return itens.filter((i) => i.bloqueante).every((i) => i.ok);
}

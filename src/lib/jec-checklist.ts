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
  comarcaCidade: string;
  comarcaUf: string;
  temValor: boolean;
  modoAssistentePendenteConfirmacao: boolean;
}): ItemChecklistJec[] {
  const fatosOk = opcoes.fatos.trim().length >= 40;
  const tipoOk = Boolean(opcoes.tipoSelecionado.trim());
  const reusOk = opcoes.reusCount > 0;
  const comarcaOk =
    Boolean(opcoes.comarcaCidade.trim()) && Boolean(opcoes.comarcaUf.trim());

  return [
    {
      id: "tipo",
      label: "Tipo de ação (ou Assistente confirmado)",
      ok: tipoOk && !opcoes.modoAssistentePendenteConfirmacao,
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
      label: "Comarca (cidade e UF)",
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

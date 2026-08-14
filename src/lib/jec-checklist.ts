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
  autorOk: boolean;
  reusOk: boolean;
  comarcaForo: string;
  temValor: boolean;
  assistentePendente?: boolean;
  processoPendenteConfirmacao?: boolean;
  partesJaQualificadas?: boolean;
}): ItemChecklistJec[] {
  const fatosOk = opcoes.fatos.trim().length >= 40;
  const tipoOk =
    Boolean(opcoes.tipoSelecionado.trim()) &&
    opcoes.tipoSelecionado !== "assistente-facto" &&
    !opcoes.assistentePendente &&
    !opcoes.processoPendenteConfirmacao;
  const comarcaOk = opcoes.comarcaForo.trim().length >= 12;

  return [
    {
      id: "tipo",
      label: opcoes.processoPendenteConfirmacao
        ? "Confirmar a peça sugerida a partir do processo"
        : opcoes.assistentePendente
          ? "Definir o tipo de ação (Assistente, processo ou texto livre)"
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
      id: "autor",
      label: opcoes.partesJaQualificadas
        ? "Nome do autor (já qualificado nos autos)"
        : "Pelo menos um autor qualificado",
      ok: opcoes.autorOk,
      bloqueante: true,
    },
    {
      id: "reus",
      label: opcoes.partesJaQualificadas
        ? "Nome do réu (já qualificado nos autos)"
        : "Pelo menos um réu qualificado",
      ok: opcoes.reusOk,
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

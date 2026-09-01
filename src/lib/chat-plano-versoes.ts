/**
 * Histórico de versões do plano estratégico no chat.
 */

import type { PreviewTriagemData } from "@/components/dashboard/preview-triagem-peca";

export type VersaoPlanoChat = {
  id: string;
  ts: number;
  triagem: PreviewTriagemData;
  resumoMudanca?: string;
};

const MAX_VERSOES = 8;

export function idVersaoPlano(): string {
  return `pv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function registrarVersaoPlano(
  versoes: VersaoPlanoChat[],
  triagem: PreviewTriagemData,
  resumoMudanca?: string
): VersaoPlanoChat[] {
  const ultima = versoes[versoes.length - 1];
  if (
    ultima &&
    ultima.triagem.estrategiaJuridica === triagem.estrategiaJuridica &&
    ultima.triagem.topicos.length === triagem.topicos.length
  ) {
    return versoes;
  }
  const nova: VersaoPlanoChat = {
    id: idVersaoPlano(),
    ts: Date.now(),
    triagem,
    resumoMudanca,
  };
  return [...versoes, nova].slice(-MAX_VERSOES);
}

/**
 * Limite simples em memória (best-effort em serverless).
 * Não substitui cota persistida; evita rajada de Gemini no mesmo processo.
 */

type Janela = { vezes: number[]; };

const store = new Map<string, Janela>();

export function dentroDoLimite(params: {
  chave: string;
  max: number;
  janelaMs: number;
}): boolean {
  const agora = Date.now();
  const atual = store.get(params.chave)?.vezes ?? [];
  const vivos = atual.filter((t) => agora - t < params.janelaMs);
  if (vivos.length >= params.max) {
    store.set(params.chave, { vezes: vivos });
    return false;
  }
  vivos.push(agora);
  store.set(params.chave, { vezes: vivos });
  return true;
}

/** Só para testes. */
export function limparLimiteMemoria() {
  store.clear();
}

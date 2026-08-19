/**
 * Página do PDF anexado (juris do caso), nunca URL da web.
 * Depende do marcador inserido na extração: `--- página N ---`.
 */

const MARCADOR = /---\s*página\s+(\d+)\s*---/gi;

export function paginaDoTrechoNoTexto(
  textoAnexo: string,
  trecho: string
): number | null {
  const anexo = textoAnexo.trim();
  const needle = trecho.replace(/\s+/g, " ").trim().slice(0, 48);
  if (!anexo || needle.length < 8) return null;
  const idx = anexo.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return null;
  const antes = anexo.slice(0, idx);
  let pagina: number | null = null;
  let m: RegExpExecArray | null;
  const re = new RegExp(MARCADOR.source, "gi");
  while ((m = re.exec(antes)) !== null) {
    pagina = Number(m[1]);
  }
  return pagina && Number.isFinite(pagina) ? pagina : null;
}

export function rotuloCitacaoAnexo(opcoes: {
  titulo: string;
  pagina: number | null;
}): string {
  if (opcoes.pagina) return `Anexo · p. ${opcoes.pagina} · ${opcoes.titulo}`;
  return `Anexo · ${opcoes.titulo}`;
}

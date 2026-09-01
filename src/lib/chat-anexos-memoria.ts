/**
 * Memória de anexos por sessão — evita re-OCR e reenvio do mesmo PDF a cada turno.
 */

export type AnexoMemoriaItem = {
  fingerprint: string;
  nome: string;
  textoExtraido: string;
  processadoEntradaCaso: boolean;
};

export const MAX_ANEXOS_MEMORIA = 8;
export const MAX_TEXTO_ANEXO_MEMORIA = 48_000;

export function fingerprintArquivo(
  file: Pick<File, "name" | "size" | "lastModified">
): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function marcadorAnexoNoRelato(nome: string): string {
  return `--- ${nome} ---`;
}

export function relatoJaContemAnexo(relato: string, nome: string): boolean {
  return relato.includes(marcadorAnexoNoRelato(nome));
}

export function juntarTextoAnexoAoRelato(
  relato: string,
  nome: string,
  texto: string
): string {
  const base = relato.trim();
  if (!texto.trim()) return base;
  if (relatoJaContemAnexo(base, nome)) return base;
  return [base, `${marcadorAnexoNoRelato(nome)}\n${texto.trim()}`]
    .filter(Boolean)
    .join("\n\n");
}

export function truncarTextoMemoriaAnexo(texto: string): string {
  if (texto.length <= MAX_TEXTO_ANEXO_MEMORIA) return texto;
  return `${texto.slice(0, MAX_TEXTO_ANEXO_MEMORIA)}\n[…truncado na memória da sessão…]`;
}

export function upsertAnexoMemoria(
  memoria: AnexoMemoriaItem[],
  item: AnexoMemoriaItem
): AnexoMemoriaItem[] {
  const rest = memoria.filter((m) => m.fingerprint !== item.fingerprint);
  return [...rest, item].slice(-MAX_ANEXOS_MEMORIA);
}

export function marcarAnexosEntradaProcessada(
  memoria: AnexoMemoriaItem[],
  fingerprints: string[]
): AnexoMemoriaItem[] {
  const set = new Set(fingerprints);
  return memoria.map((m) =>
    set.has(m.fingerprint) ? { ...m, processadoEntradaCaso: true } : m
  );
}

export function sanitizarAnexosMemoria(
  memoria: AnexoMemoriaItem[] | null | undefined
): AnexoMemoriaItem[] {
  if (!Array.isArray(memoria)) return [];
  return memoria
    .filter((m) => m && typeof m.fingerprint === "string" && m.nome)
    .slice(-MAX_ANEXOS_MEMORIA)
    .map((m) => ({
      fingerprint: m.fingerprint,
      nome: String(m.nome).slice(0, 200),
      textoExtraido: truncarTextoMemoriaAnexo(String(m.textoExtraido ?? "")),
      processadoEntradaCaso: Boolean(m.processadoEntradaCaso),
    }));
}

/** Só chama /api/entrada-caso quando há arquivo novo para OCR ou 1ª organização com anexo. */
export function deveChamarEntradaCaso(opts: {
  arquivosParaServidor: number;
  casoJaOrganizado: boolean;
}): boolean {
  if (opts.arquivosParaServidor > 0) return true;
  if (opts.casoJaOrganizado) return false;
  return false;
}

export type ArquivoEnvioMemoria = {
  nome: string;
  mimeType: string;
  base64: string;
};

export async function processarArquivosComMemoria(input: {
  relatoBase: string;
  files: File[];
  memoria: AnexoMemoriaItem[];
  extrairTextoLocal: (file: File) => Promise<string>;
  minCharsTextoUtil: number;
  limiteArquivoBytes: number;
  limiteUploadBytes: number;
  arquivoParaBase64: (file: File) => Promise<ArquivoEnvioMemoria>;
}): Promise<{
  relato: string;
  arquivos: ArquivoEnvioMemoria[];
  memoria: AnexoMemoriaItem[];
  reutilizouCache: boolean;
  fingerprintsEnviadosServidor: string[];
}> {
  let relatoMaisTexto = input.relatoBase.trim();
  let memoria = sanitizarAnexosMemoria(input.memoria);
  const payloadArquivos: ArquivoEnvioMemoria[] = [];
  const fingerprintsEnviadosServidor: string[] = [];
  let reutilizouCache = false;

  for (const file of input.files.slice(0, 4)) {
    if (file.size > input.limiteArquivoBytes) {
      throw new Error(`“${file.name}” passa de 40 MB.`);
    }

    const fp = fingerprintArquivo(file);
    const cached = memoria.find((m) => m.fingerprint === fp);

    if (relatoJaContemAnexo(relatoMaisTexto, file.name)) {
      reutilizouCache = true;
      if (!cached) {
        memoria = upsertAnexoMemoria(memoria, {
          fingerprint: fp,
          nome: file.name,
          textoExtraido: "",
          processadoEntradaCaso: true,
        });
      }
      continue;
    }

    if (
      cached?.textoExtraido &&
      cached.textoExtraido.length >= input.minCharsTextoUtil
    ) {
      relatoMaisTexto = juntarTextoAnexoAoRelato(
        relatoMaisTexto,
        file.name,
        cached.textoExtraido
      );
      reutilizouCache = true;
      continue;
    }

    try {
      const texto = await input.extrairTextoLocal(file);
      if (texto.length >= input.minCharsTextoUtil) {
        const textoMem = truncarTextoMemoriaAnexo(texto);
        relatoMaisTexto = juntarTextoAnexoAoRelato(
          relatoMaisTexto,
          file.name,
          textoMem
        );
        memoria = upsertAnexoMemoria(memoria, {
          fingerprint: fp,
          nome: file.name,
          textoExtraido: textoMem,
          processadoEntradaCaso: false,
        });
        continue;
      }
    } catch {
      /* OCR no servidor */
    }

    if (cached?.processadoEntradaCaso) {
      reutilizouCache = true;
      continue;
    }

    if (file.size > input.limiteUploadBytes) {
      throw new Error(
        `“${file.name}” parece escaneado e é grande demais para leitura automática. Cole o texto ou envie um PDF mais leve.`
      );
    }

    payloadArquivos.push(await input.arquivoParaBase64(file));
    fingerprintsEnviadosServidor.push(fp);
    memoria = upsertAnexoMemoria(memoria, {
      fingerprint: fp,
      nome: file.name,
      textoExtraido: cached?.textoExtraido ?? "",
      processadoEntradaCaso: false,
    });
  }

  return {
    relato: relatoMaisTexto,
    arquivos: payloadArquivos,
    memoria,
    reutilizouCache,
    fingerprintsEnviadosServidor,
  };
}

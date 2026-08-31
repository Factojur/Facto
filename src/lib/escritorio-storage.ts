import {
  ESCRITORIO_STORAGE_KEY,
  escritorioConfigVazio,
  type EscritorioConfig,
} from "./escritorio-types";

/** Formato antigo, quando havia um único upload de "logo". */
type EscritorioConfigLegado = Partial<EscritorioConfig> & {
  logoBase64?: string;
};

export function carregarEscritorioConfig(): EscritorioConfig {
  if (typeof window === "undefined") return escritorioConfigVazio;

  try {
    const raw = localStorage.getItem(ESCRITORIO_STORAGE_KEY);
    if (!raw) return escritorioConfigVazio;

    const salvo = JSON.parse(raw) as EscritorioConfigLegado;
    const config: EscritorioConfig = { ...escritorioConfigVazio, ...salvo };

    // Migração: versões antigas guardavam a imagem única em "logoBase64".
    if (salvo.logoBase64 && !config.cabecalhoBase64) {
      config.cabecalhoBase64 = salvo.logoBase64;
    }

    return config;
  } catch {
    return escritorioConfigVazio;
  }
}

export function salvarEscritorioConfig(config: EscritorioConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ESCRITORIO_STORAGE_KEY, JSON.stringify(config));
}

/** Há imagem ou texto de escritório salvo (pode timbrar). */
export function escritorioTemConteudoTimbre(config: EscritorioConfig): boolean {
  return Boolean(
    config.cabecalhoBase64?.trim() ||
      config.rodapeBase64?.trim() ||
      config.marcaDaguaBase64?.trim() ||
      config.nomeEscritorio?.trim() ||
      config.endereco?.trim()
  );
}

export async function imagemParaBase64(file: File): Promise<string> {
  const maxBytes = 500 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Imagem deve ter no máximo 500 KB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Erro ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

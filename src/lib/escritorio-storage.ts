import {
  ESCRITORIO_STORAGE_KEY,
  escritorioConfigVazio,
  type EscritorioConfig,
} from "./escritorio-types";

export function carregarEscritorioConfig(): EscritorioConfig {
  if (typeof window === "undefined") return escritorioConfigVazio;

  try {
    const raw = localStorage.getItem(ESCRITORIO_STORAGE_KEY);
    if (!raw) return escritorioConfigVazio;
    return { ...escritorioConfigVazio, ...JSON.parse(raw) };
  } catch {
    return escritorioConfigVazio;
  }
}

export function salvarEscritorioConfig(config: EscritorioConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ESCRITORIO_STORAGE_KEY, JSON.stringify(config));
}

export async function logoParaBase64(file: File): Promise<string> {
  const maxBytes = 500 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Logo deve ter no máximo 500 KB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Erro ao ler o logo."));
    reader.readAsDataURL(file);
  });
}

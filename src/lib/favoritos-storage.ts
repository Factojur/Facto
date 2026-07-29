const CHAVE_PREFIXO = "facto-favoritos";

export function chaveFavoritosLocal(userId: string): string {
  return `${CHAVE_PREFIXO}:${userId}`;
}

export function carregarFavoritosLocal(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(chaveFavoritosLocal(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function salvarFavoritosLocal(userId: string, favoritos: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(chaveFavoritosLocal(userId), JSON.stringify(favoritos));
}

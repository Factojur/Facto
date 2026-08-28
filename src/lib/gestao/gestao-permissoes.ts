import type { PapelGestao } from "@/lib/gestao/gestao-types";

export function rotuloPapelGestao(papel: PapelGestao | string): string {
  switch (papel) {
    case "admin":
      return "Titular";
    case "socio":
      return "Membro";
    default:
      return "Membro";
  }
}

export function ehAdminGestao(
  papel: PapelGestao | string | null | undefined
): boolean {
  return papel === "admin";
}

export function ehUrgenciaPrazoDestaque(
  urgencia: "vencido" | "hoje" | "semana" | "futuro" | "concluido"
): boolean {
  return urgencia === "vencido" || urgencia === "hoje" || urgencia === "semana";
}

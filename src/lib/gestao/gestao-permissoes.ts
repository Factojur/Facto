import type { PapelGestao, ProcessoGestao } from "@/lib/gestao/gestao-types";

/** Titular (admin) e sócios veem honorários contratados; colaboradores e estagiários não. */
export function podeVerHonorariosGestao(
  papel: PapelGestao | string | null | undefined
): boolean {
  return papel === "admin" || papel === "socio";
}

export function rotuloPapelGestao(papel: PapelGestao | string): string {
  switch (papel) {
    case "admin":
      return "Titular";
    case "socio":
      return "Sócio";
    default:
      return "Colaborador";
  }
}

export function sanitizarProcessoHonorarios<T extends ProcessoGestao>(
  processo: T,
  podeVerHonorarios: boolean
): T {
  if (podeVerHonorarios) return processo;
  return {
    ...processo,
    honorarioTipo: "a_definir",
    honorarioValorCentavos: null,
    honorarioPercentual: null,
    honorarioStatus: "a_definir",
    honorarioObservacao: "",
  };
}

export function ehUrgenciaPrazoDestaque(
  urgencia: "vencido" | "hoje" | "semana" | "futuro" | "concluido"
): boolean {
  return urgencia === "vencido" || urgencia === "hoje" || urgencia === "semana";
}

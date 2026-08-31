/**
 * Teste grátis: 1 área · 2 peças · 7 dias · export limpo (protocolável).
 */

import { PLANO_TRIAL } from "@/lib/planos-facto";
import { getAreaById } from "@/lib/areas-atuacao";

/** Domínios descartáveis comuns — bloqueio anti-abuso no trial. */
const DOMINIOS_DESCARTAVEIS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "discard.email",
]);

export type TrialPerfil = {
  trial_ate: string | null;
  trial_area_id: string | null;
  trial_pecas_usadas: number | null;
};

export function emailDescartavel(email: string): boolean {
  const dominio = email.trim().toLowerCase().split("@")[1] ?? "";
  return DOMINIOS_DESCARTAVEIS.has(dominio);
}

export function areaValidaParaTrial(areaId: string): boolean {
  const area = getAreaById(areaId);
  return Boolean(area?.available && area.href);
}

export function trialAindaValido(perfil: TrialPerfil | null | undefined): boolean {
  if (!perfil?.trial_ate) return false;
  const ate = new Date(perfil.trial_ate).getTime();
  return Number.isFinite(ate) && ate > Date.now();
}

export function diasTrialRestantes(perfil: TrialPerfil | null | undefined): number {
  if (!trialAindaValido(perfil) || !perfil?.trial_ate) return 0;
  const ms = new Date(perfil.trial_ate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function dataFimTrial(agora = new Date()): Date {
  const fim = new Date(agora);
  fim.setUTCDate(fim.getUTCDate() + PLANO_TRIAL.diasValidade);
  return fim;
}

export function pecasTrialRestantes(perfil: TrialPerfil | null | undefined): number {
  const usadas = Number(perfil?.trial_pecas_usadas ?? 0);
  return Math.max(0, PLANO_TRIAL.pecasPorMes - usadas);
}

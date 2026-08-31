/**
 * Consentimento LGPD para sync opcional na nuvem (minutas + memória de cliente).
 * Versão separada dos Termos gerais — exige aceite explícito na interface.
 */

export const SYNC_NUVEM_VERSAO = "2026-08-29";

export const SYNC_NUVEM_RESUMO =
  "Opt-in para guardar conversas do assistente, minutas geradas e qualificação de clientes na sua conta FACTO (Supabase), em vez de só no navegador. Você pode revogar a qualquer momento.";

export type SyncNuvemStatus = {
  optIn: boolean;
  versao: string | null;
  optInEm: string | null;
  migrationOk?: boolean;
};

export function syncNuvemConsentimentoValido(meta: {
  sync_nuvem_opt_in?: boolean | null;
  sync_nuvem_versao?: string | null;
  sync_nuvem_opt_in_em?: string | null;
} | null | undefined): boolean {
  if (!meta?.sync_nuvem_opt_in) return false;
  return meta.sync_nuvem_versao === SYNC_NUVEM_VERSAO;
}

export function lerSyncNuvemDeMetadata(
  metadata: Record<string, unknown> | null | undefined
): SyncNuvemStatus {
  const optIn = metadata?.sync_nuvem_opt_in === true;
  const versao =
    typeof metadata?.sync_nuvem_versao === "string"
      ? metadata.sync_nuvem_versao
      : null;
  const optInEm =
    typeof metadata?.sync_nuvem_opt_in_em === "string"
      ? metadata.sync_nuvem_opt_in_em
      : null;
  return {
    optIn: optIn && versao === SYNC_NUVEM_VERSAO,
    versao,
    optInEm,
  };
}

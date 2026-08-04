/** Versão do pacote Termos + Privacidade. Ao mudar, usuários precisam aceitar de novo. */
export const ACEITE_TERMOS_VERSAO = "2026-08-04";

export function temAceiteTermos(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return false;
  const versao = metadata.aceite_termos_versao;
  const quando = metadata.aceite_termos_em;
  return (
    typeof quando === "string" &&
    quando.length > 0 &&
    versao === ACEITE_TERMOS_VERSAO
  );
}

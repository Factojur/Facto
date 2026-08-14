/**
 * Compat: reexporta o JurisprudenciaService.
 * Prefira importar de `@/lib/juris-provedores/jurisprudencia-service`.
 */

export {
  buscarJurisprudenciasAi,
  buscarPrecedentes,
  completarEmentaPorLookup,
  jurisAiTokenConfigurado,
  jurisprudenciaServiceConfigurado,
  lookupEmentaPorNumero,
  numeroProcessoDeTitulo,
  slugTribunalParaApi,
  JURIS_BUSCAS_POR_USUARIO_DIA,
  JURIS_BUSCAS_POR_USUARIO_MES,
} from "@/lib/juris-provedores/jurisprudencia-service";

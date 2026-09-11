export {
  buscarEsajTjJuris,
  ementaTjEsajValida,
  fonteTjPortal,
  siglaTj,
} from "@/lib/scrapers/esaj-tj";
export type { UfTjEsaj } from "@/lib/scrapers/esaj-tj";
export { buscarTjbaJuris, ementaTjbaValida } from "@/lib/scrapers/tjba";
export { buscarTjrnJuris, ementaTjrnValida } from "@/lib/scrapers/tjrn";
export { buscarTjpeJuris, ementaTjpeValida } from "@/lib/scrapers/tjpe";
export { buscarTjesJuris, ementaTjesValida } from "@/lib/scrapers/tjes";
export {
  buscarTjsp,
  scraperTjspHabilitado,
} from "@/lib/scrapers/tjsp";
export { buscarTseJuris, ementaTseValida } from "@/lib/scrapers/tse";
export {
  buscarTreJuris,
  buscarTreSpJuris,
  ementaTreValida,
  siglaTre,
} from "@/lib/scrapers/tre";
export type { UfTre } from "@/lib/scrapers/tre";
export type { JulgadoScrape, ResultadoScrape } from "@/lib/scrapers/types";
export {
  ANOS_MAX_JULGADO,
  MAX_RESULTADOS_SCRAPE,
  POOL_SCRAPE_MAX,
} from "@/lib/scrapers/types";
export {
  extrairPalavrasChaveCaso,
  selecionarTopPorAfinidade,
  termoBuscaAPartirDoCaso,
} from "@/lib/scrapers/afinidade";
export {
  ementaPareceLixo,
  ementaJurisPortalValida,
  normalizarEmentaPortal,
  julgadoScrapeValido,
} from "@/lib/scrapers/validar-ementa";


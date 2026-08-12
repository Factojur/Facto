export {
  buscarTjsp,
  scraperTjspHabilitado,
} from "@/lib/scrapers/tjsp";
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
  julgadoScrapeValido,
} from "@/lib/scrapers/validar-ementa";


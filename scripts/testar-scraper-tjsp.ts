/**
 * Teste manual do scraper TJSP (requer Chromium do Playwright).
 * Uso: npm run test:scraper-tjsp -- "dano moral consumidor"
 *
 * Carrega .env.local se existir (via next env não automático — use dotenv ou rode com vars).
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  process.env.SCRAPER_TJSP_ENABLED = process.env.SCRAPER_TJSP_ENABLED || "true";
  const termo =
    process.argv.slice(2).join(" ").trim() ||
    "indenização dano moral atraso voo";

  console.log("Buscando TJSP:", termo);
  const { buscarTjsp } = await import("../src/lib/scrapers/tjsp");
  const r = await buscarTjsp(termo);
  console.log(
    JSON.stringify(
      {
        doCache: r.doCache,
        duracaoMs: r.duracaoMs,
        aviso: r.aviso,
        erro: r.erro,
        qtd: r.julgados.length,
        julgados: r.julgados,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Aquece o cache TJSP (juris_scrape_cache) com termos típicos do JEC.
 * Roda local com Playwright; grava no Supabase do .env.local (pode ser prod).
 *
 * Uso: npm run aquecer:cache-tjsp
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const TERMOS_JEC = [
  "indenização dano moral atraso voo",
  "inexigibilidade débito negativação indevida",
  "obrigação de fazer plano de saúde",
  "dano moral cobrança indevida telefone",
  "rescisão contrato compra venda veículo",
  "dano material e moral falha prestação serviço",
  "tutela urgência corte energia elétrica",
  "CDC vício produto garantia",
  "juros abusivos cartão crédito revisão",
  "golpe pix transferência fraude banco",
  "nome sujo SPC SERASA negativação",
  "atraso entrega imóvel construtora",
  "cancelamento passagem aérea reembolso",
  "honorários advocatícios JEC",
  "prova emprestada juizado especial",
];

async function main() {
  process.env.SCRAPER_TJSP_ENABLED =
    process.env.SCRAPER_TJSP_ENABLED || "true";

  const { buscarTjsp } = await import("../src/lib/scrapers/tjsp");
  const { termoBuscaAPartirDoCaso } = await import(
    "../src/lib/scrapers/afinidade"
  );

  console.log(
    `Aquecendo ${TERMOS_JEC.length} termos TJSP → juris_scrape_cache…`
  );

  let ok = 0;
  let falhas = 0;

  for (const termo of TERMOS_JEC) {
    const chave = termoBuscaAPartirDoCaso(termo);
    process.stdout.write(`• ${chave.slice(0, 60)}… `);
    try {
      const r = await buscarTjsp(termo);
      if (r.julgados.length || r.doCache) {
        ok++;
        console.log(
          `ok (${r.fonte ?? (r.doCache ? "cache" : "?")}, ${r.julgados.length} top, pool=${r.poolSize ?? "—"})`
        );
      } else {
        falhas++;
        console.log(`vazio: ${r.aviso ?? r.erro ?? "sem resultado"}`);
      }
    } catch (e) {
      falhas++;
      console.log(e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(JSON.stringify({ ok, falhas }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

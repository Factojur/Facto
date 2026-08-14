/**
 * Completa ementas curtas na base via lookup (cota de 10 mil consultas, não as 500 buscas).
 * Só grava summary/ementa — nunca inteiro teor.
 *
 * Uso: npx tsx scripts/enriquecer-juris-ementas.ts
 * Depois: npm run reindex:embeddings
 *
 * Env:
 * - LOOKUP_EMENTA_MAX=800  — só itens com texto menor que isso (antes de "Relator")
 * - LOOKUP_LIMITE=2000
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  completarEmentaPorLookup,
  numeroProcessoDeTitulo,
  slugTribunalParaApi,
  tokensDoPool,
  type PrecedenteInterno,
} from "../src/lib/juris-provedores/jurisprudencia-service";

config({ path: resolve(process.cwd(), ".env.local") });

const MAX_CURTA = Math.max(
  200,
  Number(process.env.LOOKUP_EMENTA_MAX ?? 800) || 800
);
const LIMITE = Math.max(
  1,
  Number(process.env.LOOKUP_LIMITE ?? 2000) || 2000
);

function corpoEmenta(texto: string): string {
  const i = texto.search(/\n\nRelator/i);
  return (i > 0 ? texto.slice(0, i) : texto).trim();
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!tokensDoPool().length) {
    console.error("Configure JURISPRUDENCIAS_AI_API_KEY no .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(
    `Lookup ementas curtas (< ${MAX_CURTA} chars) · até ${LIMITE} itens\n`
  );

  let atualizados = 0;
  let pulados = 0;
  let falhas = 0;
  let offset = 0;
  const page = 200;
  let processados = 0;
  let esgotado = false;

  while (processados < LIMITE && !esgotado) {
    const { data, error } = await supabase
      .from("base_conhecimento")
      .select("id, titulo, texto, categoria, fonte")
      .eq("categoria", "Jurisprudência")
      .order("id", { ascending: true })
      .range(offset, offset + page - 1);

    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    if (!data?.length) break;
    offset += data.length;

    for (const row of data) {
      if (processados >= LIMITE) break;
      const cat = (row.categoria || "").toLowerCase();
      if (cat.includes("súmula") || cat.includes("sumula")) continue;
      const titulo = String(row.titulo || "");
      const texto = String(row.texto || "");
      const corpo = corpoEmenta(texto);
      if (corpo.length >= MAX_CURTA && !corpo.endsWith("...")) {
        continue;
      }
      const numero = numeroProcessoDeTitulo(titulo);
      const court = slugTribunalParaApi(titulo);
      if (!numero || !court) {
        pulados++;
        continue;
      }

      processados++;
      const p: PrecedenteInterno = {
        origem: "jurisprudencias_ai",
        tribunal: court.toUpperCase(),
        titulo,
        ementa: corpo,
        numeroProcesso: numero,
        tipo: "acordao",
      };
      const hyd = await completarEmentaPorLookup(p);
      if (hyd.esgotado) {
        esgotado = true;
        console.log("Cota de consultas (lookup) esgotada — parando.");
        break;
      }
      if (!hyd.lookup) {
        pulados++;
        continue;
      }

      const partes = [hyd.precedente.ementa.trim()];
      if (hyd.precedente.relator) {
        partes.push(`Relator(a): ${hyd.precedente.relator}`);
      }
      if (hyd.precedente.data) partes.push(`Data: ${hyd.precedente.data}`);
      if (hyd.precedente.url) {
        partes.push(`Fonte oficial: ${hyd.precedente.url}`);
      }
      const novo = partes.join("\n\n");
      const { error: upd } = await supabase
        .from("base_conhecimento")
        .update({ texto: novo, embedding: null })
        .eq("id", row.id);
      if (upd) {
        falhas++;
        console.log(`  falha ${titulo}: ${upd.message}`);
      } else {
        atualizados++;
        process.stdout.write(`▸ ${titulo.slice(0, 52)}… +${novo.length - texto.length} chars\n`);
      }
      await new Promise((r) => setTimeout(r, 80));
    }

    if (data.length < page) break;
  }

  console.log(
    `\nConcluído: ${atualizados} ementas completadas, ${pulados} skip, ${falhas} falha(s).`
  );
  console.log("Próximo: npm run reindex:embeddings");
  if (esgotado) process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

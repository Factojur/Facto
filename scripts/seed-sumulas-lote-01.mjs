/**
 * Sobe SV 1–10 STF em base_conhecimento.
 * Uso: node scripts/seed-sumulas-lote-01.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}

loadEnvLocal();

const SUMULAS = [
  {
    titulo: "Súmula Vinculante 1 do STF",
    texto:
      "Súmula Vinculante 1/STF (ATIVA): Ofende a garantia constitucional do ato jurídico perfeito a decisão que, sem ponderar as circunstâncias do caso concreto, desconsidera a validade e a eficácia de acordo constante de termo de adesão instituído pela Lei Complementar nº 110/2001.",
  },
  {
    titulo: "Súmula Vinculante 2 do STF",
    texto:
      "Súmula Vinculante 2/STF (ATIVA): É inconstitucional a lei ou ato normativo estadual ou distrital que disponha sobre sistemas de consórcios e sorteios, inclusive bingos e loterias.",
  },
  {
    titulo: "Súmula Vinculante 3 do STF",
    texto:
      "Súmula Vinculante 3/STF (ATIVA): Nos processos perante o Tribunal de Contas da União asseguram-se o contraditório e a ampla defesa quando da decisão puder resultar anulação ou revogação de ato administrativo que beneficie o interessado, excetuada a apreciação da legalidade do ato de concessão inicial de aposentadoria, reforma e pensão.",
  },
  {
    titulo: "Súmula Vinculante 4 do STF",
    texto:
      "Súmula Vinculante 4/STF (ATIVA): Salvo nos casos previstos na Constituição, o salário mínimo não pode ser usado como indexador de base de cálculo de vantagem de servidor público ou de empregado, nem ser substituído por decisão judicial.",
  },
  {
    titulo: "Súmula Vinculante 5 do STF",
    texto:
      "Súmula Vinculante 5/STF (ATIVA): A falta de defesa técnica por advogado no processo administrativo disciplinar não ofende a Constituição.",
  },
  {
    titulo: "Súmula Vinculante 6 do STF",
    texto:
      "Súmula Vinculante 6/STF (ATIVA): Não viola a Constituição o estabelecimento de remuneração inferior ao salário mínimo para as praças prestadoras de serviço militar inicial.",
  },
  {
    titulo: "Súmula Vinculante 7 do STF",
    texto:
      "Súmula Vinculante 7/STF (ATIVA): A norma do § 3º do art. 192 da Constituição, revogada pela Emenda Constitucional nº 40/2003, que limitava a taxa de juros reais a 12% ao ano, tinha sua aplicação condicionada à edição de lei complementar.",
  },
  {
    titulo: "Súmula Vinculante 8 do STF",
    texto:
      "Súmula Vinculante 8/STF (ATIVA): São inconstitucionais o parágrafo único do artigo 5º do Decreto-Lei nº 1.569/1977 e os artigos 45 e 46 da Lei nº 8.212/1991, que tratam de prescrição e decadência de crédito tributário.",
  },
  {
    titulo: "Súmula Vinculante 9 do STF",
    texto:
      "Súmula Vinculante 9/STF (ATIVA): O disposto no artigo 127 da Lei nº 7.210/1984 (Lei de Execução Penal) foi recebido pela Constituição Federal de 1988, e não se aplica aos condenados que cumpram pena em regime aberto.",
  },
  {
    titulo: "Súmula Vinculante 10 do STF",
    texto:
      "Súmula Vinculante 10/STF (ATIVA): Viola a cláusula de reserva de plenário (CF/1988, art. 97) a decisão de órgão fracionário de tribunal que, embora não declare expressamente a inconstitucionalidade de lei ou ato normativo do Poder Público, afasta a sua incidência, no todo ou em parte.",
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let ok = 0;
let falha = 0;

for (const s of SUMULAS) {
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", s.titulo)
    .maybeSingle();

  if (existente?.id) {
    const { error } = await supabase
      .from("base_conhecimento")
      .update({ categoria: "Súmula", texto: s.texto })
      .eq("id", existente.id);
    if (error) {
      console.error("ERRO update", s.titulo, error.message);
      falha++;
    } else {
      console.log("OK update", s.titulo);
      ok++;
    }
  } else {
    const { error } = await supabase.from("base_conhecimento").insert({
      titulo: s.titulo,
      categoria: "Súmula",
      texto: s.texto,
    });
    if (error) {
      console.error("ERRO insert", s.titulo, error.message);
      falha++;
    } else {
      console.log("OK insert", s.titulo);
      ok++;
    }
  }
}

console.log(`\nConcluído: ${ok} ok, ${falha} falha(s).`);
if (falha) process.exit(1);

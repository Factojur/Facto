/**
 * Seed STJ lote 11 (Súmulas 101–110).
 * Uso: node scripts/seed-sumulas-stj-lote-11.mjs
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

const ITEMS = [
  [101, "A ação de indenização do segurado em grupo contra a seguradora prescreve em um ano."],
  [102, "A incidência dos juros moratórios sobre os compensatórios, nas ações expropriatórias, não constitui anatocismo vedado em lei."],
  [103, "Incluem-se entre os imóveis funcionais que podem ser vendidos os administrados pelas Forças Armadas e ocupados pelos servidores civis."],
  [104, "Compete à Justiça Estadual o processo e julgamento dos crimes de falsificação e uso de documento falso relativo a estabelecimento particular de ensino."],
  [105, "Na ação de mandado de segurança não se admite condenação em honorários advocatícios."],
  [106, "Proposta a ação no prazo fixado para o seu exercício, a demora na citação, por motivos inerentes ao mecanismo da Justiça, não justifica o acolhimento da arguição de prescrição ou decadência."],
  [107, "Compete à Justiça Comum Estadual processar e julgar crime de estelionato praticado mediante falsificação das guias de recolhimento das contribuições previdenciárias, quando não ocorrente lesão a autarquia federal."],
  [108, "A aplicação de medidas socioeducativas ao adolescente, pela prática de ato infracional, é da competência exclusiva do juiz."],
  [109, "O reconhecimento do direito a indenização, por falta de mercadoria transportada via marítima, independe de vistoria."],
  [110, "A isenção do pagamento de honorários advocatícios, nas ações acidentárias, é restrita ao segurado."],
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

for (const [n, enunciado] of ITEMS) {
  const titulo = `Súmula ${n} do STJ`;
  const texto = `Súmula ${n}/STJ (ATIVA): ${enunciado}`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();

  const { error } = existente?.id
    ? await supabase
        .from("base_conhecimento")
        .update({ categoria: "Súmula", texto })
        .eq("id", existente.id)
    : await supabase.from("base_conhecimento").insert({
        titulo,
        categoria: "Súmula",
        texto,
      });

  if (error) {
    console.error("ERRO", titulo, error.message);
    falha++;
  } else {
    console.log(existente?.id ? "OK update" : "OK insert", titulo);
    ok++;
  }
}

console.log(`\nConcluído: ${ok} ok, ${falha} falha(s).`);
console.log("STJ lote 11: Súmulas 101–110. Próximo: 111–120.");
if (falha) process.exit(1);

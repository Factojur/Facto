/**
 * Seed STJ lotes 7–9 (Súmulas 61–90).
 * Canceladas 61 e 68: não entram em base_conhecimento.
 * Uso: node scripts/seed-sumulas-stj-lote-07-09.mjs
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

/** Só ativas — 61 e 68 canceladas ficam só no código TS (fora do RAG). */
const ITEMS = [
  [62, "Compete à Justiça Estadual processar e julgar o crime de falsa anotação na carteira de trabalho e previdência social, atribuído a empresa privada."],
  [63, "São devidos direitos autorais pela retransmissão radiofônica de músicas em estabelecimentos comerciais."],
  [64, "Não constitui constrangimento ilegal o excesso de prazo na instrução, provocado pela defesa."],
  [65, "O cancelamento, previsto no art. 29 do Decreto-lei 2.303, de 21.11.86, não alcança os débitos previdenciários."],
  [66, "Compete à Justiça Federal processar e julgar execução fiscal promovida por Conselho de Fiscalização Profissional."],
  [67, "Na desapropriação, cabe a atualização monetária, ainda que por mais de uma vez, independente do decurso de prazo superior a um ano entre o cálculo e o efetivo pagamento da indenização."],
  [69, "Na desapropriação direta, os juros compensatórios são devidos desde a antecipada imissão na posse e, na desapropriação indireta, a partir da efetiva ocupação do imóvel."],
  [70, "Os juros moratórios, na desapropriação direta ou indireta, contam-se desde o trânsito em julgado da sentença."],
  [71, "O bacalhau importado de país signatário do GATT é isento do ICM."],
  [72, "A comprovação da mora é imprescindível à busca e apreensão do bem alienado fiduciariamente."],
  [73, "A utilização de papel moeda grosseiramente falsificado configura, em tese, o crime de estelionato, da competência da Justiça Estadual."],
  [74, "Para efeitos penais, o reconhecimento da menoridade do réu requer prova por documento hábil."],
  [75, "Compete à Justiça Comum Estadual processar e julgar o policial militar por crime de promover ou facilitar a fuga de preso de estabelecimento penal."],
  [76, "A falta de registro do compromisso de compra e venda de imóvel não dispensa a prévia interpelação para constituir em mora o devedor."],
  [77, "A Caixa Econômica Federal é parte ilegítima para figurar no polo passivo das ações relativas às contribuições para o fundo PIS/PASEP."],
  [78, "Compete à Justiça Militar processar e julgar policial de corporação estadual, ainda que o delito tenha sido praticado em outra unidade federativa."],
  [79, "Os bancos comerciais não estão sujeitos a registro nos Conselhos Regionais de Economia."],
  [80, "A taxa de melhoramento dos portos não se inclui na base de cálculo do ICMS."],
  [81, "Não se concede fiança quando, em concurso material, a soma das penas mínimas cominadas for superior a dois anos de reclusão."],
  [82, "Compete à Justiça Federal, excluídas as reclamações trabalhistas, processar e julgar os feitos relativos a movimentação do FGTS."],
  [83, "Não se conhece do recurso especial pela divergência, quando a orientação do Tribunal se firmou no mesmo sentido da decisão recorrida."],
  [84, "É admissível a oposição de embargos de terceiro fundados em alegação de posse advinda do compromisso de compra e venda de imóvel, ainda que desprovido do registro."],
  [85, "Nas relações jurídicas de trato sucessivo em que a Fazenda Pública figure como devedora, quando não tiver sido negado o próprio direito reclamado, a prescrição atinge apenas as prestações vencidas antes do quinquênio anterior à propositura da ação."],
  [86, "Cabe recurso especial contra acórdão proferido no julgamento de agravo de instrumento."],
  [87, "A isenção do ICMS relativa a rações balanceadas para animais abrange o concentrado e o suplemento."],
  [88, "São admissíveis embargos infringentes em processo falimentar."],
  [89, "A ação acidentária prescinde do exaurimento da via administrativa."],
  [90, "Compete à Justiça Estadual Militar processar e julgar o policial militar pela prática do crime militar, e à Comum pela prática do crime comum simultâneo àquele."],
];

const CANCELADAS = [61, 68];

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
let removidas = 0;

for (const n of CANCELADAS) {
  const titulo = `Súmula ${n} do STJ`;
  const { data: existente } = await supabase
    .from("base_conhecimento")
    .select("id")
    .eq("titulo", titulo)
    .maybeSingle();
  if (existente?.id) {
    const { error } = await supabase
      .from("base_conhecimento")
      .delete()
      .eq("id", existente.id);
    if (error) {
      console.error("ERRO delete cancelada", titulo, error.message);
      falha++;
    } else {
      console.log("OK remove cancelada", titulo);
      removidas++;
    }
  } else {
    console.log("skip (não estava no RAG)", titulo);
  }
}

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

console.log(
  `\nConcluído: ${ok} ativas ok, ${removidas} cancelada(s) removida(s), ${falha} falha(s).`
);
console.log("STJ lotes 7–9: 61–90 (61 e 68 fora do RAG). Próximo: 91 (cancelada) + 92–100.");
if (falha) process.exit(1);

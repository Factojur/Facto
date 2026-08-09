/**
 * Seed STJ lotes 1–3 (Súmulas 1–30).
 * Uso: node scripts/seed-sumulas-stj-lote-01-03.mjs
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
  [1, "O foro do domicílio ou da residência do alimentando é o competente para a ação de investigação de paternidade, quando cumulada com a de alimentos."],
  [2, 'Não cabe o habeas data (CF, art. 5º, LXXII, letra "a") se não houve recusa de informações por parte da autoridade administrativa.'],
  [3, "Compete ao Tribunal Regional Federal dirimir conflito de competência verificado, na respectiva região, entre juiz federal e juiz estadual investido de jurisdição federal."],
  [4, "Compete à Justiça Estadual julgar causa decorrente do processo eleitoral sindical."],
  [5, "A simples interpretação de cláusula contratual não enseja recurso especial."],
  [6, "Compete à Justiça Comum Estadual processar e julgar delito decorrente de acidente de trânsito envolvendo viatura de polícia militar, salvo se autor e vítima forem policiais militares em situação de atividade."],
  [7, "A pretensão de simples reexame de prova não enseja recurso especial."],
  [8, "Aplica-se a correção monetária aos créditos habilitados em concordata preventiva, salvo durante o período compreendido entre as datas de vigência da Lei 7.274, de 10-12-84, e do Decreto-lei 2.283, de 27-02-86."],
  [9, "A exigência da prisão provisória, para apelar, não ofende a garantia constitucional da presunção de inocência."],
  [10, "Instalada a Junta de Conciliação e Julgamento, cessa a competência do Juiz de Direito em matéria trabalhista, inclusive para a execução das sentenças por ele proferidas."],
  [11, "A presença da União ou de qualquer de seus entes, na ação de usucapião especial, não afasta a competência do foro da situação do imóvel."],
  [12, "Em desapropriação, são cumuláveis juros compensatórios e moratórios."],
  [13, "A divergência entre julgados do mesmo Tribunal não enseja recurso especial."],
  [14, "Arbitrados os honorários advocatícios em percentual sobre o valor da causa, a correção monetária incide a partir do respectivo ajuizamento."],
  [15, "Compete à Justiça Estadual processar e julgar os litígios decorrentes de acidente do trabalho."],
  [16, "A legislação ordinária sobre crédito rural não veda a incidência da correção monetária."],
  [17, "Quando o falso se exaure no estelionato, sem mais potencialidade lesiva, é por este absorvido."],
  [18, "A sentença concessiva do perdão judicial é declaratória da extinção da punibilidade, não subsistindo qualquer efeito condenatório."],
  [19, "A fixação do horário bancário, para atendimento ao público, é da competência da União."],
  [20, "A mercadoria importada de país signatário do GATT é isenta do ICM, quando contemplado com esse favor o similar nacional."],
  [21, "Pronunciado o réu, fica superada a alegação do constrangimento ilegal da prisão por excesso de prazo na instrução."],
  [22, "Não há conflito de competência entre o Tribunal de Justiça e Tribunal de Alçada do mesmo estado membro."],
  [23, "O Banco Central do Brasil é parte legítima nas ações fundadas na Resolução 1154, de 1986."],
  [24, "Aplica-se ao crime de estelionato, em que figure como vítima entidade autárquica da previdência social, a qualificadora do § 3º, do art. 171 do Código Penal."],
  [25, "Nas ações da Lei de Falências o prazo para a interposição de recurso conta-se da intimação da parte."],
  [26, "O avalista do título de crédito vinculado a contrato de mútuo também responde pelas obrigações pactuadas, quando no contrato figurar como devedor solidário."],
  [27, "Pode a execução fundar-se em mais de um título extrajudicial relativos ao mesmo negócio."],
  [28, "O contrato de alienação fiduciária em garantia pode ter por objeto bem que já integrava o patrimônio do devedor."],
  [29, "No pagamento em juízo para elidir falência, são devidos correção monetária, juros e honorários de advogado."],
  [30, "A comissão de permanência e a correção monetária são inacumuláveis."],
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
console.log("STJ lotes 1–3: Súmulas 1–30 (ativas). Próximo: 31+.");
if (falha) process.exit(1);

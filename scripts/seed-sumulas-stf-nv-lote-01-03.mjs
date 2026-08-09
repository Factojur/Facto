/**
 * Seed STF NV lotes 1–3 (Súmulas 1–30).
 * Fora do RAG: 2, 3, 4.
 * Uso: node scripts/seed-sumulas-stf-nv-lote-01-03.mjs
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

const FORA = [2,3,4];
const ITEMS = [
  [
    1,
    "É vedada a expulsão de estrangeiro casado com Brasileira, ou que tenha filho Brasileiro, dependente da economia paterna."
  ],
  [
    5,
    "A sanção do projeto supre a falta de iniciativa do Poder Executivo."
  ],
  [
    6,
    "A revogação ou anulação, pelo Poder Executivo, de aposentadoria, ou qualquer outro ato aprovado pelo Tribunal de Contas, não produz efeitos antes de aprovada por aquele Tribunal, ressalvada a competência revisora do Judiciário."
  ],
  [
    7,
    "Sem prejuízo de recurso para o Congresso, não é exequível contrato administrativo a que o Tribunal de Contas houver negado registro."
  ],
  [
    8,
    "Diretor de sociedade de economia mista pode ser destituído no curso do mandato."
  ],
  [
    9,
    "Para o acesso de auditores ao Superior Tribunal Militar, só concorrem os de segunda entrância."
  ],
  [
    10,
    "O tempo de serviço militar conta-se para efeito de disponibilidade e aposentadoria do servidor público estadual."
  ],
  [
    11,
    "A vitaliciedade não impede a extinção do cargo, ficando o funcionário em disponibilidade, com todos os vencimentos."
  ],
  [
    12,
    "A vitaliciedade do professor catedrático não impede o desdobramento da cátedra."
  ],
  [
    13,
    "A equiparação de extranumerário a funcionário efetivo, determinada pela L. 2.284, de 9.8.54, não envolve reestruturação, não compreendendo, portanto, os vencimentos."
  ],
  [
    14,
    "Não é admissível, por ato administrativo, restringir, em razão da idade, inscrição em concurso para cargo público."
  ],
  [
    15,
    "Dentro do prazo de validade do concurso, o candidato aprovado tem o direito à nomeação, quando o cargo for preenchido sem observância da classificação."
  ],
  [
    16,
    "Funcionário nomeado por concurso tem direito à posse."
  ],
  [
    17,
    "A nomeação de funcionário sem concurso pode ser desfeita antes da posse."
  ],
  [
    18,
    "Pela falta residual, não compreendida na absolvição pelo juízo criminal, é admissível a punição administrativa do servidor público."
  ],
  [
    19,
    "É inadmissível segunda punição de servidor público, baseada no mesmo processo em que se fundou a primeira."
  ],
  [
    20,
    "É necessário processo administrativo com ampla defesa, para demissão de funcionário admitido por concurso."
  ],
  [
    21,
    "Funcionário em estágio probatório não pode ser exonerado nem demitido sem inquérito ou sem as formalidades legais de apuração de sua capacidade."
  ],
  [
    22,
    "O estágio probatório não protege o funcionário contra a extinção do cargo."
  ],
  [
    23,
    "Verificados os pressupostos legais para o licenciamento da obra, não o impede a declaração de utilidade pública para desapropriação do imóvel, mas o valor da obra não se incluirá na indenização, quando a desapropriação for efetivada."
  ],
  [
    24,
    "Funcionário interino substituto é livremente demissível, mesmo antes de cessar a causa da substituição."
  ],
  [
    25,
    "A nomeação a termo não impede a livre demissão pelo Presidente da República, de ocupante de cargo dirigente de autarquia."
  ],
  [
    26,
    "Os servidores do Instituto de Aposentadoria e Pensões dos Industriários não podem acumular a sua gratificação bienal com o adicional de tempo de serviço previsto no Estatuto dos Funcionários Civis da União."
  ],
  [
    27,
    "Os servidores públicos não têm vencimentos irredutíveis, prerrogativa dos membros do Poder Judiciário e dos que lhes são equiparados."
  ],
  [
    28,
    "O estabelecimento bancário é responsável pelo pagamento de cheque falso, ressalvadas as hipóteses de culpa exclusiva ou concorrente do correntista."
  ],
  [
    29,
    "Gratificação devida a servidores do \"sistema fazendário\" não se estende aos dos Tribunais de Contas."
  ],
  [
    30,
    "Servidores de coletorias não têm direito à percentagem pela cobrança de contribuições destinadas à Petrobrás."
  ]
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
let removidas = 0;

for (const n of FORA) {
  const titulo = `Súmula ${n} do STF`;
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
      console.error("ERRO delete", titulo, error.message);
      falha++;
    } else {
      console.log("OK remove fora-RAG", titulo);
      removidas++;
    }
  } else {
    console.log("skip (não estava no RAG)", titulo);
  }
}

for (const [n, enunciado] of ITEMS) {
  const titulo = `Súmula ${n} do STF`;
  const texto = `Súmula ${n}/STF (ATIVA): ${enunciado}`;
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
  `\nConcluído: ${ok} ativas ok, ${removidas} removida(s), ${falha} falha(s).`
);
console.log("STF NV lotes 1–3: 1–30. Próximo: 31–.");
if (falha) process.exit(1);

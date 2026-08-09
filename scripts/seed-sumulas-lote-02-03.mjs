/**
 * Sobe lotes 02 e 03 de súmulas vinculantes STF em base_conhecimento.
 * Uso: node scripts/seed-sumulas-lote-02-03.mjs
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

/** Espelha src/lib/sumulas/lote-02 e lote-03 (apenas ativas para insert). */
const SUMULAS = [
  // Lote 2 — SV 11–20
  {
    titulo: "Súmula Vinculante 11 do STF",
    texto:
      "Súmula Vinculante 11/STF (ATIVA): Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.",
  },
  {
    titulo: "Súmula Vinculante 12 do STF",
    texto:
      "Súmula Vinculante 12/STF (ATIVA): A cobrança de taxa de matrícula nas universidades públicas viola o disposto no art. 206, IV, da Constituição Federal.",
  },
  {
    titulo: "Súmula Vinculante 13 do STF",
    texto:
      "Súmula Vinculante 13/STF (ATIVA): A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.",
  },
  {
    titulo: "Súmula Vinculante 14 do STF",
    texto:
      "Súmula Vinculante 14/STF (ATIVA): É direito do defensor, no interesse do representado, ter acesso amplo aos elementos de prova que, já documentados em procedimento investigatório realizado por órgão com competência de polícia judiciária, digam respeito ao exercício do direito de defesa.",
  },
  {
    titulo: "Súmula Vinculante 15 do STF",
    texto:
      "Súmula Vinculante 15/STF (ATIVA): O cálculo de gratificações e outras vantagens do servidor público não incide sobre o abono utilizado para se atingir o salário mínimo.",
  },
  {
    titulo: "Súmula Vinculante 16 do STF",
    texto:
      "Súmula Vinculante 16/STF (ATIVA): Os artigos 7º, IV, e 39, § 3º (redação da EC 19/98), da Constituição, referem-se ao total da remuneração percebida pelo servidor público.",
  },
  {
    titulo: "Súmula Vinculante 17 do STF",
    texto:
      "Súmula Vinculante 17/STF (ATIVA): Durante o período previsto no parágrafo 1º do artigo 100 da Constituição, não incidem juros de mora sobre os precatórios que nele sejam pagos.",
  },
  {
    titulo: "Súmula Vinculante 18 do STF",
    texto:
      "Súmula Vinculante 18/STF (ATIVA): A dissolução da sociedade ou do vínculo conjugal, no curso do mandato, não afasta a inelegibilidade prevista no § 7º do artigo 14 da Constituição Federal.",
  },
  {
    titulo: "Súmula Vinculante 19 do STF",
    texto:
      "Súmula Vinculante 19/STF (ATIVA): A taxa cobrada exclusivamente em razão dos serviços públicos de coleta, remoção e tratamento ou destinação de lixo ou resíduos provenientes de imóveis, não viola o artigo 145, II, da Constituição Federal.",
  },
  {
    titulo: "Súmula Vinculante 20 do STF",
    texto:
      "Súmula Vinculante 20/STF (ATIVA): A Gratificação de Desempenho de Atividade Técnico-Administrativa - GDATA, instituída pela Lei nº 10.404/2002, deve ser deferida aos inativos nos valores correspondentes a 37,5 (trinta e sete vírgula cinco) pontos no período de fevereiro a maio de 2002 e, nos termos do artigo 5º, parágrafo único, da Lei nº 10.404/2002, no período de junho de 2002 até a conclusão dos efeitos do último ciclo de avaliação a que se refere o artigo 1º da Medida Provisória nº 198/2004, a partir da qual passa a ser de 60 (sessenta) pontos.",
  },
  // Lote 3 — SV 21–29 + 31 (SV 30 omitida: pendente de publicação)
  {
    titulo: "Súmula Vinculante 21 do STF",
    texto:
      "Súmula Vinculante 21/STF (ATIVA): É inconstitucional a exigência de depósito ou arrolamento prévios de dinheiro ou bens para admissibilidade de recurso administrativo.",
  },
  {
    titulo: "Súmula Vinculante 22 do STF",
    texto:
      "Súmula Vinculante 22/STF (ATIVA): A Justiça do Trabalho é competente para processar e julgar as ações de indenização por danos morais e patrimoniais decorrentes de acidente de trabalho propostas por empregado contra empregador, inclusive aquelas que ainda não possuíam sentença de mérito em primeiro grau quando da promulgação da Emenda Constitucional nº 45/04.",
  },
  {
    titulo: "Súmula Vinculante 23 do STF",
    texto:
      "Súmula Vinculante 23/STF (ATIVA): A Justiça do Trabalho é competente para processar e julgar ação possessória ajuizada em decorrência do exercício do direito de greve pelos trabalhadores da iniciativa privada.",
  },
  {
    titulo: "Súmula Vinculante 24 do STF",
    texto:
      "Súmula Vinculante 24/STF (ATIVA): Não se tipifica crime material contra a ordem tributária, previsto no art. 1º, incisos I a IV, da Lei nº 8.137/90, antes do lançamento definitivo do tributo.",
  },
  {
    titulo: "Súmula Vinculante 25 do STF",
    texto:
      "Súmula Vinculante 25/STF (ATIVA): É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade do depósito.",
  },
  {
    titulo: "Súmula Vinculante 26 do STF",
    texto:
      "Súmula Vinculante 26/STF (ATIVA): Para efeito de progressão de regime no cumprimento de pena por crime hediondo, ou equiparado, o juízo da execução observará a inconstitucionalidade do art. 2º da Lei nº 8.072, de 25 de julho de 1990, sem prejuízo de avaliar se o condenado preenche, ou não, os requisitos objetivos e subjetivos do benefício, podendo determinar, para tal fim, de modo fundamentado, a realização de exame criminológico.",
  },
  {
    titulo: "Súmula Vinculante 27 do STF",
    texto:
      "Súmula Vinculante 27/STF (ATIVA): Compete à Justiça estadual julgar causas entre consumidor e concessionária de serviço público de telefonia, quando a ANATEL não seja litisconsorte passiva necessária, assistente, nem opoente.",
  },
  {
    titulo: "Súmula Vinculante 28 do STF",
    texto:
      "Súmula Vinculante 28/STF (ATIVA): É inconstitucional a exigência de depósito prévio como requisito de admissibilidade de ação judicial na qual se pretenda discutir a exigibilidade de crédito tributário.",
  },
  {
    titulo: "Súmula Vinculante 29 do STF",
    texto:
      "Súmula Vinculante 29/STF (ATIVA): É constitucional a adoção, no cálculo do valor de taxa, de um ou mais elementos da base de cálculo própria de determinado imposto, desde que não haja integral identidade entre uma base e outra.",
  },
  {
    titulo: "Súmula Vinculante 31 do STF",
    texto:
      "Súmula Vinculante 31/STF (ATIVA): É inconstitucional a incidência do Imposto sobre Serviços de Qualquer Natureza – ISS sobre operações de locação de bens móveis.",
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

console.log(
  `Lotes 02+03: ${SUMULAS.length} súmulas (SV 11–29 + 31; SV 30 omitida)\n`
);

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
console.log(
  "Nota: SV 30 permanece pendente de publicação no STF — não foi inserida."
);
if (falha) process.exit(1);

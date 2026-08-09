/**
 * Seed STJ lotes 4–6 (Súmulas 31–60).
 * Uso: node scripts/seed-sumulas-stj-lote-04-06.mjs
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
  [31, "A aquisição, pelo segurado, de mais de um imóvel financiado pelo Sistema Financeiro da Habitação, situados na mesma localidade, não exime a seguradora da obrigação de pagamento dos seguros."],
  [32, "Compete à Justiça Federal processar justificações judiciais destinadas a instruir pedidos perante entidades que nela tem exclusividade de foro, ressalvada a aplicação do art. 15, II da Lei 5010/66."],
  [33, "A incompetência relativa não pode ser declarada de ofício."],
  [34, "Compete à Justiça Estadual processar e julgar causa relativa a mensalidade escolar, cobrada por estabelecimento particular de ensino."],
  [35, "Incide correção monetária sobre as prestações pagas, quando de sua restituição, em virtude da retirada ou exclusão do participante de plano de consórcio."],
  [36, "A correção monetária integra o valor da restituição, em caso de adiantamento de câmbio, requerida em concordata ou falência."],
  [37, "São cumuláveis as indenizações por dano material e dano moral oriundos do mesmo fato."],
  [38, "Compete à Justiça Estadual Comum, na vigência da Constituição de 1988, o processo por contravenção penal, ainda que praticada em detrimento de bens, serviços ou interesse da União ou de suas entidades."],
  [39, "Prescreve em vinte anos a ação para haver indenização, por responsabilidade civil, de sociedade de economia mista."],
  [40, "Para obtenção dos benefícios de saída temporária e trabalho externo, considera-se o tempo de cumprimento da pena no regime fechado."],
  [41, "O Superior Tribunal de Justiça não tem competência para processar e julgar, originariamente, mandado de segurança contra ato de outros tribunais ou dos respectivos órgãos."],
  [42, "Compete à Justiça Comum Estadual processar e julgar as causas cíveis em que é parte sociedade de economia mista e os crimes praticados em seu detrimento."],
  [43, "Incide correção monetária sobre dívida por ato ilícito a partir da data do efetivo prejuízo."],
  [44, "A definição, em ato regulamentar, de grau mínimo de disacusia, não exclui, por si só, a concessão do benefício previdenciário."],
  [45, "No reexame necessário, é defeso, ao Tribunal, agravar a condenação imposta à Fazenda Pública."],
  [46, "Na execução por carta, os embargos do devedor serão decididos no juízo deprecante, salvo se versarem unicamente vícios ou defeitos da penhora, avaliação ou alienação dos bens."],
  [47, "Compete à Justiça Militar processar e julgar crime cometido por militar contra civil, com emprego de arma pertencente à corporação, mesmo não estando em serviço."],
  [48, "Compete ao juízo do local da obtenção da vantagem ilícita processar e julgar crime de estelionato cometido mediante falsificação de cheque."],
  [49, "Na exportação de café em grão, não se inclui na base de cálculo do ICM a quota de contribuição a que se refere o art. 2º do Decreto-lei 2.295, de 21.11.86."],
  [50, "O adicional de tarifa portuária incide apenas nas operações realizadas com mercadorias importadas ou exportadas, objeto do comércio de navegação de longo curso."],
  [51, 'A punição do intermediador, no jogo do bicho, independe da identificação do "apostador" ou do "banqueiro".'],
  [52, "Encerrada a instrução criminal, fica superada a alegação de constrangimento por excesso de prazo."],
  [53, "Compete à Justiça Comum Estadual processar e julgar civil acusado de prática de crime contra instituições militares estaduais."],
  [54, "Os juros moratórios fluem a partir do evento danoso, em caso de responsabilidade extracontratual."],
  [55, "Tribunal Regional Federal não é competente para julgar recurso de decisão proferida por juiz estadual não investido de jurisdição federal."],
  [56, "Na desapropriação para instituir servidão administrativa são devidos os juros compensatórios pela limitação de uso da propriedade."],
  [57, "Compete à Justiça Comum Estadual processar e julgar ação de cumprimento fundada em acordo ou convenção coletiva não homologados pela Justiça do Trabalho."],
  [58, "Proposta a execução fiscal, a posterior mudança de domicílio do executado não desloca a competência já fixada."],
  [59, "Não há conflito de competência se já existe sentença com trânsito em julgado, proferida por um dos juízos conflitantes."],
  [60, "É nula a obrigação cambial assumida por procurador do mutuário vinculado ao mutuante, no exclusivo interesse deste."],
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
console.log("STJ lotes 4–6: Súmulas 31–60. Próximo: 61 (cancelada) + 62–70.");
if (falha) process.exit(1);

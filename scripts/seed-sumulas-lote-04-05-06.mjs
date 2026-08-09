/**
 * Seed lotes 4–6 (SV 32–61) + corrige SV 9 na base.
 * Uso: node scripts/seed-sumulas-lote-04-05-06.mjs
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
  [
    9,
    "O disposto no artigo 127 da Lei nº 7.210/1984 (Lei de Execução Penal) foi recebido pela ordem constitucional vigente, e não se lhe aplica o limite temporal previsto no caput do artigo 58.",
  ],
  [32, "O ICMS não incide sobre alienação de salvados de sinistro pelas seguradoras."],
  [
    33,
    "Aplicam-se ao servidor público, no que couber, as regras do regime geral da previdência social sobre aposentadoria especial de que trata o artigo 40, § 4º, inciso III da Constituição Federal, até a edição de lei complementar específica.",
  ],
  [
    34,
    "A Gratificação de Desempenho de Atividade de Seguridade Social e do Trabalho – GDASST, instituída pela Lei 10.483/2002, deve ser estendida aos inativos no valor correspondente a 60 (sessenta) pontos, desde o advento da Medida Provisória 198/2004, convertida na Lei 10.971/2004, quando tais inativos façam jus à paridade constitucional (EC 20/1998, 41/2003 e 47/2005).",
  ],
  [
    35,
    "A homologação da transação penal prevista no artigo 76 da Lei 9.099/1995 não faz coisa julgada material e, descumpridas suas cláusulas, retoma-se a situação anterior, possibilitando-se ao Ministério Público a continuidade da persecução penal mediante oferecimento de denúncia ou requisição de inquérito policial.",
  ],
  [
    36,
    "Compete à Justiça Federal comum processar e julgar civil denunciado pelos crimes de falsificação e de uso de documento falso quando se tratar de falsificação da Caderneta de Inscrição e Registro (CIR) ou de Carteira de Habilitação de Amador (CHA), ainda que expedidas pela Marinha do Brasil.",
  ],
  [
    37,
    "Não cabe ao Poder Judiciário, que não tem função legislativa, aumentar vencimentos de servidores públicos sob o fundamento de isonomia.",
  ],
  [
    38,
    "É competente o Município para fixar o horário de funcionamento de estabelecimento comercial.",
  ],
  [
    39,
    "Compete privativamente à União legislar sobre vencimentos dos membros das polícias civil e militar e do corpo de bombeiros militar do Distrito Federal.",
  ],
  [
    40,
    "A contribuição confederativa de que trata o art. 8º, IV, da Constituição Federal, só é exigível dos filiados ao sindicato respectivo.",
  ],
  [41, "O serviço de iluminação pública não pode ser remunerado mediante taxa."],
  [
    42,
    "É inconstitucional a vinculação do reajuste de vencimentos de servidores estaduais ou municipais a índices federais de correção monetária.",
  ],
  [
    43,
    "É inconstitucional toda modalidade de provimento que propicie ao servidor investir-se, sem prévia aprovação em concurso público destinado ao seu provimento, em cargo que não integra a carreira na qual anteriormente investido.",
  ],
  [
    44,
    "Só por lei se pode sujeitar a exame psicotécnico a habilitação de candidato a cargo público.",
  ],
  [
    45,
    "A competência constitucional do Tribunal do Júri prevalece sobre o foro por prerrogativa de função estabelecido exclusivamente pela constituição estadual.",
  ],
  [
    46,
    "A definição dos crimes de responsabilidade e o estabelecimento das respectivas normas de processo e julgamento são da competência legislativa privativa da União.",
  ],
  [
    47,
    "Os honorários advocatícios incluídos na condenação ou destacados do montante principal devido ao credor consubstanciam verba de natureza alimentar cuja satisfação ocorrerá com a expedição de precatório ou requisição de pequeno valor, observada ordem especial restrita aos créditos dessa natureza.",
  ],
  [
    48,
    "Na entrada de mercadoria importada do exterior, é legítima a cobrança do ICMS por ocasião do desembaraço aduaneiro.",
  ],
  [
    49,
    "Ofende o princípio da livre concorrência lei municipal que impede a instalação de estabelecimentos comerciais do mesmo ramo em determinada área.",
  ],
  [
    50,
    "Norma legal que altera o prazo de recolhimento de obrigação tributária não se sujeita ao princípio da anterioridade.",
  ],
  [
    51,
    "O reajuste de 28,86%, concedido aos servidores militares pelas Leis 8622/1993 e 8627/1993, estende-se aos servidores civis do poder executivo, observadas as eventuais compensações decorrentes dos reajustes diferenciados concedidos pelos mesmos diplomas legais.",
  ],
  [
    52,
    "Ainda quando alugado a terceiros, permanece imune ao Imposto sobre a Propriedade Predial e Territorial Urbana (IPTU) o imóvel pertencente a qualquer das entidades referidas pelo art. 150, VI, “c”, da Constituição Federal, desde que o valor dos aluguéis seja aplicado nas atividades para as quais tais entidades foram constituídas.",
  ],
  [
    53,
    "A competência da Justiça do Trabalho prevista no art. 114, VIII, da Constituição Federal alcança a execução de ofício das contribuições previdenciárias relativas ao objeto da condenação constante das sentenças que proferir e acordos por ela homologados.",
  ],
  [
    54,
    "A medida provisória não apreciada pelo congresso nacional podia, até a Emenda Constitucional 32/2001, ser reeditada dentro do seu prazo de eficácia de trinta dias, mantidos os efeitos de lei desde a primeira edição.",
  ],
  [55, "O direito ao auxílio-alimentação não se estende aos servidores inativos."],
  [
    56,
    "A falta de estabelecimento penal adequado não autoriza a manutenção do condenado em regime prisional mais gravoso, devendo-se observar, nessa hipótese, os parâmetros fixados no RE 641.320/RS.",
  ],
  [
    57,
    "A imunidade tributária constante do art. 150, VI, d, da CF/88 aplica-se à importação e comercialização, no mercado interno, do livro eletrônico (e-book) e dos suportes exclusivamente utilizados para fixá-los, como leitores de livros eletrônicos (e-readers), ainda que possuam funcionalidades acessórias.",
  ],
  [
    58,
    "Inexiste direito a crédito presumido de IPI relativamente à entrada de insumos isentos, sujeitos à alíquota zero ou não tributáveis, o que não contraria o princípio da não cumulatividade.",
  ],
  [
    59,
    "É impositiva a fixação do regime aberto e a substituição da pena privativa de liberdade por restritiva de direitos quando reconhecida a figura do tráfico privilegiado (art. 33, § 4º, da Lei 11.343/06) e ausentes vetores negativos na primeira fase da dosimetria (art. 59 do CP), observados os requisitos do art. 33, § 2º, alínea c, e do art. 44, ambos do Código Penal.",
  ],
  [
    60,
    "O pedido e a análise administrativos de fármacos na rede pública de saúde, a judicialização do caso, bem ainda seus desdobramentos (administrativos e jurisdicionais), devem observar os termos dos 3 (três) acordos interfederativos (e seus fluxos) homologados pelo Supremo Tribunal Federal, em governança judicial colaborativa, no tema 1.234 da sistemática da repercussão geral (RE 1.366.243).",
  ],
  [
    61,
    "A concessão judicial de medicamento registrado na ANVISA, mas não incorporado às listas de dispensação do Sistema Único de Saúde, deve observar as teses firmadas no julgamento do Tema 6 da Repercussão Geral (RE 566.471).",
  ],
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
  const titulo = `Súmula Vinculante ${n} do STF`;
  const texto = `Súmula Vinculante ${n}/STF (ATIVA): ${enunciado}`;
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
console.log("Pendentes: SV 30 (sem publicação), SV 62 (próximo lote), STJ.");
if (falha) process.exit(1);

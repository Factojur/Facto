/**
 * Seed STF NV lotes 4–10 (Súmulas 31–100).
 * Fora do RAG neste bloco: (nenhuma).
 * Uso: node scripts/seed-sumulas-stf-nv-lote-04-10.mjs
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

const FORA = [];
const ITEMS = [
  [
    31,
    "Para aplicação da L. 1741, de 22.11.52, soma-se o tempo de serviço ininterrupto em mais de um cargo em comissão."
  ],
  [
    32,
    "Para aplicação da L. 1741, de 22.11.52, soma-se o tempo de serviço ininterrupto em cargo em comissão e em função gratificada."
  ],
  [
    33,
    "A L. 1.741, de 22.11.52, é aplicável às autarquias federais."
  ],
  [
    34,
    "No Estado de São Paulo, funcionário eleito vereador fica licenciado por toda a duração do mandato."
  ],
  [
    35,
    "Em caso de acidente do trabalho ou de transporte, a concubina tem direito de ser indenizada pela morte do amásio, se entre eles não havia impedimento para o matrimônio."
  ],
  [
    36,
    "Servidor vitalício está sujeito à aposentadoria compulsória, em razão da idade."
  ],
  [
    37,
    "Não tem direito de se aposentar pelo Tesouro Nacional o servidor que não satisfizer as condições estabelecidas na legislação do serviço público federal, ainda que aposentado pela respectiva instituição previdenciária, com direito, em tese, a duas aposentadorias."
  ],
  [
    38,
    "Reclassificação posterior à aposentadoria não aproveita ao servidor aposentado."
  ],
  [
    39,
    "À falta de lei, funcionário em disponibilidade não pode exigir, judicialmente, o seu aproveitamento, que fica subordinado ao critério de conveniência da administração."
  ],
  [
    40,
    "A elevação da entrância da comarca não promove automaticamente o juiz, mas não interrompe o exercício de suas funções na mesma comarca."
  ],
  [
    41,
    "Juízes preparadores ou substitutos não têm direito aos vencimentos da atividade fora dos períodos de exercício."
  ],
  [
    42,
    "É legítima a equiparação de juízes do Tribunal de Contas, em direitos e garantias, aos membros do Poder Judiciário."
  ],
  [
    43,
    "Não contraria a Constituição Federal o art. 61 da Constituição de São Paulo, que equiparou os vencimentos do Ministério Público aos da magistratura."
  ],
  [
    44,
    "O exercício do cargo pelo prazo determinado na L. 1.341, de 30.1.51, art. 91, dá preferência para a nomeação interina de Procurador da República."
  ],
  [
    45,
    "A estabilidade dos substitutos do Ministério Público Militar não confere direito aos vencimentos da atividade fora dos períodos de exercício."
  ],
  [
    46,
    "Desmembramento de serventia de justiça não viola o princípio de vitaliciedade do serventuário."
  ],
  [
    47,
    "Reitor de universidade não é livremente demissível pelo Presidente da República durante o prazo de sua investidura."
  ],
  [
    48,
    "É legítimo o rodízio de docentes livres na substituição do professor catedrático."
  ],
  [
    49,
    "A cláusula de inalienabilidade inclui a incomunicabilidade dos bens."
  ],
  [
    50,
    "A lei pode estabelecer condições para a demissão de extranumerário."
  ],
  [
    51,
    "Militar não tem direito a mais de duas promoções na passagem para a inatividade, ainda que por motivos diversos."
  ],
  [
    52,
    "A promoção de militar, vinculada à inatividade, pode ser feita, quando couber, a pôsto inexistente no quadro."
  ],
  [
    53,
    "A promoção de professor militar, vinculada à sua reforma, pode ser feita, quando couber, a pôsto inexistente no quadro."
  ],
  [
    54,
    "A reserva ativa do magistério militar não confere vantagens vinculadas à efetiva passagem para a inatividade."
  ],
  [
    55,
    "Militar da reserva está sujeito à pena disciplinar."
  ],
  [
    56,
    "Militar reformado não está sujeito à pena disciplinar."
  ],
  [
    57,
    "Militar inativo não tem direito ao uso do uniforme fora dos casos previstos em lei ou regulamento."
  ],
  [
    58,
    "É válida a exigência de média superior a quatro para aprovação em estabelecimento de ensino superior, consoante o respectivo regimento."
  ],
  [
    59,
    "Imigrante pode trazer, sem licença prévia, automóvel que lhe pertença desde mais de seis meses antes do seu embarque para o Brasil."
  ],
  [
    60,
    "Não pode o estrangeiro trazer automóvel quando não comprovada a transferência definitiva de sua residência para o Brasil."
  ],
  [
    61,
    "Brasileiro domiciliado no estrangeiro, que se transfere definitivamente para o Brasil, pode trazer automóvel licenciado em seu nome há mais de seis meses"
  ],
  [
    62,
    "Não basta a simples estada no estrangeiro por mais de seis meses, para dar direito à trazida de automóvel com fundamento em transferência de residência."
  ],
  [
    63,
    "É indispensável, para trazida de automóvel, a prova do licenciamento há mais de seis meses no país de origem."
  ],
  [
    64,
    "É permitido trazer do estrangeiro, como bagagem, objetos de uso pessoal e doméstico, desde que, por sua quantidade e natureza, não induzam finalidade comercial."
  ],
  [
    65,
    "A cláusula de aluguel progressivo anterior à L. 3.494, de 19.12.58, continua em vigor em caso de prorrogação legal ou convencional da locação."
  ],
  [
    66,
    "É legítima a cobrança do tributo que houver sido aumentado após o orçamento, mas antes do início do respectivo exercício financeiro."
  ],
  [
    67,
    "É inconstitucional a cobrança do tributo que houver sido criado ou aumentado no mesmo exercício financeiro."
  ],
  [
    68,
    "É legítima a cobrança, pelos Municípios, no exercício de 1961, de tributo estadual, regularmente criado ou aumentado, e que lhes foi transferido pela Emenda Constitucional nº 5, de 21.11.61."
  ],
  [
    69,
    "A Constituição estadual não pode estabelecer limite para o aumento de tributos municipais."
  ],
  [
    70,
    "É inadmissível a interdição de estabelecimento como meio coercitivo para cobrança de tributo."
  ],
  [
    71,
    "Embora pago indevidamente, não cabe restituição de tributo indireto."
  ],
  [
    72,
    "No julgamento de questão constitucional, vinculada a decisão do Tribunal Superior Eleitoral, não estão impedidos os Ministros do Supremo Tribunal Federal que ali tenham funcionado no mesmo processo, ou no processo originário."
  ],
  [
    73,
    "A imunidade das autarquias, implicitamente contida no art. 31, V, \"a\", da Constituição Federal, abrange tributos estaduais e municipais."
  ],
  [
    74,
    "O imóvel transcrito em nome de autarquia, embora objeto de promessa de venda a particulares, continua imune de impostos locais."
  ],
  [
    75,
    "Sendo vendedora uma autarquia, a sua imunidade fiscal não compreende o impôsto de transmissão \"inter vivos\", que é encargo do comprador."
  ],
  [
    76,
    "As sociedades de economia mista não estão protegidas pela imunidade fiscal do art. 31, V, \"a\", Constituição Federal."
  ],
  [
    77,
    "Está isenta de impostos federais a aquisição de bens pela Rêde Ferroviária Federal."
  ],
  [
    78,
    "Estão isentas de impostos locais as emprêsas de energia elétrica, no que respeita às suas atividades específicas."
  ],
  [
    79,
    "O Banco do Brasil não tem isenção de tributos locais."
  ],
  [
    80,
    "Para a retomada de prédio situado fora do domicílio do locador exige-se a prova da necessidade."
  ],
  [
    81,
    "As cooperativas não gozam de isenção de impostos locais, com fundamento na Constituição e nas leis federais."
  ],
  [
    82,
    "São inconstitucionais o impôsto de cessão e a taxa sôbre inscrição de promessa de venda de imóvel, substitutivos do impôsto de transmissão, por incidirem sôbre ato que não transfere o domínio."
  ],
  [
    83,
    "Os ágios de importação incluem-se no valor dos artigos importados para incidência do impôsto de consumo."
  ],
  [
    84,
    "Não estão isentos do impôsto de consumo os produtos importados pelas cooperativas."
  ],
  [
    85,
    "Não estão sujeitos ao impôsto de consumo os bens de uso pessoal e doméstico trazidos, como bagagem, do exterior."
  ],
  [
    86,
    "Não está sujeito ao impôsto de consumo automóvel usado, trazido do exterior pelo proprietário."
  ],
  [
    87,
    "Somente no que não colidirem com a L. 3.244, de 14.8.57, são aplicáveis acordos tarifários anteriores."
  ],
  [
    88,
    "É válida a majoração da tarifa alfandegária, resultante da L. 3.244, de 14.8.57, que modificou o Acordo Geral sôbre Tarifas Aduaneiras e Comércio (GATT), aprovado pela L. 313, de 30.7.48."
  ],
  [
    89,
    "Estão isentas do impôsto de importação frutas importadas da Argentina, do Chile, da Espanha e de Portugal, enquanto vigentes os respectivos acordos comerciais."
  ],
  [
    90,
    "É legítima a lei local que faça incidir o impôsto de indústrias e profissões com base no movimento econômico do contribuinte."
  ],
  [
    91,
    "A incidência do impôsto único não isenta o comerciante de combustíveis do impôsto de indústrias e profissões."
  ],
  [
    92,
    "É constitucional o art. 100, nº II, da L. 4.563, de 20.2.57, do Município de Recife, que faz variar o impôsto de licença em função do aumento do capital do contribuinte."
  ],
  [
    93,
    "Não está isenta do impôsto de renda a atividade profissional do arquiteto."
  ],
  [
    94,
    "É competente a autoridade alfandegária para o desconto, na fonte, do impôsto de renda correspondente às comissões dos despachantes aduaneiros."
  ],
  [
    95,
    "Para cálculo do impôsto de lucro extraordinário, incluem-se no capital as reservas do ano-base, apuradas em balanço."
  ],
  [
    96,
    "O impôsto de lucro imobiliário incide sôbre a venda de imóvel da meação do cônjuge sobrevivente, ainda que aberta a sucessão antes da vigência da L. 3.470, de 28.11.58."
  ],
  [
    97,
    "É devida a alíquota anterior do impôsto de lucro imobiliário, quando a promessa de venda houver sido celebrada antes da vigência da lei que a tiver elevado."
  ],
  [
    98,
    "Sendo o imóvel alienado na vigência da L. 3.470, de 28.11.58, ainda que adquirido por herança, usucapião ou a título gratuito, é devido o impôsto de lucro imobiliário."
  ],
  [
    99,
    "Não é devido o impôsto de lucro imobiliário, quando a alienação de imóvel adquirido por herança, ou a título gratuito, tiver sido anterior à vigência da L. 3.470, de 28.11.58."
  ],
  [
    100,
    "Não é devido o impôsto de lucro imobiliário, quando a alienação de imóvel, adquirido por usucapião, tiver sido anterior à vigência da L. 3.470, de 28.11.58."
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
console.log("STF NV lotes 4–10: 31–100.");
if (falha) process.exit(1);

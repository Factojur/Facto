/**
 * Seed STF NV lotes 51–74 (Súmulas 501–736).
 * Fora do RAG neste bloco: 563, 584, 599.
 * Uso: node scripts/seed-sumulas-stf-nv-lote-51-74.mjs
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

const FORA = [563,584,599];
const ITEMS = [
  [
    501,
    "Compete à Justiça ordinária estadual o processo e o julgamento, em ambas as instâncias, das causas de acidente do trabalho, ainda que promovidas contra a União, suas autarquias, emprêsas públicas ou sociedades de economia mista."
  ],
  [
    502,
    "Na aplicação do art. 839 do C. Pr. Civ., com a redação da Lei nº 4.290, de 5.12.63, a relação valor da causa e salário mínimo vigente na Capital do Estado, ou do Território, para o efeito de alçada, deve ser considerada na data do ajuizamento do pedido."
  ],
  [
    503,
    "A dúvida, suscitada por particular, sôbre o direito de tributar, manifestado por dois Estados, não configura litígio da competência originária do Supremo Tribunal Federal."
  ],
  [
    504,
    "Compete à Justiça Federal, em ambas as instâncias, o processo e o julgamento das causas fundadas em contrato de seguro marítimo."
  ],
  [
    505,
    "Salvo quando contrariarem a Constituição, não cabe recurso para o Supremo Tribunal Federal, de quaisquer decisões da Justiça do Trabalho, inclusive dos presidentes de seus Tribunais."
  ],
  [
    506,
    "O agravo a que se refere o art. 4º da Lei nº 4.348, de 26.6.64, cabe, somente, do despacho do Presidente do Supremo Tribunal Federal que defere a suspensão da liminar, em mandado de segurança; não do que a denega."
  ],
  [
    507,
    "A ampliação dos prazos a que se refere o art. 32 do Código de Processo Civil aplica-se aos executivos fiscais."
  ],
  [
    508,
    "Compete à Justiça Estadual, em ambas as instâncias, processar e julgar as causas em que for parte o Banco do Brasil S. A."
  ],
  [
    509,
    "A Lei nº 4.632, de 18.5.65, que alterou o art. 64 do Código de Processo Civil, aplica-se aos processos em andamento, nas instâncias ordinárias."
  ],
  [
    510,
    "Praticado o ato por autoridade, no exercício de competência delegada, contra ela cabe o mandado de segurança ou a medida judicial."
  ],
  [
    511,
    "Compete à Justiça Federal, em ambas as instâncias, processar e julgar as causas entre autarquias federais e entidades públicas locais, inclusive mandados de segurança, ressalvada a ação fiscal, nos termos da Constituição Federal de 1967, art. 119, § 3º."
  ],
  [
    512,
    "Não cabe condenação em honorários de advogado na ação de mandado de segurança."
  ],
  [
    513,
    "A decisão que enseja a interposição de recurso ordinário ou extraordinário não é a do plenário, que resolve o incidente de inconstitucionalidade, mas a do órgão (Câmaras, Grupos ou Turmas) que completa o julgamento do feito."
  ],
  [
    514,
    "Admite-se ação rescisória contra sentença transitada em julgado, ainda que contra ela não se tenha esgotado todos os recursos."
  ],
  [
    515,
    "A competência para a ação rescisória não é do Supremo Tribunal Federal, quando a questão federal, apreciada no recurso extraordinário ou no agravo de instrumento, seja diversa da que foi suscitada no pedido rescisório."
  ],
  [
    516,
    "O Serviço Social da Indústria - S. E. S. I. - está sujeito à jurisdição da Justiça Estadual."
  ],
  [
    517,
    "As sociedades de economia mista só têm fôro na Justiça Federal, quando a União intervém como assistente ou opoente."
  ],
  [
    518,
    "A intervenção da União, em feito já julgado pela segunda instância e pendente de embargos, não desloca o processo para o Tribunal Federal de Recursos."
  ],
  [
    519,
    "Aplica-se aos executivos fiscais o princípio da sucumbência a que se refere o art. 64 do Código de Processo Civil."
  ],
  [
    520,
    "Não exige a lei que, para requerer o exame a que se refere o art. 777 do Código de Processo Penal, tenha o sentenciado cumprido mais de metade do prazo da medida de segurança imposta."
  ],
  [
    521,
    "O foro competente para o processo e julgamento dos crimes de estelionato, sob a modalidade da emissão dolosa de cheque sem provisão de fundos, é o do local onde se deu a recusa do pagamento pelo sacado."
  ],
  [
    522,
    "Salvo ocorrência de tráfico para o Exterior, quando, então, a competência será da Justiça Federal, compete à Justiça dos Estados o processo e julgamento dos crimes relativos a entorpecentes."
  ],
  [
    523,
    "No processo penal, a falta da defesa constitui nulidade absoluta, mas a sua deficiência só o anulará se houver prova de prejuízo para o réu."
  ],
  [
    524,
    "Arquivado o inquérito policial, por despacho do juiz, a requerimento do promotor de justiça, não pode a ação penal ser iniciada, sem novas provas."
  ],
  [
    525,
    "A medida de segurança não será aplicada em segunda instância, quando só o réu tenha recorrido."
  ],
  [
    526,
    "Subsiste a competência do Supremo Tribunal Federal para conhecer e julgar a apelação, nos crimes da Lei de Segurança Nacional, se houve sentença antes da vigência do A.I. nº 2."
  ],
  [
    527,
    "Após a vigência do Ato Institucional nº 6, que deu nova redação ao art. 114, III, da Constituição Federal de 1967, não cabe recurso extraordinário das decisões do juiz singular."
  ],
  [
    528,
    "Se a decisão contiver partes autônomas, a admissão parcial, pelo Presidente do Tribunal a quo, de recurso extraordinário que, sôbre qualquer delas se manifestar, não limitará a apreciação de todas pelo Supremo Tribunal Federal, independentemente de interposição de agravo de instrumento."
  ],
  [
    529,
    "Subsiste a responsabilidade do empregador pela indenização decorrente de acidente do trabalho, quando o segurador, por haver entrado em liquidação, ou por outro motivo, não se encontrar em condições financeiras, de efetuar, na forma da lei, o pagamento que o seguro obrigatório visava garantir."
  ],
  [
    530,
    "Na legislação anterior ao art. 4º da Lei nº 4.749, de 12-8-1965, a contribuição para a previdência social não estava sujeita ao limite estabelecido no art. 69 da Lei nº 3.807, de 26 de agosto de 1960, sôbre o 13º salário a que se refere o art. 3º da Lei nº 4.281, de 8-11-63."
  ],
  [
    531,
    "É inconstitucional o Decreto nº 51.668, de 17-1-1963, que estabeleceu salário profissional para trabalhadores de transportes marítimos, fluviais e lacustres."
  ],
  [
    532,
    "É constitucional a Lei nº 5.043, de 21.6.66, que concedeu remissão das dívidas fiscais oriundas da falta de oportuno pagamento de sêlo nos contratos particulares com a Caixa Econômica e outras entidades autárquicas."
  ],
  [
    533,
    "Nas operações denominadas \"crediários\", com emissão de vales ou certificados para compras e nas quais, pelo financiamento, se cobram, em separado, juros, selos e outras despesas, incluir-se-á tudo no custo da mercadoria e sôbre esse preço global calcular-se-á o impôsto de vendas e consignações."
  ],
  [
    534,
    "O impôsto de importação sôbre o extrato alcoólico de malte, como matéria-prima para fabricação de whisky, incide à base de 60%, desde que desembarcado antes do Ddecreto-lei nº 398, de 30.12.1968."
  ],
  [
    535,
    "Na importação, a granel, de combustíveis líquidos é admíssivel a diferença de pêso, para mais, até 4%, motivada pelas variações previstas no Decreto-lei nº 1.028, de 4-1-1939, art. 1º."
  ],
  [
    536,
    "São objetivamente imunes ao impôsto sôbre circulação de mercadorias os produtos industrializados, em geral, destinados à exportação, além de outros, com a mesma destinação, cuja isenção a lei determinar."
  ],
  [
    537,
    "É inconstitucional a exigência de impôsto estadual do sêlo, quando feita nos atos e instrumentos tributados ou regulados por lei federal, ressalvado o disposto no art. 15, § 5º, da Constituição Federal de 1946."
  ],
  [
    538,
    "A avaliação judicial para o efeito do cálculo das benfeitorias dedutíveis do impôsto sôbre lucro imobiliário independe do limite a que se refere a Lei nº 3.470, de 28-11-1958, art. 8º, parágrafo único."
  ],
  [
    539,
    "É constitucional a lei do Município que reduz o impôsto predial urbano sôbre imóvel ocupado pela residência do proprietário, que não possua outro."
  ],
  [
    540,
    "No preço da mercadoria sujeita ao impôsto de vendas e consignações, não se incluem as despesas de frete e carreto."
  ],
  [
    541,
    "O impôsto sôbre vendas e consignações não incide sôbre a venda ocasional de veículos e equipamentos usados, que não se insere na atividade profissional do vendedor, e não é realizada com o fim de lucro, sem caráter, pois, de comercialidade."
  ],
  [
    542,
    "Não é inconstitucional a multa instituída pelo Estado-membro, como sanção pelo retardamento do início ou da ultimação do inventário."
  ],
  [
    543,
    "A Lei nº 2.975, de 27-11-1965, revogou, apenas, as isenções de caráter geral, relativas ao impôsto único sôbre combustíveis, não as especiais, por outras leis concedidas."
  ],
  [
    544,
    "Isenções tributárias concedidas, sob condição onerosa, não podem ser livremente suprimidas."
  ],
  [
    545,
    "Preços de serviços públicos e taxas não se confundem, porque estas, diferentemente daqueles, são compulsórias e têm sua cobrança condicionada à prévia autorização orçamentária, em relação à lei que as instituiu."
  ],
  [
    546,
    "Cabe a restituição do tributo pago indevidamente, quando reconhecido por decisão, que o contribuinte de jure não recuperou do contribuinte de facto o quantum respectivo."
  ],
  [
    547,
    "Não é lícito à autoridade proibir que o contribuinte em débito adquira estampilhas, despache mercadorias nas alfândegas e exerça suas atividades profissionais."
  ],
  [
    548,
    "É inconstitucional o Decreto-lei nº 643, de 19.6.47, artigo 4º, do Paraná, na parte que exige sêlo proporcional sôbre atos e instrumentos regulados por lei federal."
  ],
  [
    549,
    "A Taxa de Bombeiros do Estado de Pernambuco é constitucional, revogada a Súmula nº 274."
  ],
  [
    550,
    "A isenção concedida pelo art. 2º da Lei nº 1.815 de 1953, às emprêsas de navegação aérea não compreende a taxa de melhoramento de portos, instituída pela Lei nº 3.421 de 1958."
  ],
  [
    551,
    "É inconstitucional a taxa de urbanização da Lei número 2.320, de 20-12-1961, instituída pelo Município de Pôrto Alegre, porque seu fato gerador é o mesmo da transmissão imobiliária."
  ],
  [
    552,
    "Com a regulamentação do art. 15 da Lei nº 5.316/67, pelo Decreto 71.037/72, tornou-se exequível a exigência da exaustão da via administrativa antes do início da ação de acidente do trabalho."
  ],
  [
    553,
    "O Adicional ao Frete para Renovação da Marinha Mercante (AFRMM) é contribuição parafiscal, não sendo abrangido pela imunidade prevista na letra d, inciso III, do art. 19, da Constituição Federal."
  ],
  [
    554,
    "O pagamento de cheque emitido sem provisão de fundos, após o recebimento da denúncia, não obsta ao prosseguimento da ação penal."
  ],
  [
    555,
    "É competente o Tribunal de Justiça para julgar conflito de jurisdição entre Juiz de Direito do Estado e a Justiça Militar local."
  ],
  [
    556,
    "É competente a Justiça comum para julgar as causas em que é parte sociedade de economia mista."
  ],
  [
    557,
    "É competente a Justiça Federal para julgar as causas em que são partes a COBAL e a CIBRAZEM."
  ],
  [
    558,
    "É constitucional o art. 27 do Decreto-lei 898, de 29.9.69."
  ],
  [
    559,
    "O Decreto-lei 730, de 5.8.69, revogou a exigência de homologação, pelo Ministro da Fazenda, das Resoluções do Conselho de Política Aduaneira."
  ],
  [
    560,
    "A extinção de punibilidade, pelo pagamento do tributo devido, estende-se ao crime de contrabando ou descaminho, por força do art. 18, § 2º, do Decreto-lei 157/67."
  ],
  [
    561,
    "Em desapropriação, é devida a correção monetária até a data do efetivo pagamento da indenização, devendo proceder-se à atualização do cálculo, ainda que por mais de uma vez."
  ],
  [
    562,
    "Na indenização de danos materiais decorrentes de ato ilícito cabe a atualização de seu valor, utilizando-se, para esse fim, dentre outros critérios, dos índices de correção monetária."
  ],
  [
    564,
    "A ausência de fundamentação do despacho de recebimento de denúncia por crime falimentar enseja nulidade processual, salvo se já houver sentença condenatória."
  ],
  [
    565,
    "A multa fiscal moratória constitui pena administrativa, não se incluindo no crédito habilitado em falência."
  ],
  [
    566,
    "Enquanto pendente, o pedido de readaptação fundado em desvio funcional não gera direitos para o servidor, relativamente ao cargo pleiteado."
  ],
  [
    567,
    "A constituição, ao assegurar, no § 3º do art. 102, a contagem integral do tempo de serviço público federal, estadual ou municipal para os efeitos de aposentadoria e disponibilidade não proíbe à União, aos Estados e aos Municípios mandarem contar, mediante lei, para efeito diverso, tempo de serviço prestado a outra pessoa de direito público interno."
  ],
  [
    568,
    "A identificação criminal não constitui constrangimento ilegal, ainda que o indiciado já tenha sido identificado civilmente."
  ],
  [
    569,
    "É inconstitucional a discriminação de alíquotas do imposto de circulação de mercadorias nas operações interestaduais, em razão de o destinatário ser, ou não, contribuinte."
  ],
  [
    570,
    "O impôsto de circulação de mercadorias não incide sobre a importação de bens de capital."
  ],
  [
    571,
    "O comprador de café ao IBC, ainda que sem expedição de nota fiscal, habilita-se, quando da comercialização do produto, ao crédito do ICM que incidiu sobre a operação anterior."
  ],
  [
    572,
    "No cálculo do imposto de circulação de mercadorias devido na saída de mercadorias para o exterior, não se incluem fretes pagos a terceiros, seguros e despesas de embarque."
  ],
  [
    573,
    "Não constitui fato gerador do imposto de circulação de mercadorias a saída física de máquinas, utensílios e implementos a título de comodato."
  ],
  [
    574,
    "Sem lei estadual que a estabeleça, é ilegítima a cobrança do imposto de circulação de mercadorias sobre o fornecimento de alimentação e bebidas em restaurante ou estabelecimento similar."
  ],
  [
    575,
    "À mercadoria importada de país signatário do GATT, ou membro da ALALC, estende-se a isenção do imposto de circulação de mercadorias concedida a similar nacional."
  ],
  [
    576,
    "É lícita a cobrança do imposto de circulação de mercadorias sobre produtos importados sob o regime da alíquota \"zero\"."
  ],
  [
    577,
    "Na importação de mercadorias do exterior, o fato gerador do imposto de circulação de mercadorias ocorre no momento de sua entrada no estabelecimento do importador."
  ],
  [
    578,
    "Não podem os Estados, a título de ressarcimento de despesas, reduzir a parcela de 20% do produto da arrecadação do imposto de circulação de mercadorias, atribuída aos Municípios pelo art. 23, § 8º, da Constituição Federal."
  ],
  [
    579,
    "A cal virgem e a hidratada estão sujeitas ao imposto de circulação de mercadorias."
  ],
  [
    580,
    "A isenção prevista no art. 13, parágrafo único, do Decreto-lei 43/66, restringe-se aos filmes cinematográficos."
  ],
  [
    581,
    "A exigência de transporte em navio de bandeira brasileira, para efeito de isenção tributária, legitimou-se com o advento do Decreto-lei nº 666, de 2.7.69."
  ],
  [
    582,
    "É constitucional a Resolução nº 640/69, do Conselho de Política Aduaneira, que reduziu a alíquota do imposto de importação para a soda cáustica, destinada a zonas de difícil distribuição e abastecimento."
  ],
  [
    583,
    "Promitente-Comprador de imóvel residencial transcrito em nome de autarquia é contribuinte do imposto predial territorial urbano."
  ],
  [
    585,
    "Não incide o imposto de renda sobre a remessa de divisas para pagamento de serviços prestados no exterior, por empresa que não opera no Brasil."
  ],
  [
    586,
    "Incide imposto de renda sobre os juros remetidos para o exterior, com base em contrato de mútuo."
  ],
  [
    587,
    "Incide imposto de renda sobre o pagamento de serviços técnicos contratados no exterior e prestados no Brasil."
  ],
  [
    588,
    "O imposto sobre serviços não incide sobre os depósitos, as comissões e taxas de desconto, cobrados pelos estabelecimentos bancários."
  ],
  [
    589,
    "É inconstitucional a fixação de adicional progressivo do imposto predial e territorial urbano em função do número de imóveis do contribuinte."
  ],
  [
    590,
    "Calcula-se o imposto de transmissão causa mortis sobre o saldo credor da promessa de compra e venda de imóvel, no momento da abertura da sucessão do promitente vendedor."
  ],
  [
    591,
    "A imunidade ou a isenção tributária do comprador não se estende ao produtor, contribuinte do imposto sobre produtos industrializados."
  ],
  [
    592,
    "Nos crimes falimentares, aplicam-se as causas interruptivas da prescrição, previstas no Código Penal."
  ],
  [
    593,
    "Incide o percentual do Fundo de Garantia do Tempo de Serviço (FGTS) sobre a parcela da remuneração correspondente a horas extraordinárias de trabalho."
  ],
  [
    594,
    "Os direitos de queixa e de representação podem ser exercidos, independentemente, pelo ofendido ou por seu representante legal."
  ],
  [
    595,
    "É inconstitucional a taxa municipal de conservação de estradas de rodagem cuja base de cálculo seja idêntica à do imposto territorial rural."
  ],
  [
    596,
    "As disposições do Decreto 22.626/33 não se aplicam às taxas de juros e aos outros encargos cobrados nas operações realizadas por instituições públicas ou privadas, que integram o sistema financeiro nacional."
  ],
  [
    597,
    "Não cabem embargos infringentes de acórdão que, em mandado de segurança decidiu, por maioria de votos, a apelação."
  ],
  [
    598,
    "Nos embargos de divergência não servem como padrão de discordância os mesmos paradigmas invocados para demonstrá-la mas repelidos como não dissidentes no julgamento do recurso extraordinário."
  ],
  [
    600,
    "Cabe ação executiva contra o emitente e seus avalistas, ainda que não apresentado o cheque ao sacado no prazo legal, desde que não prescrita a ação cambiária."
  ],
  [
    601,
    "Os arts. 3º, II, e 55 da Lei Complementar nº 40/81 (Lei Orgânica do Ministério Público) não revogaram a legislação anterior que atribui a iniciativa para a ação penal pública, no processo sumário, ao juiz ou à autoridade policial, mediante Portaria ou Auto de Prisão em Flagrante."
  ],
  [
    602,
    "Nas causas criminais, o prazo de interposição de Recurso Extraordinário é de 10 (dez) dias."
  ],
  [
    603,
    "A competência para o processo e julgamento de latrocínio é do Juiz singular e não do Tribunal do Júri."
  ],
  [
    604,
    "A prescrição pela pena em concreto é somente da pretensão executória da pena privativa de liberdade."
  ],
  [
    605,
    "Não se admite continuidade delitiva nos crimes contra a vida."
  ],
  [
    606,
    "Não cabe habeas corpus originário para o Tribunal Pleno de decisão de Turma, ou do Plenário, proferida em habeas corpus ou no respectivo recurso."
  ],
  [
    607,
    "Na ação penal regida pela Lei nº 4611/65, a denúncia, como substitutivo da Portaria, não interrompe a prescrição."
  ],
  [
    608,
    "No crime de estupro, praticado mediante violência real, a ação penal é pública incondicionada."
  ],
  [
    609,
    "É pública incondicionada a ação penal por crime de sonegação fiscal."
  ],
  [
    610,
    "Há crime de latrocínio, quando o homicídio se consuma, ainda que não realize o agente a subtração de bens da vítima."
  ],
  [
    611,
    "Transitada em julgado a sentença condenatória, compete ao Juízo das execuções a aplicação de lei mais benigna."
  ],
  [
    612,
    "Ao trabalhador rural não se aplicam, por analogia, os benefícios previstos na Lei nº 6367, de 19/10/76."
  ],
  [
    613,
    "Os dependentes de trabalhador rural não têm direito à pensão previdenciária, se o óbito ocorreu anteriormente à vigência da Lei Complementar nº 11/71."
  ],
  [
    614,
    "Somente o Procurador-Geral da Justiça tem legitimidade para propor ação direta interventiva por inconstitucionalidade de Lei Municipal."
  ],
  [
    615,
    "O princípio constitucional da anualidade (§ 29 do art. 153 da CF) não se aplica à revogação de isenção do ICM."
  ],
  [
    616,
    "É permitida a cumulação da multa contratual com os honorários de advogado, após o advento do Código de Processo Civil vigente."
  ],
  [
    617,
    "A base de cálculo dos honorários de advogado em desapropriação é a diferença entre a oferta e a indenização, corrigidas ambas monetariamente."
  ],
  [
    618,
    "Na desapropriação, direta ou indireta, a taxa dos juros compensatórios é de 12% (doze por cento) ao ano."
  ],
  [
    619,
    "A prisão do depositário judicial pode ser decretada no próprio processo em que se constituiu o encargo, independentemente da propositura de ação de depósito. (Revogada)"
  ],
  [
    620,
    "A sentença proferida contra Autarquias não está sujeita a reexame necessário, salvo quando sucumbente em execução de dívida ativa."
  ],
  [
    621,
    "Não enseja embargos de terceiro à penhora a promessa de compra e venda não inscrita no registro de imóveis."
  ],
  [
    622,
    "Não cabe agravo regimental contra decisão do relator que concede ou indefere liminar em mandado de segurança."
  ],
  [
    623,
    "Não gera por si só a competência originária do Supremo Tribunal Federal para conhecer do mandado de segurança com base no art. 102, I, n, da Constituição, dirigir-se o pedido contra deliberação administrativa do tribunal de origem, da qual haja participado a maioria ou a totalidade de seus membros."
  ],
  [
    624,
    "Não compete ao Supremo Tribunal Federal conhecer originariamente de mandado de segurança contra atos de outros tribunais."
  ],
  [
    625,
    "Controvérsia sobre matéria de direito não impede concessão de mandado de segurança."
  ],
  [
    626,
    "A suspensão da liminar em mandado de segurança, salvo determinação em contrário da decisão que a deferir, vigorará até o trânsito em julgado da decisão definitiva de concessão da segurança ou, havendo recurso, até a sua manutenção pelo Supremo Tribunal Federal, desde que o objeto da liminar deferida coincida, total ou parcialmente, com o da impetração."
  ],
  [
    627,
    "No mandado de segurança contra a nomeação de magistrado da competência do Presidente da República, este é considerado autoridade coatora, ainda que o fundamento da impetração seja nulidade ocorrida em fase anterior do procedimento."
  ],
  [
    628,
    "Integrante de lista de candidatos a determinada vaga da composição de tribunal é parte legítima para impugnar a validade da nomeação de concorrente."
  ],
  [
    629,
    "A impetração de mandado de segurança coletivo por entidade de classe em favor dos associados independe da autorização destes."
  ],
  [
    630,
    "A entidade de classe tem legitimação para o mandado de segurança ainda quando a pretensão veiculada interesse apenas a uma parte da respectiva categoria."
  ],
  [
    631,
    "Extingue-se o processo de mandado de segurança se o impetrante não promove, no prazo assinado, a citação do litisconsorte passivo necessário."
  ],
  [
    632,
    "É constitucional lei que fixa o prazo de decadência para a impetração de mandado de segurança."
  ],
  [
    633,
    "É incabível a condenação em verba honorária nos recursos extraordinários interpostos em processo trabalhista, exceto nas hipóteses previstas na Lei 5.584/70."
  ],
  [
    634,
    "Não compete ao Supremo Tribunal Federal conceder medida cautelar para dar efeito suspensivo a recurso extraordinário que ainda não foi objeto de juízo de admissibilidade na origem."
  ],
  [
    635,
    "Cabe ao Presidente do Tribunal de origem decidir o pedido de medida cautelar em recurso extraordinário ainda pendente do seu juízo de admissibilidade."
  ],
  [
    636,
    "Não cabe recurso extraordinário por contrariedade ao princípio constitucional da legalidade, quando a sua verificação pressuponha rever a interpretação dada a normas infraconstitucionais pela decisão recorrida."
  ],
  [
    637,
    "Não cabe recurso extraordinário contra acórdão de Tribunal de Justiça que defere pedido de intervenção estadual em Município."
  ],
  [
    638,
    "A controvérsia sobre a incidência, ou não, de correção monetária em operações de crédito rural é de natureza infraconstitucional, não viabilizando recurso extraordinário."
  ],
  [
    639,
    "Aplica-se a Súmula 288 quando não constarem do traslado do agravo de instrumento as cópias das peças necessárias à verificação da tempestividade do recurso extraordinário não admitido pela decisão agravada."
  ],
  [
    640,
    "É cabível recurso extraordinário contra decisão proferida por juiz de primeiro grau nas causas de alçada, ou por turma recursal de juizado especial cível e criminal."
  ],
  [
    641,
    "Não se conta em dobro o prazo para recorrer, quando só um dos litisconsortes haja sucumbido."
  ],
  [
    642,
    "Não cabe ação direta de inconstitucionalidade de lei do Distrito Federal derivada da sua competência legislativa municipal."
  ],
  [
    643,
    "O Ministério Público tem legitimidade para promover ação civil pública cujo fundamento seja a ilegalidade de reajuste de mensalidades escolares."
  ],
  [
    644,
    "Ao titular do cargo de procurador de autarquia não se exige a apresentação de instrumento de mandato para representá-la em juízo."
  ],
  [
    645,
    "É competente o Município para fixar o horário de funcionamento de estabelecimento comercial."
  ],
  [
    646,
    "Ofende o princípio da livre concorrência lei municipal que impede a instalação de estabelecimentos comerciais do mesmo ramo em determinada área."
  ],
  [
    647,
    "Compete privativamente à União legislar sobre vencimentos dos membros das polícias civil e militar do Distrito Federal."
  ],
  [
    648,
    "A norma do § 3º do art. 192 da Constituição, revogada pela EC 40/2003, que limitava a taxa de juros reais a 12% ao ano, tinha sua aplicabilidade condicionada à edição de lei complementar."
  ],
  [
    649,
    "É inconstitucional a criação, por Constituição estadual, de órgão de controle administrativo do Poder Judiciário do qual participem representantes de outros Poderes ou entidades."
  ],
  [
    650,
    "Os incisos I e XI do art. 20 da CF não alcançam terras de aldeamentos extintos, ainda que ocupadas por indígenas em passado remoto."
  ],
  [
    651,
    "A medida provisória não apreciada pelo Congresso Nacional podia, até a EC 32/2001, ser reeditada dentro do seu prazo de eficácia de trinta dias, mantidos os efeitos de lei desde a primeira edição."
  ],
  [
    652,
    "Não contraria a Constituição o art. 15, § 1º, do Dl. 3.365/41 (Lei da Desapropriação por utilidade pública)."
  ],
  [
    653,
    "No Tribunal de Contas estadual, composto por sete conselheiros, quatro devem ser escolhidos pela Assembléia Legislativa e três pelo Chefe do Poder Executivo estadual, cabendo a este indicar um dentre auditores e outro dentre membros do Ministério Público, e um terceiro a sua livre escolha."
  ],
  [
    654,
    "A garantia da irretroatividade da lei, prevista no art 5º, XXXVI, da Constituição da República, não é invocável pela entidade estatal que a tenha editado."
  ],
  [
    655,
    "A exceção prevista no art. 100, caput, da Constituição, em favor dos créditos de natureza alimentícia, não dispensa a expedição de precatório, limitando-se a isentá-los da observância da ordem cronológica dos precatórios decorrentes de condenações de outra natureza."
  ],
  [
    656,
    "É inconstitucional a lei que estabelece alíquotas progressivas para o imposto de transmissão inter vivos de bens imóveis - ITBI com base no valor venal do imóvel."
  ],
  [
    657,
    "A imunidade prevista no art. 150, VI, d, da Constituição Federal abrange os filmes e papéis fotográficos necessários à publicação de jornais e periódicos."
  ],
  [
    658,
    "São constitucionais os arts. 7º da Lei 7.787/89 e 1º da Lei 7.894/89 e da Lei 8.147/90, que majoraram a alíquota do Finsocial, quando devida a contribuição por empresas dedicadas exclusivamente à prestação de serviços."
  ],
  [
    659,
    "É legítima a cobrança da COFINS, do PIS e do FINSOCIAL sobre as operações relativas a energia elétrica, serviços de telecomunicações, derivados de petróleo, combustíveis e minerais do País."
  ],
  [
    660,
    "Não incide ICMS na importação de bens por pessoa física ou jurídica que não seja contribuinte do imposto."
  ],
  [
    661,
    "Na entrada de mercadoria importada do exterior, é legítima a cobrança do ICMS por ocasião do desembaraço aduaneiro."
  ],
  [
    662,
    "É legítima a incidência do ICMS na comercialização de exemplares de obras cinematográficas, gravados em fitas de videocassete."
  ],
  [
    663,
    "Os §§ 1º e 3º do art. 9º do Dl. 406/68 foram recebidos pela Constituição."
  ],
  [
    664,
    "É inconstitucional o inciso V do art. 1º da Lei 8.033/90, que instituiu a incidência do imposto nas operações de crédito, câmbio e seguros - IOF sobre saques efetuados em caderneta de poupança."
  ],
  [
    665,
    "É constitucional a Taxa de Fiscalização dos Mercados de Títulos e Valores Mobiliários instituída pela Lei 7.940/89."
  ],
  [
    666,
    "A contribuição confederativa de que trata o art. 8º, IV, da Constituição, só é exigível dos filiados ao sindicato respectivo."
  ],
  [
    667,
    "Viola a garantia constitucional de acesso à jurisdição a taxa judiciária calculada sem limite sobre o valor da causa."
  ],
  [
    668,
    "É inconstitucional a lei municipal que tenha estabelecido, antes da Emenda Constitucional 29/2000, alíquotas progressivas para o IPTU, salvo se destinada a assegurar o cumprimento da função social da propriedade urbana."
  ],
  [
    669,
    "Norma legal que altera o prazo de recolhimento da obrigação tributária não se sujeita ao princípio da anterioridade."
  ],
  [
    670,
    "O serviço de iluminação pública não pode ser remunerado mediante taxa."
  ],
  [
    671,
    "Os servidores públicos e os trabalhadores em geral têm direito, no que concerne à URP de abril/maio de 1988, apenas ao valor correspondente a 7/30 de 16,19% sobre os vencimentos e salários pertinentes aos meses de abril e maio de 1988, não cumulativamente, devidamente corrigido até o efetivo pagamento."
  ],
  [
    672,
    "O reajuste de 28,86%, concedido aos servidores militares pelas Leis 8.622/93 e 8.627/93, estende-se aos servidores civis do Poder Executivo, observadas as eventuais compensações decorrentes dos reajustes diferenciados concedidos pelos mesmos diplomas legais."
  ],
  [
    673,
    "O art. 125, § 4º, da Constituição não impede a perda da graduação de militar mediante procedimento administrativo."
  ],
  [
    674,
    "A anistia prevista no art. 8º do ADCT não alcança os militares expulsos com base em legislação disciplinar ordinária, ainda que em razão de atos praticados por motivação política."
  ],
  [
    675,
    "Os intervalos fixados para descanso e alimentação durante a jornada de seis horas não descaracterizam o sistema de turnos ininterruptos de revezamento para o efeito do art. 7º, XIV, da Constituição."
  ],
  [
    676,
    "A garantia da estabilidade provisória prevista no art. 10, II, a, do ADCT, também se aplica ao suplente do cargo de direção de comissões internas de prevenção de acidentes (CIPA)."
  ],
  [
    677,
    "Até que lei venha a dispor a respeito, incumbe ao Ministério do Trabalho proceder ao registro das entidades sindicais e zelar pela observância do princípio da unicidade."
  ],
  [
    678,
    "São inconstitucionais os incisos I e III do art. 7º da Lei 8.162/91, que afastam, para efeito de anuênio e de licença-prêmio, a contagem do tempo de serviço regido pela CLT dos servidores que passaram a submeter-se ao Regime Jurídico Único."
  ],
  [
    679,
    "A fixação de vencimentos dos servidores públicos não pode ser objeto de convenção coletiva."
  ],
  [
    680,
    "O direito ao auxílio-alimentação não se estende aos servidores inativos."
  ],
  [
    681,
    "É inconstitucional a vinculação do reajuste de vencimentos de servidores estaduais ou municipais a índices federais de correção monetária."
  ],
  [
    682,
    "Não ofende a Constituição a correção monetária no pagamento com atraso dos vencimentos de servidores públicos."
  ],
  [
    683,
    "O limite de idade para a inscrição em concurso público só se legitima em face do art. 7º, XXX, da Constituição, quando possa ser justificado pela natureza das atribuições do cargo a ser preenchido."
  ],
  [
    684,
    "É inconstitucional o veto não motivado à participação de candidato a concurso público."
  ],
  [
    685,
    "É inconstitucional toda modalidade de provimento que propicie ao servidor investir-se, sem prévia aprovação em concurso público destinado ao seu provimento, em cargo que não integra a carreira na qual anteriormente investido."
  ],
  [
    686,
    "Só por lei se pode sujeitar a exame psicotécnico a habilitação de candidato a cargo público."
  ],
  [
    687,
    "A revisão de que trata o art. 58 do ADCT não se aplica aos benefícios previdenciários concedidos após a promulgação da Constituição de 1988."
  ],
  [
    688,
    "É legítima a incidência da contribuição previdenciária sobre o 13º salário."
  ],
  [
    689,
    "O segurado pode ajuizar ação contra a instituição previdenciária perante o juízo federal do seu domicílio ou nas varas federais da Capital do Estado-Membro."
  ],
  [
    690,
    "Compete originariamente ao Supremo Tribunal Federal o julgamento de habeas corpus contra decisão de turma recursal de juizados especiais criminais."
  ],
  [
    691,
    "Não compete ao Supremo Tribunal Federal conhecer de habeas corpus impetrado contra decisão do Relator que, em habeas corpus requerido a tribunal superior, indefere a liminar."
  ],
  [
    692,
    "Não se conhece de habeas corpus contra omissão de relator de extradição, se fundado em fato ou direito estrangeiro cuja prova não constava dos autos, nem foi ele provocado a respeito."
  ],
  [
    693,
    "Não cabe habeas corpus contra decisão condenatória a pena de multa, ou relativo a processo em curso por infração penal a que a pena pecuniária seja a única cominada."
  ],
  [
    694,
    "Não cabe habeas corpus contra a imposição da pena de exclusão de militar ou de perda de patente ou de função pública."
  ],
  [
    695,
    "Não cabe habeas corpus quando já extinta a pena privativa de liberdade."
  ],
  [
    696,
    "Reunidos os pressupostos legais permissivos da suspensão condicional do processo, mas se recusando o Promotor de Justiça a propô-la, o Juiz, dissentindo, remeterá a questão ao Procurador-Geral, aplicando-se por analogia o art. 28 do Código de Processo Penal."
  ],
  [
    697,
    "A proibição de liberdade provisória nos processos por crimes hediondos não veda o relaxamento da prisão processual por excesso de prazo."
  ],
  [
    698,
    "Não se estende aos demais crimes hediondos a admissibilidade de progressão no regime de execução da pena aplicada ao crime de tortura."
  ],
  [
    699,
    "O prazo para interposição de agravo, em processo penal, é de cinco dias, de acordo com a Lei 8.038/90, não se aplicando o disposto a respeito nas alterações da Lei 8.950/94 ao Código de Processo Civil."
  ],
  [
    700,
    "É de cinco dias o prazo para interposição de agravo contra decisão do juiz da execução penal."
  ],
  [
    701,
    "No mandado de segurança impetrado pelo Ministério Público contra decisão proferida em processo penal, é obrigatória a citação do réu como litisconsorte passivo."
  ],
  [
    702,
    "A competência do Tribunal de Justiça para julgar prefeitos restringe-se aos crimes de competência da Justiça comum estadual; nos demais casos, a competência originária caberá ao respectivo tribunal de segundo grau."
  ],
  [
    703,
    "A extinção do mandato do prefeito não impede a instauração de processo pela prática dos crimes previstos no art. 1º do Dl. 201/67."
  ],
  [
    704,
    "Não viola as garantias do juiz natural, da ampla defesa e do devido processo legal a atração por continência ou conexão do processo do co-réu ao foro por prerrogativa de função de um dos denunciados."
  ],
  [
    705,
    "A renúncia do réu ao direito de apelação, manifestada sem a assistência do defensor, não impede o conhecimento da apelação por este interposta."
  ],
  [
    706,
    "É relativa a nulidade decorrente da inobservância da competência penal por prevenção."
  ],
  [
    707,
    "Constitui nulidade a falta de intimação do denunciado para oferecer contra-razões ao recurso interposto da rejeição da denúncia, não a suprindo a nomeação de defensor dativo."
  ],
  [
    708,
    "É nulo o julgamento da apelação se, após a manifestação nos autos da renúncia do único defensor, o réu não foi previamente intimado para constituir outro."
  ],
  [
    709,
    "Salvo quando nula a decisão de primeiro grau, o acórdão que provê o recurso contra a rejeição da denúncia vale, desde logo, pelo recebimento dela."
  ],
  [
    710,
    "No processo penal, contam-se os prazos da data da intimação, e não da juntada aos autos do mandado ou da carta precatória ou de ordem."
  ],
  [
    711,
    "A lei penal mais grave aplica-se ao crime continuado ou ao crime permanente, se a sua vigência é anterior à cessação da continuidade ou da permanência."
  ],
  [
    712,
    "É nula a decisão que determina o desaforamento de processo da competência do júri sem audiência da defesa."
  ],
  [
    713,
    "O efeito devolutivo da apelação contra decisões do Júri é adstrito aos fundamentos da sua interposição."
  ],
  [
    714,
    "É concorrente a legitimidade do ofendido, mediante queixa, e do Ministério Público, condicionada à representação do ofendido, para a ação penal por crime contra a honra de servidor público em razão do exercício de suas funções."
  ],
  [
    715,
    "A pena unificada para atender ao limite de trinta anos de cumprimento, determinado pelo art. 75 do Código Penal, não é considerada para a concessão de outros benefícios, como o livramento condicional ou regime mais favorável de execução."
  ],
  [
    716,
    "Admite-se a progressão de regime de cumprimento da pena ou a aplicação imediata de regime menos severo nela determinada, antes do trânsito em julgado da sentença condenatória."
  ],
  [
    717,
    "Não impede a progressão de regime de execução da pena, fixada em sentença não transitada em julgado, o fato de o réu se encontrar em prisão especial."
  ],
  [
    718,
    "A opinião do julgador sobre a gravidade em abstrato do crime não constitui motivação idônea para a imposição de regime mais severo do que o permitido segundo a pena aplicada."
  ],
  [
    719,
    "A imposição do regime de cumprimento mais severo do que a pena aplicada permitir exige motivação idônea."
  ],
  [
    720,
    "O art. 309 do Código de Trânsito Brasileiro, que reclama decorra do fato perigo de dano, derrogou o art. 32 da Lei das Contravenções Penais no tocante à direção sem habilitação em vias terrestres."
  ],
  [
    721,
    "A competência constitucional do Tribunal do Júri prevalece sobre o foro por prerrogativa de função estabelecido exclusivamente pela Constituição estadual."
  ],
  [
    722,
    "São da competência legislativa da União a definição dos crimes de responsabilidade e o estabelecimento das respectivas normas de processo e julgamento."
  ],
  [
    723,
    "Não se admite a suspensão condicional do processo por crime continuado, se a soma da pena mínima da infração mais grave com o aumento mínimo de um sexto for superior a um ano."
  ],
  [
    724,
    "Ainda quando alugado a terceiros, permanece imune ao IPTU o imóvel pertencente a qualquer das entidades referidas pelo art. 150, VI, c, da Constituição, desde que o valor dos aluguéis seja aplicado nas atividades essenciais de tais entidades."
  ],
  [
    725,
    "É constitucional o § 2º do art. 6º da L. 8.024/90, resultante da conversão da MPr 168/90, que fixou o BTN fiscal como índice de correção monetária aplicável aos depósitos bloqueados pelo Plano Collor I."
  ],
  [
    726,
    "Para efeito de aposentadoria especial de professores, não se computa o tempo de serviço prestado fora da sala de aula."
  ],
  [
    727,
    "Não pode o magistrado deixar de encaminhar ao Supremo Tribunal Federal o agravo de instrumento interposto da decisão que não admite recurso extraordinário, ainda que referente a causa instaurada no âmbito dos juizados especiais."
  ],
  [
    728,
    "É de três dias o prazo para a interposição de recurso extraordinário contra decisão do Tribunal Superior Eleitoral, contado, quando for o caso, a partir da publicação do acórdão, na própria sessão de julgamento, nos termos do art. 12 da Lei 6.055/74, que não foi revogado pela Lei 8.950/94."
  ],
  [
    729,
    "A decisão na ADC-4 não se aplica à antecipação de tutela em causa de natureza previdenciária."
  ],
  [
    730,
    "A imunidade tributária conferida a instituições de assistência social sem fins lucrativos pelo art. 150, VI, c, da Constituição, somente alcança as entidades fechadas de previdência social privada se não houver contribuição dos beneficiários."
  ],
  [
    731,
    "Para fim da competência originária do Supremo Tribunal Federal, é de interesse geral da magistratura a questão de saber se, em face da LOMAN, os juízes têm direito à licença-prêmio."
  ],
  [
    732,
    "É constitucional a cobrança da contribuição do salário-educação, seja sob a Carta de 1969, seja sob a Constituição Federal de 1988, e no regime da Lei 9.424/96."
  ],
  [
    733,
    "Não cabe recurso extraordinário contra decisão proferida no processamento de precatórios."
  ],
  [
    734,
    "Não cabe reclamação quando já houver transitado em julgado o ato judicial que se alega tenha desrespeitado decisão do Supremo Tribunal Federal."
  ],
  [
    735,
    "Não cabe recurso extraordinário contra acórdão que defere medida liminar."
  ],
  [
    736,
    "Compete à Justiça do Trabalho julgar as ações que tenham como causa de pedir o descumprimento de normas trabalhistas relativas à segurança, higiene e saúde dos trabalhadores."
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
console.log("STF NV lotes 51–74: 501–736.");
if (falha) process.exit(1);

/**
 * Seed STF NV lotes 11–30 (Súmulas 101–300).
 * Fora do RAG neste bloco: (nenhuma).
 * Uso: node scripts/seed-sumulas-stf-nv-lote-11-30.mjs
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
    101,
    "O mandado de segurança não substitui a ação popular."
  ],
  [
    102,
    "É devido o impôsto federal do selo pela incorporação de reservas, em reavaliação de ativo, ainda que realizada antes da vigência da L. 3.519, de 30.12.58."
  ],
  [
    103,
    "É devido o impôsto federal do selo na simples reavaliação de ativo, realizada posteriormente à vigência da L. 3.519, de 30.12.58."
  ],
  [
    104,
    "Não é devido o impôsto federal do selo na simples reavaliação de ativo anterior à vigência da L. 3.519, de 30.12.58."
  ],
  [
    105,
    "Salvo se tiver havido premeditação, o suicídio do segurado no período contratual de carência não exime o segurador do pagamento do seguro."
  ],
  [
    106,
    "É legítima a cobrança de sêlo sôbre registro de automóveis, na conformidade da legislação estadual."
  ],
  [
    107,
    "É inconstitucional o impôsto de selo de 3%, \"ad valorem\", do Paraná, quanto aos produtos remetidos para fora do Estado."
  ],
  [
    108,
    "É legítima a incidência do impôsto de transmissão \"inter vivos\" sôbre o valor do imóvel ao tempo da alienação e não da promessa, na conformidade da legislação local."
  ],
  [
    109,
    "É devida a multa prevista no art. 15, § 6º, da L. 1.300, de 28.12.50, ainda que a desocupação do imóvel tenha resultado da notificação e não haja sido proposta ação de despejo."
  ],
  [
    110,
    "O impôsto de transmissão inter vivos não incide sôbre a construção, ou parte dela, realizada pelo adquirente, mas sôbre o que tiver sido construído ao tempo da alienação do terreno."
  ],
  [
    111,
    "É legítima a incidência do impôsto de transmissão \"inter vivos\" sôbre a restituição, ao antigo proprietário, de imóvel que deixou de servir à finalidade da sua desapropriação."
  ],
  [
    112,
    "O impôsto de transmissão \"causa mortis\" é devido pela alíquota vigente ao tempo da abertura da sucessão."
  ],
  [
    113,
    "O impôsto de transmissão \"causa mortis\" é calculado sôbre o valor dos bens na data da avaliação."
  ],
  [
    114,
    "O impôsto de transmissão \"causa mortis\" não é exigível antes da homologação do cálculo."
  ],
  [
    115,
    "Sôbre os honorários do advogado contratado pelo inventariante, com a homologação do juiz, não incide o impôsto de transmissão \"causa mortis\"."
  ],
  [
    116,
    "Em desquite ou inventário, é legítima a cobrança do chamado impôsto de reposição, quando houver desigualdade nos valôres partilhados."
  ],
  [
    117,
    "A lei estadual pode fazer variar a alíquota do impôsto de vendas e consignações em razão da espécie do produto."
  ],
  [
    118,
    "Estão sujeitas ao impôsto de vendas e consignações as transações sôbre minerais, que ainda não estão compreendidos na legislação federal sôbre o impôsto único."
  ],
  [
    119,
    "É devido o impôsto de vendas e consignações sôbre a venda de cafés ao Instituto Brasileiro do Café, embora o lote, originariamente, se destinasse à exportação."
  ],
  [
    120,
    "Parede de tijolos de vidro translúcido pode ser levantada a menos de metro e meio do prédio vizinho, não importando servidão sôbre êle."
  ],
  [
    121,
    "É vedada a capitalização de juros, ainda que expressamente convencionada."
  ],
  [
    122,
    "O enfiteuta pode purgar a mora enquanto não decretado o comisso por sentença."
  ],
  [
    123,
    "Sendo a locação regida pelo D. 24.150, de 20.4.34, o locatário não tem direito à purgação da mora prevista na L. 1.300, de 28.12.50."
  ],
  [
    124,
    "É inconstitucional o adicional do impôsto de vendas e consignações cobrado pelo Estado do Espírito Santo sôbre cafés da cota de expurgo entregues ao Instituto Brasileiro do Café."
  ],
  [
    125,
    "Não é devido o impôsto de vendas e consignações sôbre a parcela do impôsto de consumo que onera a primeira venda realizada pelo produtor."
  ],
  [
    126,
    "É inconstitucional a chamada taxa de aguardente, do Instituto do Açúcar e do Álcool."
  ],
  [
    127,
    "É indevida a taxa de armazenagem, posteriormente aos primeiros trinta dias, quando não exigível o impôsto de consumo, cuja cobrança tenha motivado a retenção da mercadoria."
  ],
  [
    128,
    "É indevida a taxa de assistência médica e hospitalar das instituições de previdência social."
  ],
  [
    129,
    "Na conformidade da legislação local, é legítima a cobrança de taxa de calçamento."
  ],
  [
    130,
    "A taxa de despacho aduaneiro (art. 66 da L. 3.244, de 14.8.57) continua a ser exigível após o Dec. Legisl. 14, de 25.8.60, que aprovou alterações introduzidas no Acordo Geral sôbre Tarifas Aduaneiras e Comércio (GATT)."
  ],
  [
    131,
    "A taxa de despacho aduaneiro (art. 66 da L. 3.244, de 14.8.57) continua a ser exigível após o Dec. Legisl. 14, de 25.8.60, mesmo para as mercadorias incluídas na vigente lista III do Acordo Geral sôbre Tarifas Aduaneiras e Comércio (GATT)."
  ],
  [
    132,
    "Não é devida a taxa de previdência social na importação de amianto bruto ou em fibra."
  ],
  [
    133,
    "Não é devida a taxa de despacho aduaneiro na importação de fertilizantes e inseticidas."
  ],
  [
    134,
    "A isenção fiscal para a importação de frutas da Argentina compreende a taxa de despacho aduaneiro e a taxa de previdência social."
  ],
  [
    135,
    "É inconstitucional a taxa de eletrificação de Pernambuco."
  ],
  [
    136,
    "É constitucional a taxa de estatística da Bahia."
  ],
  [
    137,
    "A taxa de fiscalização da exportação incide sôbre a bonificação cambial concedida ao exportador."
  ],
  [
    138,
    "É inconstitucional a taxa contra fogo, do estado de Minas Gerais, incidente sôbre prêmio de seguro contra fogo."
  ],
  [
    139,
    "É indevida a cobrança do impôsto de transação a que se refere a L. 899, de 1957, art. 58, IV, letra \"e\", do antigo Distrito Federal."
  ],
  [
    140,
    "Na importação de lubrificantes é devida a taxa de previdência social."
  ],
  [
    141,
    "Não incide a taxa de previdência social sôbre combustíveis."
  ],
  [
    142,
    "Não é devida a taxa de previdência social sôbre mercadorias isentas do impôsto de importação."
  ],
  [
    143,
    "Na forma da lei estadual, é devido o impôsto de vendas e consignações na exportação de café pelo Estado da Guanabara, embora proveniente de outro Estado."
  ],
  [
    144,
    "É inconstitucional a incidência da taxa de recuperação econômica de Minas Gerais sôbre contrato sujeito ao impôsto federal do sêlo."
  ],
  [
    145,
    "Não há crime, quando a preparação do flagrante pela polícia torna impossível a sua consumação."
  ],
  [
    146,
    "A prescrição da ação penal regula-se pela pena concretizada na sentença, quando não há recurso da acusação."
  ],
  [
    147,
    "A prescrição de crime falimentar começa a correr da data em que deveria estar encerrada a falência, ou do trânsito em julgado da sentença que a encerrar ou que julgar cumprida a concordata."
  ],
  [
    148,
    "É legítimo o aumento de tarifas portuárias por ato do Ministro da Viação e Obras Públicas."
  ],
  [
    149,
    "É imprescritível a ação de investigação de paternidade, mas não o é a de petição de herança."
  ],
  [
    150,
    "Prescreve a execução no mesmo prazo de prescrição da ação."
  ],
  [
    151,
    "Prescreve em um ano a ação do segurador subrogado para haver indenização por extravio ou perda de carga transportada por navio."
  ],
  [
    152,
    "A ação para anular venda de ascendente a descendente, sem consentimento dos demais, prescreve em quatro anos a contar da abertura da sucessão. (Revogada)"
  ],
  [
    153,
    "Simples protesto cambiário não interrompe a prescrição."
  ],
  [
    154,
    "Simples vistoria não interrompe a prescrição."
  ],
  [
    155,
    "É relativa a nulidade do processo criminal por falta de intimação da expedição de precatória para inquirição de testemunha."
  ],
  [
    156,
    "É absoluta a nulidade do julgamento, pelo júri, por falta de quesito obrigatório."
  ],
  [
    157,
    "É necessária prévia autorização do Presidente da República para desapropriação, pelos Estados, de emprêsa de energia elétrica."
  ],
  [
    158,
    "Salvo estipulação contratual averbada no registro imobiliário, não responde o adquirente pelas benfeitorias do locatário."
  ],
  [
    159,
    "Cobrança excessiva, mas de boa-fé, não dá lugar às sanções do art. 1.531 do Código Civil."
  ],
  [
    160,
    "É nula a decisão do Tribunal que acolhe, contra o réu, nulidade não argüida no recurso da acusação, ressalvados os casos de recurso de ofício."
  ],
  [
    161,
    "Em contrato de transporte, é inoperante a cláusula de não indenizar."
  ],
  [
    162,
    "É absoluta a nulidade do julgamento pelo júri, quando os quesitos da defesa não precedem aos das circunstâncias agravantes."
  ],
  [
    163,
    "Salvo contra a Fazenda Pública, sendo a obrigação ilíquida, contam-se os juros moratórios desde a citação inicial para a ação."
  ],
  [
    164,
    "No processo de desapropriação, são devidos juros compensatórios desde a antecipada imissão de posse, ordenada pelo juiz, por motivo de urgência."
  ],
  [
    165,
    "A venda realizada diretamente pelo mandante ao mandatário não é atingida pela nulidade do art. 1.133, II, do Código Civil."
  ],
  [
    166,
    "É inadmissível o arrependimento no compromisso de compra e venda sujeito ao regime do Dl. 58, de 10.12.37."
  ],
  [
    167,
    "Não se aplica o regime do Dl. 58, de 10.12.37, ao compromisso de compra e venda não inscrito no registro imobiliário, salvo se o promitente vendedor se obrigou a efetuar o registro."
  ],
  [
    168,
    "Para os efeitos do Dl. 58, de 10.12.37, admite-se a inscrição imobiliária do compromisso de compra e venda no curso da ação."
  ],
  [
    169,
    "Depende de sentença a aplicação da pena de comisso."
  ],
  [
    170,
    "É resgatável a enfiteuse instituída anteriormente à vigência do Código Civil."
  ],
  [
    171,
    "Não se admite, na locação em curso, de prazo determinado, a majoração de encargos a que se refere a L. 3.844, de 15.12.60."
  ],
  [
    172,
    "Não se admite, na locação em curso, de prazo determinado, o reajustamento de aluguel a que se refere a L. 3.085, de 29.12.56."
  ],
  [
    173,
    "Em caso de obstáculo judicial admite-se a purga da mora, pelo locatário, além do prazo legal."
  ],
  [
    174,
    "Para a retomada do imóvel alugado, não é necessária a comprovação dos requisitos legais na notificação prévia."
  ],
  [
    175,
    "Admite-se a retomada de imóvel alugado para uso de filho que vai contrair matrimônio."
  ],
  [
    176,
    "O promitente comprador, nas condições previstas na L. 1.300, de 28-12-50, pode retomar o imóvel locado."
  ],
  [
    177,
    "O cessionário do promitente comprador, nas mesmas condições dêste, pode retomar o imóvel locado."
  ],
  [
    178,
    "Não excederá de cinco anos a renovação judicial de contrato de locação, fundada no D. 24.150, de 20.4.34."
  ],
  [
    179,
    "O aluguel arbitrado judicialmente nos termos da L. 3.085, de 29.12.56, art. 6º, vigora a partir da data do laudo pericial."
  ],
  [
    180,
    "Na ação revisional do art. 31 do D. 24.150, de 20.4.34, o aluguel arbitrado vigora a partir do laudo pericial."
  ],
  [
    181,
    "Na retomada, para construção mais útil de imóvel sujeito ao D. 24.150, de 20.4.34, é sempre devida indenização para despesas de mudança do locatário."
  ],
  [
    182,
    "Não impede o reajustamento do débito pecuário, nos termos da L. 1.002, de 24.12.49, a falta de cancelamento da renúncia à moratória da L. 209, de 2.1.48."
  ],
  [
    183,
    "Não se incluem no reajustamento pecuário dívidas estranhas à atividade agropecuária."
  ],
  [
    184,
    "Não se incluem no reajustamento pecuário dívidas contraídas posteriormente a 19.12.46."
  ],
  [
    185,
    "Em processo de reajustamento pecuário, não responde a União pelos honorários do advogado do credor ou do devedor."
  ],
  [
    186,
    "Não infringe a lei a tolerância da quebra de 1% no transporte por estrada de ferro, prevista no regulamento de transportes."
  ],
  [
    187,
    "A responsabilidade contratual do transportador, pelo acidente com o passageiro, não é elidida por culpa de terceiro, contra o qual tem ação regressiva."
  ],
  [
    188,
    "O segurador tem ação regressiva contra o causador do dano, pelo que efetivamente pagou, até ao limite previsto no contrato de seguro."
  ],
  [
    189,
    "Avais em branco e superpostos consideram-se simultâneos e não sucessivos."
  ],
  [
    190,
    "O não pagamento de título vencido há mais de trinta dias, sem protesto, não impede a concordata preventiva."
  ],
  [
    191,
    "Inclui-se no crédito habilitado em falência a multa fiscal simplesmente moratória."
  ],
  [
    192,
    "Não se inclui no crédito habilitado em falência a multa fiscal com efeito de pena administrativa."
  ],
  [
    193,
    "Para a restituição prevista no art. 76, § 2º, da Lei de Falências, conta-se o prazo de quinze dias da entrega da coisa e não da sua remessa."
  ],
  [
    194,
    "É competente o Ministro do Trabalho para a especificação das atividades insalubres."
  ],
  [
    195,
    "Contrato de trabalho para obra certa, ou de prazo determinado, transforma-se em contrato de prazo indeterminado, quando prorrogado por mais de quatro anos."
  ],
  [
    196,
    "Ainda que exerça atividade rural, o empregado de emprêsa industrial ou comercial é classificado de acôrdo com a categoria do empregador."
  ],
  [
    197,
    "O empregado com representação sindical só pode ser despedido mediante inquérito em que se apure falta grave."
  ],
  [
    198,
    "As ausências motivadas por acidente do trabalho não são descontáveis do período aquisitivo das férias."
  ],
  [
    199,
    "O salário das férias do empregado horista corresponde à média do período aquisitivo, não podendo ser inferior ao mínimo."
  ],
  [
    200,
    "Não é inconstitucional a L. 1.530, de 26.12.51, que manda incluir na indenização por despedida injusta parcela correspondente a férias proporcionais."
  ],
  [
    201,
    "O vendedor pracista, remunerado mediante comissão, não tem direito ao repouso semanal remunerado."
  ],
  [
    202,
    "Na equiparação de salário, em caso de trabalho igual, toma-se em conta o tempo de serviço na função, e não no emprêgo."
  ],
  [
    203,
    "Não está sujeita à vacância de 60 dias a vigência de novos níveis de salário mínimo."
  ],
  [
    204,
    "Tem direito o trabalhador substituto, ou de reserva, ao salário mínimo no dia em que fica à disposição do empregador sem ser aproveitado na função específica; se aproveitado, recebe o salário contratual."
  ],
  [
    205,
    "Tem direito a salário integral o menor não sujeito a aprendizagem metódica."
  ],
  [
    206,
    "É nulo o julgamento ulterior pelo júri com a participação de jurado que funcionou em julgamento anterior do mesmo processo."
  ],
  [
    207,
    "As gratificações habituais, inclusive a de Natal, consideram-se tacitamente convencionadas, integrando o salário."
  ],
  [
    208,
    "O assistente do Ministério Público não pode recorrer, extraordinariamente, de decisão concessiva de \"habeas corpus\"."
  ],
  [
    209,
    "O salário-produção, como outras modalidades de salário-prêmio, é devido, desde que verificada a condição a que estiver subordinado, e não pode ser suprimido unilateralmente, pelo empregador, quando pago com habitualidade."
  ],
  [
    210,
    "O assistente do Ministério Público pode recorrer, inclusive extraordinariamente, na ação penal, nos casos dos arts. 584, § 1º, e 598 do Cód. de Proc. Penal."
  ],
  [
    211,
    "Contra a decisão proferida sôbre o agravo no auto do processo, por ocasião do julgamento da apelação, não se admitem embargos infringentes ou de nulidade."
  ],
  [
    212,
    "Tem direito ao adicional de serviço perigoso o empregado de posto de revenda de combustível líquido."
  ],
  [
    213,
    "É devido o adicional de serviço noturno, ainda que sujeito o empregado ao regime de revezamento."
  ],
  [
    214,
    "A duração legal da hora de serviço noturno (52 minutos e trinta segundos) constitui vantagem suplementar que não dispensa o salário adicional."
  ],
  [
    215,
    "Conta-se a favor de empregado readmitido o tempo de serviço anterior, salvo se houver sido despedido por falta grave ou tiver recebido a indenização legal."
  ],
  [
    216,
    "Para decretação da absolvição de instância pela paralisação do processo por mais de trinta dias, é necessário que o autor, previamente intimado, não promova o andamento da causa."
  ],
  [
    217,
    "Tem direito de retornar ao emprego, ou ser indenizado em caso de recusa do empregador, o aposentado que recupera a capacidade de trabalho dentro de cinco anos, a contar da aposentadoria, que se torna definitiva após êsse prazo."
  ],
  [
    218,
    "É competente o Juízo da Fazenda Nacional da capital do Estado, e não o da situação da coisa, para a desapropriação promovida por emprêsa de energia elétrica, se a União Federal intervém como assistente."
  ],
  [
    219,
    "Para a indenização devida a empregado que tinha direito a ser readmitido, e não foi, levam-se em conta as vantagens advindas à sua categoria no período do afastamento."
  ],
  [
    220,
    "A indenização devida a empregado estável, que não é readmitido, ao cessar sua aposentadoria, deve ser paga em dôbro."
  ],
  [
    221,
    "A transferência de estabelecimento, ou a sua extinção parcial, por motivo que não seja de fôrça maior, não justifica a transferência de empregado estável."
  ],
  [
    222,
    "O princípio da identidade física do juiz não é aplicável às Juntas de Conciliação e Julgamento da Justiça do Trabalho."
  ],
  [
    223,
    "Concedida isenção de custas ao empregado, por elas não responde o sindicato que o representa em juízo."
  ],
  [
    224,
    "Os juros da mora, nas reclamações trabalhistas, são contados desde a notificação inicial."
  ],
  [
    225,
    "Não é absoluto o valor probatório das anotações da carteira profissional."
  ],
  [
    226,
    "Na ação de desquite, os alimentos são devidos desde a inicial e não da data da decisão que os concede."
  ],
  [
    227,
    "A concordata do empregador não impede a execução de crédito nem a reclamação de empregado na Justiça do Trabalho."
  ],
  [
    228,
    "Não é provisória a execução na pendência de recurso extraordinário, ou de agravo destinado a fazê-lo admitir."
  ],
  [
    229,
    "A indenização acidentária não exclui a do direito comum, em caso de dolo ou culpa grave do empregador."
  ],
  [
    230,
    "A prescrição da ação de acidente do trabalho conta-se do exame pericial que comprovar a enfermidade ou verificar a natureza da incapacidade."
  ],
  [
    231,
    "O revel, em processo cível, pode produzir provas, desde que compareça em tempo oportuno."
  ],
  [
    232,
    "Em caso de acidente do trabalho, são devidas diárias até doze meses, as quais não se confundem com a indenização acidentária nem com o auxílio-enfermidade."
  ],
  [
    233,
    "Salvo em caso de divergência qualificada (L. 623, de 1949), não cabe recurso de embargos contra decisão que nega provimento a agravo ou não conhece de recurso extraordinário, ainda que por maioria de votos."
  ],
  [
    234,
    "São devidos honorários de advogado em ação de acidente do trabalho julgada procedente."
  ],
  [
    235,
    "É competente para a ação de acidente do trabalho a Justiça cível comum, inclusive em segunda instância, ainda que seja parte autarquia seguradora."
  ],
  [
    236,
    "Em ação de acidente do trabalho, a autarquia seguradora não tem isenção de custas."
  ],
  [
    237,
    "O usucapião pode ser argüído em defesa."
  ],
  [
    238,
    "Em caso de acidente do trabalho, a multa pelo retardamento da liquidação é exigível do segurador sub-rogado, ainda que autarquia."
  ],
  [
    239,
    "Decisão que declara indevida a cobrança do impôsto em determinado exercício não faz coisa julgada em relação aos posteriores."
  ],
  [
    240,
    "O depósito para recorrer, em ação de acidente do trabalho, é exigível do segurador sub-rogado, ainda que autarquia."
  ],
  [
    241,
    "A contribuição previdenciária incide sôbre o abono incorporado ao salário."
  ],
  [
    242,
    "O agravo no auto do processo deve ser apreciado, no julgamento da apelação, ainda que o agravante não tenha apelado."
  ],
  [
    243,
    "Em caso de dupla aposentadoria, os proventos a cargo do IAPFESP não são equiparáveis aos pagos pelo Tesouro Nacional, mas calculados à base da média salarial nos últimos doze meses de serviço."
  ],
  [
    244,
    "A importação de máquinas de costura está isenta do impôsto de consumo."
  ],
  [
    245,
    "A imunidade parlamentar não se estende ao co-réu sem essa prerrogativa."
  ],
  [
    246,
    "Comprovado não ter havido fraude, não se configura o crime de emissão de cheque sem fundos."
  ],
  [
    247,
    "O relator não admitirá os embargos da L. 623, de 19.2.49, nem deles conhecerá o Supremo Tribunal Federal, quando houver jurisprudência firme do Plenário no mesmo sentido da decisão embargada."
  ],
  [
    248,
    "É competente, originariamente, o Supremo Tribunal Federal, para mandado de segurança contra ato do Tribunal de Contas da União."
  ],
  [
    249,
    "É competente o Supremo Tribunal Federal para a ação rescisória, quando, embora não tendo conhecido do recurso extraordinário, ou havendo negado provimento ao agravo, tiver apreciado a questão federal controvertida."
  ],
  [
    250,
    "A intervenção da União desloca o processo do juízo cível comum para o fazendário."
  ],
  [
    251,
    "Responde a Rêde Ferroviária Federal S.A. perante o fôro comum e não perante o juízo especial da Fazenda Nacional, a menos que a União intervenha na causa."
  ],
  [
    252,
    "Na ação rescisória, não estão impedidos juízes que participaram do julgamento rescindendo."
  ],
  [
    253,
    "Nos embargos da L. 623, de 19.2.49, no Supremo Tribunal Federal, a divergência somente será acolhida, se tiver sido indicada na petição de recurso extraordinário."
  ],
  [
    254,
    "Incluem-se os juros moratórios na liquidação, embora omisso o pedido inicial ou a condenação."
  ],
  [
    255,
    "Sendo ilíquida a obrigação, os juros moratórios, contra a Fazenda Pública, incluídas as autarquias, são contados do trânsito em julgado da sentença de liquidação."
  ],
  [
    256,
    "É dispensável pedido expresso para condenação do réu em honorários, com fundamento nos arts. 63 ou 64 do Cód. de Proc. Civil."
  ],
  [
    257,
    "São cabíveis honorários de advogado na ação regressiva do segurador contra o causador do dano."
  ],
  [
    258,
    "É admissível reconvenção em ação declaratória."
  ],
  [
    259,
    "Para produzir efeito em juízo não é necessária a inscrição, no registro público, de documentos de procedência estrangeira, autenticados por via consular."
  ],
  [
    260,
    "O exame de livros comerciais, em ação judicial, fica limitado às transações entre os litigantes."
  ],
  [
    261,
    "Para a ação de indenização, em caso de avaria, é dispensável que a vistoria se faça judicialmente."
  ],
  [
    262,
    "Não cabe medida possessória liminar para liberação alfandegária de automóvel."
  ],
  [
    263,
    "O possuidor deve ser citado pessoalmente para a ação de usucapião."
  ],
  [
    264,
    "Verifica-se a prescrição intercorrente pela paralisação da ação rescisória por mais de cinco anos."
  ],
  [
    265,
    "Na apuração de haveres não prevalece o balanço não aprovado pelo sócio falecido, excluído ou que se retirou."
  ],
  [
    266,
    "Não cabe mandado de segurança contra lei em tese."
  ],
  [
    267,
    "Não cabe mandado de segurança contra ato judicial passível de recurso ou correição."
  ],
  [
    268,
    "Não cabe mandado de segurança contra decisão judicial com trânsito em julgado."
  ],
  [
    269,
    "O mandado de segurança não é substitutivo de ação de cobrança."
  ],
  [
    270,
    "Não cabe mandado de segurança para impugnar enquadramento da L. 3.780, de 12.7.60, que envolva exame de prova ou de situação funcional complexa."
  ],
  [
    271,
    "Concessão de mandado de segurança não produz efeitos patrimoniais em relação a período pretérito, os quais devem ser reclamados administrativamente ou pela via judicial própria."
  ],
  [
    272,
    "Não se admite como ordinário recurso extraordinário de decisão denegatória de mandado de segurança."
  ],
  [
    273,
    "Nos embargos da L. 623, de 19.2.49, a divergência sôbre questão prejudicial ou preliminar, suscitada após a interposição do recurso extraordinário, ou do agravo, somente será acolhida se o acórdão-padrão for anterior à decisão embargada."
  ],
  [
    274,
    "É inconstitucional a taxa de serviço contra fogo cobrada pelo Estado de Pernambuco. (Revogada)"
  ],
  [
    275,
    "Está sujeita a recurso \"ex officio\" sentença concessiva de reajustamento pecuário anterior à vigência da L. 2.804, de 25.6.56."
  ],
  [
    276,
    "Não cabe recurso de revista em ação executiva fiscal."
  ],
  [
    277,
    "São cabíveis embargos, em favor da Fazenda Pública, em ação executiva fiscal, não sendo unânime a decisão."
  ],
  [
    278,
    "São cabíveis embargos em ação executiva fiscal contra decisão reformatória da de primeira instância, ainda que unânime."
  ],
  [
    279,
    "Para simples reexame de prova não cabe recurso extraordinário."
  ],
  [
    280,
    "Por ofensa a direito local não cabe recurso extraordinário."
  ],
  [
    281,
    "É inadmissível o recurso extraordinário, quando couber na Justiça de origem, recurso ordinário da decisão impugnada."
  ],
  [
    282,
    "É inadmissível o recurso extraordinário, quando não ventilada, na decisão recorrida, a questão federal suscitada."
  ],
  [
    283,
    "É inadmissível o recurso extraordinário, quando a decisão recorrida assenta em mais de um fundamento suficiente e o recurso não abrange todos eles."
  ],
  [
    284,
    "É inadmissível o recurso extraordinário, quando a deficiência na sua fundamentação não permitir a exata compreensão da controvérsia."
  ],
  [
    285,
    "Não sendo razoável a argüição de inconstitucionalidade, não se conhece do recurso extraordinário fundado na letra c do art. 101, III, da Constituição Federal."
  ],
  [
    286,
    "Não se conhece do recurso extraordinário fundado em divergência jurisprudencial, quando a orientação do plenário do Supremo Tribunal Federal já se firmou no mesmo sentido da decisão recorrida."
  ],
  [
    287,
    "Nega-se provimento ao agravo, quando a deficiência na sua fundamentação, ou na do recurso extraordinário, não permitir a exata compreensão da controvérsia."
  ],
  [
    288,
    "Nega-se provimento a agravo para subida de recurso extraordinário, quando faltar no traslado o despacho agravado, a decisão recorrida, a petição de recurso extraordinário ou qualquer peça essencial à compreensão da controvérsia."
  ],
  [
    289,
    "O provimento do agravo por uma das Turmas do Supremo Tribunal Federal ainda que sem ressalva, não prejudica a questão do cabimento do recurso extraordinário."
  ],
  [
    290,
    "Nos embargos da L. 623, de 19.2.49, a prova de divergência far-se-á por certidão, ou mediante indicação do \"Diário da Justiça\" ou de repertório de jurisprudência autorizado, que a tenha publicado, com a transcrição do trecho que configure a divergência, mencionadas as circunstâncias que identifiquem ou assemelhem os casos confrontados."
  ],
  [
    291,
    "No recurso extraordinário pela letra \"d\" do art. 101, n. III, da Constituição, a prova do dissídio jurisprudencial far-se-á por certidão, ou mediante indicação do \"Diário da Justiça\" ou de repertório de jurisprudência autorizado, com a transcrição do trecho que configure a divergência, mencionadas as circunstâncias que identifiquem ou assemelhem os casos confrontados."
  ],
  [
    292,
    "Interposto o recurso extraordinário por mais de um dos fundamentos indicados no art. 101, n. III, da Constituição, a admissão apenas por um deles não prejudica o seu conhecimento por qualquer dos outros."
  ],
  [
    293,
    "São inadmissíveis embargos infringentes contra decisão em matéria constitucional submetida ao plenário dos Tribunais."
  ],
  [
    294,
    "São inadmissíveis embargos infringentes contra decisão do Supremo Tribunal Federal em mandado de segurança."
  ],
  [
    295,
    "São inadmissíveis embargos infringentes contra decisão unânime do Supremo Tribunal Federal em ação rescisória."
  ],
  [
    296,
    "São inadmissíveis embargos infringentes sôbre matéria não ventilada, pela Turma, no julgamento do recurso extraordinário."
  ],
  [
    297,
    "Oficiais e praças das milícias dos Estados, no exercício de função policial civil, não são considerados militares para efeitos penais, sendo competente a Justiça comum para julgar os crimes cometidos por ou contra eles."
  ],
  [
    298,
    "O legislador ordinário só pode sujeitar civis à Justiça Militar, em tempo de paz, nos crimes contra a segurança externa do país ou as instituições militares."
  ],
  [
    299,
    "O recurso ordinário e o extraordinário interpostos no mesmo processo de mandado de segurança, ou de \"habeas corpus\", serão julgados conjuntamente pelo Tribunal Pleno."
  ],
  [
    300,
    "São incabíveis os embargos da L. 623, de 19.2.49, contra provimento de agravo para subida de recurso extraordinário."
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
console.log("STF NV lotes 11–30: 101–300.");
if (falha) process.exit(1);

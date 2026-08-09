/**
 * Seed STF NV lotes 31–50 (Súmulas 301–500).
 * Fora do RAG neste bloco: 301, 394.
 * Uso: node scripts/seed-sumulas-stf-nv-lote-31-50.mjs
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

const FORA = [301,394];
const ITEMS = [
  [
    302,
    "Está isenta da taxa de previdência social a importação de petróleo bruto."
  ],
  [
    303,
    "Não é devido o impôsto federal de sêlo em contrato firmado com autarquia anteriormente à vigência da Emenda Constitucional nº 5, de 21.11.61."
  ],
  [
    304,
    "Decisão denegatória de mandado de segurança, não fazendo coisa julgada contra o impetrante, não impede o uso da ação própria."
  ],
  [
    305,
    "Acordo de desquite ratificado por ambos os cônjuges não é retratável unilateralmente."
  ],
  [
    306,
    "As taxas de recuperação econômica e de assistência hospitalar de Minas Gerais são legítimas, quando incidem sôbre matéria tributável pelo Estado."
  ],
  [
    307,
    "É devido o adicional de serviço insalubre, calculado à base do salário mínimo da região, ainda que a remuneração contratual seja superior ao salário mínimo acrescido da taxa de insalubridade."
  ],
  [
    308,
    "A taxa de despacho aduaneiro, sendo adicional do impôsto de importação, não incide sôbre borracha importada com isenção daquele impôsto."
  ],
  [
    309,
    "A taxa de despacho aduaneiro, sendo adicional do impôsto de importação, não está compreendida na isenção do impôsto de consumo para automóvel usado trazido do exterior pelo proprietário."
  ],
  [
    310,
    "Quando a intimação tiver lugar na sexta-feira, ou a publicação com efeito de intimação for feita nesse dia, o prazo judicial terá início na segunda-feira imediata, salvo se não houver expediente, caso em que começará no primeiro dia útil que se seguir."
  ],
  [
    311,
    "No típico acidente do trabalho, a existência de ação judicial não exclui a multa pelo retardamento da liquidação."
  ],
  [
    312,
    "Músico integrante de orquestra da emprêsa, com atuação permanente e vínculo de subordinação, está sujeito a legislação geral do trabalho, e não à especial dos artistas."
  ],
  [
    313,
    "Provada a identidade entre o trabalho diurno e o noturno, é devido o adicional, quanto a este, sem a limitação do art. 73, § 3º, da C.L.T., independentemente da natureza da atividade do empregador."
  ],
  [
    314,
    "Na composição do dano por acidente do trabalho, ou de transporte, não é contrário à lei tomar para base da indenização o salário do tempo da perícia ou da sentença."
  ],
  [
    315,
    "Indispensável o traslado das razões da revista, para julgamento, pelo Tribunal Superior do Trabalho, do agravo para sua admissão."
  ],
  [
    316,
    "A simples adesão a greve não constitui falta grave."
  ],
  [
    317,
    "São improcedentes os embargos declaratórios, quando não pedida a declaração do julgado anterior, em que se verificou a omissão."
  ],
  [
    318,
    "É legítima a cobrança, em 1962, pela municipalidade de São Paulo, do impôsto de indústrias e profissões, consoante as leis 5.917 e 5.919, de 1961 (aumento anterior à vigência do orçamento e incidência do tributo sôbre o movimento econômico do contribuinte)."
  ],
  [
    319,
    "O prazo do recurso ordinário para o Supremo Tribunal Federal, em \"habeas corpus\" ou mandado de segurança, é de cinco dias."
  ],
  [
    320,
    "A apelação despachada pelo juiz no prazo legal não fica prejudicada pela demora da juntada, por culpa do cartório."
  ],
  [
    321,
    "A constituição estadual pode estabelecer a irredutibilidade dos vencimentos do Ministério Público."
  ],
  [
    322,
    "Não terá seguimento pedido ou recurso dirigido ao Supremo Tribunal Federal, quando manifestamente incabível, ou apresentado fora do prazo, ou quando for evidente a incompetência do Tribunal."
  ],
  [
    323,
    "É inadmissível a apreensão de mercadorias como meio coercitivo para pagamento de tributos."
  ],
  [
    324,
    "A imunidade do art. 31, V, da Constituição Federal não compreende as taxas."
  ],
  [
    325,
    "As emendas ao regimento do Supremo Tribunal Federal, sôbre julgamento de questão constitucional, aplicam-se aos pedidos ajuizados e aos recursos interpostos anteriormente a sua aprovação."
  ],
  [
    326,
    "É legítima a incidência do impôsto de transmissão \"inter vivos\" sôbre a transferência do domínio útil."
  ],
  [
    327,
    "O direito trabalhista admite a prescrição intercorrente."
  ],
  [
    328,
    "É legítima a incidência do impôsto de transmissão inter vivos sôbre a doação de imóvel."
  ],
  [
    329,
    "O impôsto de transmissão \"inter vivos\" não incide sôbre a transferência de ações de sociedade imobiliária."
  ],
  [
    330,
    "O Supremo Tribunal Federal não é competente para conhecer de mandado de segurança contra atos dos Tribunais de Justiça dos Estados."
  ],
  [
    331,
    "É legítima a incidência do impôsto de transmissão \"causa mortis\" no inventário por morte presumida."
  ],
  [
    332,
    "É legítima a incidência do impôsto de vendas e consignações sôbre a parcela do preço correspondente aos ágios cambiais."
  ],
  [
    333,
    "Está sujeita ao impôsto de vendas e consignações a venda realizada por invernista não qualificado como pequeno produtor."
  ],
  [
    334,
    "É legítima a cobrança, ao empreiteiro, do impôsto de vendas e consignações, sôbre o valor dos materiais empregados, quando a empreitada não for apenas de lavor."
  ],
  [
    335,
    "É válida a cláusula de eleição do fôro para os processos oriundos do contrato."
  ],
  [
    336,
    "A imunidade da autarquia financiadora, quanto ao contrato de financiamento, não se estende à compra e venda entre particulares, embora constantes os dois atos de um só instrumento."
  ],
  [
    337,
    "A controvérsia entre o empregador e o segurador não suspende o pagamento devido ao empregado por acidente do trabalho."
  ],
  [
    338,
    "Não cabe ação rescisória no âmbito da justiça do trabalho."
  ],
  [
    339,
    "Não cabe ao Poder Judiciário, que não tem função legislativa, aumentar vencimentos de servidores públicos sob fundamento de isonomia."
  ],
  [
    340,
    "Desde a vigência do Código Civil, os bens dominicais, como os demais bens públicos, não podem ser adquiridos por usucapião."
  ],
  [
    341,
    "É presumida a culpa do patrão ou comitente pelo ato culposo do empregado ou preposto."
  ],
  [
    342,
    "Cabe agravo no auto do processo, e não agravo de petição, do despacho que não admite a reconvenção."
  ],
  [
    343,
    "Não cabe ação rescisória por ofensa a literal disposição de lei, quando a decisão rescindenda se tiver baseado em texto legal de interpretação controvertida nos tribunais."
  ],
  [
    344,
    "Sentença de primeira instância concessiva de habeas corpus, em caso de crime praticado em detrimento de bens, serviços ou interesses da União, está sujeita a recurso \"ex officio\"."
  ],
  [
    345,
    "Na chamada desapropriação indireta, os juros compensatórios são devidos a partir da perícia, desde que tenha atribuído valor atual ao imóvel."
  ],
  [
    346,
    "A administração pública pode declarar a nulidade dos seus próprios atos."
  ],
  [
    347,
    "O Tribunal de Contas, no exercício de suas atribuições, pode apreciar a constitucionalidade das leis e dos atos do poder público."
  ],
  [
    348,
    "É constitucional a criação de taxa de construção, conservação e melhoramento de estradas."
  ],
  [
    349,
    "A prescrição atinge somente as prestações de mais de dois anos, reclamadas com fundamento em decisão normativa da Justiça do Trabalho, ou em convenção coletiva de trabalho, quando não estiver em causa a própria validade de tais atos."
  ],
  [
    350,
    "O impôsto de indústrias e profissões não é exigível de empregado, por falta de autonomia na sua atividade profissional."
  ],
  [
    351,
    "É nula a citação por edital de réu preso na mesma unidade da Federação em que o juiz exerce a sua jurisdição."
  ],
  [
    352,
    "Não é nulo o processo penal por falta de nomeação de curador ao réu menor que teve a assistência de defensor dativo."
  ],
  [
    353,
    "São incabíveis os embargos da L. 623, de 19.2.49, com fundamento em divergência entre decisões da mesma Turma do Supremo Tribunal Federal."
  ],
  [
    354,
    "Em caso de embargos infringentes parciais, é definitiva a parte da decisão embargada em que não houve divergência na votação."
  ],
  [
    355,
    "Em caso de embargos infringentes parciais, é tardio o recurso extraordinário interposto após o julgamento dos embargos, quanto à parte da decisão embargada que não fôra por eles abrangida."
  ],
  [
    356,
    "O ponto omisso da decisão, sôbre o qual não foram opostos embargos declaratórios, não pode ser objeto de recurso extraordinário, por faltar o requisito do prequestionamento."
  ],
  [
    357,
    "É lícita a convenção pela qual o locador renuncia, durante a vigência do contrato, à ação revisional do art. 31 do Decreto 24.150, de 20.4.34."
  ],
  [
    358,
    "O servidor público em disponibilidade tem direito aos vencimentos integrais do cargo."
  ],
  [
    359,
    "Ressalvada a revisão prevista em lei, os proventos da inatividade regulam-se pela lei vigente ao tempo em que o militar, ou o servidor civil, reuniu os requisitos necessários. (Alterada)"
  ],
  [
    360,
    "Não há prazo de decadência para a representação de inconstitucionalidade prevista no art. 8º, parágrafo único, da Constituição Federal."
  ],
  [
    361,
    "No processo penal, é nulo o exame realizado por um só perito, considerando-se impedido o que tiver funcionado, anteriormente, na diligência de apreensão."
  ],
  [
    362,
    "A condição de ter o clube sede própria para a prática de jôgo lícito não o obriga a ser proprietário do imóvel em que tem sede."
  ],
  [
    363,
    "A pessoa jurídica de direito privado pode ser demandada no domicílio da agência, ou estabelecimento, em que se praticou o ato."
  ],
  [
    364,
    "Enquanto o Estado da Guanabara não tiver Tribunal Militar de segunda instância, o Tribunal de Justiça é competente para julgar os recursos das decisões da auditoria da Polícia Militar."
  ],
  [
    365,
    "Pessoa jurídica não tem legitimidade para propor ação popular."
  ],
  [
    366,
    "Não é nula a citação por edital que indica o dispositivo da lei penal, embora não transcreva a denúncia ou queixa, ou não resuma os fatos em que se baseia."
  ],
  [
    367,
    "Concede-se liberdade ao extraditando que não for retirado do país no prazo do art. 16 do Decreto-lei. 394, de 28.4.38."
  ],
  [
    368,
    "Não há embargos infringentes no processo de reclamação."
  ],
  [
    369,
    "Julgados do mesmo Tribunal não servem para fundamentar o recurso extraordinário por divergência jurisprudencial."
  ],
  [
    370,
    "Julgada improcedente a ação renovatória da locação, terá o locatário, para desocupar o imóvel, o prazo de seis meses, acrescido de tantos meses quantos forem os anos da ocupação, até o limite total de dezoito meses."
  ],
  [
    371,
    "Ferroviário, que foi admitido como servidor autárquico, não tem direito a dupla aposentadoria."
  ],
  [
    372,
    "A L. 2.752, de 10.4.56, sôbre dupla aposentadoria, aproveita, quando couber, a servidores aposentados antes de sua publicação."
  ],
  [
    373,
    "Servidor nomeado após aprovação no curso de capacitação policial, instituído na Polícia do Distrito Federal, em 1941, preenche o requisito da nomeação por concurso a que se referem as Leis 705, de 16.5.49 e 1.639, de 14.7.52."
  ],
  [
    374,
    "Na retomada para construção mais útil, não é necessário que a obra tenha sido ordenada pela autoridade pública."
  ],
  [
    375,
    "Não renovada a locação regida pelo D. 24.150, de 20.4.34, aplica-se o direito comum e não a legislação especial do inquilinato."
  ],
  [
    376,
    "Na renovação de locação, regida pelo D. 24.150, de 20.4.34, o prazo do nôvo contrato conta-se da transcrição da decisão exequenda no Registro de Títulos e Documentos; começa, porém, da terminação do contrato anterior, se esta tiver ocorrido antes do registro."
  ],
  [
    377,
    "No regime de separação legal de bens, comunicam-se os adquiridos na constância do casamento."
  ],
  [
    378,
    "Na indenização por desapropriação incluem-se honorários do advogado do expropriado."
  ],
  [
    379,
    "No acôrdo de desquite não se admite renúncia aos alimentos, que poderão ser pleiteados ulteriormente, verificados os pressupostos legais."
  ],
  [
    380,
    "Comprovada a existência de sociedade de fato entre os concubinos, é cabível a sua dissolução judicial, com a partilha do patrimônio adquirido pelo esfôrço comum."
  ],
  [
    381,
    "Não se homologa sentença de divórcio obtida, por procuração, em país de que os cônjuges não eram nacionais."
  ],
  [
    382,
    "A vida em comum sob o mesmo teto, \"more uxorio\", não é indispensável à caracterização do concubinato."
  ],
  [
    383,
    "A prescrição em favor da Fazenda Pública recomeça a correr, por dois anos e meio, a partir do ato interruptivo, mas não fica reduzida aquém de cinco anos, embora o titular do direito a interrompa durante a primeira metade do prazo."
  ],
  [
    384,
    "A demissão de extranumerário do serviço público federal, equiparado a funcionário de provimento efetivo para efeito de estabilidade, é da competência do Presidente da República."
  ],
  [
    385,
    "Oficial das Fôrças Armadas só pode ser reformado, em tempo de paz, por decisão de tribunal militar permanente, ressalvada a situação especial dos atingidos pelo art. 177 da Constituição de 1937."
  ],
  [
    386,
    "Pela execução de obra musical por artistas remunerados é devido direito autoral, não exigível quando a orquestra for de amadores."
  ],
  [
    387,
    "A cambial emitida ou aceita com omissões, ou em branco, pode ser completada pelo credor de boa-fé antes da cobrança ou do protesto."
  ],
  [
    388,
    "O casamento da ofendida com quem não seja o ofensor faz cessar a qualidade do seu representante legal, e a ação penal só pode prosseguir por iniciativa da própria ofendida, observados os prazos legais de decadência e perempção. (Revogada)"
  ],
  [
    389,
    "Salvo limite legal, a fixação de honorários de advogado, em complemento da condenação, depende das circunstâncias da causa, não dando lugar a recurso extraordinário."
  ],
  [
    390,
    "A exibição judicial de livros comerciais pode ser requerida como medida preventiva."
  ],
  [
    391,
    "O confinante certo deve ser citado, pessoalmente, para a ação de usucapião."
  ],
  [
    392,
    "O prazo para recorrer de acórdão concessivo de segurança conta-se da publicação oficial de suas conclusões, e não da anterior ciência à autoridade para cumprimento da decisão."
  ],
  [
    393,
    "Para requerer revisão criminal, o condenado não é obrigado a recolher-se à prisão."
  ],
  [
    395,
    "Não se conhece de recurso de \"habeas corpus\" cujo objeto seja resolver sôbre o ônus das custas, por não estar mais em causa a liberdade de locomoção."
  ],
  [
    396,
    "Para a ação penal por ofensa à honra, sendo admissível a exceção da verdade quanto ao desempenho de função pública, prevalece a competência especial por prerrogativa de função, ainda que já tenha cessado o exercício funcional do ofendido."
  ],
  [
    397,
    "O poder de polícia da Câmara dos Deputados e do Senado Federal, em caso de crime cometido nas suas dependências, compreende, consoante o regimento, a prisão em flagrante do acusado e a realização do inquérito."
  ],
  [
    398,
    "O Supremo Tribunal Federal não é competente para processar e julgar, originariamente, deputado ou senador acusado de crime."
  ],
  [
    399,
    "Não cabe recurso extraordinário, por violação de lei federal, quando a ofensa alegada for a regimento de tribunal."
  ],
  [
    400,
    "Decisão que deu razoável interpretação à lei, ainda que não seja a melhor, não autoriza recurso extraordinário pela letra a do art. 101, III, da C.F."
  ],
  [
    401,
    "Não se conhece do recurso de revista, nem dos embargos de divergência, do processo trabalhista, quando houver jurisprudência firme do Tribunal Superior do Trabalho no mesmo sentido da decisão impugnada, salvo se houver colisão com a jurisprudência do Supremo Tribunal Federal."
  ],
  [
    402,
    "Vigia noturno tem direito a salário adicional."
  ],
  [
    403,
    "É de decadência o prazo de trinta dias para instauração do inquérito judicial, a contar da suspensão, por falta grave, de empregado estável."
  ],
  [
    404,
    "Não contrariam a Constituição os arts 3º, 22 e 27 da L. 3.244, de 14.8.57, que definem as atribuições do Conselho de Política Aduaneira quanto à tarifa flexível."
  ],
  [
    405,
    "Denegado o mandado de segurança pela sentença, ou no julgamento do agravo, dela interposto, fica sem efeito a liminar concedida, retroagindo os efeitos da decisão contrária."
  ],
  [
    406,
    "O estudante ou professor bolsista e o servidor público em missão de estudo satisfazem a condição da mudança de residência para o efeito de trazer automóvel do exterior, atendidos os demais requisitos legais."
  ],
  [
    407,
    "Não tem direito ao têrço de campanha o militar que não participou de operações de guerra, embora servisse na \"zona de guerra\"."
  ],
  [
    408,
    "Os servidores fazendários não têm direito a percentagem pela arrecadação de receita federal destinada ao Banco Nacional de Desenvolvimento Econômico."
  ],
  [
    409,
    "Ao retomante, que tenha mais de um prédio alugado, cabe optar entre eles, salvo abuso de direito."
  ],
  [
    410,
    "Se o locador, utilizando prédio próprio para residência ou atividade comercial, pede o imóvel locado para uso próprio, diverso do que tem o por ele ocupado, não está obrigado a provar a necessidade, que se presume."
  ],
  [
    411,
    "O locatário autorizado a ceder a locação pode sublocar o imóvel."
  ],
  [
    412,
    "No compromisso de compra e venda com cláusula de arrependimento, a devolução do sinal, por quem o deu, ou a sua restituição em dôbro, por quem o recebeu, exclui indenização maior, a título de perdas e danos, salvo os juros moratórios e os encargos do processo."
  ],
  [
    413,
    "O compromisso de compra e venda de imóveis, ainda que não loteados, dá direito à execução compulsória, quando reunidos os requisitos legais."
  ],
  [
    414,
    "Não se distingue a visão direta da oblíqua na proibição de abrir janela, ou fazer terraço, eirado, ou varanda, a menos de metro e meio do prédio de outrem."
  ],
  [
    415,
    "Servidão de trânsito não titulada, mas tornada permanente, sobretudo pela natureza das obras realizadas, considera-se aparente, conferindo direito à proteção possessória."
  ],
  [
    416,
    "Pela demora no pagamento do preço da desapropriação não cabe indenização complementar além dos juros."
  ],
  [
    417,
    "Pode ser objeto de restituição, na falência, dinheiro em poder do falido, recebido em nome de outrem, ou do qual, por lei ou contrato, não tivesse êle a disponibilidade."
  ],
  [
    418,
    "O empréstimo compulsório não é tributo, e sua arrecadação não está sujeita à exigência constitucional da prévia autorização orçamentária."
  ],
  [
    419,
    "Os Municípios têm competência para regular o horário do comércio local, desde que não infrinjam leis estaduais ou federais válidas."
  ],
  [
    420,
    "Não se homologa sentença proferida no estrangeiro sem prova do trânsito em julgado."
  ],
  [
    421,
    "Não impede a extradição a circunstância de ser o extraditando casado com brasileira ou ter filho brasileiro."
  ],
  [
    422,
    "A absolvição criminal não prejudica a medida de segurança, quando couber, ainda que importe privação da liberdade."
  ],
  [
    423,
    "Não transita em julgado a sentença por haver omitido o recurso \"ex officio\", que se considera interposto \"ex lege\"."
  ],
  [
    424,
    "Transita em julgado o despacho saneador de que não houve recurso, excluídas as questões deixadas, explícita ou implicitamente, para a sentença."
  ],
  [
    425,
    "O agravo despachado no prazo legal não fica prejudicado pela demora da juntada, por culpa do cartório; nem o agravo entregue em cartório no prazo legal, embora despachado tardiamente."
  ],
  [
    426,
    "A falta do termo específico não prejudica o agravo no auto do processo, quando oportuna a interposição por petição ou no termo da audiência."
  ],
  [
    427,
    "A falta de petição de interposição não prejudica o agravo no auto do processo tomado por termo."
  ],
  [
    428,
    "Não fica prejudicada a apelação entregue em cartório no prazo legal, embora despachada tardiamente."
  ],
  [
    429,
    "A existência de recurso administrativo com efeito suspensivo não impede o uso do mandado de segurança contra omissão da autoridade."
  ],
  [
    430,
    "Pedido de reconsideração na via administrativa não interrompe o prazo para o mandado de segurança."
  ],
  [
    431,
    "É nulo o julgamento de recurso criminal, na segunda instância, sem prévia intimação, ou publicação da pauta, salvo em \"habeas corpus\"."
  ],
  [
    432,
    "Não cabe recurso extraordinário com fundamento no art. 101, III, \"d\", da Constituição Federal, quando a divergência alegada for entre decisões da Justiça do Trabalho."
  ],
  [
    433,
    "É competente o Tribunal Regional do Trabalho para julgar mandado de segurança contra ato de seu presidente em execução de sentença trabalhista."
  ],
  [
    434,
    "A controvérsia entre seguradores indicados pelo empregador na ação de acidente do trabalho não suspende o pagamento devido ao acidentado."
  ],
  [
    435,
    "O impôsto de transmissão \"causa mortis\" pela transferência de ações é devido ao Estado em que tem sede a companhia."
  ],
  [
    436,
    "É válida a L. 4.093, de 24.10.959, do Paraná, que revogou a isenção concedida às cooperativas por lei anterior."
  ],
  [
    437,
    "Está isenta da taxa de despacho aduaneiro a importação de equipamento para a indústria automobilística, segundo plano aprovado, no prazo legal, pelo órgão competente."
  ],
  [
    438,
    "É ilegítima a cobrança, em 1962, da Taxa de Educação e Saúde, de Santa Catarina, adicional do impôsto de vendas e consignações."
  ],
  [
    439,
    "Estão sujeitos à fiscalização tributária ou previdenciária quaisquer livros comerciais, limitado o exame aos pontos objeto da investigação."
  ],
  [
    440,
    "Os benefícios da legislação federal de serviços de guerra não são exigíveis dos Estados, sem que a lei estadual assim disponha."
  ],
  [
    441,
    "O militar, que passa à inatividade com proventos integrais, não tem direito às cotas trigésimas a que se refere o Código de Vencimentos e Vantagens dos Militares."
  ],
  [
    442,
    "A inscrição do contrato de locação no Registro de Imóveis, para a validade da cláusula de vigência contra o adquirente do imóvel, ou perante terceiros, dispensa a transcrição no Registro de Títulos e Documentos."
  ],
  [
    443,
    "A prescrição das prestações anteriores ao período previsto em lei não ocorre, quando não tiver sido negado, antes daquele prazo, o próprio direito reclamado, ou a situação jurídica de que êle resulta."
  ],
  [
    444,
    "Na retomada para construção mais útil, de imóvel sujeito ao D. 24.150, de 20.4.34, a indenização se limita às despesas de mudança."
  ],
  [
    445,
    "A L. 2.437, de 7.3.55, que reduz prazo prescricional, é aplicável às prescrições em curso na data de sua vigência (1.1.56), salvo quanto aos processos então pendentes."
  ],
  [
    446,
    "Contrato de exploração de jazida ou pedreira não está sujeito ao D. 24.150, de 20.4.34."
  ],
  [
    447,
    "É válida a disposição testamentária em favor de filho adulterino do testador com sua concubina."
  ],
  [
    448,
    "O prazo para o assistente recorrer, supletivamente, começa a correr imediatamente após o transcurso do prazo do Ministério Público."
  ],
  [
    449,
    "O valor da causa, na consignatória de aluguel, corresponde a uma anuidade."
  ],
  [
    450,
    "São devidos honorários de advogado sempre que vencedor o beneficiário de justiça gratuita."
  ],
  [
    451,
    "A competência especial por prerrogativa de função não se estende ao crime cometido após a cessação definitiva do exercício funcional."
  ],
  [
    452,
    "Oficiais e praças do Corpo de Bombeiros do Estado da Guanabara respondem perante a Justiça Comum por crime anterior à L. 427, de 11.10.48."
  ],
  [
    453,
    "Não se aplicam à segunda instância o art. 384 e parágrafo único do Código de Processo Penal, que possibilitam dar nova definição jurídica ao fato delituoso, em virtude de circunstância elementar não contida, explícita ou implicitamente, na denúncia ou queixa."
  ],
  [
    454,
    "Simples interpretação de cláusulas contratuais não dá lugar a recurso extraordinário."
  ],
  [
    455,
    "Da decisão que se seguir ao julgamento de constitucionalidade pelo Tribunal Pleno, são inadmissíveis embargos infringentes quanto à matéria constitucional."
  ],
  [
    456,
    "O Supremo Tribunal Federal, conhecendo do recurso extraordinário, julgará a causa, aplicando o direito à espécie."
  ],
  [
    457,
    "O Tribunal Superior do Trabalho, conhecendo da revista, julgará a causa, aplicando o direito à espécie."
  ],
  [
    458,
    "O processo da execução trabalhista não exclui a remição pelo executado."
  ],
  [
    459,
    "No cálculo da indenização por despedida injusta, incluem-se os adicionais, ou gratificações, que, pela habitualidade, se tenham incorporado ao salário."
  ],
  [
    460,
    "Para efeito do adicional de insalubridade, a perícia judicial, em reclamação trabalhista, não dispensa o enquadramento da atividade entre as insalubres, que é ato da competência do Ministro do Trabalho e Previdência Social."
  ],
  [
    461,
    "É duplo, e não triplo, o pagamento do salário nos dias destinados a descanso."
  ],
  [
    462,
    "No cálculo da indenização por despedida injusta inclui-se, quando devido, o repouso semanal remunerado."
  ],
  [
    463,
    "Para efeito de indenização e estabilidade, conta-se o tempo em que o empregado esteve afastado, em serviço militar obrigatório, mesmo anteriormente à L. 4.072, de 1.6.62."
  ],
  [
    464,
    "No cálculo da indenização por acidente do trabalho inclui-se, quando devido, o repouso semanal remunerado."
  ],
  [
    465,
    "O regime de manutenção de salário, aplicável ao IAPM e ao IAPETC, exclui a indenização tarifada na Lei de Acidentes do Trabalho, mas não o benefício previdenciário."
  ],
  [
    466,
    "Não é inconstitucional a inclusão de sócios e administradores de sociedades e titulares de firmas individuais como contribuintes obrigatórios da previdência social."
  ],
  [
    467,
    "A base do cálculo das contribuições previdenciárias, anteriormente à vigência da Lei Orgânica da Previdência Social, é o salário mínimo mensal, observados os limites da L. 2.755 de 1956."
  ],
  [
    468,
    "Após a E. C. nº 5 de 21.11.61, em contrato firmado com a União, Estado, Município ou autarquia, é devido o impôsto federal de sêlo pelo contratante não protegido pela imunidade, ainda que haja repercussão do ônus tributário sôbre o patrimônio daquelas entidades."
  ],
  [
    469,
    "A multa de cem por cento, para o caso de mercadoria importada irregularmente, é calculada à base do custo de câmbio da categoria correspondente."
  ],
  [
    470,
    "O impôsto de transmissão \"inter vivos\" não incide sôbre a construção, ou parte dela, realizada, inequivocamente, pelo promitente comprador, mas sôbre o valor do que tiver sido construído antes da promessa de venda."
  ],
  [
    471,
    "As emprêsas aeroviárias não estão isentas do impôsto de indústrias e profissões."
  ],
  [
    472,
    "A condenação do autor em honorários de advogado, com fundamento no art. 64 do C. P. C., depende de reconvenção."
  ],
  [
    473,
    "A administração pode anular seus próprios atos, quando eivados de vícios que os tornam ilegais, porque deles não se originam direitos; ou revogá-los, por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos, e ressalvada, em todos os casos, a apreciação judicial."
  ],
  [
    474,
    "Não há direito líquido e certo, amparado pelo mandado de segurança, quando se escuda em lei cujos efeitos foram anulados por outra, declarada constitucional pelo Supremo Tribunal Federal."
  ],
  [
    475,
    "A Lei nº 4.686, de 21-6-65, tem aplicação imediata aos processos em curso, inclusive em grau de recurso extraordinário."
  ],
  [
    476,
    "Desapropriadas as ações de uma sociedade, o Poder desapropriante, imitido na posse, pode exercer, desde logo, todos os direitos inerentes aos respectivos títulos."
  ],
  [
    477,
    "As concessões de terras devolutas situadas na faixa de fronteira, feitas pelos Estados, autorizam, apenas, o uso, permanecendo o domínio com a União, ainda que se mantenha inerte ou tolerante, em relação aos possuidores."
  ],
  [
    478,
    "O provimento em cargos de Juízes substitutos do Trabalho, deve ser feito independentemente de lista tríplice, na ordem de classificação dos candidatos."
  ],
  [
    479,
    "As margens dos rios navegáveis são de domínio público, insuscetíveis de expropriação e, por isso mesmo, excluídas de indenização."
  ],
  [
    480,
    "Pertencem ao domínio e administração da União, nos termos dos arts. 4º, IV e 186, da Constituição Federal de 1967, as terras ocupadas por silvícolas."
  ],
  [
    481,
    "Se a locação compreende, além do imóvel, fundo de comércio, com instalações e pertences, como no caso de teatros, cinemas e hotéis, não se aplicam ao retomante as restrições do art. 8º, e, parágrafo único, do Decreto nº. 24.150, de 20.4.34."
  ],
  [
    482,
    "O locatário, que não for sucessor ou cessionário do que o precedeu na locação, não pode somar os prazos concedidos a este, para pedir a renovação do contrato, nos termos do Decreto nº 24.150."
  ],
  [
    483,
    "É dispensável a prova da necessidade, na retomada de prédio situado em localidade para onde o proprietário pretende transferir residência, salvo se mantiver, também, a anterior, quando dita prova será exigida."
  ],
  [
    484,
    "Pode, legitimamente, o proprietário pedir o prédio para a residência de filho, ainda que solteiro, de acordo com o art. 11, nº III, da Lei nº 4.494, de 25.11.64."
  ],
  [
    485,
    "Nas locações regidas pelo Decreto nº 24.150, de 20 de abril de 1934, a presunção de sinceridade do retomante é relativa, podendo ser ilidida pelo locatário."
  ],
  [
    486,
    "Admite-se a retomada para sociedade da qual o locador, ou seu cônjuge, seja sócio, com participação predominante no capital social."
  ],
  [
    487,
    "Será deferida a posse a quem, evidentemente, tiver o domínio, se com base neste for ela disputada."
  ],
  [
    488,
    "A preferência a que se refere o art. 9º da Lei nº 3.912, de 3-7-1961, constitui direito pessoal. Sua violação resolve-se em perdas e danos."
  ],
  [
    489,
    "A compra e venda de automóvel não prevalece contra terceiros, de boa-fé, se o contrato não foi transcrito no Registro de Títulos e Documentos."
  ],
  [
    490,
    "A pensão correspondente à indenização oriunda de responsabilidade civil deve ser calculada com base no salário-mínimo vigente ao tempo da sentença e ajustar-se-á às variações ulteriores."
  ],
  [
    491,
    "É indenizável o acidente que cause a morte de filho menor, ainda que não exerça trabalho remunerado."
  ],
  [
    492,
    "A emprêsa locadora de veículos responde, civil e solidariamente com o locatário, pelos danos por este causados a terceiro, no uso do carro locado."
  ],
  [
    493,
    "O valor da indenização, se consistente em prestações periódicas e sucessivas, compreenderá, para que se mantenha inalterável na sua fixação, parcelas compensatórias do impôsto de renda, incidente sôbre os juros do capital gravado ou caucionado, nos termos dos arts. 911 e 912 do Código de Processo Civil."
  ],
  [
    494,
    "A ação para anular venda de ascendente a descendente, sem consentimento dos demais, prescreve em vinte anos, contados da data do ato, revogada a Súmula nº 152."
  ],
  [
    495,
    "A restituição em dinheiro da coisa vendida a crédito, entregue nos quinze dias anteriores ao pedido de falência ou de concordata, cabe, quando, ainda que consumida ou transformada, não faça o devedor prova de haver sido alienada a terceiro."
  ],
  [
    496,
    "São válidos, porque salvaguardados pelas Disposições Constitucionais Transitórias da Constituição Federal de 1967, os decretos-leis expedidos entre 24 de janeiro e 15 de março de 1967."
  ],
  [
    497,
    "Quando se tratar de crime continuado, a prescrição regula-se pela pena imposta na sentença, não se computando o acréscimo decorrente da continuação."
  ],
  [
    498,
    "Compete à Justiça dos Estados, em ambas as instâncias, o processo e o julgamento dos crimes contra a economia popular."
  ],
  [
    499,
    "Não obsta à concessão do \"sursis\" condenação anterior à pena de multa."
  ],
  [
    500,
    "Não cabe a ação cominatória para compelir-se o réu a cumprir obrigação de dar."
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
console.log("STF NV lotes 31–50: 301–500.");
if (falha) process.exit(1);

/**
 * Fundamentação jurídica do template de reserva (sem Gemini).
 * Linguagem formal / forense — não substitui revisão do advogado.
 */

function letraSubtopico(n: number): string {
  return `${String.fromCharCode(97 + n)})`;
}

export function montarFundamentosDireitoJec(opcoes: {
  tipoAcao: string;
  fatos: string;
  tutelaUrgencia: boolean;
  trechosBase?: { titulo: string; categoria: string; texto: string }[];
  /** Título romano completo, ex.: "II - DO DIREITO" ou "III - DAS RAZÕES…". */
  tituloSecao?: string;
  pedirJusticaGratuita?: boolean;
}): string[] {
  const tipo = opcoes.tipoAcao.toLowerCase();
  const fatos = opcoes.fatos.toLowerCase();

  const linhas: string[] = [opcoes.tituloSecao?.trim() || "II - DO DIREITO"];
  let sub = 0;

  const addSub = (titulo: string, ...paragrafos: string[]) => {
    linhas.push(`${letraSubtopico(sub++)} ${titulo}`, ...paragrafos);
  };

  addSub(
    "Da competência do Juizado Especial Cível",
    "A presente demanda encontra amparo na Lei nº 9.099/95, que institui os Juizados Especiais Cíveis, via adequada às causas de menor complexidade, sob os critérios da oralidade, simplicidade, informalidade, economia processual e celeridade (art. 2º). Presentes os requisitos de alçada e de matéria, impõe-se o processamento perante este Juizado."
  );

  // Núcleo de mérito conforme tipo / fatos
  if (
    contem(fatos, [
      "golpe",
      "pix",
      "fraude",
      "clonagem",
      "estelionato",
      "santander",
      "banco",
      "cartão",
      "cartao",
    ]) ||
    tipo.includes("inexigibilidade") ||
    tipo.includes("inexistência") ||
    tipo.includes("inexistencia") ||
    tipo.includes("indeniza")
  ) {
    addSub(
      "Da relação de consumo e da responsabilidade objetiva",
      "A relação estabelecida entre as partes atrai a incidência do Código de Defesa do Consumidor (Lei nº 8.078/90), porquanto o autor figura como destinatário final dos serviços (art. 2º) e a requerida como fornecedora (art. 3º). Nos termos do art. 14 do CDC, o fornecedor de serviços responde, independentemente de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços.",
      "A falha na segurança das operações, o vazamento ou a utilização indevida de dados cadastrais e a ausência de mecanismos eficazes de contenção de fraudes configuram defeito do serviço, atraindo a responsabilidade objetiva da instituição, bem como o dever de informação e de proteção (arts. 6º, I e III, e 14 do CDC). A jurisprudência consolidada reconhece a responsabilidade das instituições financeiras por fraudes praticadas por terceiros no âmbito de suas operações (Súmula 479 do STJ), sobretudo quando as movimentações destoam do perfil do cliente."
    );
    addSub(
      "Dos danos materiais e morais",
      "O prejuízo patrimonial correspondente aos valores indevidamente transferidos ou não restituídos deve ser integralmente reparado, com correção monetária e juros legais. Paralelamente, a angústia, a vulnerabilidade e o abalo à dignidade decorrentes da fraude e da inércia na solução administrativa ultrapassam o mero aborrecimento, autorizando a condenação em danos morais em quantum proporcional às circunstâncias do caso concreto (art. 6º, VI, do CDC e art. 186 do Código Civil)."
    );
    addSub(
      "Da inversão do ônus da prova",
      "Por se tratar de relação de consumo e diante da hipossuficiência técnica do autor frente à instituição financeira — detentora dos logs, sistemas de autenticação e trilhas das operações —, impõe-se a inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC e, subsidiariamente, do art. 373, §1º, do CPC, a fim de que a requerida demonstre a inexistência de falha na prestação do serviço e a regularidade das operações impugnadas."
    );
    addSub(
      "Da legislação de proteção de dados",
      "A exposição e o uso indevido de dados pessoais e bancários do consumidor igualmente encontram respaldo na Lei nº 13.709/2018 (LGPD), notadamente nos deveres de segurança e de prevenção (arts. 6º, VII, e 46), reforçando o dever de indenizar pelos danos decorrentes da falha na guarda das informações. In casu, o conhecimento prévio, pelos fraudadores, de dados cadastrais e saldos tipicamente sob guarda da instituição reforça o nexo entre a falha de segurança e o dano experimentado pelo autor."
    );
  } else if (tipo.includes("cobrança") || tipo.includes("cobranca")) {
    addSub(
      "Do inadimplemento e da obrigação de pagar",
      "Restando demonstrada a existência de obrigação líquida, certa e exigível, bem como o inadimplemento do réu, impõe-se a condenação ao pagamento do quantum devido, com atualização monetária e juros de mora, nos termos dos arts. 389, 394 e 395 do Código Civil, assegurando-se a satisfação integral do crédito do autor."
    );
    addSub(
      "Dos ônus da prova",
      "Cabe ao réu, na forma do art. 373, II, do Código de Processo Civil, comprovar fato impeditivo, modificativo ou extintivo do direito do autor, sob pena de procedência do pedido condenatório."
    );
  } else if (tipo.includes("obrigação") || tipo.includes("obrigacao")) {
    addSub(
      "Da obrigação de fazer",
      "Demonstrada a existência de obrigação de fazer inadimplida, impõe-se a condenação do réu ao cumprimento específico da prestação, podendo o juízo fixar prazo e astreintes para assegurar a efetividade do comando judicial (arts. 497 e 537 do CPC)."
    );
    addSub(
      "Do inadimplemento",
      "O descumprimento voluntário da obrigação gera o dever de indenizar perdas e danos eventualmente comprovados, sem prejuízo da tutela específica (arts. 389 e 475 do Código Civil)."
    );
  } else if (tipo.includes("despejo") || tipo.includes("locação") || tipo.includes("locacao")) {
    addSub(
      "Da relação locatícia e do despejo",
      "A relação jurídica deduzida atrai a Lei nº 8.245/91 (Lei do Inquilinato). Verificado o inadimplemento contratual — notadamente a falta de pagamento — é medida de direito a rescisão contratual com a consequente ordem de despejo, sem prejuízo da cobrança dos aluguéis e encargos em atraso, devidamente atualizados."
    );
    addSub(
      "Da purga da mora",
      "Assevera-se o direito à purga da mora nos casos e prazos legais, sem que isso obste, desde logo, o processamento da demanda e a tutela dos créditos locatícios devidos."
    );
  } else if (tipo.includes("execução") || tipo.includes("execucao")) {
    addSub(
      "Do título executivo extrajudicial",
      "Presente título executivo extrajudicial líquido, certo e exigível, autoriza-se o processamento da execução nos termos do art. 784 do Código de Processo Civil e da Lei nº 9.099/95, com citação do executado para pagamento e, no silêncio, adoção das medidas executivas cabíveis."
    );
    addSub(
      "Dos consectários",
      "Sobre o débito incidem correção monetária e juros de mora, além das verbas de sucumbência na forma da legislação aplicável ao rito."
    );
  } else {
    addSub(
      "Do direito material aplicável",
      "Os fatos narrados revelam a existência de direito subjetivo violado, a legitimidade das partes e o interesse de agir, atraindo a tutela jurisdicional para a recomposição da situação jurídica ofendida, com arrimo no ordenamento civil e, quando se tratar de relação de consumo, no Código de Defesa do Consumidor."
    );
    addSub(
      "Do dever de indenizar e/ou de cumprir a obrigação",
      "À luz dos arts. 186 e 927 do Código Civil — e, se consumidora a relação, do art. 14 do CDC —, aquele que causa dano por ato ilícito ou por defeito na prestação de serviço fica obrigado a repará-lo, podendo a condenação abranger obrigação de fazer, de não fazer, de dar e/ou de pagar quantia certa, conforme o pedido formulado."
    );
  }

  if (opcoes.tutelaUrgencia) {
    addSub(
      "Da tutela de urgência",
      "Presentes a probabilidade do direito (*fumus boni iuris*) e o perigo de dano ou o risco ao resultado útil do processo (*periculum in mora*), nos termos do art. 300 do Código de Processo Civil, impõe-se a concessão da tutela de urgência para acautelar o direito da parte autora até o julgamento definitivo."
    );
  }

  if (opcoes.pedirJusticaGratuita) {
    addSub(
      "Da justiça gratuita",
      "A parte autora declara não possuir condições de arcar com as custas, as taxas e as despesas processuais sem prejuízo do próprio sustento e de sua família, fazendo jus aos benefícios da justiça gratuita, nos termos da Lei nº 9.099/95 e da legislação processual pertinente, sem prejuízo da juntada da declaração de hipossuficiência."
    );
  }

  if (opcoes.trechosBase && opcoes.trechosBase.length > 0) {
    addSub(
      "Dos entendimentos e dispositivos invocados pelo escritório",
      "Aplicam-se, ainda, os seguintes dispositivos e entendimentos constantes da base de conhecimento anexada ao caso, os quais reforçam a tese deduzida:"
    );
    for (const item of opcoes.trechosBase.slice(0, 4)) {
      const trecho = item.texto.trim().replace(/\s+/g, " ");
      linhas.push(
        `${item.categoria} — ${item.titulo}: ${trecho.slice(0, 900)}${trecho.length > 900 ? "…" : ""}`
      );
    }
  }

  linhas.push(
    "Ante o conjunto normativo acima, resta evidenciada a procedência dos pedidos formulados, merecendo a demanda o acolhimento integral por este Juízo."
  );

  return linhas;
}

function contem(texto: string, termos: string[]): boolean {
  return termos.some((t) => texto.includes(t));
}

import type { CasoOuroArea } from "./types";

function pecaCompleta(p: {
  foro: string;
  autor: string;
  reu: string;
  nomePeca: string;
  fatos: string;
  direito: string;
  pedidos: string[];
}): string {
  const letras = p.pedidos
    .map((ped, i) => `${String.fromCharCode(97 + i)}) ${ped};`)
    .join("\n");
  return `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO ${p.foro}

${p.autor} vem, por advogado, propor

${p.nomePeca}

em face de ${p.reu}, pelos fatos e fundamentos a seguir.

I - DOS FATOS
${p.fatos}

II - DO DIREITO
${p.direito}

III - DOS PEDIDOS
Ante o exposto, requer:
${letras}

Nestes termos,
pede deferimento.

São Paulo/SP, 14 de agosto de 2026.
Advogado Teste
OAB/SP 404040
`.trim();
}

/**
 * Peça completa por área (endereçamento + fatos + direito + pedidos + lastro).
 * Módulos fechados já ficam prontos; o catálogo exige peça completa em todas.
 */
export const CASOS_OURO_AREAS: CasoOuroArea[] = [
  {
    id: "jecr-transacao-penal",
    areaId: "jecr",
    tema: "JECRIM — transação penal / Lei 9.099",
    fatosChave: ["lesão corporal leve", "transação penal"],
    leisComLastro: ["art. 76"],
    jurisComLastro: ["HC 2001111"],
    jurisSemLastro: ["HC 9999999"],
    contextoLastro: `
Lei 9.099/95. Art. 76 — transação penal no Juizado Especial Criminal.
HC nº 2001111 — cabimento de transação penal em infrações de menor potencial ofensivo.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO JUIZADO ESPECIAL CRIMINAL DA COMARCA DE SÃO PAULO - SP",
      autor: "QUERELANTE FICTO",
      reu: "QUERELADO FICTO",
      nomePeca: "PEDIDO DE HOMOLOGAÇÃO DE TRANSAÇÃO PENAL",
      fatos:
        "Noticiado crime de lesão corporal leve, infração de menor potencial ofensivo, as partes formalizaram proposta de transação penal.",
      direito:
        "Aplica-se a Lei nº 9.099/95 e o art. 76. Cita-se o HC nº 2001111 e o HC nº 9999999.",
      pedidos: [
        "Homologação da transação penal",
        "Extinção da punibilidade pelo cumprimento",
      ],
    }),
  },
  {
    id: "trabalhista-horas-extras",
    areaId: "trabalhista",
    tema: "Horas extras / intervalo intrajornada",
    fatosChave: ["intervalo intrajornada", "horas extras"],
    leisComLastro: ["art. 71", "Súmula 437"],
    jurisComLastro: ["REsp 3002222"],
    jurisSemLastro: ["REsp 8888888"],
    contextoLastro: `
CLT art. 71. Súmula 437 do TST — intervalo intrajornada suprimido.
REsp nº 3002222 — horas extras habituais e reflexos.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA DO TRABALHO DE SÃO PAULO",
      autor: "RECLAMANTE FICTO",
      reu: "RECLAMADA FICTA LTDA.",
      nomePeca: "RECLAMAÇÃO TRABALHISTA",
      fatos:
        "O reclamante laborava sem intervalo intrajornada regular e prestava horas extras habituais sem o devido pagamento.",
      direito:
        "Incidem o art. 71 da CLT e a Súmula 437 do TST. Colaciona-se o REsp nº 3002222 e o REsp nº 8888888.",
      pedidos: [
        "Pagamento de horas extras e reflexos",
        "Indenização pelo intervalo suprimido",
      ],
    }),
  },
  {
    id: "criminal-habeas-corpus",
    areaId: "criminal",
    tema: "Habeas corpus — prisão preventiva",
    fatosChave: ["prisão preventiva", "periculum libertatis"],
    leisComLastro: ["art. 312"],
    jurisComLastro: ["HC 4003333"],
    jurisSemLastro: ["HC 7777777"],
    contextoLastro: `
CPP art. 312 — requisitos da prisão preventiva.
HC nº 4003333 — ausência de fundamentação concreta da custódia cautelar.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO",
      autor: "IMPETRANTE FICTO",
      reu: "AUTORIDADE COATORA FICTA",
      nomePeca: "HABEAS CORPUS COM PEDIDO DE LIMINAR",
      fatos:
        "Paciente preso preventivamente sem demonstração de periculum libertatis nem fundamentação concreta da custódia.",
      direito:
        "Exige-se fundamento no art. 312 do CPP. Cita-se o HC nº 4003333 e o HC nº 7777777.",
      pedidos: [
        "Concessão da ordem de habeas corpus",
        "Revogação da prisão preventiva",
      ],
    }),
  },
  {
    id: "empresarial-dissolucao",
    areaId: "empresarial",
    tema: "Dissolução parcial de sociedade",
    fatosChave: ["dissolução parcial", "apuração de haveres"],
    leisComLastro: ["art. 1.029"],
    jurisComLastro: ["REsp 5004444"],
    jurisSemLastro: ["REsp 6666666"],
    contextoLastro: `
Código Civil art. 1.029 — direito de retirada do sócio.
REsp nº 5004444 — dissolução parcial e apuração de haveres.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA EMPRESARIAL DA COMARCA DE SÃO PAULO - SP",
      autor: "SÓCIO RETIRANTE FICTO",
      reu: "SOCIEDADE FICTA LTDA.",
      nomePeca: "AÇÃO DE DISSOLUÇÃO PARCIAL DE SOCIEDADE",
      fatos:
        "O autor exerceu o direito de retirada e a sociedade recusou a apuração de haveres de forma regular.",
      direito:
        "Aplica-se o art. 1.029 do Código Civil. Cita-se o REsp nº 5004444 e o REsp nº 6666666.",
      pedidos: [
        "Dissolução parcial da sociedade",
        "Apuração e pagamento de haveres",
      ],
    }),
  },
  {
    id: "civil-responsabilidade",
    areaId: "civil",
    tema: "Responsabilidade civil / acidente",
    fatosChave: ["acidente de trânsito", "nexo causal"],
    leisComLastro: ["art. 186", "art. 927"],
    jurisComLastro: ["1007001-22.2023.8.26.0100"],
    jurisSemLastro: ["1007002-33.2023.8.26.0100"],
    contextoLastro: `
Código Civil art. 186 e art. 927 — ato ilícito e dever de indenizar.
TJSP Processo nº 1007001-22.2023.8.26.0100 — acidente de trânsito e nexo causal.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "AUTOR FICTO",
      reu: "RÉU FICTO",
      nomePeca: "AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS",
      fatos:
        "O autor sofreu acidente de trânsito por culpa do réu, com nexo causal comprovado e prejuízos materiais e morais.",
      direito:
        "Incidem o art. 186 e o art. 927 do Código Civil. Cita-se o Processo nº 1007001-22.2023.8.26.0100 e o Processo nº 1007002-33.2023.8.26.0100.",
      pedidos: [
        "Indenização por danos materiais",
        "Indenização por danos morais",
      ],
    }),
  },
  {
    id: "familia-alimentos",
    areaId: "familia",
    tema: "Alimentos / guarda",
    fatosChave: ["pensão alimentícia", "guarda compartilhada"],
    leisComLastro: ["art. 1.694"],
    jurisComLastro: ["REsp 6005555"],
    jurisSemLastro: ["REsp 6161616"],
    contextoLastro: `
Código Civil art. 1.694 — alimentos.
REsp nº 6005555 — guarda compartilhada e pensão alimentícia.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA DE FAMÍLIA DA COMARCA DE SÃO PAULO - SP",
      autor: "ALIMENTANDA FICTA",
      reu: "ALIMENTANTE FICTO",
      nomePeca: "AÇÃO DE ALIMENTOS C/C GUARDA COMPARTILHADA",
      fatos:
        "A autora necessita de pensão alimentícia proporcional e pretende a guarda compartilhada do filho menor.",
      direito:
        "Aplica-se o art. 1.694 do Código Civil. Colaciona-se o REsp nº 6005555 e o REsp nº 6161616.",
      pedidos: [
        "Fixação de pensão alimentícia",
        "Guarda compartilhada",
      ],
    }),
  },
  {
    id: "imobiliario-despejo",
    areaId: "imobiliario",
    tema: "Despejo por falta de pagamento",
    fatosChave: ["aluguel", "despejo"],
    leisComLastro: ["Lei 8.245/91"],
    jurisComLastro: ["1007101-11.2024.8.26.0100"],
    jurisSemLastro: ["1007102-22.2024.8.26.0100"],
    contextoLastro: `
Lei nº 8.245/91 — locação de imóveis urbanos.
TJSP Processo nº 1007101-11.2024.8.26.0100 — despejo por inadimplemento locatício.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "LOCADOR FICTO",
      reu: "LOCATÁRIO FICTO",
      nomePeca: "AÇÃO DE DESPEJO POR FALTA DE PAGAMENTO",
      fatos:
        "O locatário deixou de pagar aluguel e encargos por três meses consecutivos, apesar de notificado.",
      direito:
        "Aplica-se a Lei nº 8.245/91. Cita-se o Processo nº 1007101-11.2024.8.26.0100 e o Processo nº 1007102-22.2024.8.26.0100.",
      pedidos: [
        "Rescisão do contrato de locação",
        "Despejo e cobrança dos aluguéis em atraso",
      ],
    }),
  },
  {
    id: "contratual-inadimplemento",
    areaId: "contratual",
    tema: "Resolução contratual por inadimplemento",
    fatosChave: ["inadimplemento absoluto", "resolução"],
    leisComLastro: ["art. 475"],
    jurisComLastro: ["1007201-33.2023.8.26.0100"],
    jurisSemLastro: ["1007202-44.2023.8.26.0100"],
    contextoLastro: `
Código Civil art. 475 — resolução por inadimplemento.
TJSP Processo nº 1007201-33.2023.8.26.0100 — resolução contratual e perdas e danos.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "CREDOR FICTO",
      reu: "DEVEDOR FICTO",
      nomePeca: "AÇÃO DE RESOLUÇÃO CONTRATUAL C/C PERDAS E DANOS",
      fatos:
        "O réu incorreu em inadimplemento absoluto da obrigação principal, após mora não purgada.",
      direito:
        "Incide o art. 475 do Código Civil. Cita-se o Processo nº 1007201-33.2023.8.26.0100 e o Processo nº 1007202-44.2023.8.26.0100.",
      pedidos: [
        "Resolução do contrato",
        "Perdas e danos",
      ],
    }),
  },
  {
    id: "tributario-execucao-fiscal",
    areaId: "tributario",
    tema: "Exceção de pré-executividade / CDA",
    fatosChave: ["CDA", "execução fiscal"],
    leisComLastro: ["art. 204"],
    jurisComLastro: ["REsp 7006666"],
    jurisSemLastro: ["REsp 7070707"],
    contextoLastro: `
CTN art. 204 — presunção de certeza e liquidez da CDA.
REsp nº 7006666 — nulidade de CDA por ausência de fundamento legal.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA DA FAZENDA PÚBLICA DA COMARCA DE SÃO PAULO - SP",
      autor: "EXECUTADO FICTO",
      reu: "FAZENDA PÚBLICA FICTA",
      nomePeca: "EXCEÇÃO DE PRÉ-EXECUTIVIDADE",
      fatos:
        "A CDA (Certidão de Dívida Ativa) que instrui a execução fiscal carece de fundamento legal e de liquidez.",
      direito:
        "Aplica-se o art. 204 do CTN. Colaciona-se o REsp nº 7006666 e o REsp nº 7070707.",
      pedidos: [
        "Acolhimento da exceção",
        "Extinção da execução fiscal",
      ],
    }),
  },
  {
    id: "administrativo-ms",
    areaId: "administrativo",
    tema: "Mandado de segurança / licitação",
    fatosChave: ["licitação", "direito líquido e certo"],
    leisComLastro: ["Lei 14.133/21", "Lei 12.016/09"],
    jurisComLastro: ["REsp 8007777"],
    jurisSemLastro: ["REsp 8080808"],
    contextoLastro: `
Lei nº 14.133/21 — licitações. Lei nº 12.016/09 — mandado de segurança.
REsp nº 8007777 — anulação de ato licitatório e direito líquido e certo.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA DA FAZENDA PÚBLICA DA COMARCA DE SÃO PAULO - SP",
      autor: "IMPETRANTE FICTO",
      reu: "AUTORIDADE COATORA FICTA",
      nomePeca: "MANDADO DE SEGURANÇA",
      fatos:
        "A autoridade coatora excluiu o impetrante de licitação sem motivação idônea, violando direito líquido e certo.",
      direito:
        "Aplicam-se a Lei nº 14.133/21 e a Lei nº 12.016/09. Cita-se o REsp nº 8007777 e o REsp nº 8080808.",
      pedidos: [
        "Concessão da segurança",
        "Anulação do ato de exclusão",
      ],
    }),
  },
  {
    id: "previdenciario-aposentadoria",
    areaId: "previdenciario",
    tema: "Aposentadoria especial / ruído",
    fatosChave: ["aposentadoria especial", "agente nocivo"],
    leisComLastro: ["Lei 8.213/91"],
    jurisComLastro: ["REsp 9008888"],
    jurisSemLastro: ["REsp 9090909"],
    contextoLastro: `
Lei nº 8.213/91 — benefícios previdenciários.
REsp nº 9008888 — aposentadoria especial por exposição a ruído.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO JUIZADO ESPECIAL FEDERAL DA SEÇÃO JUDICIÁRIA DE SÃO PAULO",
      autor: "SEGURADO FICTO",
      reu: "INSTITUTO NACIONAL DO SEGURO SOCIAL — INSS",
      nomePeca: "AÇÃO PREVIDENCIÁRIA DE CONCESSÃO DE APOSENTADORIA ESPECIAL",
      fatos:
        "O autor laborou exposto a agente nocivo (ruído) e o INSS indeferiu a aposentadoria especial.",
      direito:
        "Aplica-se a Lei nº 8.213/91. Colaciona-se o REsp nº 9008888 e o REsp nº 9090909.",
      pedidos: [
        "Concessão da aposentadoria especial",
        "Pagamento das parcelas em atraso",
      ],
    }),
  },
  {
    id: "consumidor-propaganda",
    areaId: "consumidor",
    tema: "Publicidade enganosa / CDC",
    fatosChave: ["publicidade enganosa", "produto"],
    leisComLastro: ["art. 37"],
    jurisComLastro: ["1008001-33.2022.8.26.0100"],
    jurisSemLastro: ["1008002-44.2022.8.26.0100"],
    contextoLastro: `
CDC art. 37. Publicidade enganosa.
TJSP Processo nº 1008001-33.2022.8.26.0100 — propaganda enganosa e dano moral.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "CONSUMIDOR FICTO",
      reu: "FORNECEDOR FICTO LTDA.",
      nomePeca: "AÇÃO DE INDENIZAÇÃO POR PUBLICIDADE ENGANOSA",
      fatos:
        "Fornecedor veiculou publicidade enganosa sobre condições do produto, induzindo o consumidor a erro.",
      direito:
        "Incide o art. 37 do CDC. Cita-se o Processo nº 1008001-33.2022.8.26.0100 e o Processo nº 1008002-44.2022.8.26.0100.",
      pedidos: [
        "Indenização por danos morais e materiais",
        "Abstenção da publicidade enganosa",
      ],
    }),
  },
  {
    id: "digital-lgpd",
    areaId: "digital",
    tema: "LGPD — vazamento de dados pessoais",
    fatosChave: ["dados pessoais", "vazamento"],
    leisComLastro: ["Lei 13.709/18", "art. 42"],
    jurisComLastro: ["1009001-55.2023.8.26.0100"],
    jurisSemLastro: ["1009002-66.2023.8.26.0100"],
    contextoLastro: `
Lei nº 13.709/18 art. 42 — responsabilidade por dano em tratamento de dados.
TJSP Processo nº 1009001-55.2023.8.26.0100 — vazamento de dados e indenização LGPD.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "TITULAR DOS DADOS FICTO",
      reu: "CONTROLADOR FICTO S.A.",
      nomePeca: "AÇÃO DE INDENIZAÇÃO POR VAZAMENTO DE DADOS (LGPD)",
      fatos:
        "Controlador permitiu acesso indevido a dados pessoais sensíveis, com vazamento comprovado.",
      direito:
        "Aplica-se a Lei nº 13.709/18 e o art. 42. Cita-se o Processo nº 1009001-55.2023.8.26.0100 e o Processo nº 1009002-66.2023.8.26.0100.",
      pedidos: [
        "Indenização por danos morais",
        "Medidas de contenção e transparência",
      ],
    }),
  },
  {
    id: "ambiental-tac",
    areaId: "ambiental",
    tema: "Infração ambiental / TAC",
    fatosChave: ["degradação ambiental", "área de preservação"],
    leisComLastro: ["Lei 6.938/81"],
    jurisComLastro: ["REsp 1100111"],
    jurisSemLastro: ["REsp 1212121"],
    contextoLastro: `
Lei nº 6.938/81 — Política Nacional do Meio Ambiente.
REsp nº 1100111 — responsabilidade objetiva por dano ambiental.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA DA FAZENDA PÚBLICA DA COMARCA DE SÃO PAULO - SP",
      autor: "MINISTÉRIO PÚBLICO FICTO",
      reu: "EMPRESA POLUIDORA FICTA S.A.",
      nomePeca: "AÇÃO CIVIL PÚBLICA AMBIENTAL",
      fatos:
        "Empresa causou degradação ambiental em área de preservação, sem licença válida.",
      direito:
        "Fundamenta-se na Lei nº 6.938/81. Colaciona-se o REsp nº 1100111 e o REsp nº 1212121.",
      pedidos: [
        "Reparação ambiental",
        "Obrigação de fazer e multa diária",
      ],
    }),
  },
  {
    id: "pi-violacao-marca",
    areaId: "propriedade-intelectual",
    tema: "Violação de marca registrada",
    fatosChave: ["marca registrada", "contrafação"],
    leisComLastro: ["Lei 9.279/96"],
    jurisComLastro: ["REsp 1200222"],
    jurisSemLastro: ["REsp 1313131"],
    contextoLastro: `
Lei nº 9.279/96 — propriedade industrial.
REsp nº 1200222 — contrafação de marca e indenização.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA EMPRESARIAL DA COMARCA DE SÃO PAULO - SP",
      autor: "TITULAR DA MARCA FICTO",
      reu: "CONTRAFACTOR FICTO LTDA.",
      nomePeca: "AÇÃO DE ABSTENÇÃO DE USO DE MARCA C/C INDENIZAÇÃO",
      fatos:
        "Réu comercializou produtos com marca registrada idêntica, configurando contrafação.",
      direito:
        "Aplica-se a Lei nº 9.279/96. Cita-se o REsp nº 1200222 e o REsp nº 1313131.",
      pedidos: [
        "Cessação do uso da marca",
        "Indenização por contrafação",
      ],
    }),
  },
  {
    id: "internacional-homologacao",
    areaId: "internacional",
    tema: "Homologação de sentença estrangeira",
    fatosChave: ["sentença estrangeira", "homologação"],
    leisComLastro: ["art. 961"],
    jurisComLastro: ["REsp 1300333"],
    jurisSemLastro: ["REsp 1414141"],
    contextoLastro: `
CPC art. 961 — requisitos da homologação de sentença estrangeira.
REsp nº 1300333 — ordem pública e contraditório na homologação.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO SUPERIOR TRIBUNAL DE JUSTIÇA",
      autor: "REQUERENTE FICTO",
      reu: "REQUERIDO FICTO",
      nomePeca: "PEDIDO DE HOMOLOGAÇÃO DE SENTENÇA ESTRANGEIRA",
      fatos:
        "Autor busca homologar sentença proferida no exterior, com trânsito e contraditório observados.",
      direito:
        "Incide o art. 961 do CPC. Colaciona-se o REsp nº 1300333 e o REsp nº 1414141.",
      pedidos: [
        "Homologação da sentença estrangeira",
        "Exequatur para cumprimento no Brasil",
      ],
    }),
  },
  {
    id: "medico-erro-cirurgico",
    areaId: "medico",
    tema: "Erro médico / plano de saúde",
    fatosChave: ["procedimento cirúrgico", "sequelas"],
    leisComLastro: ["art. 14", "Súmula 387"],
    jurisComLastro: ["1010001-77.2023.8.26.0100"],
    jurisSemLastro: ["1010002-88.2023.8.26.0100"],
    contextoLastro: `
CDC art. 14. Súmula 387 do STJ — dano moral por morte de ascendente.
TJSP Processo nº 1010001-77.2023.8.26.0100 — erro médico e responsabilidade civil.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP",
      autor: "PACIENTE FICTO",
      reu: "HOSPITAL FICTO S.A.",
      nomePeca: "AÇÃO DE INDENIZAÇÃO POR ERRO MÉDICO",
      fatos:
        "Procedimento cirúrgico eletivo resultou em sequelas permanentes atribuíveis a falha na prestação do serviço.",
      direito:
        "Aplica-se o art. 14 do CDC e a Súmula 387 do STJ. Cita-se o Processo nº 1010001-77.2023.8.26.0100 e o Processo nº 1010002-88.2023.8.26.0100.",
      pedidos: [
        "Indenização por danos morais e materiais",
        "Pensão e tratamento futuro, se cabível",
      ],
    }),
  },
  {
    id: "agrario-arrendamento",
    areaId: "agrario",
    tema: "Contrato de arrendamento rural",
    fatosChave: ["arrendamento", "colheita"],
    leisComLastro: ["Lei 4.504/64"],
    jurisComLastro: ["REsp 1400444"],
    jurisSemLastro: ["REsp 1515151"],
    contextoLastro: `
Lei nº 4.504/64 — Estatuto da Terra.
REsp nº 1400444 — inadimplemento de contrato de arrendamento rural.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DA __ VARA CÍVEL DA COMARCA DE RIBEIRÃO PRETO - SP",
      autor: "ARRENDADOR FICTO",
      reu: "ARRENDATÁRIO FICTO",
      nomePeca: "AÇÃO DE RESOLUÇÃO DE ARRENDAMENTO RURAL",
      fatos:
        "Arrendatário deixou de pagar a parte devida da colheita, violando o contrato de arrendamento rural.",
      direito:
        "Fundamenta-se na Lei nº 4.504/64. Colaciona-se o REsp nº 1400444 e o REsp nº 1515151.",
      pedidos: [
        "Resolução do contrato",
        "Perdas e danos e imissão na posse",
      ],
    }),
  },
  {
    id: "eleitoral-propaganda",
    areaId: "eleitoral",
    tema: "Propaganda eleitoral antecipada",
    fatosChave: ["propaganda", "prazo legal"],
    leisComLastro: ["Lei 9.504/97"],
    jurisComLastro: ["REsp 1500555"],
    jurisSemLastro: ["REsp 1616161"],
    contextoLastro: `
Lei nº 9.504/97 — eleições.
REsp nº 1500555 — propaganda eleitoral irregular e multa.
    `.trim(),
    pecaIaBruta: pecaCompleta({
      foro: "DO TRIBUNAL REGIONAL ELEITORAL DE SÃO PAULO",
      autor: "REPRESENTANTE FICTO",
      reu: "REPRESENTADO FICTO",
      nomePeca: "REPRESENTAÇÃO POR PROPAGANDA ELEITORAL ANTECIPADA",
      fatos:
        "Candidato veiculou propaganda antes do prazo legal, com pedido explícito de voto.",
      direito:
        "Aplica-se a Lei nº 9.504/97. Cita-se o REsp nº 1500555 e o REsp nº 1616161.",
      pedidos: [
        "Aplicação de multa eleitoral",
        "Cessação da propaganda irregular",
      ],
    }),
  },
];

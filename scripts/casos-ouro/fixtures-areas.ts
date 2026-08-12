import type { CasoOuroArea } from "./types";

/**
 * Lastro por área de atuação (áreas fechadas + cobertura multiárea).
 * Snippets sintéticos — validam verificação de citações sem Gemini.
 */
export const CASOS_OURO_AREAS: CasoOuroArea[] = [
  {
    id: "jecr-transacao-penal",
    areaId: "jecr",
    tema: "JECRIM — transação penal / Lei 9.099",
    leisComLastro: ["art. 76"],
    jurisComLastro: ["HC 2001111"],
    jurisSemLastro: ["HC 9999999"],
    contextoLastro: `
Lei 9.099/95. Art. 76 — transação penal no Juizado Especial Criminal.
HC nº 2001111 — cabimento de transação penal em infrações de menor potencial ofensivo.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Noticiado crime de lesão corporal leve, passível de transação penal.

II - DO DIREITO
Aplica-se a Lei nº 9.099/95 e o art. 76. Cita-se o HC nº 2001111 e o HC nº 9999999.

III - DOS PEDIDOS
a) Homologação da transação penal.
    `.trim(),
  },
  {
    id: "trabalhista-horas-extras",
    areaId: "trabalhista",
    tema: "Horas extras / intervalo intrajornada",
    leisComLastro: ["art. 71", "Súmula 437"],
    jurisComLastro: ["REsp 3002222"],
    jurisSemLastro: ["REsp 8888888"],
    contextoLastro: `
CLT art. 71. Súmula 437 do TST — intervalo intrajornada suprimido.
REsp nº 3002222 — horas extras habituais e reflexos.
    `.trim(),
    textoPeca: `
I - DOS FATOS
O reclamante laborava sem intervalo intrajornada regular.

II - DO DIREITO
Incidem o art. 71 da CLT e a Súmula 437 do TST. Colaciona-se o REsp nº 3002222 e o REsp nº 8888888.

III - DOS PEDIDOS
a) Pagamento de horas extras e reflexos.
    `.trim(),
  },
  {
    id: "criminal-habeas-corpus",
    areaId: "criminal",
    tema: "Habeas corpus — prisão preventiva",
    leisComLastro: ["art. 312"],
    jurisComLastro: ["HC 4003333"],
    jurisSemLastro: ["HC 7777777"],
    contextoLastro: `
CPP art. 312 — requisitos da prisão preventiva.
HC nº 4003333 — ausência de fundamentação concreta da custódia cautelar.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Paciente preso preventivamente sem demonstração de periculum libertatis.

II - DO DIREITO
Exige-se fundamento no art. 312 do CPP. Cita-se o HC nº 4003333 e o HC nº 7777777.

III - DOS PEDIDOS
a) Concessão da ordem de habeas corpus.
    `.trim(),
  },
  {
    id: "empresarial-dissolucao",
    areaId: "empresarial",
    tema: "Dissolução parcial de sociedade",
    leisComLastro: ["art. 1.029"],
    jurisComLastro: ["REsp 5004444"],
    jurisSemLastro: ["REsp 6666666"],
    contextoLastro: `
Código Civil art. 1.029 — dissolução parcial de sociedade.
REsp nº 5004444 — apuração de haveres e exclusão de sócio.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Quebra da affectio societatis entre os sócios.

II - DO DIREITO
Aplica-se o art. 1.029 do Código Civil. Colaciona-se o REsp nº 5004444 e o REsp nº 6666666.

III - DOS PEDIDOS
a) Dissolução parcial e apuração de haveres.
    `.trim(),
  },
  {
    id: "civil-cobranca",
    areaId: "civil",
    tema: "Ação de cobrança / inadimplemento",
    leisComLastro: ["art. 389"],
    jurisComLastro: ["1006001-01.2020.8.26.0100"],
    jurisSemLastro: ["1006002-02.2020.8.26.0100"],
    contextoLastro: `
Código Civil art. 389 — inadimplemento e mora.
TJSP Processo nº 1006001-01.2020.8.26.0100 — cobrança de débito líquido e certo.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Inadimplemento contratual com saldo devedor confessado.

II - DO DIREITO
Incide o art. 389 do Código Civil. Cita-se o Processo nº 1006001-01.2020.8.26.0100 e o Processo nº 1006002-02.2020.8.26.0100.

III - DOS PEDIDOS
a) Condenação ao pagamento do débito.
    `.trim(),
  },
  {
    id: "familia-pensao",
    areaId: "familia",
    tema: "Pensão alimentícia / binômio necessidade-possibilidade",
    leisComLastro: ["art. 1.694"],
    jurisComLastro: ["REsp 6005555"],
    jurisSemLastro: ["REsp 5555555"],
    contextoLastro: `
Código Civil art. 1.694 — alimentos entre parentes.
REsp nº 6005555 — binômio necessidade-possibilidade na fixação de pensão.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Filho menor necessita de alimentos e o genitor possui capacidade contributiva.

II - DO DIREITO
Fundamenta-se no art. 1.694 do Código Civil. Colaciona-se o REsp nº 6005555 e o REsp nº 5555555.

III - DOS PEDIDOS
a) Fixação de pensão alimentícia.
    `.trim(),
  },
  {
    id: "imobiliario-despejo",
    areaId: "imobiliario",
    tema: "Despejo por falta de pagamento",
    leisComLastro: ["Lei 8.245/91", "art. 9"],
    jurisComLastro: ["1007001-11.2021.8.26.0100"],
    jurisSemLastro: ["1007002-22.2021.8.26.0100"],
    contextoLastro: `
Lei nº 8.245/91 art. 9 — despejo por falta de pagamento.
TJSP Processo nº 1007001-11.2021.8.26.0100 — locação inadimplida e rescisão.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Locatário inadimpliu aluguéis por mais de três meses.

II - DO DIREITO
Aplica-se a Lei nº 8.245/91 e o art. 9. Cita-se o Processo nº 1007001-11.2021.8.26.0100 e o Processo nº 1007002-22.2021.8.26.0100.

III - DOS PEDIDOS
a) Despejo e condenação ao pagamento dos aluguéis.
    `.trim(),
  },
  {
    id: "contratual-resolucao",
    areaId: "contratual",
    tema: "Resolução contratual por inadimplemento",
    leisComLastro: ["art. 475"],
    jurisComLastro: ["REsp 7006666"],
    jurisSemLastro: ["REsp 4444444"],
    contextoLastro: `
Código Civil art. 475 — resolução por inadimplemento.
REsp nº 7006666 — cláusula resolutiva expressa e resolução de contrato bilateral.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Inadimplemento absoluto de obrigação essencial do contrato.

II - DO DIREITO
Incide o art. 475 do Código Civil. Colaciona-se o REsp nº 7006666 e o REsp nº 4444444.

III - DOS PEDIDOS
a) Resolução contratual e perdas e danos.
    `.trim(),
  },
  {
    id: "tributario-ms",
    areaId: "tributario",
    tema: "Mandado de segurança — exigência fiscal",
    leisComLastro: ["Lei 12.016/09"],
    jurisComLastro: ["REsp 8007777"],
    jurisSemLastro: ["REsp 3333333"],
    contextoLastro: `
Lei nº 12.016/09 — mandado de segurança.
REsp nº 8007777 — ilegalidade de exação tributária sem lei específica.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Fisco exige tributo sem previsão legal específica.

II - DO DIREITO
Aplica-se a Lei nº 12.016/09. Cita-se o REsp nº 8007777 e o REsp nº 3333333.

III - DOS PEDIDOS
a) Concessão da segurança.
    `.trim(),
  },
  {
    id: "administrativo-licitacao",
    areaId: "administrativo",
    tema: "Licitação / vício de legalidade",
    leisComLastro: ["Lei 14.133/21"],
    jurisComLastro: ["REsp 9008888"],
    jurisSemLastro: ["REsp 2222222"],
    contextoLastro: `
Lei nº 14.133/21 — licitações e contratos administrativos.
REsp nº 9008888 — nulidade de certame por vício insanável.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Edital de licitação impôs requisito discriminatório.

II - DO DIREITO
Fundamenta-se na Lei nº 14.133/21. Colaciona-se o REsp nº 9008888 e o REsp nº 2222222.

III - DOS PEDIDOS
a) Anulação do certame.
    `.trim(),
  },
  {
    id: "previdenciario-aposentadoria",
    areaId: "previdenciario",
    tema: "Aposentadoria por tempo de contribuição",
    leisComLastro: ["Lei 8.213/91"],
    jurisComLastro: ["REsp 1000999"],
    jurisSemLastro: ["REsp 1111111"],
    contextoLastro: `
Lei nº 8.213/91 — benefícios previdenciários.
REsp nº 1000999 — reconhecimento de tempo especial e conversão.
    `.trim(),
    textoPeca: `
I - DOS FATOS
INSS indeferiu aposentadoria apesar do tempo mínimo comprovado.

II - DO DIREITO
Aplica-se a Lei nº 8.213/91. Cita-se o REsp nº 1000999 e o REsp nº 1111111.

III - DOS PEDIDOS
a) Concessão do benefício previdenciário.
    `.trim(),
  },
  {
    id: "consumidor-propaganda",
    areaId: "consumidor",
    tema: "Publicidade enganosa / CDC",
    leisComLastro: ["art. 37", "Súmula 479"],
    jurisComLastro: ["1008001-33.2022.8.26.0100"],
    jurisSemLastro: ["1008002-44.2022.8.26.0100"],
    contextoLastro: `
CDC art. 37. Súmula 479 do STJ — responsabilidade objetiva bancária (analogia consumidor).
TJSP Processo nº 1008001-33.2022.8.26.0100 — propaganda enganosa e dano moral.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Fornecedor veiculou publicidade enganosa sobre condições do produto.

II - DO DIREITO
Incidem o art. 37 do CDC e a Súmula 479 do STJ. Cita-se o Processo nº 1008001-33.2022.8.26.0100 e o Processo nº 1008002-44.2022.8.26.0100.

III - DOS PEDIDOS
a) Indenização por danos morais e materiais.
    `.trim(),
  },
  {
    id: "digital-lgpd",
    areaId: "digital",
    tema: "LGPD — vazamento de dados pessoais",
    leisComLastro: ["Lei 13.709/18", "art. 42"],
    jurisComLastro: ["1009001-55.2023.8.26.0100"],
    jurisSemLastro: ["1009002-66.2023.8.26.0100"],
    contextoLastro: `
Lei nº 13.709/18 art. 42 — responsabilidade por dano em tratamento de dados.
TJSP Processo nº 1009001-55.2023.8.26.0100 — vazamento de dados e indenização LGPD.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Controlador permitiu acesso indevido a dados pessoais sensíveis.

II - DO DIREITO
Aplica-se a Lei nº 13.709/18 e o art. 42. Cita-se o Processo nº 1009001-55.2023.8.26.0100 e o Processo nº 1009002-66.2023.8.26.0100.

III - DOS PEDIDOS
a) Indenização por danos morais.
    `.trim(),
  },
  {
    id: "ambiental-tac",
    areaId: "ambiental",
    tema: "Infração ambiental / TAC",
    leisComLastro: ["Lei 6.938/81"],
    jurisComLastro: ["REsp 1100111"],
    jurisSemLastro: ["REsp 1212121"],
    contextoLastro: `
Lei nº 6.938/81 — Política Nacional do Meio Ambiente.
REsp nº 1100111 — responsabilidade objetiva por dano ambiental.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Empresa causou degradação ambiental em área de preservação.

II - DO DIREITO
Fundamenta-se na Lei nº 6.938/81. Colaciona-se o REsp nº 1100111 e o REsp nº 1212121.

III - DOS PEDIDOS
a) Reparação ambiental e multa.
    `.trim(),
  },
  {
    id: "pi-violacao-marca",
    areaId: "propriedade-intelectual",
    tema: "Violação de marca registrada",
    leisComLastro: ["Lei 9.279/96"],
    jurisComLastro: ["REsp 1200222"],
    jurisSemLastro: ["REsp 1313131"],
    contextoLastro: `
Lei nº 9.279/96 — propriedade industrial.
REsp nº 1200222 — contrafação de marca e indenização.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Réu comercializou produtos com marca idêntica à registrada.

II - DO DIREITO
Aplica-se a Lei nº 9.279/96. Cita-se o REsp nº 1200222 e o REsp nº 1313131.

III - DOS PEDIDOS
a) Cessação do uso e indenização.
    `.trim(),
  },
  {
    id: "internacional-homologacao",
    areaId: "internacional",
    tema: "Homologação de sentença estrangeira",
    leisComLastro: ["art. 961"],
    jurisComLastro: ["REsp 1300333"],
    jurisSemLastro: ["REsp 1414141"],
    contextoLastro: `
CPC art. 961 — requisitos da homologação de sentença estrangeira.
REsp nº 1300333 — ordem pública e contraditório na homologação.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Autor busca homologar sentença proferida no exterior.

II - DO DIREITO
Incide o art. 961 do CPC. Colaciona-se o REsp nº 1300333 e o REsp nº 1414141.

III - DOS PEDIDOS
a) Homologação da sentença estrangeira.
    `.trim(),
  },
  {
    id: "medico-erro-cirurgico",
    areaId: "medico",
    tema: "Erro médico / plano de saúde",
    leisComLastro: ["art. 14", "Súmula 387"],
    jurisComLastro: ["1010001-77.2023.8.26.0100"],
    jurisSemLastro: ["1010002-88.2023.8.26.0100"],
    contextoLastro: `
CDC art. 14. Súmula 387 do STJ — dano moral por morte de ascendente.
TJSP Processo nº 1010001-77.2023.8.26.0100 — erro médico e responsabilidade civil.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Procedimento cirúrgico eletivo resultou em sequelas permanentes.

II - DO DIREITO
Aplica-se o art. 14 do CDC e a Súmula 387 do STJ. Cita-se o Processo nº 1010001-77.2023.8.26.0100 e o Processo nº 1010002-88.2023.8.26.0100.

III - DOS PEDIDOS
a) Indenização por danos morais e materiais.
    `.trim(),
  },
  {
    id: "agrario-arrendamento",
    areaId: "agrario",
    tema: "Contrato de arrendamento rural",
    leisComLastro: ["Lei 4.504/64"],
    jurisComLastro: ["REsp 1400444"],
    jurisSemLastro: ["REsp 1515151"],
    contextoLastro: `
Lei nº 4.504/64 — Estatuto da Terra.
REsp nº 1400444 — inadimplemento de contrato de arrendamento rural.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Arrendatário deixou de pagar a parte devida da colheita.

II - DO DIREITO
Fundamenta-se na Lei nº 4.504/64. Colaciona-se o REsp nº 1400444 e o REsp nº 1515151.

III - DOS PEDIDOS
a) Resolução do contrato e perdas e danos.
    `.trim(),
  },
  {
    id: "eleitoral-propaganda",
    areaId: "eleitoral",
    tema: "Propaganda eleitoral antecipada",
    leisComLastro: ["Lei 9.504/97"],
    jurisComLastro: ["REsp 1500555"],
    jurisSemLastro: ["REsp 1616161"],
    contextoLastro: `
Lei nº 9.504/97 — Código Eleitoral.
REsp nº 1500555 — propaganda eleitoral irregular e multa.
    `.trim(),
    textoPeca: `
I - DOS FATOS
Candidato veiculou propaganda antes do prazo legal.

II - DO DIREITO
Aplica-se a Lei nº 9.504/97. Cita-se o REsp nº 1500555 e o REsp nº 1616161.

III - DOS PEDIDOS
a) Aplicação de multa eleitoral.
    `.trim(),
  },
];

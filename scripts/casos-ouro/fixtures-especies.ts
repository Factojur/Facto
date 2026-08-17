import type { CasoOuroEspecie } from "./types";

/** Espécies JEC (exceto petição inicial, coberta pelos 9 temas). */
export const CASOS_OURO_ESPECIES: CasoOuroEspecie[] = [
  {
    id: "contestacao-negativa-geral",
    especie: "contestacao",
    tema: "Contestação — negativa geral e mérito",
    secoesObrigatorias: [
      "DAS PRELIMINARES",
      "DO MÉRITO",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1002001-11.2023.8.26.0100"],
    jurisSemLastro: ["1002002-22.2023.8.26.0100"],
    contextoLastro: `
Lei 9.099/95. CDC art. 14.
TJSP Processo nº 1002001-11.2023.8.26.0100 — contestação em ação de indenização JEC.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

BANCO RÉU FICTO, por advogado, vem apresentar

CONTESTAÇÃO

em face de AUTOR FICTO.

I - DAS PRELIMINARES
a) Da ilegitimidade passiva — inexistência de relação jurídica direta.

II - DO MÉRITO — DOS FATOS E DO DIREITO
O autor não comprovou falha na prestação do serviço. Cita-se o Processo nº 1002001-11.2023.8.26.0100 e o Processo nº 1002002-22.2023.8.26.0100.

III - DOS PEDIDOS
a) Improcedência total dos pedidos;
b) Condenação em honorários, se cabível.

Nestes termos,
pede deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "embargos-monitoria",
    especie: "embargos",
    tema: "Embargos à monitória — tempestividade",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE",
      "DOS FATOS",
      "DO DIREITO",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1003001-33.2022.8.26.0100"],
    jurisSemLastro: ["REsp 3030303"],
    contextoLastro: `
CPC art. 702. Lei 9.099/95.
TJSP Processo nº 1003001-33.2022.8.26.0100 — embargos à monitória no JEC.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

DEVEDOR FICTO apresenta

EMBARGOS À MONITÓRIA

em face de CREDOR FICTO.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Os embargos são tempestivos e cabíveis nos termos do art. 702 do CPC.

II - DOS FATOS
O título executivo carece de liquidez e certeza.

III - DO DIREITO
Colaciona-se o Processo nº 1003001-33.2022.8.26.0100 e o REsp nº 3030303.

IV - DOS PEDIDOS
a) Acolhimento dos embargos;
b) Extinção da monitória.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 505050
    `.trim(),
  },
  {
    id: "recurso-inominado",
    especie: "recurso-inominado",
    tema: "Recurso inominado — reforma da sentença",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE",
      "DO HISTÓRICO PROCESSUAL",
      "DAS RAZÕES DE REFORMA",
      "DOS PEDIDOS RECURSAIS",
    ],
    jurisComLastro: ["1004001-44.2021.8.26.0100"],
    jurisSemLastro: ["1004002-55.2021.8.26.0100"],
    contextoLastro: `
Lei 9.099/95 art. 41 — recurso inominado.
TJSP Processo nº 1004001-44.2021.8.26.0100 — reforma de sentença de improcedência.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

RECORRENTE FICTO interpõe

RECURSO INOMINADO

contra sentença de improcedência.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Recurso interposto dentro do prazo legal.

II - DO HISTÓRICO PROCESSUAL
A sentença julgou improcedente pedido de indenização por negativação indevida.

III - DAS RAZÕES DE REFORMA
A prova documental comprova a inexigibilidade do débito. Cita-se o Processo nº 1004001-44.2021.8.26.0100 e o Processo nº 1004002-55.2021.8.26.0100.

IV - DOS PEDIDOS RECURSAIS
a) Reforma da sentença;
b) Procedência dos pedidos iniciais.

Nestes termos,
pede deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 606060
    `.trim(),
  },
  {
    id: "replica-contestacao",
    especie: "replica",
    tema: "Réplica — impugnação específica",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE",
      "DA IMPUGNAÇÃO ESPECÍFICA",
      "DO REFORÇO",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1005001-66.2022.8.26.0100"],
    jurisSemLastro: ["AgInt no AREsp 5050505"],
    contextoLastro: `
CDC. Lei 9.099/95.
TJSP Processo nº 1005001-66.2022.8.26.0100 — réplica à contestação em ação consumerista.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

AUTOR FICTO apresenta

RÉPLICA

à contestação do réu.

I - DA TEMPESTIVIDADE
Manifestação tempestiva nos autos.

II - DA IMPUGNAÇÃO ESPECÍFICA
Impugnam-se os fatos alegados genericamente pelo réu quanto à inexistência de falha.

III - DO REFORÇO DA INICIAL E DO DIREITO
Reforça-se a tese inicial com prova documental. Colaciona-se o Processo nº 1005001-66.2022.8.26.0100 e o AgInt no AREsp 5050505.

IV - DOS PEDIDOS
a) Rejeição das preliminares;
b) Procedência dos pedidos.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 707070
    `.trim(),
  },
  {
    id: "execucao-titulo-jec",
    especie: "execucao",
    tema: "Execução de título judicial JEC",
    secoesObrigatorias: [
      "DO TÍTULO EXECUTIVO",
      "DO DÉBITO",
      "DAS MEDIDAS EXECUTIVAS",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1006001-77.2020.8.26.0100"],
    jurisSemLastro: ["1006002-88.2020.8.26.0100"],
    contextoLastro: `
Lei 9.099/95. CPC art. 771 — título executivo judicial.
TJSP Processo nº 1006001-77.2020.8.26.0100 — execução de sentença condenatória JEC.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

EXequente FICTO promove

EXECUÇÃO DE TÍTULO JUDICIAL

em face de EXECUTADO FICTO.

I - DO TÍTULO EXECUTIVO
Executa-se sentença transitada em julgado que condenou o réu ao pagamento de R$ 5.000,00.

II - DO DÉBITO E DO CÁLCULO
Saldo atualizado: R$ 5.450,00, com correção e juros legais.

III - DAS MEDIDAS EXECUTIVAS
Requer-se penhora online via SISBAJUD e consulta a bens.

IV - DOS PEDIDOS
a) Citação para pagamento;
b) Penhora e expropriação, se necessário.

Cita-se o Processo nº 1006001-77.2020.8.26.0100 e o Processo nº 1006002-88.2020.8.26.0100.

Nestes termos,
pede deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 808080
    `.trim(),
  },
  {
    id: "agravo-instrumento-tutela",
    especie: "agravo-instrumento",
    tema: "Agravo de instrumento — tutela de urgência indeferida",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE",
      "DO HISTÓRICO",
      "DAS RAZÕES",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1007001-11.2024.8.26.0100"],
    jurisSemLastro: ["1007002-22.2024.8.26.0100"],
    contextoLastro: `
Lei 9.099/95. CPC art. 1.015 — agravo de instrumento contra decisão interlocutória.
TJSP Processo nº 1007001-11.2024.8.26.0100 — tutela de urgência indeferida no JEC.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

AGRAVANTE FICTO interpõe

AGRAVO DE INSTRUMENTO

contra decisão que indeferiu tutela de urgência.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Agravo interposto dentro do prazo legal contra decisão interlocutória.

II - DO HISTÓRICO PROCESSUAL E DA DECISÃO AGRAVADA
A decisão agravada indeferiu liminar de obrigação de fazer.

III - DAS RAZÕES DO AGRAVO
Presentes fumus boni iuris e periculum in mora. Cita-se o Processo nº 1007001-11.2024.8.26.0100 e o Processo nº 1007002-22.2024.8.26.0100.

IV - DOS PEDIDOS
a) Conhecimento e provimento do agravo;
b) Reforma da decisão agravada.

Nestes termos,
pede deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 909090
    `.trim(),
  },
  {
    id: "contrarrazoes-inominado",
    especie: "contrarrazoes-inominado",
    tema: "Contrarrazões ao recurso inominado",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE",
      "DO RECURSO",
      "DAS CONTRARRAZÕES",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1007101-33.2023.8.26.0100"],
    jurisSemLastro: ["1007102-44.2023.8.26.0100"],
    contextoLastro: `
Lei 9.099/95 art. 41 — contrarrazões ao recurso inominado.
TJSP Processo nº 1007101-33.2023.8.26.0100 — manutenção de sentença de improcedência.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

RECORRIDO FICTO apresenta

CONTRARRAZÕES AO RECURSO INOMINADO

interposto pelo recorrente.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Contrarrazões tempestivas nos autos.

II - DO RECURSO INTERPOSTO E DO HISTÓRICO
O recorrente busca reforma de sentença de improcedência.

III - DAS CONTRARRAZÕES
A sentença está correta e o recurso é infundado. Cita-se o Processo nº 1007101-33.2023.8.26.0100 e o Processo nº 1007102-44.2023.8.26.0100.

IV - DOS PEDIDOS
a) Conhecimento das contrarrazões;
b) Desprovimento do recurso inominado.

Nestes termos,
pede deferimento.

São Paulo/SP, 12 de agosto de 2026.
OAB/SP 919191
    `.trim(),
  },
];

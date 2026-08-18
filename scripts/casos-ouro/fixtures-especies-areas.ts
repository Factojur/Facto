import type { CasoOuroEspecie } from "./types";

/**
 * Espécies além da inicial, nas áreas de volume (rito próprio).
 * JEC continua em fixtures-especies.ts.
 */
export const CASOS_OURO_ESPECIES_AREAS: CasoOuroEspecie[] = [
  {
    id: "civil-contestacao",
    especie: "contestacao",
    tema: "Civil — contestação (rito comum)",
    secoesObrigatorias: ["DAS PRELIMINARES", "DO MÉRITO", "DOS PEDIDOS"],
    jurisComLastro: ["1008101-11.2024.8.26.0100"],
    jurisSemLastro: ["1008102-22.2024.8.26.0100"],
    contextoLastro: `
CPC art. 335. Código Civil art. 186.
TJSP Processo nº 1008101-11.2024.8.26.0100 — contestação em indenização na justiça comum.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP

RÉU FICTO apresenta

CONTESTAÇÃO

em face de AUTOR FICTO.

I - DAS PRELIMINARES
a) Da inépcia — pedidos genéricos.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Ausência de nexo causal. Cita-se o Processo nº 1008101-11.2024.8.26.0100 e o Processo nº 1008102-22.2024.8.26.0100.

III - DOS PEDIDOS
a) Improcedência;
b) Honorários, se cabível.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "civil-reconvencao",
    especie: "reconvencao",
    tema: "Civil — contestação com reconvenção (art. 343)",
    secoesObrigatorias: [
      "DAS PRELIMINARES",
      "DO MÉRITO",
      "DA RECONVENÇÃO",
      "DOS PEDIDOS",
    ],
    jurisComLastro: ["1008105-55.2024.8.26.0100"],
    jurisSemLastro: ["1008106-66.2024.8.26.0100"],
    contextoLastro: `
CPC art. 343. Código Civil art. 186.
TJSP Processo nº 1008105-55.2024.8.26.0100 — reconvenção na justiça comum.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP

RÉU FICTO apresenta

CONTESTAÇÃO COM RECONVENÇÃO

em face de AUTOR FICTO.

I - DAS PRELIMINARES
a) Da inépcia — pedidos genéricos.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Ausência de nexo causal. Cita-se o Processo nº 1008105-55.2024.8.26.0100.

III - DA RECONVENÇÃO — DOS FATOS E DO DIREITO
O reconvinte formula pedido próprio contra o reconvindo, na forma do art. 343 do CPC. Cita-se o Processo nº 1008106-66.2024.8.26.0100.

IV - DOS PEDIDOS
a) Improcedência da inicial;
b) Procedência da reconvenção;
c) Honorários, se cabível.

Nestes termos,
pede deferimento.

São Paulo/SP, 18 de agosto de 2026.
OAB/SP 414141
    `.trim(),
  },
  {
    id: "civil-apelacao",
    especie: "apelacao",
    tema: "Civil — apelação",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE E DO CABIMENTO",
      "DAS RAZÕES DE REFORMA",
      "DOS PEDIDOS RECURSAIS",
    ],
    jurisComLastro: ["1008103-33.2023.8.26.0100"],
    jurisSemLastro: ["REsp 8181818"],
    contextoLastro: `
CPC art. 1.009.
TJSP Processo nº 1008103-33.2023.8.26.0100 — apelação cível.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP

APELANTE FICTO interpõe

APELAÇÃO

em face da sentença.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Recurso tempestivo, art. 1.009 do CPC.

II - DO HISTÓRICO PROCESSUAL
Sentença de improcedência.

III - DAS RAZÕES DE REFORMA
Error in judicando. Cita-se o Processo nº 1008103-33.2023.8.26.0100 e o REsp nº 8181818.

IV - DOS PEDIDOS RECURSAIS
a) Reforma da sentença;
b) Procedência dos pedidos iniciais.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "consumidor-contestacao",
    especie: "contestacao",
    tema: "Consumidor — contestação na justiça comum",
    secoesObrigatorias: ["DAS PRELIMINARES", "DO MÉRITO", "DOS PEDIDOS"],
    jurisComLastro: ["1008201-44.2024.8.26.0100"],
    jurisSemLastro: ["1008202-55.2024.8.26.0100"],
    contextoLastro: `
CDC art. 14. CPC art. 335.
TJSP Processo nº 1008201-44.2024.8.26.0100 — defesa de fornecedor na Vara Cível.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP

FORNECEDOR FICTO LTDA. apresenta

CONTESTAÇÃO

em face de CONSUMIDOR FICTO.

I - DAS PRELIMINARES
a) Da ausência de relação de consumo.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Serviço prestado conforme o contrato. Cita-se o Processo nº 1008201-44.2024.8.26.0100 e o Processo nº 1008202-55.2024.8.26.0100.

III - DOS PEDIDOS
a) Improcedência.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "trabalhista-defesa",
    especie: "defesa",
    tema: "Trabalhista — defesa (contestação CLT)",
    secoesObrigatorias: ["DAS PRELIMINARES", "DO MÉRITO", "DOS PEDIDOS"],
    jurisComLastro: ["1008511-11.2024.8.26.0100"],
    jurisSemLastro: ["1008512-22.2024.8.26.0100"],
    contextoLastro: `
CLT art. 847. Súmula 338 do TST.
TJSP Processo nº 1008511-11.2024.8.26.0100 — ônus da prova da jornada.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO DA __ VARA DO TRABALHO DE SÃO PAULO

RECLAMADA FICTA LTDA. apresenta

DEFESA

em face de RECLAMANTE FICTO.

I - DAS PRELIMINARES
a) Da inépcia da inicial.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Jornada comprovada por cartões de ponto. Cita-se o Processo nº 1008511-11.2024.8.26.0100 e o Processo nº 1008512-22.2024.8.26.0100.

III - DOS PEDIDOS
a) Improcedência dos pedidos.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "trabalhista-ro",
    especie: "recurso-ordinario",
    tema: "Trabalhista — recurso ordinário",
    secoesObrigatorias: [
      "DA TEMPESTIVIDADE E DO CABIMENTO",
      "DAS RAZÕES DE REFORMA",
      "DOS PEDIDOS RECURSAIS",
    ],
    jurisComLastro: ["1008611-11.2023.8.26.0100"],
    jurisSemLastro: ["1008612-22.2023.8.26.0100"],
    contextoLastro: `
CLT art. 895.
Processo nº 1008611-11.2023.8.26.0100 — recurso ordinário e horas extras.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO DA __ VARA DO TRABALHO DE SÃO PAULO

RECLAMANTE FICTO interpõe

RECURSO ORDINÁRIO

em face da sentença.

I - DA TEMPESTIVIDADE E DO CABIMENTO
Prazo de oito dias, art. 895 da CLT.

II - DO HISTÓRICO PROCESSUAL
Sentença de improcedência parcial.

III - DAS RAZÕES DE REFORMA
Intervalo intrajornada. Cita-se o Processo nº 1008611-11.2023.8.26.0100 e o Processo nº 1008612-22.2023.8.26.0100.

IV - DOS PEDIDOS RECURSAIS
a) Reforma para condenar em horas extras e reflexos.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "familia-contestacao",
    especie: "contestacao",
    tema: "Família — contestação em alimentos",
    secoesObrigatorias: ["DAS PRELIMINARES", "DO MÉRITO", "DOS PEDIDOS"],
    jurisComLastro: ["1008301-66.2024.8.26.0100"],
    jurisSemLastro: ["1008302-77.2024.8.26.0100"],
    contextoLastro: `
Código Civil art. 1.694. CPC art. 335.
TJSP Processo nº 1008301-66.2024.8.26.0100 — binômio necessidade-possibilidade.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA DE FAMÍLIA DA COMARCA DE SÃO PAULO - SP

ALIMENTANTE FICTO apresenta

CONTESTAÇÃO

em face de ALIMENTANDA FICTA.

I - DAS PRELIMINARES
a) Da ausência de prova da necessidade.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Binômio necessidade-possibilidade. Cita-se o Processo nº 1008301-66.2024.8.26.0100 e o Processo nº 1008302-77.2024.8.26.0100.

III - DOS PEDIDOS
a) Fixação em patamar compatível com a possibilidade do alimentante.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
  {
    id: "imobiliario-contestacao",
    especie: "contestacao",
    tema: "Imobiliário — contestação em despejo",
    secoesObrigatorias: ["DAS PRELIMINARES", "DO MÉRITO", "DOS PEDIDOS"],
    jurisComLastro: ["1008401-88.2024.8.26.0100"],
    jurisSemLastro: ["1008402-99.2024.8.26.0100"],
    contextoLastro: `
Lei 8.245/91. CPC art. 335.
TJSP Processo nº 1008401-88.2024.8.26.0100 — purgação da mora em despejo.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA __ VARA CÍVEL DA COMARCA DE SÃO PAULO - SP

LOCATÁRIO FICTO apresenta

CONTESTAÇÃO

em face de LOCADOR FICTO.

I - DAS PRELIMINARES
a) Da purgação da mora tempestiva.

II - DO MÉRITO — DOS FATOS E DO DIREITO
Aluguéis pagos. Cita-se o Processo nº 1008401-88.2024.8.26.0100 e o Processo nº 1008402-99.2024.8.26.0100.

III - DOS PEDIDOS
a) Improcedência do despejo.

Nestes termos,
pede deferimento.

São Paulo/SP, 16 de agosto de 2026.
OAB/SP 404040
    `.trim(),
  },
];

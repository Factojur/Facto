/**
 * Casos-ouro JEC — fixtures fictícias para regressão (sem Gemini).
 * Cada caso: tema típico + peça sintética + contexto de lastro esperado.
 */

export type CasoOuroJec = {
  id: string;
  tema: string;
  /** Trecho de fatos (para híbrido / asserts de preservação). */
  fatosChave: string[];
  /** Contexto que teria sido injetado no prompt (base + juris). */
  contextoLastro: string;
  /** Peça “como a IA poderia devolver” (antes do pós-processamento). */
  pecaIaBruta: string;
  /** Números CNJ / REsp que DEVEM ser lastreados (estão no contexto). */
  jurisComLastro: string[];
  /** Números inventados — devem receber [NÃO ENCONTRADO NA BASE]. */
  jurisSemLastro: string[];
  tipoAcao: string;
  valorCausaBloco: string;
  tutelaUrgencia?: boolean;
};

export const CASOS_OURO_JEC: CasoOuroJec[] = [
  {
    id: "golpe-pix-banco",
    tema: "Golpe PIX / falsa central bancária",
    fatosChave: ["falsa central", "PIX", "banco"],
    tipoAcao: "Ação de Indenização por Danos Materiais e Morais",
    valorCausaBloco: "Dá-se à causa o valor de R$ 12.450,00 (doze mil quatrocentos e cinquenta reais).",
    tutelaUrgencia: true,
    jurisComLastro: ["1001234-56.2023.8.26.0100"],
    jurisSemLastro: ["1099999-99.2020.8.26.0001"],
    contextoLastro: `
Súmula 479 do STJ. Art. 14 do CDC. Responsabilidade objetiva da instituição financeira.
Julgado TJSP Processo nº 1001234-56.2023.8.26.0100 — golpe mediante engenharia social e falha na segurança das operações PIX.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE SÃO PAULO - SP

AÇÃO DE INDENIZAÇÃO POR DANOS MATERIAIS E MORAIS

ANA TESTE, brasileira, solteira, analista, CPF 111.111.111-11, vem propor a presente

PETIÇÃO INICIAL — AÇÃO DE INDENIZAÇÃO (JEC)

em face de BANCO FICTO S.A., pelos fatos e fundamentos a seguir.

I - DOS FATOS
A autora foi vítima de golpe mediante falsa central telefônica. Transferiu valores via PIX após orientação de fraudadores. O banco não bloqueou a tempo as operações atípicas.

II - DO DIREITO a) Da relação de consumo
Aplica-se o CDC e a Súmula 479 do STJ. Cita-se o Processo nº 1001234-56.2023.8.26.0100. Também o Processo nº 1099999-99.2020.8.26.0001.

III - DOS PEDIDOS
Ante o exposto, requer:
a) A citação do réu;
b) A condenação ao pagamento de indenização;
c) A procedência dos pedidos.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 10 de agosto de 2026.
Advogada Teste
OAB/SP 123456
    `.trim(),
  },
  {
    id: "negativacao-indevida",
    tema: "Negativação indevida / inexigibilidade",
    fatosChave: ["negativação", "SPC", "inexigível"],
    tipoAcao: "Ação Declaratória de Inexistência de Débito c/c Danos Morais",
    valorCausaBloco: "Dá-se à causa o valor de R$ 15.000,00 (quinze mil reais).",
    jurisComLastro: ["1005555-11.2022.8.26.0002"],
    jurisSemLastro: ["REsp 9999999"],
    contextoLastro: `
Súmula 385 do STJ. Negativação indevida. Dano moral in re ipsa quando inscrição abusiva.
TJSP Processo 1005555-11.2022.8.26.0002 — declaração de inexigibilidade e exclusão do SPC/Serasa.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE CAMPINAS - SP

JOÃO CONSUMIDOR, brasileiro, CPF 222.222.222-22, vem propor

PETIÇÃO INICIAL

em face de FINANCEIRA EXEMPLO LTDA.

I - DOS FATOS
O autor teve o nome inserido nos cadastros de proteção ao crédito (SPC/Serasa) por dívida inexigível, sem contratação válida.

II - DO DIREITO a) Da negativação indevida
O dano moral in re ipsa prescinde de prova do abalo. Colaciona-se o Processo nº 1005555-11.2022.8.26.0002 e o REsp nº 9999999.

III - DOS PEDIDOS
a) A declaração de inexigibilidade do débito;
b) A exclusão da negativação;
c) Indenização por danos morais.

Nestes termos,
pede deferimento.

Campinas/SP, 10 de agosto de 2026.
Advogado Exemplo
OAB/SP 654321
    `.trim(),
  },
  {
    id: "atraso-voo",
    tema: "Atraso de voo / dano moral",
    fatosChave: ["atraso", "voo", "companhia aérea"],
    tipoAcao: "Ação de Indenização por Danos Morais",
    valorCausaBloco: "Dá-se à causa o valor de R$ 8.000,00 (oito mil reais).",
    jurisComLastro: ["1007777-22.2021.8.26.0100"],
    jurisSemLastro: ["1000000-00.2019.8.26.9999"],
    contextoLastro: `
Convenção de Montreal. CDC. Atraso de voo e assistência material.
TJSP 1007777-22.2021.8.26.0100 — indenização por atraso superior a quatro horas sem assistência adequada.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

MARIA PASSAGEIRA propõe ação em face de COMPANHIA AÉREA FICTA S.A.

I - DOS FATOS
Houve atraso de voo superior a quatro horas, sem assistência adequada pela companhia aérea, gerando dano moral.

II - DO DIREITO
Aplica-se o CDC. Cita-se o Processo nº 1007777-22.2021.8.26.0100 e ainda o Processo nº 1000000-00.2019.8.26.9999.

III - DOS PEDIDOS
a) Citação;
b) Indenização por danos morais;
c) Procedência.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 10 de agosto de 2026.
OAB/SP 111222
    `.trim(),
  },
  {
    id: "vicio-produto",
    tema: "Vício do produto / CDC garantia",
    fatosChave: ["vício", "produto", "garantia"],
    tipoAcao: "Ação de Obrigação de Fazer c/c Danos Materiais",
    valorCausaBloco: "Dá-se à causa o valor de R$ 3.200,00 (três mil e duzentos reais).",
    jurisComLastro: ["1003333-44.2024.8.26.0001"],
    jurisSemLastro: ["AgInt no AREsp 8888888"],
    contextoLastro: `
Arts. 18 e 20 do CDC. Vício do produto e substituição/reexecução do serviço.
TJSP Processo nº 1003333-44.2024.8.26.0001 — garantia legal e responsabilidade do fornecedor.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

CARLOS COMPRADOR vem a juízo em face de LOJA ELETRO FICTA LTDA.

I - DOS FATOS
O produto apresentou vício oculto dentro do prazo de garantia, sem solução administrativa.

II - DO DIREITO a) Do vício do produto
Incidem os arts. 18 e 20 do CDC. Colaciona-se o Processo nº 1003333-44.2024.8.26.0001 e o AgInt no AREsp 8888888.

III - DOS PEDIDOS
a) Obrigação de substituir o produto;
b) Danos materiais subsidiários;
c) Procedência.

Nestes termos,
pede deferimento.

Santos/SP, 10 de agosto de 2026.
OAB/SP 333444
    `.trim(),
  },
  {
    id: "plano-saude-obrigacao",
    tema: "Plano de saúde / obrigação de fazer",
    fatosChave: ["plano de saúde", "cobertura", "obrigação de fazer"],
    tipoAcao: "Ação de Obrigação de Fazer c/c Tutela de Urgência",
    valorCausaBloco: "Dá-se à causa o valor de R$ 20.000,00 (vinte mil reais).",
    tutelaUrgencia: true,
    jurisComLastro: ["1008888-77.2023.8.26.0100"],
    jurisSemLastro: ["1001111-11.2018.8.26.5555"],
    contextoLastro: `
Lei 9.656/98. CDC. Cobertura de tratamento. Tutela de urgência (fumus boni iuris e periculum in mora).
TJSP 1008888-77.2023.8.26.0100 — obrigação de autorizar procedimento negado abusivamente.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

PACIENTE FICTO propõe obrigação de fazer em face de PLANO SAÚDE EXEMPLO S.A.

I - DOS FATOS
O plano de saúde negou cobertura de tratamento prescrito, colocando em risco a saúde do autor.

II - DO DIREITO
Há fumus boni iuris e periculum in mora. Cita-se o Processo nº 1008888-77.2023.8.26.0100 e o Processo nº 1001111-11.2018.8.26.5555.

III - DOS PEDIDOS
a) Tutela de urgência para autorizar o procedimento;
b) Confirmação da obrigação de fazer;
c) Procedência.

Termos em que,
Pede e espera deferimento.

São Paulo/SP, 10 de agosto de 2026.
OAB/SP 555666
    `.trim(),
  },
  {
    id: "cobranca-telefone",
    tema: "Cobrança indevida telefone / dano moral",
    fatosChave: ["cobrança indevida", "telefone", "operadora"],
    tipoAcao: "Ação Declaratória c/c Danos Morais",
    valorCausaBloco: "Dá-se à causa o valor de R$ 10.000,00 (dez mil reais).",
    jurisComLastro: ["1004444-55.2022.8.26.0003"],
    jurisSemLastro: ["REsp 7777777/SP"],
    contextoLastro: `
CDC. Cobrança indevida de serviços de telefonia. Repetição do indébito.
TJSP Processo nº 1004444-55.2022.8.26.0003 — cobrança de serviços não contratados.
    `.trim(),
    pecaIaBruta: `
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DO JUIZADO ESPECIAL CÍVEL

USUÁRIO LINHA propõe ação em face de OPERADORA TELEFONE S.A.

I - DOS FATOS
A operadora efetuou cobrança indevida de serviços de telefone não contratados, com insistência vexatória.

II - DO DIREITO
Aplica-se o CDC. Colaciona-se o Processo nº 1004444-55.2022.8.26.0003 e o REsp 7777777/SP.

III - DOS PEDIDOS
a) Declaração de inexigibilidade;
b) Repetição do indébito;
c) Danos morais.

Nestes termos,
pede deferimento.

São Paulo/SP, 10 de agosto de 2026.
OAB/SP 777888
    `.trim(),
  },
];

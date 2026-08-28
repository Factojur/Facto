import { ASSISTENTE_FACTO } from "@/lib/assistente-facto";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import { normalizarAreaIdMinuta } from "@/lib/minuta-modulo";

const ENTRADA_POR_AREA: Record<AreaIdMinuta, string> = {
  jec:
    "Ex.: Cliente comprou notebook no site em 02/08, recebeu em 05/08, pediu arrependimento no 6º dia e a loja recusou a devolução…",
  consumidor:
    "Ex.: Consumidor contratou plano de internet em 10/01; velocidade caiu após 3 meses; protocolou reclamação na Anatel e a operadora não regularizou…",
  civil:
    "Ex.: Autor emprestou R$ 15 mil ao réu em 03/2022 com promessa de devolução em 6 meses; há conversas de WhatsApp e o devedor não pagou…",
  trabalhista:
    "Ex.: Reclamante trabalhou de 2019 a 2024 como vendedor, com metas e ponto; foi dispensado sem receber horas extras e verbas rescisórias…",
  familia:
    "Ex.: Pais separados desde 2021; criança de 7 anos mora com a mãe; pai pede guarda compartilhada e fixação de alimentos de R$ ____…",
  imobiliario:
    "Ex.: Locação residencial desde 2020, aluguel R$ 2.100; inquilino atrasou 4 meses após notificação; imóvel em Campinas/SP…",
  jecr:
    "Ex.: Querelante registrou BO em 12/05 por lesão corporal leve; autor do fato foi identificado; tentativa de composição no CEJUSC fracassou…",
  criminal:
    "Ex.: Paciente preso em flagrante em 15/03 por tráfico; audiência de custódia manteve a prisão; defesa pede relaxamento por ilegalidade da busca…",
  previdenciario:
    "Ex.: Segurado teve auxílio-doença negado em 08/2024 apesar de laudos de hérnia de disco; INSS indeferiu administrativamente; pede restabelecimento…",
  tributario:
    "Ex.: Fazenda lançou auto de infração de ICMS em 2022; empresa impugna por decadência e ausência de notificação válida…",
  administrativo:
    "Ex.: Servidor público sofreu remoção compulsória em 2024 sem processo administrativo; pede anulação do ato e retorno ao cargo…",
  empresarial:
    "Ex.: Sócio minoritário foi excluído da sociedade em assembleia sem quórum; apuração de haveres fixada em valor irrisório…",
  digital:
    "Ex.: Plataforma vazou dados pessoais de clientes em março/2025; houve fraude em cartões; empresa não notificou a ANPD no prazo…",
  ambiental:
    "Ex.: Empresa despeja efluentes no rio desde 2023; laudo do órgão ambiental constatou dano; comunidade pede embargo e reparação…",
  "propriedade-intelectual":
    "Ex.: Concorrente usa marca semelhante desde 2024 em e-commerce; titular registrou o nome no INPI; há confusão entre consumidores…",
  internacional:
    "Ex.: Sentença estrangeira de divórcio proferida nos EUA em 2023; ex-cônjuge resiste à homologação no Brasil quanto à partilha…",
  medico:
    "Ex.: Paciente submeteu-se a cirurgia em 11/2024; complicação por falha no pós-operatório; laudo pericial aponta nexo causal…",
  agrario:
    "Ex.: Família ocupa área rural há 20 anos com benfeitorias; proprietário registral pede reintegração; há prova de posse mansa…",
  eleitoral:
    "Ex.: Candidato teve registro indeferido por suposta propaganda antecipada; decisão baseada em post de rede social de apoiador…",
  constitucional:
    "Ex.: Lei municipal proíbe comércio em feriados estaduais; associação de lojistas pede controle concentrado de constitucionalidade…",
};

const FATOS_PADRAO_POR_AREA: Record<AreaIdMinuta, string> = {
  jec:
    "Narração cronológica dos fatos, com datas, valores, tentativas de solução e o que se pede ao Juizado. Anexe as provas correspondentes.",
  consumidor:
    "Ex.: Relação de consumo desde ____. O fornecedor ____ (produto/serviço). Defeito ou descumprimento em ____. Reclamação em ____ sem solução. Prejuízo de R$ ____.",
  civil:
    "Ex.: Em __/__/____ as partes celebraram ____ (contrato anexo). O réu descumpriu ____. Notificação em ____. Dano material R$ ____ e pedido de ____.",
  trabalhista:
    "Ex.: Admissão em ____, função ____, salário R$ ____. Jornada das ____ às ____ com intervalo suprimido. Dispensa em ____ sem pagar ____.",
  familia:
    "Ex.: União/casamento de ____ a ____. Filhos: ____. Guarda atual: ____. Rendimentos de cada genitor: ____. Necessidades da criança: ____.",
  imobiliario:
    "Ex.: Contrato de locação de __/__/____, aluguel R$ ____, garantia ____. Inadimplemento desde ____. Notificação em ____. Estado do imóvel: ____.",
  jecr:
    "Ex.: Fato ocorrido em __/__/____: ____. BO nº ____ de ____. Partes: querelante ____ e querelado ____. Tentativa de acordo em ____. Pedido: ____.",
  criminal:
    "Ex.: Em __/__/____ o acusado foi preso em flagrante por ____. IP nº ____. Audiência de custódia em ____. Prisão preventiva decretada em ____. Situação atual: ____.",
  previdenciario:
    "Ex.: Segurado com CID ____ desde ____. Benefício ____ requerido em ____, indeferido em ____. Laudos médicos anexos. Contribuições até ____.",
  tributario:
    "Ex.: Auto de infração nº ____ de __/__/____, tributo ____, valor R$ ____. Fundamento: ____. Impugnação administrativa em ____ (resultado: ____).",
  administrativo:
    "Ex.: Ato administrativo de __/__/____ (portaria/despacho anexo). Servidor/requerente ____. Violação a ____ (legalidade, motivação, contraditório). Pedido: ____.",
  empresarial:
    "Ex.: Sociedade constituída em ____, quotas de ____. Conflito desde ____ sobre ____. Deliberação de __/__/____. Prejuízo ou pedido: ____.",
  digital:
    "Ex.: Tratamento de dados pessoais de ____ desde ____. Incidente/violação em ____. Dados expostos: ____. Medidas da empresa: ____. Dano: ____.",
  ambiental:
    "Ex.: Dano ambiental em __/__/____ no imóvel/rio ____. Autuação/auto de infração nº ____. Laudo técnico: ____. Extensão do dano: ____.",
  "propriedade-intelectual":
    "Ex.: Registro/marca/patente nº ____ desde ____. Uso indevido pelo réu desde ____. Produtos/serviços confundíveis: ____. Prejuízo e pedido: ____.",
  internacional:
    "Ex.: Sentença estrangeira proferida em __/__/____ pelo juízo de ____. Requisitos do art. 963 do CPC: ____. Tradução juramentada anexa.",
  medico:
    "Ex.: Atendimento/cirurgia em __/__/____ no hospital ____. Intercorrência: ____. Laudo pericial: ____. Sequelas e danos: ____.",
  agrario:
    "Ex.: Posse do imóvel rural desde ____, área de ____ ha, benfeitorias: ____. Ameaça de despejo/reintegração em ____. Documentos rurais: ____.",
  eleitoral:
    "Ex.: Eleição de __/__/____, cargo ____. Ato impugnado: ____. Fundamento legal (Lei 9.504/CF): ____. Provas (propaganda, atas): ____.",
  constitucional:
    "Ex.: Norma impugnada: ____. Vigência desde ____. Violação aos arts. ____ da CF. Pedido (ADI/ADPF/MS): ____.",
};

/** Placeholder da caixa Entrada do caso — exemplo do rito da área. */
export function placeholderEntradaPorArea(areaId?: string | null): string {
  const area = normalizarAreaIdMinuta(areaId);
  return ENTRADA_POR_AREA[area];
}

/** Placeholder da aba Fatos — prioriza espécie/tipo, depois o rito da área. */
export function placeholderFatosPorArea(
  areaId?: string | null,
  tipoAcao?: string | null
): string {
  const area = normalizarAreaIdMinuta(areaId);
  const tipo = String(tipoAcao ?? "").trim();

  if (!tipo || tipo === ASSISTENTE_FACTO) {
    return (
      FATOS_PADRAO_POR_AREA[area] ??
      "Descreva em ordem cronológica: o que aconteceu, quando, com quem, quais documentos existem e qual o prejuízo ou pedido."
    );
  }

  const porTipo = placeholderFatosPorTipoNaArea(area, tipo);
  if (porTipo) return porTipo;

  return FATOS_PADRAO_POR_AREA[area];
}

function placeholderFatosPorTipoNaArea(
  area: AreaIdMinuta,
  tipoAcao: string
): string | null {
  const t = tipoAcao.toLowerCase();

  if (area === "criminal" || area === "jecr") {
    if (t.includes("habeas") || t.includes("hc")) {
      return (
        "Ex.: Paciente preso em __/__/____ por ____. Decisão de prisão em ____. Ilegalidade: ____. Constrangimento ilegal até hoje. Pedido liminar."
      );
    }
    if (
      t.includes("resposta") ||
      t.includes("defesa") ||
      t.includes("queixa")
    ) {
      return (
        "Ex.: Fato em __/__/____: ____. Acusação baseada em ____. Provas da defesa: ____. Tese: atipicidade / legítima defesa / ausência de dolo."
      );
    }
    if (t.includes("apelação") || t.includes("apelacao") || t.includes("recurso")) {
      return (
        "Ex.: Sentença de __/__/____ condenou por ____. Pena de ____. Erro de fato/direito: ____. Prequestionamento: ____. Pedido de absolvição/redução."
      );
    }
    if (t.includes("transação") || t.includes("transacao")) {
      return (
        "Ex.: Crime de menor potencial em __/__/____. Réu primário. Proposta de transação penal: pena de ____ + reparação de R$ ____."
      );
    }
    return null;
  }

  if (area === "trabalhista") {
    if (t.includes("reclama")) {
      return (
        "Ex.: Contrato de __/__/____ a __/__/____, função ____, salário R$ ____. Horas extras não pagas. Verbas não quitadas na rescisão: ____."
      );
    }
    return null;
  }

  if (area === "familia") {
    if (t.includes("aliment")) {
      return (
        "Ex.: Filho(a) ____, nascido em ____. Alimentante renda R$ ____. Necessidades: escola R$ ____, saúde ____. Valor pleiteado: R$ ____."
      );
    }
    if (t.includes("guarda") || t.includes("divórcio") || t.includes("divorcio")) {
      return (
        "Ex.: Filhos: ____. Residência atual com ____. Vínculo com o outro genitor: ____. Melhor interesse: guarda ____."
      );
    }
    return null;
  }

  if (area === "previdenciario") {
    if (t.includes("benefício") || t.includes("beneficio") || t.includes("aposent")) {
      return (
        "Ex.: Pedido de ____ em __/__/____. INSS indeferiu em ____. CID ____. Contribuição até ____. Incapacidade desde ____."
      );
    }
    return null;
  }

  if (area === "tributario" || area === "administrativo") {
    if (t.includes("mandado") || t.includes("segurança") || t.includes("seguranca")) {
      return (
        "Ex.: Ato coator de __/__/____: ____. Direito líquido e certo: ____. Urgência: ____. Autoridade coatora: ____."
      );
    }
    return null;
  }

  if (area === "eleitoral") {
    if (t.includes("representação") || t.includes("representacao") || t.includes("aije")) {
      return (
        "Ex.: Eleição de __/__/____. Conduta ilícita: ____. Provas (vídeo, material): ____. Pedido de cassação/multa."
      );
    }
    return null;
  }

  // Tipos transversais (cível/consumidor/JEC)
  if (t.includes("cobrança") || t.includes("cobranca")) {
    return (
      "Ex.: Em __/__/____ o réu contratou/obrigou-se a ____ no valor de R$ ____. " +
      "Vencimento __/__/____. Notificado em ____. Não pagou. Pedido: R$ ____ + correção e juros."
    );
  }
  if (t.includes("indeniza")) {
    return (
      "Ex.: Em __/__/____ ocorreu ____. Prejuízo material R$ ____ e dano moral por ____. " +
      "Provas: ____. Pedido de indenização de R$ ____."
    );
  }
  if (t.includes("despejo") || t.includes("locação") || t.includes("locacao")) {
    return (
      "Ex.: Locação de __/__/____, aluguel R$ ____. Inadimplemento desde ____. " +
      "Notificação ____. Pedido: despejo e aluguéis em atraso."
    );
  }
  if (t.includes("execução") || t.includes("execucao")) {
    return (
      "Ex.: Título ____ de ____, valor R$ ____, vencido ____. " +
      "Protesto/apresentação em ____. Pedido: citação e atos executórios."
    );
  }
  if (t.includes("obrigação") || t.includes("obrigacao")) {
    return (
      "Ex.: Réu obrigou-se a ____ até ____ (contrato anexo). Não cumpriu. " +
      "Pedido: obrigação de fazer com multa diária."
    );
  }

  return null;
}

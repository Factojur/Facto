/**
 * Lotes 684+ — reforço das áreas fracas até o fim da assinatura (vencimento 2026-09-13).
 */

import type { PackTribunal } from "./seed-juris-termos-lotes-prioridade";

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
};

function par(a: string, r: string): TermoSeed[] {
  return [
    { lado: "autor", q: a },
    { lado: "reu", q: r },
  ];
}

function pack(...pares: [string, string][]): TermoSeed[] {
  return pares.flatMap(([a, r]) => par(a, r));
}

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

const LACUNAS_684: PackTribunal[] = [
  {
    rotulo: "STF · direitos sociais II",
    tribunal: "stf",
    termos: pack(
      ["mínimo existencial saúde STF", "reserva do possível saúde"],
      ["moradia digna direito fundamental", "moradia política pública"],
      ["educação inclusiva deficiente", "educação especial custo excessivo"],
      ["assistência social BPC LOAS", "BPC renda per capita"],
      ["seguridade previdenciária princípio", "previdência equilíbrio financeiro"]
    ),
  },
  {
    rotulo: "STF · processo constitucional II",
    tribunal: "stf",
    termos: pack(
      ["recurso extraordinário prequestionamento", "RE ausência prequestionamento"],
      ["repercussão geral negativa", "repercussão geral genérica"],
      ["agravo RE recurso especial", "agravo RE cabimento"],
      ["suspensão liminar ADI", "ADI liminar requisitos"],
      ["modulação efeitos ADI", "ADI efeitos ex nunc"]
    ),
  },
  {
    rotulo: "TRF3 · previdenciário BPC",
    tribunal: "trf3",
    termos: pack(
      ["BPC LOAS deficiência longa duração", "BPC deficiência leve"],
      ["BPC idoso renda per capita", "BPC idoso miserabilidade"],
      ["auxílio inclusão BPC", "auxílio inclusão indeferimento"],
      ["benefício assistencial revisão", "benefício assistencial decadência"],
      ["LOAS critério socioeconômico", "LOAS renda informal"]
    ),
  },
  {
    rotulo: "TRF3 · previdenciário rural",
    tribunal: "trf3",
    termos: pack(
      ["aposentadoria rural segurado especial", "rural ausência carência"],
      ["tempo rural comprovação INSS", "tempo rural início de prova"],
      ["atividade rural simultânea urbana", "rural atividade eventual"],
      ["idade rural mulher", "idade rural carência"],
      ["auxílio doença rural", "auxílio doença nexo rural"]
    ),
  },
  {
    rotulo: "TRF4 · previdenciário especial",
    tribunal: "trf4",
    termos: pack(
      ["aposentadoria especial PPP agente nocivo", "especial PPP inválido"],
      ["insalubridade periculosidade INSS", "especial ausência laudo"],
      ["conversão tempo especial comum", "conversão fator prejudicial"],
      ["revisão vida toda TRF4", "revisão vida toda decadência"],
      ["desaposentação previdenciária", "desaposentação vedada"]
    ),
  },
  {
    rotulo: "TRF4 · benefícios por incapacidade",
    tribunal: "trf4",
    termos: pack(
      ["auxílio doença incapacidade laborativa", "auxílio doença alta médica"],
      ["aposentadoria por invalidez acidentária", "invalidez nexo não comprovado"],
      ["auxílio acidente sequela", "auxílio acidente mínima"],
      ["perícia judicial previdenciária", "perícia judicial prova em contrário"],
      ["DIB data início benefício", "DIB termo inicial indeferimento"]
    ),
  },
  {
    rotulo: "STJ · previdenciário",
    tribunal: "stj",
    termos: pack(
      ["revisão teto previdenciário", "revisão teto prescrito"],
      ["pensão por morte dependente", "pensão dependente união estável"],
      ["salário maternidade segurada", "salário maternidade carência"],
      ["contribuição previdenciária rural", "contribuição rural dispensa"],
      ["desconto indevido benefício", "desconto empréstimo consignado"]
    ),
  },
  {
    rotulo: "TST · horas extras II",
    tribunal: "tst",
    termos: pack(
      ["horas extras habitualidade reflexos", "horas extras eventuais"],
      ["intervalo intrajornada supressão", "intervalo intrajornada negociação"],
      ["banco de horas invalidade", "banco de horas acordo válido"],
      ["sobreaviso telefone celular", "sobreaviso ausência restrição"],
      ["tempo à disposição deslocamento", "tempo deslocamento não computável"]
    ),
  },
  {
    rotulo: "TST · rescisão e verbas",
    tribunal: "tst",
    termos: pack(
      ["verbas rescisórias diferença salarial", "verbas rescisórias quitação"],
      ["multa artigo 477 CLT", "multa 477 pagamento tempestivo"],
      ["FGTS rescisão indireta", "rescisão indireta justa causa empregado"],
      ["aviso prévio indenizado", "aviso prévio pedido demissão"],
      ["dano moral assédio moral", "assédio moral prova insuficiente"]
    ),
  },
  {
    rotulo: "TST · vínculo e terceirização",
    tribunal: "tst",
    termos: pack(
      ["pejotização vínculo empregatício", "pejotização autonomia"],
      ["terceirização atividade fim", "terceirização licitude"],
      ["equiparação salarial requisitos", "equiparação salarial diferença função"],
      ["grupo econômico responsabilidade", "grupo econômico mera identidade sócios"],
      ["sucessão trabalhista", "sucessão ausência transferência"]
    ),
  },
  {
    rotulo: "TST · estabilidade",
    tribunal: "tst",
    termos: pack(
      ["estabilidade gestante demissão", "estabilidade gestante justa causa"],
      ["estabilidade acidentária art 118", "estabilidade acidentária alta"],
      ["estabilidade cipeiro", "estabilidade cipeiro mandato"],
      ["reintegração estabilidade", "reintegração dispensa válida"],
      ["indenização estabilidade", "indenização estabilidade cálculo"]
    ),
  },
  {
    rotulo: "CARF · PIS COFINS",
    tribunal: "carf",
    termos: pack(
      ["PIS COFINS crédito insumo", "PIS COFINS credito vedado"],
      ["exclusão ICMS base PIS", "ICMS base PIS integra"],
      ["monofásico PIS COFINS", "monofásico creditamento"],
      ["regime cumulativo não cumulativo", "regime cumulativo conversão"],
      ["contribuição previdenciária crédito", "crédito previdenciária indeferido"]
    ),
  },
  {
    rotulo: "CARF · IRPJ CSLL",
    tribunal: "carf",
    termos: pack(
      ["IRPJ lucro presumido glosa", "IRPJ glosa procedente"],
      ["CSLL adição fiscal", "CSLL compensação prejuízo"],
      ["juros SELIC compensação", "compensão lançamento prescrito"],
      ["transação tributária CARF", "transação requisitos"],
      ["multa qualificada CARF", "multa qualificada afastamento"]
    ),
  },
  {
    rotulo: "STJ · tributário",
    tribunal: "stj",
    termos: pack(
      ["execução fiscal CDA vício", "CDA liquidez certeza"],
      ["prescrição tributária intercorrente", "prescrição tributária interrupção"],
      ["ISS serviço local", "ISS exportação serviço"],
      ["ICMS substituição tributária", "ST ICMS ilegitimidade"],
      ["lançamento tributário decadência", "lançamento decadência"]
    ),
  },
  {
    rotulo: "STJ · eleitoral",
    tribunal: "stj",
    termos: pack(
      ["propaganda eleitoral antecipada", "propaganda eleitoral liberdade"],
      ["abuse poder econômico", "abuso poder econômico não comprovado"],
      ["cassação diploma inelegibilidade", "cassação ausência prova"],
      ["prestação contas campanha", "contas campanha rejeição"],
      ["impugnação registro candidatura", "registro candidatura deferimento"]
    ),
  },
  {
    rotulo: "STJ · digital LGPD II",
    tribunal: "stj",
    termos: pack(
      ["LGPD dano moral vazamento", "LGPD dano moral ausência"],
      ["eliminação dados titular", "eliminação dados base legal"],
      ["portabilidade dados pessoais", "portabilidade dados recusa"],
      ["responsabilidade operador LGPD", "operador culpa exclusiva titular"],
      ["deepfake direito imagem", "deepfake liberdade expressão"]
    ),
  },
  {
    rotulo: "STJ · internacional",
    tribunal: "stj",
    termos: pack(
      ["homologação sentença estrangeira", "homologação ordem pública"],
      ["exequatur carta rogatória", "exequatur ausência reciprocidade"],
      ["convenção Haia alimentos", "alimentos transfronteiriços"],
      ["apostila Haia documento", "apostila Haia requisitos"],
      ["imunidade jurisdição estrangeira", "imunidade jurisdição relativa"]
    ),
  },
  {
    rotulo: "STJ · conselhos profissionais",
    tribunal: "stj",
    termos: pack(
      ["CRM processo ético médico", "CRM processo ético ampla defesa"],
      ["OAB suspensão advogado", "OAB suspensão proporcionalidade"],
      ["CREA anotação responsabilidade técnica", "CREA RT exigência"],
      ["COREN processo disciplinar", "COREN disciplinar nulidade"],
      ["conselho profissional multa", "conselho multa dosimetria"]
    ),
  },
  {
    rotulo: "STJ · marítimo",
    tribunal: "stj",
    termos: pack(
      ["acidente navegação responsabilidade", "acidente navegação caso fortuito"],
      ["contrato afretamento marítimo", "afretamento inadimplemento"],
      ["salvamento marítimo remuneração", "salvamento ausência perigo"],
      ["colisão embarcações culpa", "colisão culpa concorrente"]
    ),
  },
  {
    rotulo: "STJ · agrário",
    tribunal: "stj",
    termos: pack(
      ["reforma agrária assentamento", "reforma agrária propriedade produtiva"],
      ["usucapião rural especial", "usucapião rural requisitos"],
      ["contrato parceria agrícola", "parceria agrícola rescisão"],
      ["demarcação terras quilombolas", "demarcação quilombola titularidade"]
    ),
  },
  {
    rotulo: "STJ · criminal competência",
    tribunal: "stj",
    termos: pack(
      ["habeas corpus STJ competência", "habeas corpus incompetência"],
      ["prisão preventiva STJ", "preventiva fundamentação"],
      ["recurso especial penal", "REsp penal Súmula 284"],
      ["júri decisão manifestamente contrária", "júri prova suficiente"]
    ),
  },
  {
    rotulo: "STF · JECR remédios",
    tribunal: "stf",
    termos: pack(
      ["mandado segurança coletivo entidade", "MS coletivo ilegitimidade"],
      ["habeas data coletivo", "habeas data individualidade"],
      ["controle constitucional estadual", "constitucionalidade lei municipal"],
      ["ADI lei orgânica município", "ADI lei orgânica competência"]
    ),
  },
  {
    rotulo: "TRF3 · execução previdenciária",
    tribunal: "trf3",
    termos: pack(
      ["execução previdenciária RPV", "RPV valor limite"],
      ["honorários sucumbência previdenciário", "honorários fixação equitativa"],
      ["cumprimento sentença INSS", "cumprimento sentença impugnação"],
      ["astreintes benefício previdenciário", "astreintes valor excessivo"]
    ),
  },
  {
    rotulo: "TRF4 · contribuição rural",
    tribunal: "trf4",
    termos: pack(
      ["contribuição previdenciária produtor rural", "contribuição rural isenção"],
      ["GFIP rural regularização", "GFIP rural multa"],
      ["segurado especial comercialização", "segurado especial requisitos"],
      ["carência rural aposentadoria", "carência rural insuficiente"]
    ),
  },
  {
    rotulo: "TST · teletrabalho",
    tribunal: "tst",
    termos: pack(
      ["teletrabalho controle jornada", "teletrabalho autonomia horário"],
      ["home office custeio equipamento", "home office custo empregado"],
      ["teletrabalho reversão presencial", "teletrabalho alteração contratual"],
      ["sobrejornada teletrabalho", "teletrabalho jornada indeterminada"]
    ),
  },
];

const TJS_REFORCO = [
  "tjsp",
  "tjmg",
  "tjrs",
  "tjpr",
  "tjrj",
  "tjba",
  "tjpe",
  "tjgo",
  "tjsc",
  "tjce",
] as const;

const TEMAS_TJ: { rotulo: string; termos: TermoSeed[] }[] = [
  {
    rotulo: "previdenciário local",
    termos: pack(
      ["benefício previdenciário negado judicial", "benefício previdenciário indeferimento legal"],
      ["aposentadoria por tempo contribuição", "aposentadoria carência insuficiente"],
      ["auxílio doença perícia judicial", "auxílio doença capacidade laborativa"],
      ["revisão benefício previdenciário", "revisão prescrita"]
    ),
  },
  {
    rotulo: "trabalhista residual TJ",
    termos: pack(
      ["empregado doméstico verbas rescisórias", "doméstico vínculo ausente"],
      ["acidente trabalho indenização", "acidente culpa exclusiva vítima"],
      ["assédio moral trabalhista", "assédio moral prova frágil"],
      ["equiparação salarial", "equiparação diferença função"]
    ),
  },
  {
    rotulo: "tributário local",
    termos: pack(
      ["IPTU lançamento ilegal", "IPTU lançamento regular"],
      ["ISS serviço municipal", "ISS imunidade"],
      ["execução fiscal municipal", "execução fiscal nulidade CDA"],
      ["ITBI base cálculo", "ITBI base venal"]
    ),
  },
  {
    rotulo: "digital consumer",
    termos: pack(
      ["golpe pix responsabilidade banco", "golpe pix culpa correntista"],
      ["vazamento dados indenização", "vazamento dados dano não comprovado"],
      ["plataforma digital cancelamento", "cancelamento termos de uso"],
      ["LGPD dano moral consumidor", "LGPD dano moral ausente"]
    ),
  },
  {
    rotulo: "eleitoral local STJ espelho",
    termos: pack(
      ["propaganda eleitoral irregular multa", "propaganda eleitoral liberdade"],
      ["compra de votos crime eleitoral", "compra votos prova insuficiente"],
      ["inelegibilidade candidato", "inelegibilidade afastada"],
      ["abuso poder político", "abuso poder não configurado"]
    ),
  },
  {
    rotulo: "constitucional estadual",
    termos: pack(
      ["mandado segurança servidor estadual", "mandado segurança decadência"],
      ["concurso público estadual", "concurso público discricionariedade"],
      ["servidor público remuneração", "servidor remuneração legal"],
      ["improbidade administrativa estadual", "improbidade dolo ausente"]
    ),
  },
  {
    rotulo: "ambiental reforço",
    termos: pack(
      ["licença ambiental negada", "licença ambiental indeferimento legal"],
      ["multa ambiental estadual", "multa ambiental proporcionalidade"],
      ["dano ambiental indenização", "dano ambiental nexo"],
      ["reserva legal APP", "APP área consolidada"]
    ),
  },
  {
    rotulo: "internacional privado",
    termos: pack(
      ["alimentos transnacionais", "alimentos competência brasileira"],
      ["guarda compartilhada fronteira", "guarda homologação estrangeira"],
      ["reconhecimento sentença estrangeira", "reconhecimento ordem pública"],
      ["apostila Haia documento público", "apostila Haia requisito"]
    ),
  },
];

function montar(): {
  lotes: Record<number, TermoSeed[]>;
  rotulos: Record<number, string>;
  max: number;
} {
  const lotes: Record<number, TermoSeed[]> = {};
  const rotulos: Record<number, string> = {};
  let n = 684;

  for (const p of LACUNAS_684) {
    lotes[n] = noTribunal(p.termos, p.tribunal);
    rotulos[n] = p.rotulo;
    n++;
  }

  for (const tema of TEMAS_TJ) {
    for (const tj of TJS_REFORCO) {
      lotes[n] = noTribunal(tema.termos, tj);
      rotulos[n] = `${tj.toUpperCase()} · ${tema.rotulo}`;
      n++;
    }
  }

  return { lotes, rotulos, max: n - 1 };
}

const m = montar();
export const LOTES_684_PLUS = m.lotes;
export const ROTULO_LOTE_684 = m.rotulos;
export const LOTE_MAX_FASE3 = m.max;

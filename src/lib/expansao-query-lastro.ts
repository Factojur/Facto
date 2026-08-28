/**
 * Expansão de sinônimos para busca na base FACTO (embedding + keyword).
 * Liga o relato do advogado aos termos das ementas no acervo.
 */

export type ExpansaoQueryLastro = {
  /** Termos extras para ILIKE / pontuação keyword. */
  termos: string[];
  /** Bigramas discriminantes (ex.: "golpe pix"). */
  bigramas: string[];
  /** Bloco anexado à consulta semântica (embedding). */
  blocoSemantico: string;
  /** IDs dos grupos que dispararam (debug). */
  gruposAtivos: string[];
};

type GrupoExpansao = {
  id: string;
  /** `"*"` = todas as áreas; senão lista de `areaId`. */
  areas: readonly string[] | "*";
  padroes: RegExp[];
  termos: readonly string[];
};

export function normalizarQueryLastro(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Alias de área (ex.: contratual → civil). */
function areaCanonica(areaId?: string | null): string | null {
  if (!areaId?.trim()) return null;
  const id = areaId.trim().toLowerCase();
  if (id === "contratual") return "civil";
  return id;
}

function grupoAplica(
  areaId: string | undefined | null,
  areas: readonly string[] | "*"
): boolean {
  if (areas === "*") return true;
  const aid = areaCanonica(areaId);
  if (!aid) return false;
  return areas.includes(aid);
}

/** Monta regex tolerante a espaços entre palavras. */
function p(...frases: string[]): RegExp {
  const partes = frases.map((f) =>
    normalizarQueryLastro(f).trim().replace(/\s+/g, "\\s+")
  );
  return new RegExp(partes.join("|"), "i");
}

const GRUPOS_EXPANSAO: GrupoExpansao[] = [
  // —— Golpes e fraudes financeiras (várias áreas cíveis) ——
  {
    id: "golpe-pix",
    areas: ["jec", "consumidor", "civil", "digital"],
    padroes: [
      p(
        "golpe pix",
        "golpe do pix",
        "pix golpe",
        "transferencia pix",
        "transferencia via pix",
        "transferiu pix",
        "enviou pix",
        "chave pix",
        "pix fraudulento"
      ),
    ],
    termos: [
      "golpe pix",
      "transferencia fraudulenta",
      "fraude bancaria",
      "estelionato",
      "Súmula 479",
      "fortuito interno",
      "falha seguranca",
      "instituicao financeira",
    ],
  },
  {
    id: "golpe-maquininha",
    areas: ["jec", "consumidor", "civil", "digital"],
    padroes: [
      p(
        "golpe maquininha",
        "golpe da maquininha",
        "maquininha",
        "maquinha",
        "cartao clonado",
        "clonagem cartao",
        "cartao debito golpe"
      ),
    ],
    termos: [
      "golpe maquininha",
      "cartao clonado",
      "fraude cartao",
      "chargeback",
      "operacao bancaria",
      "Súmula 479",
    ],
  },
  {
    id: "golpe-motoboy",
    areas: ["jec", "consumidor", "civil", "digital"],
    padroes: [
      p(
        "golpe motoboy",
        "golpe do motoboy",
        "motoqueiro",
        "entregador falso",
        "falso entregador",
        "golpe entrega"
      ),
    ],
    termos: [
      "golpe motoboy",
      "estelionato",
      "engenharia social",
      "conta corrente",
      "transferencia indevida",
    ],
  },
  {
    id: "falsa-central",
    areas: ["jec", "consumidor", "civil", "digital"],
    padroes: [
      p(
        "falsa central",
        "central telefonica",
        "central do banco",
        "funcionario do banco ligou",
        "ligacao do banco",
        "golpe telefone",
        "golpe telefonico"
      ),
    ],
    termos: [
      "falsa central",
      "engenharia social",
      "golpe bancario",
      "fraude",
      "Súmula 479",
      "responsabilidade objetiva banco",
    ],
  },
  {
    id: "golpe-whatsapp",
    areas: ["jec", "consumidor", "civil", "digital"],
    padroes: [
      p(
        "golpe whatsapp",
        "golpe zap",
        "whatsapp golpe",
        "mensagem falsa",
        "perfil clonado",
        "golpe aplicativo"
      ),
    ],
    termos: [
      "golpe whatsapp",
      "estelionato",
      "transferencia pix",
      "fraude eletronica",
      "falha seguranca",
    ],
  },
  {
    id: "boleto-falso",
    areas: ["jec", "consumidor", "civil", "empresarial"],
    padroes: [p("boleto falso", "boleto adulterado", "boleto fraudulento", "segunda via falsa")],
    termos: ["boleto falso", "estelionato", "cobranca indevida", "fraude"],
  },
  {
    id: "negativacao",
    areas: ["jec", "consumidor", "civil"],
    padroes: [
      p(
        "negativacao",
        "nome sujo",
        "spc",
        "serasa",
        "scpc",
        "restricao cadastral",
        "inscricao indevida"
      ),
    ],
    termos: [
      "negativacao indevida",
      "inexigibilidade",
      "dano moral",
      "Súmula 385",
      "cadastro inadimplentes",
    ],
  },
  {
    id: "vicio-produto-servico",
    areas: ["jec", "consumidor", "civil"],
    padroes: [
      p(
        "vicio produto",
        "produto com defeito",
        "vicio do servico",
        "nao funcionou",
        "produto defeituoso"
      ),
    ],
    termos: ["vicio produto", "CDC art 18", "CDC art 14", "troca", "reparacao"],
  },
  {
    id: "plano-saude",
    areas: ["jec", "consumidor", "medico", "civil"],
    padroes: [
      p(
        "plano de saude",
        "operadora negou",
        "negativa cobertura",
        "home care",
        "cirurgia negada"
      ),
    ],
    termos: [
      "plano saude",
      "negativa cobertura",
      "CDC",
      "dano moral",
      "tratamento medico",
    ],
  },
  // —— JEC / rito ——
  {
    id: "juizado-9099",
    areas: ["jec"],
    padroes: [p("juizado especial", "jec", "pequenas causas", "9.099", "recurso inominado")],
    termos: ["juizado especial civel", "Lei 9.099", "recurso inominado", "turma recursal"],
  },
  // —— Civil ——
  {
    id: "cobranca-inadimplemento",
    areas: ["civil", "jec", "empresarial"],
    padroes: [
      p(
        "cobranca",
        "inadimplemento",
        "nao pagou",
        "debito",
        "obrigacao de pagar",
        "nota promissoria"
      ),
    ],
    termos: ["cobranca", "inadimplemento", "obrigacao pagar", "mora", "juros mora"],
  },
  {
    id: "obrigacao-fazer",
    areas: ["civil", "jec", "consumidor"],
    padroes: [p("obrigacao de fazer", "cumprimento obrigacao", "tutela especifica")],
    termos: ["obrigacao fazer", "tutela especifica", "astreintes", "inadimplemento"],
  },
  {
    id: "responsabilidade-civil",
    areas: ["civil", "jec"],
    padroes: [p("dano material", "dano moral", "indenizacao", "acidente transito", "colisao")],
    termos: ["responsabilidade civil", "indenizacao", "dano moral", "nexo causal"],
  },
  // —— Trabalhista ——
  {
    id: "horas-extras",
    areas: ["trabalhista"],
    padroes: [
      p("hora extra", "horas extras", "sobrejornada", "banco de horas", "intervalo intrajornada"),
    ],
    termos: ["horas extras", "CLT", "Súmula 437", "adicional noturno", "intervalo"],
  },
  {
    id: "assedio-moral",
    areas: ["trabalhista"],
    padroes: [p("assedio moral", "humilhacao", "ambiente hostil", "bullying trabalho")],
    termos: ["assedio moral", "dano moral", "CLT", "indenizacao"],
  },
  {
    id: "rescisao-trabalhista",
    areas: ["trabalhista"],
    padroes: [
      p(
        "verbas rescisorias",
        "rescisao",
        "demissao",
        "justa causa",
        "pedido demissao",
        "fgts"
      ),
    ],
    termos: ["verbas rescisorias", "FGTS", "aviso previo", "multa 40", "TRCT"],
  },
  {
    id: "vinculo-pejotizacao",
    areas: ["trabalhista"],
    padroes: [
      p("pejotizacao", "pessoa juridica", "sem carteira", "vinculo emprego", "pj fraudulento"),
    ],
    termos: ["vinculo emprego", "CLT art 3", "pejotizacao", "subordinacao", "pessoalidade"],
  },
  {
    id: "equiparacao-salarial",
    areas: ["trabalhista"],
    padroes: [p("equiparacao salarial", "salario igual", "paradigma", "discriminacao salarial")],
    termos: ["equiparacao salarial", "CLT art 461", "isonomia"],
  },
  // —— Família ——
  {
    id: "alimentos",
    areas: ["familia"],
    padroes: [p("alimentos", "pensao alimenticia", "binomio", "alimentos provisionais")],
    termos: ["alimentos", "CC 1694", "necessidade possibilidade", "pensao"],
  },
  {
    id: "guarda-divorcio",
    areas: ["familia"],
    padroes: [
      p("guarda", "divorcio", "separacao", "uniao estavel", "regulamentacao visitas"),
    ],
    termos: ["guarda compartilhada", "divorcio", "uniao estavel", "melhor interesse"],
  },
  {
    id: "inventario",
    areas: ["familia"],
    padroes: [p("inventario", "partilha", "heranca", "testamento", "arrolamento")],
    termos: ["inventario", "partilha bens", "sucessao", "herdeiros"],
  },
  // —— Imobiliário ——
  {
    id: "despejo-locacao",
    areas: ["imobiliario", "civil", "jec"],
    padroes: [p("despejo", "locacao", "aluguel atrasado", "inadimplencia aluguel", "Lei 8.245")],
    termos: ["despejo", "locacao", "Lei 8245", "purga mora", "contrato locacao"],
  },
  {
    id: "usucapiao",
    areas: ["imobiliario", "civil"],
    padroes: [p("usucapiao", "usucapião", "posse mansa", "animus domini")],
    termos: ["usucapiao", "posse", "propriedade", "CC 1238"],
  },
  {
    id: "condominio",
    areas: ["imobiliario", "civil"],
    padroes: [p("condominio", "taxa condominial", "assembleia condominial", "sindico")],
    termos: ["condominio", "cotas condominiais", "inadimplencia condominio"],
  },
  {
    id: "atraso-obra",
    areas: ["imobiliario", "consumidor", "civil"],
    padroes: [p("atraso entrega", "atraso obra", "incorporadora", "habite-se", "distrato imovel")],
    termos: ["atraso entrega", "incorporadora", "distrato", "perdas danos"],
  },
  // —— Tributário ——
  {
    id: "execucao-fiscal",
    areas: ["tributario"],
    padroes: [p("execucao fiscal", "cda", "Lei 6.830", "embargos execucao", "excecao pre-executividade")],
    termos: ["execucao fiscal", "CDA", "Lei 6830", "embargos", "prescricao tributaria"],
  },
  {
    id: "tributo-icms-iptu",
    areas: ["tributario"],
    padroes: [p("icms", "iptu", "iss", "itbi", "auto de infracao", "lancamento tributario")],
    termos: ["ICMS", "IPTU", "ISS", "anulacao lancamento", "CARF"],
  },
  // —— Previdenciário ——
  {
    id: "aposentadoria",
    areas: ["previdenciario"],
    padroes: [
      p(
        "aposentadoria",
        "tempo contribuicao",
        "idade",
        "revisao beneficio",
        "concessao beneficio"
      ),
    ],
    termos: ["aposentadoria", "INSS", "Lei 8213", "tempo contribuicao", "JEF"],
  },
  {
    id: "auxilio-bpc",
    areas: ["previdenciario"],
    padroes: [p("auxilio doenca", "bpc", "loas", "beneficio negado", "incapacidade")],
    termos: ["auxilio doenca", "BPC", "LOAS", "beneficio previdenciario", "INSS"],
  },
  // —— Criminal ——
  {
    id: "habeas-corpus",
    areas: ["criminal"],
    padroes: [p("habeas corpus", "hc", "liberdade provisoria", "prisao ilegal")],
    termos: ["habeas corpus", "CPP", "liberdade", "constricao ilegal"],
  },
  {
    id: "prisao-penal",
    areas: ["criminal"],
    padroes: [p("prisao preventiva", "flagrante", "trafico", "receptacao", "estelionato penal")],
    termos: ["prisao preventiva", "codigo penal", "CPP", "liberdade provisoria"],
  },
  // —— JECRIM ——
  {
    id: "jecrim",
    areas: ["jecr"],
    padroes: [
      p("jecrim", "juizado criminal", "transacao penal", "composicao civil", "vias de fato"),
    ],
    termos: ["JECRIM", "transacao penal", "Lei 9099", "composicao civil"],
  },
  {
    id: "lesao-corporal",
    areas: ["jecr", "criminal"],
    padroes: [p("lesao corporal", "vias de fato", "ameaca", "injuria")],
    termos: ["lesao corporal leve", "contravencao", "Lei 9099"],
  },
  // —— Constitucional ——
  {
    id: "remedios-constitucionais",
    areas: ["constitucional"],
    padroes: [
      p(
        "mandado seguranca",
        "adi",
        "adpf",
        "recurso extraordinario",
        "reclamacao constitucional",
        "controle concentrado"
      ),
    ],
    termos: ["mandado seguranca", "ADI", "ADPF", "recurso extraordinario", "STF"],
  },
  // —— Administrativo ——
  {
    id: "ms-administrativo",
    areas: ["administrativo", "constitucional", "tributario"],
    padroes: [p("mandado seguranca", "ato administrativo", "licitacao", "servidor publico")],
    termos: ["mandado seguranca", "Lei 12016", "ato administrativo", "direito liquido certo"],
  },
  {
    id: "improbidade",
    areas: ["administrativo"],
    padroes: [p("improbidade", "lai", "lei anticorrupcao", "ato improbo")],
    termos: ["improbidade administrativa", "Lei 8429", "sancoes"],
  },
  // —— Médico ——
  {
    id: "erro-medico",
    areas: ["medico", "consumidor", "civil"],
    padroes: [
      p("erro medico", "negligencia medica", "cirurgia", "internacao", "prontuario", "obito hospitalar"),
    ],
    termos: ["erro medico", "responsabilidade civil", "nexo causal", "dano moral"],
  },
  // —— Digital ——
  {
    id: "lgpd",
    areas: ["digital", "consumidor", "civil"],
    padroes: [p("lgpd", "dados pessoais", "vazamento dados", "privacidade", "titular dados")],
    termos: ["LGPD", "dados pessoais", "vazamento", "dano moral", "ANPD"],
  },
  // —— Ambiental ——
  {
    id: "ambiental",
    areas: ["ambiental"],
    padroes: [p("dano ambiental", "licenca ambiental", "ibama", "poluicao", "area preservacao")],
    termos: ["dano ambiental", "ACP", "obrigacao fazer", "Lei 6938"],
  },
  // —— Propriedade intelectual ——
  {
    id: "marca-autoral",
    areas: ["propriedade-intelectual", "empresarial", "digital"],
    padroes: [p("marca", "contrafacao", "direitos autorais", "lpi", "plagio", "uso indevido marca")],
    termos: ["marca", "LPI", "contrafacao", "abstencao uso", "direitos autorais"],
  },
  // —— Agrário ——
  {
    id: "agrario",
    areas: ["agrario"],
    padroes: [p("arrendamento rural", "credito rural", "posse rural", "usucapiao rural")],
    termos: ["arrendamento rural", "Estatuto Terra", "credito rural", "parceria agricola"],
  },
  // —— Internacional ——
  {
    id: "internacional",
    areas: ["internacional"],
    padroes: [p("homologacao sentenca", "sentenca estrangeira", "exequatur", "arbitragem internacional")],
    termos: ["homologacao sentenca estrangeira", "STJ", "CPC", "exequatur"],
  },
  // —— Eleitoral ——
  {
    id: "eleitoral",
    areas: ["eleitoral"],
    padroes: [
      p("propaganda eleitoral", "aije", "registro candidatura", "cassacao diploma", "contas campanha"),
    ],
    termos: ["propaganda eleitoral", "AIJE", "TSE", "eleicao", "inelegibilidade"],
  },
  // —— Empresarial ——
  {
    id: "recuperacao-falencia",
    areas: ["empresarial"],
    padroes: [p("recuperacao judicial", "falencia", "recuperacao extrajudicial", "plano recuperacao")],
    termos: ["recuperacao judicial", "Lei 11101", "falencia", "credores"],
  },
  {
    id: "societario",
    areas: ["empresarial", "civil"],
    padroes: [p("dissolucao sociedade", "exclusao socio", "apropriacao indébita societaria", "quotas")],
    termos: ["dissolucao parcial", "sociedade limitada", "Lei 6404", "quotas"],
  },
];

const STOPWORDS_QUERY = new Set([
  "para",
  "pela",
  "pelo",
  "com",
  "sem",
  "uma",
  "que",
  "como",
  "mais",
  "muito",
  "este",
  "essa",
  "isso",
  "nao",
  "sim",
  "caso",
  "parte",
  "autor",
  "reu",
  "processo",
  "acao",
  "juizo",
  "tribunal",
]);

/** Bigramas discriminantes a partir do texto (complementa unigramas). */
export function extrairBigramasQuery(texto: string, limite = 10): string[] {
  const palavras = normalizarQueryLastro(texto)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 4 && !STOPWORDS_QUERY.has(p));

  const bigramas: string[] = [];
  for (let i = 0; i < palavras.length - 1; i++) {
    const a = palavras[i]!;
    const b = palavras[i + 1]!;
    if (a.length >= 4 && b.length >= 4) {
      bigramas.push(`${a} ${b}`);
    }
  }
  return [...new Set(bigramas)].slice(0, limite);
}

/**
 * Expande fatos/consulta com sinônimos e termos de busca alinhados ao acervo.
 */
export function expandirQueryLastro(
  areaId: string | undefined | null,
  ...textos: Array<string | null | undefined>
): ExpansaoQueryLastro {
  const blob = normalizarQueryLastro(
    textos.filter((t) => t && String(t).trim()).join("\n")
  );

  const termos = new Set<string>();
  const gruposAtivos: string[] = [];

  for (const grupo of GRUPOS_EXPANSAO) {
    if (!grupoAplica(areaId, grupo.areas)) continue;
    if (!grupo.padroes.some((rx) => rx.test(blob))) continue;
    gruposAtivos.push(grupo.id);
    for (const t of grupo.termos) {
      termos.add(normalizarQueryLastro(t));
    }
  }

  const bigramas = extrairBigramasQuery(blob, 12);
  for (const b of bigramas) termos.add(b);

  const blocoSemantico =
    gruposAtivos.length > 0
      ? [...termos].slice(0, 24).join(" ")
      : "";

  return {
    termos: [...termos],
    bigramas,
    blocoSemantico,
    gruposAtivos,
  };
}

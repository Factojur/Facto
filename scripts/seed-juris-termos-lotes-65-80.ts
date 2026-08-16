/**
 * Lotes 65–80 — depois de 56–64 (lacunas TRF/TST/CARF).
 *
 * 65: TJSP qualidade JEC (temas fracos — não repetir lote 1)
 * 66–69: TJRJ, TJMG, TJPR, TJRS (JEC + CDC, um tribunal por vez)
 * 70–76: rito das áreas abertas no dashboard (penal, JECRIM, imobiliário, família, LGPD, médico, MS)
 * 77: tributo estadual/municipal (ICMS/IPTU) no TJSP
 * 78–79: retomar lotes vazios 41 e 50 no STJ
 * 80: ambiental/saúde no STJ (lote 56 pode ter ficado a meio)
 *
 * Rodar só depois de fechar 56–64: npx tsx scripts/seed-juris-ai-faixa.ts 65 80
 */

type TermoSeed = {
  q: string;
  lado?: "autor" | "reu" | "neutro";
  tribunal?: string;
};

function par(
  autor: string,
  reu: string,
  tribunal?: string
): TermoSeed[] {
  const t = tribunal ? { tribunal } : {};
  return [
    { lado: "autor", q: autor, ...t },
    { lado: "reu", q: reu, ...t },
  ];
}

function noTribunal(termos: TermoSeed[], tribunal: string): TermoSeed[] {
  return termos.map((t) => ({ ...t, tribunal }));
}

const JEC_CDC_CURTO: TermoSeed[] = [
  ...par(
    "indenização dano moral falha serviço CDC procedência juizado",
    "falha serviço improcedência mero aborrecimento juizado"
  ),
  ...par(
    "negativação indevida CDC dano moral procedência",
    "negativação improcedência débito exigível exercício regular"
  ),
  ...par(
    "golpe pix banco Súmula 479 procedência",
    "golpe pix improcedência culpa exclusiva da vítima"
  ),
  ...par(
    "execução título juizado especial penhora procedência",
    "execução juizado improcedência excesso iliquidez título"
  ),
  ...par(
    "juros remuneratórios revisão CDC taxa média procedência",
    "juros cartão improcedência liberdade contratual taxa mercado"
  ),
  ...par(
    "vício produto CDC substituição reexecução procedência",
    "vício produto improcedência mau uso decadência"
  ),
];

/** Lote 65 — TJSP, temas que no lote 2 deram 0 ou pouco. */
export const TERMOS_LOTE_65: TermoSeed[] = noTribunal(
  [
    ...par(
      "execução sentença juizado especial cumprimento art 52 procedência",
      "cumprimento sentença juizado improcedência inexigibilidade excesso"
    ),
    ...par(
      "juros de mora evento danoso Súmula 54 juizado procedência",
      "juros mora improcedência termo inicial citação responsabilidade contratual"
    ),
    ...par(
      "vício oculto veículo CDC prazo decadencial procedência",
      "vício veículo improcedência desgaste natural uso"
    ),
    ...par(
      "compra venda veículo desvio qualidade procedência rescisão",
      "compra veículo improcedência ciência vício aceite"
    ),
    ...par(
      "ICMS mercadoria internet substituição tributária procedência",
      "ICMS municipal ISS conflito competência improcedência"
    ),
    ...par(
      "IPTU progressividade extrafiscal legalidade procedência",
      "IPTU improcedência alíquota lei complementar observada"
    ),
  ],
  "tjsp"
);

export const TERMOS_LOTE_66 = noTribunal(JEC_CDC_CURTO, "tjrj");
export const TERMOS_LOTE_67 = noTribunal(JEC_CDC_CURTO, "tjmg");
export const TERMOS_LOTE_68 = noTribunal(JEC_CDC_CURTO, "tjpr");
export const TERMOS_LOTE_69 = noTribunal(JEC_CDC_CURTO, "tjrs");

/** Lote 70 — Penal comum (CPP), STJ. */
export const TERMOS_LOTE_70: TermoSeed[] = noTribunal(
  [
    ...par(
      "habeas corpus constrangimento ilegal prisão preventiva",
      "habeas corpus denegado gravidade concreta garantia ordem pública"
    ),
    ...par(
      "resposta à acusação art 396-A CPP rejeição denúncia",
      "resposta acusação recebimento denúncia justa causa"
    ),
    ...par(
      "apelação criminal art 593 CPP reforma sentença absolutória",
      "apelação criminal manutenção condenação prova suficiente"
    ),
    ...par(
      "agravo execução penal LEP progressão regime",
      "agravo execução denegado falta grave interrupção"
    ),
  ],
  "stj"
);

/** Lote 71 — JECRIM (completar lote 8). */
export const TERMOS_LOTE_71: TermoSeed[] = noTribunal(
  [
    ...par(
      "transação penal art 76 lei 9099 requisitos preenchidos",
      "transação penal indeferida reincidência maus antecedentes"
    ),
    ...par(
      "composição civil danos juizado criminal homologação",
      "composição civil não homologada crime ação pública incondicionada"
    ),
    ...par(
      "recurso inominado juizado especial criminal turma recursal",
      "recurso inominado JECRIM intempestivo deserção"
    ),
    ...par(
      "suspensão condicional processo art 89 lei 9099",
      "sursis processual indeferido pena mínima superior um ano"
    ),
  ],
  "tjsp"
);

/** Lote 72 — Imobiliário Lei 8.245. */
export const TERMOS_LOTE_72: TermoSeed[] = noTribunal(
  [
    ...par(
      "ação despejo falta pagamento lei 8245 procedência",
      "despejo improcedência purgação mora tempestiva"
    ),
    ...par(
      "usucapião extraordinária posse mansa quinze anos procedência",
      "usucapião improcedência posse clandestina interrupção"
    ),
    ...par(
      "cobrança cotas condominiais procedência título",
      "cota condominial improcedência assembleia irregular rateio"
    ),
    ...par(
      "consignação aluguéis recusa locador procedência",
      "consignação aluguel improcedência mora locatário"
    ),
  ],
  "tjsp"
);

/** Lote 73 — Família. */
export const TERMOS_LOTE_73: TermoSeed[] = noTribunal(
  [
    ...par(
      "alimentos necessidade possibilidade binômio procedência",
      "alimentos improcedência ausência prova necessidade"
    ),
    ...par(
      "guarda compartilhada interesse criança procedência",
      "guarda compartilhada indeferida conflito parental grave"
    ),
    ...par(
      "divórcio partilha bens comuns procedência",
      "partilha improcedência bem particular incomunicabilidade"
    ),
    ...par(
      "cumprimento alimentos prisão civil rito especial",
      "prisão civil alimentos indeferida via expropriatória suficiente"
    ),
  ],
  "tjsp"
);

/** Lote 74 — LGPD / digital. */
export const TERMOS_LOTE_74: TermoSeed[] = noTribunal(
  [
    ...par(
      "LGPD eliminação dados pessoais obrigação fazer procedência",
      "LGPD improcedência base legal legítimo interesse"
    ),
    ...par(
      "vazamento dados pessoais dano moral LGPD procedência",
      "vazamento dados improcedência ausência dano in re ipsa"
    ),
    ...par(
      "tratamento dados sem consentimento ANPD procedência",
      "tratamento dados improcedência hipótese art 7 LGPD"
    ),
  ],
  "stj"
);

/** Lote 75 — Médico. */
export const TERMOS_LOTE_75: TermoSeed[] = noTribunal(
  [
    ...par(
      "erro médico responsabilidade civil nexo causal procedência",
      "erro médico improcedência complicação inerente ausência culpa"
    ),
    ...par(
      "plano saúde negativa cobertura procedimento procedência CDC",
      "negativa cobertura improcedência rol taxativo ANS"
    ),
  ],
  "stj"
);

/** Lote 76 — Mandado de segurança. */
export const TERMOS_LOTE_76: TermoSeed[] = noTribunal(
  [
    ...par(
      "mandado de segurança direito líquido certo prova pré-constituída",
      "mandado segurança denegado prazo 120 dias decadência"
    ),
    ...par(
      "MS licitação edital ilegalidade procedência",
      "MS licitação denegado mérito administrativo discricionariedade"
    ),
  ],
  "stj"
);

/** Lote 77 — Tributo estadual/municipal no TJSP. */
export const TERMOS_LOTE_77: TermoSeed[] = noTribunal(
  [
    ...par(
      "embargos execução fiscal IPTU prescrição procedência",
      "embargos execução fiscal IPTU improcedência CDA líquida certa"
    ),
    ...par(
      "ICMS crédito escritural glosa procedência",
      "ICMS glosa improcedência documentação fiscal irregular"
    ),
    ...par(
      "ISS local prestação serviço LC 116 procedência",
      "ISS improcedência estabelecimento prestador município diverso"
    ),
  ],
  "tjsp"
);

/** Lote 78 — Marítimo no STJ (lote 41 vazio no TJSP). */
export const TERMOS_LOTE_78: TermoSeed[] = noTribunal(
  [
    ...par(
      "transporte marítimo avaria carga responsabilidade armador",
      "transporte marítimo improcedência caso fortuito"
    ),
    ...par(
      "conhecimento embarque execução título",
      "conhecimento embarque vício emissão improcedência"
    ),
    ...par(
      "práticas portuárias tarifa abusiva ANTAQ",
      "tarifa portuária tabela regulada válida"
    ),
  ],
  "stj"
);

/** Lote 79 — Conselhos profissionais no STJ (lote 50 vazio). */
export const TERMOS_LOTE_79: TermoSeed[] = noTribunal(
  [
    ...par(
      "OAB processo disciplinar nulidade cerceamento defesa",
      "OAB processo disciplinar contraditório observado"
    ),
    ...par(
      "CRM sanção médica proporcionalidade",
      "CRM cassação infração ética comprovada"
    ),
    ...par(
      "CREA exercício irregular engenharia multa",
      "CREA atividade não privativa improcedência"
    ),
  ],
  "stj"
);

/** Lote 80 — Ambiental / saúde no STJ (reforço do 56). */
export const TERMOS_LOTE_80: TermoSeed[] = noTribunal(
  [
    ...par(
      "ACP ambiental recuperação área degradada procedência",
      "ACP ambiental ausência dano comprovado improcedência"
    ),
    ...par(
      "medicamento alto custo SUS fornecimento STJ temas",
      "medicamento SUS ausência registro ANVISA improcedência"
    ),
    ...par(
      "home care plano saúde continuidade tratamento",
      "home care alta hospitalar critérios médicos"
    ),
  ],
  "stj"
);

export const LOTES_65_A_80: Record<number, TermoSeed[]> = {
  65: TERMOS_LOTE_65,
  66: TERMOS_LOTE_66,
  67: TERMOS_LOTE_67,
  68: TERMOS_LOTE_68,
  69: TERMOS_LOTE_69,
  70: TERMOS_LOTE_70,
  71: TERMOS_LOTE_71,
  72: TERMOS_LOTE_72,
  73: TERMOS_LOTE_73,
  74: TERMOS_LOTE_74,
  75: TERMOS_LOTE_75,
  76: TERMOS_LOTE_76,
  77: TERMOS_LOTE_77,
  78: TERMOS_LOTE_78,
  79: TERMOS_LOTE_79,
  80: TERMOS_LOTE_80,
};

export const ROTULO_LOTE_65_80: Record<number, string> = {
  65: "TJSP qualidade JEC (execução, juros, vício, ICMS/IPTU)",
  66: "TJRJ · JEC + CDC",
  67: "TJMG · JEC + CDC",
  68: "TJPR · JEC + CDC",
  69: "TJRS · JEC + CDC",
  70: "Penal comum · STJ",
  71: "JECRIM · TJSP",
  72: "Imobiliário 8.245 · TJSP",
  73: "Família · TJSP",
  74: "LGPD / digital · STJ",
  75: "Médico · STJ",
  76: "Mandado de segurança · STJ",
  77: "ICMS/IPTU/ISS · TJSP",
  78: "Marítimo · STJ (retoma lote 41)",
  79: "Conselhos profissionais · STJ (retoma lote 50)",
  80: "Ambiental / saúde · STJ (reforço 56)",
};

export const LOTE_MAX_EXPANDIDO = 80;

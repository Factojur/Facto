/**
 * Lotes 81–96 — TJs ainda rasos + reforço TJSP + CARF de volta.
 *
 * 81: CARF (repor o que o lote 64 quase não rendeu: IRPJ/CSLL/PIS, não ITCMD)
 * 82–86: TJCE, TJGO, TJMA, TJMT, TJSC (JEC + CDC, um tribunal por vez)
 * 87–88: TJSP reforço (processo do Juizado + consumidor volume)
 * 89–93: demais TJs com imobiliário, família, JECRIM (como o TJSP já teve)
 * 94–95: retoma lotes vazios 74 (LGPD) e 77 (IPTU/ISS) em tribunal estadual
 * 96: CARF II (lançamento, multa, compensação)
 *
 * Depois de 65–80: npx tsx scripts/seed-juris-ai-faixa.ts 81 96
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

/** Pacote curto JEC/CDC — mesmos eixos do 66–69, queries um pouco diferentes. */
const JEC_CDC: TermoSeed[] = [
  ...par(
    "juizado especial cível indenização dano moral CDC procedência",
    "juizado especial cível improcedência mero aborrecimento"
  ),
  ...par(
    "negativação indevida SPC SERASA dano moral in re ipsa",
    "negativação débito exigível exercício regular do direito"
  ),
  ...par(
    "golpe pix instituição financeira falha segurança Súmula 479",
    "golpe pix culpa exclusiva da vítima fortuito interno"
  ),
  ...par(
    "execução título extrajudicial juizado penhora",
    "embargos execução juizado excesso iliquidez"
  ),
  ...par(
    "revisão juros remuneratórios CDC taxa média mercado",
    "juros contratuais liberdade pactuação taxa mercado"
  ),
  ...par(
    "vício produto CDC substituição restituição preço",
    "vício produto mau uso prazo decadencial CDC"
  ),
];

const IMOB_FAM: TermoSeed[] = [
  ...par(
    "despejo falta de pagamento lei 8245 locação urbana",
    "despejo purgação da mora tempestiva lei 8245"
  ),
  ...par(
    "usucapião extraordinária posse mansa pacífica",
    "usucapião posse clandestina interrupção"
  ),
  ...par(
    "cobrança cotas condominiais inadimplência",
    "cota condominial assembleia irregular rateio"
  ),
  ...par(
    "alimentos binômio necessidade possibilidade",
    "alimentos ausência prova necessidade"
  ),
  ...par(
    "guarda compartilhada interesse da criança",
    "guarda compartilhada conflito parental grave"
  ),
  ...par(
    "divórcio partilha comunhão parcial bens",
    "partilha bem particular incomunicabilidade"
  ),
];

const JECRIM: TermoSeed[] = [
  ...par(
    "transação penal juizado especial criminal lei 9099",
    "transação penal indeferida reincidência"
  ),
  ...par(
    "composição civil danos juizado criminal homologação",
    "composição civil não homologada ação pública"
  ),
  ...par(
    "recurso inominado juizado especial criminal",
    "recurso inominado JECRIM intempestivo"
  ),
  ...par(
    "suspensão condicional do processo art 89 lei 9099",
    "sursis processual pena mínima superior um ano"
  ),
  ...par(
    "queixa-crime juizado especial criminal calúnia injúria",
    "queixa-crime rejeitada decadência representação"
  ),
  ...par(
    "lesão corporal leve juizado criminal composição",
    "vias de fato juizado criminal transação"
  ),
];

/** Lote 81 — CARF (repor: o 64 foi tema de STJ/ITCMD e rendeu quase nada). */
export const TERMOS_LOTE_81: TermoSeed[] = noTribunal(
  [
    ...par(
      "IRPJ glosa despesa operacional lançamento de ofício",
      "IRPJ glosa despesa comprovada escrituração regular"
    ),
    ...par(
      "CSLL base de cálculo adição lucro real",
      "CSLL lançamento decaído art 173 CTN"
    ),
    ...par(
      "PIS COFINS não cumulativo crédito insumos essencialidade",
      "PIS COFINS glosa crédito despesa alheia atividade"
    ),
    ...par(
      "multa de ofício 75 por cento lançamento de ofício",
      "multa qualificada 150 por cento sonegação não comprovada"
    ),
    ...par(
      "compensação tributária não homologada PERDCOMP",
      "compensação homologada crédito líquido certo"
    ),
    ...par(
      "simples nacional exclusão omissão receita",
      "simples nacional manutenção enquadramento regular"
    ),
  ],
  "carf"
);

export const TERMOS_LOTE_82 = noTribunal(JEC_CDC, "tjce");
export const TERMOS_LOTE_83 = noTribunal(JEC_CDC, "tjgo");
export const TERMOS_LOTE_84 = noTribunal(JEC_CDC, "tjma");
export const TERMOS_LOTE_85 = noTribunal(JEC_CDC, "tjmt");
export const TERMOS_LOTE_86 = noTribunal(JEC_CDC, "tjsc");

/** Lote 87 — TJSP processo do JEC (além do lote 65). */
export const TERMOS_LOTE_87: TermoSeed[] = noTribunal(
  [
    ...par(
      "recurso inominado juizado especial cível turma recursal",
      "recurso inominado juizado deserção intempestividade"
    ),
    ...par(
      "revelia juizado especial cível efeitos art 20 lei 9099",
      "revelia juizado não aplicação fato controverso prova"
    ),
    ...par(
      "honorários advocatícios juizado especial sucumbência",
      "honorários juizado sucumbência recíproca compensação"
    ),
    ...par(
      "incompetência territorial juizado especial cível",
      "competência juizado especial cível foro do réu"
    ),
    ...par(
      "tutela de urgência juizado especial cível deferida",
      "tutela antecipada juizado indeferida perigo inverso"
    ),
    ...par(
      "embargos de declaração juizado especial omissão",
      "embargos declaração juizado protelatórios multa"
    ),
  ],
  "tjsp"
);

/** Lote 88 — TJSP consumidor (volume do dia a dia). */
export const TERMOS_LOTE_88: TermoSeed[] = noTribunal(
  [
    ...par(
      "banco tarifa não contratada repetição indébito CDC",
      "tarifa bancária previsão contratual válida"
    ),
    ...par(
      "corte energia elétrica indevido dano moral concessionária",
      "corte energia inadimplência regular notificação"
    ),
    ...par(
      "telefonia cobrança indevida repetição em dobro CDC",
      "telefonia cobrança serviço prestado comprovado"
    ),
    ...par(
      "plano de saúde negativa de cobertura obrigação de fazer",
      "plano saúde cláusula exclusiva procedimento experimental"
    ),
    ...par(
      "compra online atraso entrega CDC arrependimento",
      "compra online prazo razoável caso fortuito"
    ),
    ...par(
      "superendividamento CDC mínimo existencial revisão",
      "superendividamento boa-fé objetiva preservação contrato"
    ),
  ],
  "tjsp"
);

export const TERMOS_LOTE_89 = noTribunal(IMOB_FAM, "tjrj");
export const TERMOS_LOTE_90 = noTribunal(IMOB_FAM, "tjmg");
export const TERMOS_LOTE_91 = noTribunal(JECRIM, "tjpr");
export const TERMOS_LOTE_92 = noTribunal(JECRIM, "tjrs");
export const TERMOS_LOTE_93 = noTribunal(IMOB_FAM, "tjsc");

/** Lote 94 — LGPD no TJ (lote 74 no STJ veio 0). */
export const TERMOS_LOTE_94: TermoSeed[] = [
  ...noTribunal(
    [
      ...par(
        "proteção dados pessoais vazamento dano moral",
        "vazamento dados ausência dano efetivo"
      ),
      ...par(
        "eliminação dados cadastrais obrigação de fazer",
        "tratamento dados base legal contrato"
      ),
      ...par(
        "LGPD consentimento inválido tratamento ilícito",
        "LGPD legítimo interesse controlador"
      ),
    ],
    "tjsp"
  ),
  ...noTribunal(
    [
      ...par(
        "dados pessoais ofensa privacidade indenização",
        "tratamento dados regular informação titular"
      ),
    ],
    "tjmg"
  ),
];

/** Lote 95 — IPTU/ISS (lote 77 no TJSP veio 0). */
export const TERMOS_LOTE_95: TermoSeed[] = [
  ...noTribunal(
    [
      ...par(
        "execução fiscal IPTU CDA prescrição quinquenal",
        "execução fiscal IPTU CDA líquida certa exigível"
      ),
      ...par(
        "ISS serviço prestado outro município LC 116",
        "ISS estabelecimento prestador competência"
      ),
      ...par(
        "ITBI base de cálculo valor venal referência",
        "ITBI valor venal declarado escritura"
      ),
    ],
    "tjsp"
  ),
  ...noTribunal(
    [
      ...par(
        "IPTU progressividade alíquota função social",
        "IPTU alíquota lei municipal válida"
      ),
    ],
    "tjmg"
  ),
];

/** Lote 96 — CARF II (reforço do 81). */
export const TERMOS_LOTE_96: TermoSeed[] = noTribunal(
  [
    ...par(
      "ágio interno amortização glosa IRPJ CSLL",
      "ágio operação legítima substância econômica"
    ),
    ...par(
      "preços de transferência ajuste lançamento",
      "preços transferência método adotado válido"
    ),
    ...par(
      "auto de infração nulidade cerceamento defesa PAF",
      "auto de infração regular contraditório observado"
    ),
    ...par(
      "decadência lançamento art 150 parágrafo 4 CTN",
      "decadência art 173 CTN dolo sonegação"
    ),
    ...par(
      "IRRF rendimento pago pessoa jurídica exterior",
      "IRRF hipótese não incidência tratado"
    ),
    ...par(
      "CSLL trava de 30 por cento prejuízo fiscal",
      "CSLL aproveitamento prejuízo fiscal integral"
    ),
  ],
  "carf"
);

export const LOTES_81_A_96: Record<number, TermoSeed[]> = {
  81: TERMOS_LOTE_81,
  82: TERMOS_LOTE_82,
  83: TERMOS_LOTE_83,
  84: TERMOS_LOTE_84,
  85: TERMOS_LOTE_85,
  86: TERMOS_LOTE_86,
  87: TERMOS_LOTE_87,
  88: TERMOS_LOTE_88,
  89: TERMOS_LOTE_89,
  90: TERMOS_LOTE_90,
  91: TERMOS_LOTE_91,
  92: TERMOS_LOTE_92,
  93: TERMOS_LOTE_93,
  94: TERMOS_LOTE_94,
  95: TERMOS_LOTE_95,
  96: TERMOS_LOTE_96,
};

export const ROTULO_LOTE_81_96: Record<number, string> = {
  81: "CARF I · IRPJ CSLL PIS multa (repor 64)",
  82: "TJCE · JEC + CDC",
  83: "TJGO · JEC + CDC",
  84: "TJMA · JEC + CDC",
  85: "TJMT · JEC + CDC",
  86: "TJSC · JEC + CDC",
  87: "TJSP reforço · processo do JEC",
  88: "TJSP reforço · consumidor volume",
  89: "TJRJ · imobiliário + família",
  90: "TJMG · imobiliário + família",
  91: "TJPR · JECRIM",
  92: "TJRS · JECRIM",
  93: "TJSC · imobiliário + família",
  94: "LGPD · TJSP/TJMG (retoma lote 74)",
  95: "IPTU/ISS/ITBI · TJSP/TJMG (retoma lote 77)",
  96: "CARF II · ágio TP auto infração decadência",
};

export const LOTE_MAX_EXPANDIDO = 96;

/**
 * Conferência orientativa para protocolar (todas as áreas).
 * Lista de leitura — não valida protocolo e não entra na redação.
 * Camada por tribunal/comarca enriquece notas (e-SAJ, PJe, JF…).
 */

import { extrairCidadeUfDoForo } from "@/lib/endereco-comarca";

export type DocConferenciaItem = {
  id: string;
  label: string;
  nota?: string;
};

export type TribunalProtocoloId =
  | "tjsp"
  | "trt2"
  | "trt15"
  | "jfsp"
  | "stf"
  | "tst"
  | "tre"
  | "generico";

export type ContextoConferenciaProtocolo = {
  areaId: string;
  foro?: string;
  numeroProcesso?: string;
};

export const DOCS_CONFERENCIA_PROTOCOLO_BASE: DocConferenciaItem[] = [
  {
    id: "peca",
    label: "Peça / petição em PDF (gerada no FACTO e revisada)",
  },
  {
    id: "identidade",
    label: "Documento de identidade e CPF (ou CNH) da parte",
  },
  {
    id: "residencia",
    label: "Comprovante de residência",
    nota: "Algumas unidades aceitam declaração — confira o juízo.",
  },
  {
    id: "procuracao",
    label: "Procuração ad judicia / substabelecimento (se houver advogado)",
  },
  {
    id: "provas",
    label: "Provas do fato (contratos, prints, notas, laudos, fotos, B.O.)",
  },
  {
    id: "docs_citados",
    label: "Documentos citados na peça e que serão juntados",
  },
  {
    id: "hipossuficiencia",
    label: "Declaração de hipossuficiência",
    nota: "Somente se pediu justiça gratuita na peça.",
  },
  {
    id: "mle",
    label: "Documentos do Mandado de Levantamento Eletrônico (MLE)",
    nota: "Somente se houver valores a levantar / pedido de MLE.",
  },
  {
    id: "titulo_calculo",
    label: "Título, sentença, acordo ou planilha de cálculo",
    nota: "Quando a espécie exigir (execução, embargos, cumprimento).",
  },
  {
    id: "decisao_recorrida",
    label: "Cópia da decisão / sentença recorrida",
    nota: "Em recurso, se o sistema digital não trouxer automaticamente.",
  },
];

export function mesclarNotasConferencia(
  base: DocConferenciaItem[],
  notasPorId: Record<string, string>
): DocConferenciaItem[] {
  return base.map((item) =>
    notasPorId[item.id]
      ? { ...item, nota: notasPorId[item.id] }
      : item
  );
}

export function docsConferenciaDaArea(areaId: string): DocConferenciaItem[] {
  const semMle =
    areaId === "criminal" ||
    areaId === "jecr" ||
    areaId === "eleitoral" ||
    areaId === "constitucional";
  let itens = DOCS_CONFERENCIA_PROTOCOLO_BASE.filter(
    (d) => !(semMle && d.id === "mle")
  );
  if (areaId === "jec") {
    itens = mesclarNotasConferencia(itens, {
      procuracao:
        "No JEC, a parte pode atuar sozinha em hipóteses da Lei 9.099/95.",
    });
  }
  if (areaId === "trabalhista") {
    itens = mesclarNotasConferencia(itens, {
      procuracao: "Na JT o advogado atua com procuração; jus postulandi tem hipóteses próprias.",
      titulo_calculo: "Planilha de liquidação / sentença, quando a espécie exigir.",
    });
  }
  if (areaId === "familia") {
    itens = mesclarNotasConferencia(itens, {
      identidade: "Documentos das partes e, se houver, das crianças/adolescentes.",
      provas: "Certidões, comprovantes de renda, laudos — o que a peça alega.",
    });
  }
  if (areaId === "previdenciario") {
    itens = mesclarNotasConferencia(itens, {
      provas: "CNIS, cartas INSS, laudos e comprovante do pedido administrativo, se houver.",
    });
  }
  if (areaId === "criminal" || areaId === "jecr") {
    itens = mesclarNotasConferencia(itens, {
      provas: "Peças do inquérito/processo, certidões e o que a defesa ou a queixa alega.",
      titulo_calculo: "Não se aplica a levantamento cível — ignore se a peça for penal.",
    });
  }
  if (areaId === "constitucional") {
    itens = mesclarNotasConferencia(itens, {
      provas:
        "Prova pré-constituída (MS), decisão paradigma (reclamação/RE), lei impugnada (ADI/ADPF) — o que a peça alega.",
      titulo_calculo: "Em regra não há levantamento cível — ignore se inaplicável.",
    });
  }
  return itens;
}

const NOTAS_TRIBUNAL: Record<
  TribunalProtocoloId,
  Partial<Record<string, string>> & { _cabecalho?: string }
> = {
  tjsp: {
    _cabecalho:
      "TJSP — costuma usar e-SAJ (Peticionamento Eletrônico). PDF legível; peça principal separada dos anexos.",
    peca: "Petição em PDF; evite scan ilegível — algumas unidades rejeitam.",
    provas: "Anexos em PDF separados; vínculo claro com o fato alegado.",
    procuracao: "Procuração com poderes específicos se houver acordo ou MLE.",
    docs_citados: "Junte só o que a peça cita — o e-SAJ lista por tipo de documento.",
  },
  trt2: {
    _cabecalho:
      "TRT-2 (SP) — PJe-JT. Verifique planilha/cálculos em anexo quando pedir diferenças.",
    titulo_calculo: "Liquidação trabalhista: planilha ou laudo contábil.",
    provas: "CTPS, holerites, TRCT, comunicações — em PDF legível.",
  },
  trt15: {
    _cabecalho: "TRT-15 (Campinas interior) — PJe-JT; mesmas boas práticas do TRT-2.",
  },
  jfsp: {
    _cabecalho:
      "Justiça Federal (JFSP) — PJe ou e-Proc conforme a seção. CNIS/INSS em previdenciário.",
    provas: "Processo administrativo INSS, CNIS atualizado e laudos em PDF.",
  },
  stf: {
    _cabecalho:
      "STF — peticionamento eletrônico próprio; remédios constitucionais exigem prova pré-constituída ou paradigma.",
    provas: "MS: prova pré-constituída; ADI/ADPF: lei ou ato impugnado.",
    decisao_recorrida: "Peça recorrida / decisão impugnada conforme o rito.",
  },
  tst: {
    _cabecalho: "TST — recurso de revista e afins via PJe; atenção a preparo e cópias.",
  },
  tre: {
    _cabecalho:
      "Justiça Eleitoral — prazos fatais; confira cartório/zona (PJe Eleitoral quando disponível).",
  },
  generico: {
    _cabecalho:
      "Confira o portal do tribunal da comarca (e-SAJ, PJe, Projudi ou presencial).",
  },
};

/** Infere tribunal de protocolo a partir de área, foro e CNJ (quando houver). */
export function inferirTribunalProtocolo(
  ctx: ContextoConferenciaProtocolo
): TribunalProtocoloId {
  const { areaId, foro = "", numeroProcesso = "" } = ctx;
  const cnj = numeroProcesso.replace(/\D/g, "");
  if (cnj.length >= 20) {
    const j = cnj.charAt(13);
    const tr = cnj.substring(14, 16);
    if (j === "5") {
      if (tr === "02") return "trt2";
      if (tr === "15") return "trt15";
      return "tst";
    }
    if (j === "4") return "jfsp";
    if (j === "8" && tr === "26") return "tjsp";
  }

  const { uf } = extrairCidadeUfDoForo(foro);
  const foroL = foro.toLowerCase();

  if (areaId === "constitucional") return "stf";
  if (areaId === "trabalhista") {
    if (uf === "SP" || /trt\s*-?\s*2|campinas|são paulo|sao paulo/i.test(foro)) {
      return "trt2";
    }
    return "tst";
  }
  if (areaId === "previdenciario" || areaId === "tributario") {
    return "jfsp";
  }
  if (areaId === "eleitoral") return "tre";
  if (
    uf === "SP" ||
    /tjsp|e-saj|esaj|comarca de.*sp\b/i.test(foroL) ||
    ["jec", "civil", "consumidor", "familia", "imobiliario", "medico", "digital"].includes(
      areaId
    )
  ) {
    return "tjsp";
  }
  return "generico";
}

export function rotuloTribunalProtocolo(id: TribunalProtocoloId): string {
  switch (id) {
    case "tjsp":
      return "TJSP (e-SAJ)";
    case "trt2":
      return "TRT-2";
    case "trt15":
      return "TRT-15";
    case "jfsp":
      return "JFSP";
    case "stf":
      return "STF";
    case "tst":
      return "TST";
    case "tre":
      return "TRE";
    default:
      return "Tribunal (genérico)";
  }
}

export function cabecalhoConferenciaTribunal(
  tribunalId: TribunalProtocoloId
): string | undefined {
  return NOTAS_TRIBUNAL[tribunalId]?._cabecalho ?? NOTAS_TRIBUNAL.generico._cabecalho;
}

export function docsConferenciaComTribunal(
  ctx: ContextoConferenciaProtocolo
): {
  tribunalId: TribunalProtocoloId;
  tribunalRotulo: string;
  itens: DocConferenciaItem[];
} {
  const tribunalId = inferirTribunalProtocolo(ctx);
  const base = docsConferenciaDaArea(ctx.areaId);
  const camada = NOTAS_TRIBUNAL[tribunalId] ?? NOTAS_TRIBUNAL.generico;
  const notas: Record<string, string> = {};
  for (const [id, nota] of Object.entries(camada)) {
    if (id === "_cabecalho" || !nota) continue;
    notas[id] = nota;
  }
  return {
    tribunalId,
    tribunalRotulo: rotuloTribunalProtocolo(tribunalId),
    itens: mesclarNotasConferencia(base, notas),
  };
}

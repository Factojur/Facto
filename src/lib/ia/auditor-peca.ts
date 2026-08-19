/**
 * Auditor da minuta — regras, 0 tokens.
 * Citações, espécie vs último ato, endereçamento, epígrafe, lacunas e pedidos.
 */

import type { CitacaoVerificada } from "@/lib/ia/verificacao-citacoes";
import { MARCADOR_NAO_ENCONTRADO } from "@/lib/ia/verificacao-citacoes";
import {
  ajustarEspecieCabivel,
  incidenteExecucaoJaAberto,
} from "@/lib/peca-cabivel-autos";
import {
  pecaUsaPartesJaQualificadas,
  nomesAutoresCurto,
  nomesReusCurto,
} from "@/lib/partes-ja-qualificadas";
import { idsPeticaoInicialDaArea, tituloPecaDaArea } from "@/lib/peca-especie-area";
import { areaMostraMle } from "@/lib/minuta-modulo";
import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";

export type GravidadeAuditor = "bloqueante" | "alerta" | "info";

export type AchadoAuditor = {
  id: string;
  gravidade: GravidadeAuditor;
  titulo: string;
  detalhe: string;
};

export type ResultadoAuditorPeca = {
  achados: AchadoAuditor[];
  status: "ok" | "parcial";
  detalhe: string;
};

export type AuditorPecaParams = {
  peca: string;
  areaId?: string;
  especie?: string | null;
  tipoAcao?: string | null;
  fatos?: string | null;
  numeroProcesso?: string | null;
  pecaInaugural?: boolean;
  pedirJusticaGratuita?: boolean;
  temMle?: boolean;
  comReconvencao?: boolean;
  pedidosUsuario?: string[] | null;
  citacoes?: CitacaoVerificada[] | null;
  marcadoresNaoEncontrado?: number;
  autores?: AutorValue[] | null;
  reus?: ReuValue[] | null;
};

function blob(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function cabeca(peca: string, n = 2800): string {
  return peca.slice(0, n);
}

function secaoPedidos(peca: string): string {
  const m = peca.match(
    /(?:DOS?\s+PEDIDOS?|DO\s+REQUERIMENTO|PEDE(?:-SE)?(?:\s+AINDA)?)\s*[:.\n]([\s\S]{0,8000}?)(?=\n\s*NESTES TERMOS|\n\s*Termos em que|\n\s*Pede deferimento|$)/i
  );
  return m?.[1] ?? peca.slice(Math.floor(peca.length * 0.55));
}

function tituloAparente(peca: string): string {
  const linhas = peca.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const l of linhas) {
    if (/EXCELENT[IÍ]SSIM/i.test(l)) continue;
    if (/^(DA COMARCA|JU[IÍ]ZO|FORO|TURMA RECURSAL|TRIBUNAL)/i.test(l)) continue;
    if (/processo\s*n/i.test(l)) continue;
    if (
      /^(autor|r[eé]u|exequente|executad|reclamante|reclamado|reconvinte|reconvindo)\s*:/i.test(
        l
      )
    ) {
      continue;
    }
    if (l.length >= 10 && l === l.toUpperCase() && /[A-ZÁÉÍÓÚÃÕ]{5}/.test(l)) {
      return l;
    }
  }
  return "";
}

function pistaTituloDaEspecie(especie: string): RegExp | null {
  const e = especie.toLowerCase();
  if (e.includes("embargos")) return /embargos/i;
  if (e.includes("agravo")) return /agravo/i;
  if (e.includes("contestacao") || e.includes("reconvencao")) return /contesta/i;
  if (e.includes("replica")) return /r[eé]plica/i;
  if (e.includes("cumprimento")) return /cumprimento/i;
  if (e === "execucao" || e === "execucao-titulo") return /execu[cç][aã]o/i;
  if (e.includes("apelacao")) return /apela[cç][aã]o/i;
  if (e.includes("recurso")) return /recurso/i;
  if (e.includes("defesa") || e.includes("resposta")) return /defesa|resposta/i;
  if (e.includes("mandado-seguranca") || e === "ms") return /mandado de seguran/i;
  return null;
}

function push(
  achados: AchadoAuditor[],
  id: string,
  gravidade: GravidadeAuditor,
  titulo: string,
  detalhe: string
) {
  achados.push({ id, gravidade, titulo, detalhe });
}

export function auditarPecaGerada(
  params: AuditorPecaParams
): ResultadoAuditorPeca {
  const peca = params.peca ?? "";
  const achados: AchadoAuditor[] = [];
  const areaId = params.areaId ?? "jec";
  const especie = String(params.especie ?? "").trim();
  const t = blob(peca);
  const head = cabeca(peca);
  const headBlob = blob(head);
  const inaugural =
    params.pecaInaugural ??
    !pecaUsaPartesJaQualificadas(especie, idsPeticaoInicialDaArea(areaId));

  if (peca.trim().length < 400) {
    push(
      achados,
      "peca-curta",
      "bloqueante",
      "Minuta curta demais",
      "O texto gerado não tem extensão de peça. Gere de novo."
    );
  }

  if (!/excelent[ií]ssim|notifica[cç][aã]o extrajudicial/i.test(head)) {
    push(
      achados,
      "sem-enderecamento",
      "alerta",
      "Endereçamento ausente",
      "A minuta não começa com o órgão julgador (Excelentíssimo…)."
    );
  }

  if (!inaugural && /_{3,}\s*vara/i.test(head)) {
    push(
      achados,
      "vara-em-branco",
      "alerta",
      "Vara em branco na peça incidental",
      "Peça incidental não deve levar “___ VARA”. Confira o foro na Identificação."
    );
  }

  if (/\[endere[cç]o do advogado\]/i.test(peca)) {
    push(
      achados,
      "end-advogado",
      "alerta",
      "Endereço do advogado em branco",
      "Preencha o endereço no Perfil ou no timbre do escritório e gere de novo."
    );
  }

  if (/\[endere[cç]o completo\]/i.test(peca) && inaugural) {
    push(
      achados,
      "end-parte",
      "alerta",
      "Endereço da parte em branco",
      "Há “[endereço completo]” na qualificação. Complete o polo na Identificação."
    );
  }

  if (/oab\/\s*\[uf\]/i.test(peca) || /oab\/[a-z]{2}\s+0{3,}/i.test(peca)) {
    push(
      achados,
      "oab-placeholder",
      "info",
      "OAB ainda como modelo",
      "A assinatura está com OAB/[UF] ou zeros. Preencha a OAB no Perfil."
    );
  }

  if (/\[\[espaco/i.test(peca)) {
    push(
      achados,
      "marcador-interno",
      "alerta",
      "Marcador interno visível",
      "Sobrou um marcador de formatação na minuta. Gere de novo."
    );
  }

  if (especie) {
    const ajustada = ajustarEspecieCabivel({
      areaId,
      especie,
      tipoAcao: params.tipoAcao,
      fatos: params.fatos,
    });
    if (ajustada !== especie) {
      const tituloCabivel = tituloPecaDaArea(areaId, ajustada);
      push(
        achados,
        "especie-cabivel",
        "bloqueante",
        "Espécie provavelmente errada",
        `Os fatos indicam ${tituloCabivel} (não reabrir ${especie.replace(/-/g, " ")}). Troque o tipo de peça e gere de novo.`
      );
    } else if (
      incidenteExecucaoJaAberto(`${params.tipoAcao ?? ""} ${params.fatos ?? ""}`) &&
      /^(execucao|cumprimento-sentenca|cumprimento-alimentos|execucao-titulo)$/.test(
        especie
      )
    ) {
      push(
        achados,
        "reabre-execucao",
        "bloqueante",
        "Reabre cumprimento já instaurado",
        "O relato descreve cumprimento/execução em curso. Esta minuta não deve ser de abertura do incidente."
      );
    }

    const titulo = tituloAparente(peca);
    const pista = pistaTituloDaEspecie(especie);
    if (
      titulo &&
      pista &&
      !pista.test(titulo) &&
      /cumprimento de senten/i.test(titulo) &&
      /embargos|agravo|contesta|recurso/i.test(especie)
    ) {
      push(
        achados,
        "titulo-vs-especie",
        "alerta",
        "Nome da peça não bate com o tipo",
        `O título na minuta (“${titulo.slice(0, 80)}”) não corresponde a ${tituloPecaDaArea(areaId, especie)}.`
      );
    }
  }

  if (
    /vossa excel[eê]ncia\s*[,:]?\s*(embargos|agravo|contesta|recurso|cumprimento|peti[cç]|execu)/i.test(
      peca
    )
  ) {
    push(
      achados,
      "nome-colado",
      "alerta",
      "Nome da peça colado após Vossa Excelência",
      "Faltou o conectivo (opor/interpor/apresentar) antes do nome da peça."
    );
  }

  if (!inaugural) {
    const nProc = String(params.numeroProcesso ?? "").trim();
    if (nProc.length >= 8 && !headBlob.includes(blob(nProc).slice(0, 15))) {
      push(
        achados,
        "epigrafe-processo",
        "alerta",
        "Epígrafe sem o número do processo",
        "O nº informado na Identificação não aparece no cabeçalho da minuta."
      );
    }
    const ativo = nomesAutoresCurto(params.autores);
    const passivo = nomesReusCurto(params.reus);
    if (ativo.length >= 3 && !headBlob.includes(blob(ativo).slice(0, 18))) {
      push(
        achados,
        "epigrafe-ativo",
        "info",
        "Polo ativo pouco visível no cabeçalho",
        "Confira se o nome da parte que você representa está na epígrafe."
      );
    }
    if (passivo.length >= 3 && !headBlob.includes(blob(passivo).slice(0, 18))) {
      push(
        achados,
        "epigrafe-passivo",
        "info",
        "Polo passivo pouco visível no cabeçalho",
        "Confira se o adversário está nomeado na epígrafe."
      );
    }
    if (
      especie &&
      !/j[aá] qualificad/i.test(cabeca(peca, 4500)) &&
      pecaUsaPartesJaQualificadas(especie, idsPeticaoInicialDaArea(areaId))
    ) {
      push(
        achados,
        "ja-qualificado",
        "info",
        "Sem “já qualificado nos autos”",
        "Peça incidental costuma qualificar só pelo nome. Confira o parágrafo das partes."
      );
    }
  }

  const pedidosTxt = secaoPedidos(peca);
  if (
    peca.trim().length >= 400 &&
    !/dos?\s+pedidos?|pede(?:-se)?|requer(?:-se)?/i.test(peca)
  ) {
    push(
      achados,
      "sem-pedidos",
      "alerta",
      "Seção de pedidos não encontrada",
      "A minuta não traz “DOS PEDIDOS” / “requer”. Confira antes de protocolar."
    );
  }

  if (params.pedirJusticaGratuita && !/justi[cç]a gratuita/i.test(pedidosTxt)) {
    push(
      achados,
      "jg-ausente",
      "alerta",
      "Justiça gratuita marcada, mas não pedida",
      "O checkbox de JG estava ligado e o pedido não aparece na minuta."
    );
  }

  if (
    params.temMle &&
    areaMostraMle(areaId) &&
    !/mandado de levantamento|levantamento eletr[oô]nico|\bmle\b/i.test(pedidosTxt)
  ) {
    push(
      achados,
      "mle-ausente",
      "alerta",
      "MLE marcado, mas não pedido",
      "O Mandado de Levantamento Eletrônico estava marcado e não entrou nos pedidos."
    );
  }

  if (
    params.comReconvencao &&
    /contestacao/i.test(especie) &&
    !/contraposto|reconven/i.test(t)
  ) {
    push(
      achados,
      "reconvencao-ausente",
      "alerta",
      "Contraposto/reconvenção marcado e ausente",
      "A contestação deveria incluir o pedido contraposto ou a reconvenção."
    );
  }

  const pedidosUser = (params.pedidosUsuario ?? [])
    .map((p) => p.trim())
    .filter((p) => p.length >= 12)
    .slice(0, 5);
  if (pedidosUser.length > 0) {
    const blobPed = blob(pedidosTxt);
    const faltando = pedidosUser.filter((p) => {
      const palavras = blob(p)
        .split(" ")
        .filter((w) => w.length >= 5)
        .slice(0, 3);
      if (palavras.length === 0) return false;
      return !palavras.some((w) => blobPed.includes(w));
    });
    if (faltando.length === pedidosUser.length) {
      push(
        achados,
        "pedidos-usuario",
        "alerta",
        "Pedidos do formulário não aparecem",
        "Nenhum dos pedidos que você digitou foi localizado na seção final. Confira."
      );
    }
  }

  const citacoes = params.citacoes ?? [];
  const jurisSem = citacoes.filter(
    (c) => c.tipo === "jurisprudencia" && !c.verificada
  );
  if (jurisSem.length > 0) {
    push(
      achados,
      "juris-sem-lastro",
      "alerta",
      "Julgado sem lastro na base",
      `${jurisSem.length} citação(ões) de acórdão/processo sem correspondência na base ou no anexo do caso (marcadas na minuta).`
    );
  }

  const nMarc =
    params.marcadoresNaoEncontrado ??
    (peca.split(MARCADOR_NAO_ENCONTRADO).length - 1);
  if (nMarc > 0 && jurisSem.length === 0) {
    push(
      achados,
      "marcador-base",
      "info",
      "Trecho sem lastro na base",
      `${nMarc} marcador(es) [NÃO ENCONTRADO NA BASE] na minuta.`
    );
  }

  const citOk = citacoes.filter((c) => c.verificada).length;
  const bloqueantes = achados.filter((a) => a.gravidade === "bloqueante").length;
  const alertas = achados.filter((a) => a.gravidade === "alerta").length;
  const status: "ok" | "parcial" =
    bloqueantes > 0 || alertas > 0 || jurisSem.length > 0 ? "parcial" : "ok";

  const partesDetalhe: string[] = [];
  if (citacoes.length > 0) {
    partesDetalhe.push(`${citOk}/${citacoes.length} citações conferidas`);
  } else {
    partesDetalhe.push("forma e espécie conferidas");
  }
  if (bloqueantes) partesDetalhe.push(`${bloqueantes} bloqueante(s)`);
  if (alertas) partesDetalhe.push(`${alertas} alerta(s)`);
  if (status === "ok" && achados.length === 0) {
    partesDetalhe.push("nenhuma lacuna objetiva");
  }

  return {
    achados,
    status,
    detalhe: partesDetalhe.join(" · "),
  };
}

export function mesclarEtapaAuditor<
  T extends {
    id: string;
    skin: string;
    titulo: string;
    status: "ok" | "parcial" | "pulado" | "erro";
    detalhe?: string;
    modelo?: string;
  },
>(equipe: T[] | undefined, auditoria: ResultadoAuditorPeca): T[] {
  const etapa = {
    id: "auditor",
    skin: "Auditor",
    titulo: "Conferência da minuta",
    status: auditoria.status,
    detalhe: auditoria.detalhe,
  } as T;
  const atual = equipe ?? [];
  const i = atual.findIndex((e) => e.id === "auditor");
  if (i >= 0) {
    const next = [...atual];
    next[i] = etapa;
    return next;
  }
  return [...atual, etapa];
}

export function anexarAuditoria<
  T extends {
    peca: string;
    equipeEtapas?: {
      id: string;
      skin: string;
      titulo: string;
      status: "ok" | "parcial" | "pulado" | "erro";
      detalhe?: string;
      modelo?: string;
    }[];
    citacoes?: CitacaoVerificada[];
    marcadoresNaoEncontrado?: number;
  },
>(saida: T, params: Omit<AuditorPecaParams, "peca" | "citacoes" | "marcadoresNaoEncontrado">): T & {
  auditoria: ResultadoAuditorPeca;
  equipeEtapas: {
    id: string;
    skin: string;
    titulo: string;
    status: "ok" | "parcial" | "pulado" | "erro";
    detalhe?: string;
    modelo?: string;
  }[];
} {
  const auditoria = auditarPecaGerada({
    ...params,
    peca: saida.peca,
    citacoes: saida.citacoes,
    marcadoresNaoEncontrado: saida.marcadoresNaoEncontrado,
  });
  return {
    ...saida,
    auditoria,
    equipeEtapas: mesclarEtapaAuditor(saida.equipeEtapas, auditoria),
  };
}

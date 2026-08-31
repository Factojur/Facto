/**
 * Entrada única: relato/PDF → campos do formulário.
 * Não redige a peça. Campo incerto fica vazio.
 * Sem Google Search.
 */

import { ritoDaArea } from "@/lib/area-rito";
import type { PreenchimentoEntradaCaso } from "@/lib/entrada-caso-types";
import {
  gerarTextoComGemini,
  geminiConfigurado,
  MODELOS_TRIAGEM,
} from "@/lib/ia/gemini-client";
import { listaEspeciesDaArea, tituloPecaDaArea } from "@/lib/peca-especie-area";
import { tesesDaArea } from "@/lib/teses-canonicas";
import {
  ajustarEspecieCabivel,
  extrairMetadadosAutos,
  janelaRelatoParaTriagem,
} from "@/lib/peca-cabivel-autos";
import {
  extrairPartesDoRelato,
  mesclarPartesExtraidas,
} from "@/lib/extrair-partes-relato";

function extrairJsonObjeto(texto: string): Record<string, unknown> | null {
  const limpo = texto
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(limpo);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fatiar */
  }
  const inicio = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  if (inicio < 0 || fim <= inicio) return null;
  try {
    const parsed = JSON.parse(limpo.slice(inicio, fim + 1));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) {
    const s = str(v);
    return s ? [s] : [];
  }
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length >= 2)
    .slice(0, 8);
}

function boolOrNull(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "sim", "yes", "1"].includes(s)) return true;
    if (["false", "nao", "não", "no", "0"].includes(s)) return false;
  }
  return null;
}

const VAZIO: PreenchimentoEntradaCaso = {
  especiePeca: null,
  tipoAcao: null,
  fatos: null,
  autoresNomes: [],
  reusNomes: [],
  numeroProcesso: null,
  foro: null,
  cidade: null,
  uf: null,
  numeroVara: null,
  especieDoProcesso: null,
  ultimoAto: null,
  pedidos: [],
  pedirJusticaGratuita: null,
  tutelaUrgencia: null,
  danosMorais: null,
  danosMateriais: null,
  tesesIds: [],
  camposIncertos: ["relato"],
  resumoConferencia: "Não foi possível preencher com segurança. Complete as abas.",
};

export async function preencherEntradaCaso(params: {
  relato: string;
  areaId: string;
}): Promise<PreenchimentoEntradaCaso> {
  const relato = params.relato.trim();
  if (relato.length < 40) return VAZIO;
  if (!geminiConfigurado()) return VAZIO;

  const metaAutos = extrairMetadadosAutos(relato);
  const janela = janelaRelatoParaTriagem(relato);

  const especies = listaEspeciesDaArea(params.areaId) ?? [];
  const idsEspecie = especies.map((e) => e.id);
  const teses = tesesDaArea(params.areaId);
  const rito = ritoDaArea(params.areaId);

  const res = await gerarTextoComGemini({
    systemPrompt: [
      `Você preenche um formulário de minuta (${rito.ritoCurto}).`,
      "NÃO redija a peça. NÃO invente fato, nome, comarca, número de processo ou julgado.",
      "Se não tiver certeza, use null ou []. Nunca chute.",
      "especieDoProcesso = o que os autos JÁ são (incidente em curso).",
      "especiePeca = a peça que o advogado deve PROTOCOLAR AGORA, não o nome do processo já aberto.",
      "Se o cumprimento/execução já está instaurado e há decisão posterior (astreintes, penhora, tutela), NÃO devolva cumprimento-sentenca nem execucao.",
      "Nesse caso: embargos-declaracao (ou embargos no JEC) se o ataque for omissão/contradição/obscuridade/erro material; agravo-instrumento se for reforma de interlocutória na justiça comum.",
      "Devolva APENAS JSON com as chaves pedidas.",
    ].join(" "),
    userPrompt: [
      `Área: ${params.areaId}`,
      `Espécies válidas (id): ${idsEspecie.join(", ") || "(qualquer da área)"}`,
      teses.length
        ? `Teses canônicas (id, só se o relato bater): ${teses.map((t) => t.id).join(", ")}`
        : "Sem teses canônicas nesta área.",
      metaAutos.numeroProcesso
        ? `CNJ extraído: ${metaAutos.numeroProcesso}`
        : "",
      metaAutos.foro ? `Foro extraído: ${metaAutos.foro}` : "",
      "",
      "<RELATO>",
      janela,
      "</RELATO>",
      "",
      "JSON:",
      JSON.stringify({
        especieDoProcesso: "incidente já em curso ou null",
        ultimoAto: "última decisão/despacho em 1 frase ou null",
        especiePeca: "id da lista da PEÇA A PROTOCOLAR AGORA ou null",
        tipoAcao: "nome da peça a protocolar ou null",
        fatos: "narração objetiva em 3ª pessoa do que motivou ESTA peça ou null",
        autoresNomes: ["nomes só se explícitos"],
        reusNomes: ["nomes só se explícitos"],
        numeroProcesso: "CNJ se aparecer, senão null",
        foro: "comarca/foro se aparecer, senão null",
        cidade: "município se aparecer",
        uf: "UF se aparecer",
        numeroVara: "número da vara/juizado se aparecer",
        pedidos: ["pedidos que ESTA peça deve fazer"],
        pedirJusticaGratuita: "true/false/null",
        tutelaUrgencia: "true/false/null",
        danosMorais: "true/false/null",
        danosMateriais: "true/false/null",
        tesesIds: ["ids da lista"],
        camposIncertos: ["campos que você deixou vazio"],
        resumoConferencia: "1 frase do que o advogado deve conferir",
      }),
    ].join("\n"),
    modelos: MODELOS_TRIAGEM,
    temperature: 0.15,
    maxOutputTokens: 4096,
  });

  if (!res.ok) return VAZIO;
  const json = extrairJsonObjeto(res.texto);
  if (!json) return VAZIO;

  const especieRaw = str(json.especiePeca);
  const especiePeca =
    especieRaw && idsEspecie.includes(especieRaw) ? especieRaw : null;
  const tesesIds = strList(json.tesesIds).filter((id) =>
    teses.some((t) => t.id === id)
  );

  const especieAjustada = ajustarEspecieCabivel({
    areaId: params.areaId,
    especie: especiePeca ?? "peticao-inicial",
    tipoAcao: str(json.tipoAcao),
    fatos: [str(json.fatos), str(json.ultimoAto), janela]
      .filter(Boolean)
      .join("\n"),
  });
  const especieFinal =
    especieAjustada && idsEspecie.includes(especieAjustada)
      ? especieAjustada
      : especiePeca;
  const tipoAcao =
    (especieFinal
      ? tituloPecaDaArea(params.areaId, especieFinal, str(json.tipoAcao))
      : null) || str(json.tipoAcao);

  const partesIa = {
    autoresNomes: strList(json.autoresNomes),
    reusNomes: strList(json.reusNomes),
  };
  const partes = mesclarPartesExtraidas(partesIa, extrairPartesDoRelato(relato));

  return {
    especiePeca: especieFinal,
    tipoAcao,
    fatos: str(json.fatos),
    autoresNomes: partes.autoresNomes,
    reusNomes: partes.reusNomes,
    numeroProcesso: str(json.numeroProcesso) || metaAutos.numeroProcesso,
    foro: str(json.foro) || metaAutos.foro,
    cidade: str(json.cidade) || metaAutos.cidade,
    uf: str(json.uf) || metaAutos.uf,
    numeroVara: str(json.numeroVara) || metaAutos.numeroVara,
    especieDoProcesso: str(json.especieDoProcesso),
    ultimoAto: str(json.ultimoAto),
    pedidos: strList(json.pedidos),
    pedirJusticaGratuita: boolOrNull(json.pedirJusticaGratuita),
    tutelaUrgencia: boolOrNull(json.tutelaUrgencia),
    danosMorais: boolOrNull(json.danosMorais),
    danosMateriais: boolOrNull(json.danosMateriais),
    tesesIds,
    camposIncertos: strList(json.camposIncertos),
    resumoConferencia:
      str(json.resumoConferencia) ||
      "Revise as três abas. Nada foi gerado ainda.",
  };
}

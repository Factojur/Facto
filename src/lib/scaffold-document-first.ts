/**
 * Preview document-first (estilo MinutaIA) — 0 tokens.
 * Monta a forma forense a partir de OCR + plano da triagem.
 * NÃO usa o esqueleto antigo do formulário JEC (gerarPecaJec), que inventava
 * fatos genéricos e atrapalhava a confiança do usuário antes do Redigir.
 */

import type { AutorValue } from "@/lib/autor-types";
import type { ReuValue } from "@/lib/reu-types";
import type { ComarcaInfo } from "@/lib/endereco-comarca";
import {
  formatarEnderecamentoPadrao,
  rotuloAreaJudiciaria,
} from "@/lib/endereco-comarca";
import { extrairDadosOcr } from "@/lib/extrair-dados-ocr";
import { gerarDocumentoTimbrado } from "@/lib/formatacao-juridica";
import type { EscritorioConfig } from "@/lib/escritorio-types";
import type { TopicoPlanejado } from "@/lib/ia/plano-topicos-peca";
import { tituloPecaDaArea, idsPeticaoInicialDaArea } from "@/lib/peca-especie-area";
import {
  autoresAPartirDosNomes,
  reusAPartirDosNomes,
  nomesAutoresCurto,
  nomesReusCurto,
  pecaUsaPartesJaQualificadas,
} from "@/lib/partes-ja-qualificadas";
import { montarMarcadorEspaco6, MARCADOR_ESPACO_1, MARCADOR_ESPACO_2 } from "@/lib/formatacao-forense";
import { filtrarRuidoOcrRelato } from "@/lib/filtrar-ruido-ocr-relato";

export type ScaffoldDocumentFirstInput = {
  fatos: string;
  areaId: string;
  especiePeca: string;
  tipoAcao?: string;
  comarca?: Partial<ComarcaInfo> | null;
  autores?: AutorValue[] | null;
  reus?: ReuValue[] | null;
  topicos?: TopicoPlanejado[] | null;
  poloAdvocacia?: "ativo" | "passivo" | null;
  escritorio?: EscritorioConfig;
  autorNome?: string;
  autorOab?: string;
};

function nomeAutor(a: AutorValue): string {
  return a.nomeCompleto?.trim() || "";
}

function nomeReu(r: ReuValue): string {
  if (r.tipo === "pj") {
    return r.razaoSocial?.trim() || r.nomeFantasia?.trim() || "";
  }
  return r.nomeCompleto?.trim() || "";
}

function marcosDoRelato(fatos: string): string[] {
  const limpo = filtrarRuidoOcrRelato(fatos);
  const datas = [...limpo.matchAll(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g)].slice(0, 4);
  const out: string[] = [];
  for (const m of datas) {
    const i = m.index ?? 0;
    const trecho = limpo
      .slice(Math.max(0, i - 40), Math.min(limpo.length, i + 90))
      .replace(/\s+/g, " ")
      .trim();
    if (trecho.length >= 20) out.push(trecho);
  }
  const fls = [...limpo.matchAll(/\bfls?\.?\s*\d{1,4}\b/gi)].slice(0, 5);
  for (const m of fls) {
    out.push(`Referência nos autos: ${m[0]}`);
  }
  return [...new Set(out)].slice(0, 6);
}

/**
 * Peça-esqueleto no formato final (endereçamento, polos, tópicos do plano).
 * Corpo dos fatos/direito = eixos do caso + remissão a fls. — sem template genérico.
 */
export function montarScaffoldDocumentFirst(
  input: ScaffoldDocumentFirstInput
): { peca: string; pecaHtml: string } {
  const ocr = extrairDadosOcr(input.fatos);
  const areaId = input.areaId || "jec";
  const especie = (input.especiePeca || "peticao-inicial")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const titulo =
    tituloPecaDaArea(areaId, especie, input.tipoAcao) ||
    input.tipoAcao?.trim() ||
    ocr.tipoAcaoInferido ||
    "PETIÇÃO";

  const comarca: ComarcaInfo = {
    foro: input.comarca?.foro?.trim() || ocr.foro || undefined,
    uf: input.comarca?.uf?.trim() || ocr.uf || undefined,
    cidade: input.comarca?.cidade?.trim() || undefined,
    numeroProcesso:
      input.comarca?.numeroProcesso?.trim() || ocr.numeroProcesso || undefined,
    numeroJuizado:
      input.comarca?.numeroJuizado?.trim() || ocr.vara || undefined,
  };

  const autores =
    input.autores?.length && input.autores.some((a) => nomeAutor(a))
      ? input.autores
      : autoresAPartirDosNomes(ocr.autores.join("; "));
  const reus =
    input.reus?.length && input.reus.some((r) => nomeReu(r))
      ? input.reus
      : reusAPartirDosNomes(ocr.reus.join("; "));

  const nomeAtivo = nomesAutoresCurto(autores) || ocr.autores[0] || "[parte ativa]";
  const nomePassivo = nomesReusCurto(reus) || ocr.reus[0] || "[parte passiva]";

  const enderecamento = formatarEnderecamentoPadrao({
    comarca,
    areaJudiciaria: rotuloAreaJudiciaria(areaId),
    areaId,
    especiePeca: especie,
    varaEmBranco: !pecaUsaPartesJaQualificadas(
      especie,
      idsPeticaoInicialDaArea(areaId)
    ),
  });

  const processo = comarca.numeroProcesso
    ? `Processo nº: ${comarca.numeroProcesso}`
    : null;

  const topicos =
    input.topicos && input.topicos.length > 0
      ? input.topicos
      : [
          { romano: "I", titulo: "DOS FATOS", subtitulos: [] },
          { romano: "II", titulo: "DO DIREITO", subtitulos: [] },
          { romano: "III", titulo: "DOS PEDIDOS", subtitulos: [] },
        ];

  const marcos = marcosDoRelato(input.fatos);
  const linhas: string[] = [
    enderecamento,
    montarMarcadorEspaco6(processo),
    `Autor(a)/polo ativo: ${nomeAtivo}`,
    MARCADOR_ESPACO_1,
    titulo.toUpperCase(),
    MARCADOR_ESPACO_1,
    `em face de ${nomePassivo}`,
    MARCADOR_ESPACO_2,
  ];

  for (const t of topicos) {
    const tituloLimpo = t.titulo
      .replace(/^[IVXLCDM]+\s*[-—–.]\s*/i, "")
      .trim()
      .toUpperCase();
    const tituloSecao = `${t.romano} - ${tituloLimpo || t.titulo.toUpperCase()}`;
    linhas.push(tituloSecao, "");

    const chave = t.titulo.toLowerCase();
    if (/fato|hist[oó]rico|narrativa|sintese/.test(chave)) {
      linhas.push(
        `Trata-se de ${titulo.toLowerCase()} em favor de ${nomeAtivo} em face de ${nomePassivo}.`
      );
      if (marcos.length) {
        linhas.push(
          "Marcos fáticos e remissões já identificados nos autos (serão desenvolvidos na redação):"
        );
        marcos.forEach((m, i) => {
          linhas.push(`${String.fromCharCode(97 + i)}) ${m}`);
        });
      } else {
        linhas.push(
          "A narrativa forense completa (cronológica, com fls. dos autos) será redigida ao confirmar Redigir."
        );
      }
      if (t.encaixe) {
        linhas.push("", `Encaixe do plano: ${t.encaixe}`);
      }
    } else if (/direito|m[eé]rito|raz[oõ]es|fundament/.test(chave)) {
      if (t.subtitulos.length) {
        t.subtitulos.forEach((s, i) => {
          linhas.push(`${String.fromCharCode(97 + i)}) ${s.toUpperCase()}`);
          linhas.push(
            t.encaixe
              ? `[Fundamentação — ${t.encaixe}]`
              : "[Fundamentação com lastro FACTO e fls. — redação ao confirmar.]"
          );
        });
      } else {
        linhas.push(
          "a) DA FUNDAMENTAÇÃO JURÍDICA",
          "[Teses do plano serão desenvolvidas com lei, súmula e jurisprudência da base FACTO.]"
        );
      }
      if (t.lastro?.length) {
        const refs = t.lastro.map((l) => l.ref).join("; ");
        linhas.push(`Lastro previsto: ${refs}`);
      }
    } else if (/pedido|requer/.test(chave)) {
      if (t.subtitulos.length) {
        t.subtitulos.forEach((s, i) => {
          linhas.push(`${i + 1}) ${s}`);
        });
      } else {
        linhas.push(
          "1) [Pedidos serão redigidos conforme a espécie e o polo da advocacia.]"
        );
      }
    } else {
      if (t.subtitulos.length) {
        t.subtitulos.forEach((s, i) => {
          linhas.push(`${String.fromCharCode(97 + i)}) ${s}`);
        });
      } else if (t.encaixe) {
        linhas.push(t.encaixe);
      } else {
        linhas.push("[Seção será desenvolvida na redação com IA.]");
      }
    }
    linhas.push("");
  }

  const adv = input.autorNome?.trim() || "[NOME DO(A) ADVOGADO(A)]";
  const oab = input.autorOab?.trim() || "OAB/[UF] 000000";
  linhas.push(
    "Nestes termos,",
    "Pede deferimento.",
    "",
    adv,
    oab
  );

  const peca = linhas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const { pecaHtml } = gerarDocumentoTimbrado(
    peca,
    input.escritorio?.usarTimbre ? input.escritorio : undefined
  );
  return { peca, pecaHtml };
}

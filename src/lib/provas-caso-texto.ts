/**
 * Texto extraído de provas do caso — insumo para a IA (não protocolo).
 */

import { extrairTextoArquivoLocal, MIN_CHARS_TEXTO_UTIL } from "@/lib/extrair-texto-cliente";
import {
  MIN_CHARS_OCR_UTIL,
  ocrImagemArquivo,
  ocrPrimeiraPaginaPdf,
  textoOcrUtil,
} from "@/lib/ocr-cliente";
import {
  montarBlocoMatrizProbatória,
  sintetizarProvaLocal,
} from "@/lib/provas-analise-local";

export type ProvaTextoCaso = {
  id: string;
  nome: string;
  /** Texto útil para a IA; vazio em mídia sem transcrição. */
  texto: string;
  tipo: "documento" | "imagem" | "midia";
  /** Resumo heurístico para o advogado e para a matriz probatória. */
  sintese?: string;
  origemTexto?: "nativo" | "ocr" | "nenhum";
};

export const LIMITE_TOTAL_TEXTO_PROVAS = 28_000;

export function provaVazia(partial?: Partial<ProvaTextoCaso>): ProvaTextoCaso {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `prova-${Date.now()}`,
    nome: "",
    texto: "",
    tipo: "documento",
    ...partial,
  };
}

function tipoDeArquivo(file: File): ProvaTextoCaso["tipo"] {
  const m = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  if (m.startsWith("image/") || /\.(heic|heif|webp|jpe?g|png|gif|bmp|tif?f)$/.test(n)) {
    return "imagem";
  }
  if (m.startsWith("audio/") || m.startsWith("video/")) return "midia";
  return "documento";
}

function finalizarProva(
  base: ProvaTextoCaso,
  texto: string,
  origem: ProvaTextoCaso["origemTexto"]
): ProvaTextoCaso {
  const t = texto.trim();
  return {
    ...base,
    texto: t,
    origemTexto: origem,
    sintese: sintetizarProvaLocal(base.nome, t),
  };
}

async function extrairTextoComOcr(
  file: File,
  tipo: ProvaTextoCaso["tipo"]
): Promise<{ texto: string; origem: ProvaTextoCaso["origemTexto"]; aviso?: string }> {
  if (tipo === "imagem") {
    try {
      const ocr = await ocrImagemArquivo(file);
      if (textoOcrUtil(ocr)) {
        return { texto: ocr, origem: "ocr" };
      }
    } catch {
      /* fallback abaixo */
    }
    return {
      texto: "",
      origem: "nenhum",
      aviso: `“${file.name}”: OCR não extraiu texto legível — cite pelo nome.`,
    };
  }

  if (tipo === "documento") {
    try {
      const ocr = await ocrPrimeiraPaginaPdf(file);
      if (textoOcrUtil(ocr)) {
        return {
          texto: ocr,
          origem: "ocr",
          aviso: `“${file.name}”: PDF escaneado — lida a 1ª página via OCR.`,
        };
      }
    } catch {
      /* ignore */
    }
  }

  return { texto: "", origem: "nenhum" };
}

export async function extrairTextosDeProvas(
  files: File[]
): Promise<{ provas: ProvaTextoCaso[]; avisos: string[] }> {
  const provas: ProvaTextoCaso[] = [];
  const avisos: string[] = [];
  let totalChars = 0;

  for (const file of files) {
    const tipo = tipoDeArquivo(file);
    const base = provaVazia({ nome: file.name, tipo });

    if (tipo === "midia") {
      provas.push(
        finalizarProva(base, "", "nenhum")
      );
      continue;
    }

    let texto = "";
    let origem: ProvaTextoCaso["origemTexto"] = "nenhum";

    if (tipo === "documento") {
      try {
        texto = await extrairTextoArquivoLocal(file);
        if (texto.length >= MIN_CHARS_TEXTO_UTIL) {
          origem = "nativo";
        }
      } catch {
        texto = "";
      }

      if (texto.length < MIN_CHARS_TEXTO_UTIL) {
        const ocrRes = await extrairTextoComOcr(file, tipo);
        if (ocrRes.texto.length >= MIN_CHARS_OCR_UTIL) {
          texto = ocrRes.texto;
          origem = ocrRes.origem;
          if (ocrRes.aviso) avisos.push(ocrRes.aviso);
        } else if (ocrRes.aviso) {
          avisos.push(ocrRes.aviso);
        } else {
          avisos.push(
            `“${file.name}”: pouco texto legível — PDF escaneado ou arquivo vazio.`
          );
        }
      }
    } else {
      const ocrRes = await extrairTextoComOcr(file, tipo);
      texto = ocrRes.texto;
      origem = ocrRes.origem;
      if (ocrRes.aviso) avisos.push(ocrRes.aviso);
    }

    if (texto.length < MIN_CHARS_OCR_UTIL) {
      provas.push(finalizarProva(base, "", "nenhum"));
      continue;
    }

    const restante = LIMITE_TOTAL_TEXTO_PROVAS - totalChars;
    const fatiado =
      texto.length > restante ? texto.slice(0, Math.max(0, restante)) : texto;
    totalChars += fatiado.length;
    provas.push(finalizarProva(base, fatiado, origem));
    if (fatiado.length < texto.length) {
      avisos.push(`“${file.name}”: texto truncado para caber no limite da análise.`);
    }
  }

  return { provas, avisos };
}

export function montarBlocoPromptProvasCaso(provas: ProvaTextoCaso[]): string {
  const comTexto = provas.filter((p) => p.texto.trim().length >= 40);
  const soNome = provas.filter((p) => p.texto.trim().length < 40);

  if (!comTexto.length && !soNome.length) return "";

  const linhas = [
    "",
    "<PROVAS_DO_CASO>",
    "Conteúdo probatório informado pelo advogado para SUBSUNÇÃO nos fatos e no direito.",
    "NÃO invente cláusulas, valores ou datas que não estejam aqui ou nos FATOS.",
    "NÃO substitua o tópico DAS PROVAS E ANEXOS — liste os documentos e o link de nuvem quando houver.",
    "Cruze cada documento com a narrativa dos fatos e com os pedidos.",
  ];

  for (const p of comTexto) {
    linhas.push("", `--- ${p.nome} ---`);
    if (p.sintese?.trim()) {
      linhas.push(`Síntese: ${p.sintese.trim()}`);
    }
    linhas.push(p.texto.trim());
  }

  if (soNome.length) {
    linhas.push(
      "",
      "Documentos/mídias sem texto extraído (citar pelo nome em DAS PROVAS):",
      soNome.map((p) => `- ${p.nome} (${p.tipo})`).join("\n")
    );
  }

  linhas.push("</PROVAS_DO_CASO>");
  linhas.push(montarBlocoMatrizProbatória(provas));
  return linhas.filter(Boolean).join("\n");
}

export { montarRelatorioProvasLocal } from "@/lib/provas-analise-local";

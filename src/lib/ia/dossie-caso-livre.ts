/**
 * Dossiê único do caso — relato + orientações + provas + dispositivo.
 * Fonte primária para triagem e redação (estilo leitura global Minuta.ia).
 */

import type { BriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
import { filtrarRuidoOcrRelato } from "@/lib/filtrar-ruido-ocr-relato";
import type { ProvaTextoCaso } from "@/lib/provas-caso-texto";

export type DossieCasoLivre = {
  /** Texto completo para prompts (XML-ish). */
  bloco: string;
  /** Relato principal (fatos + entrada) para queries RAG. */
  relato: string;
};

export function montarDossieCasoLivre(params: {
  fatos: string;
  briefingFormulario?: BriefingCasoLivre | null;
  /** Impugnação estruturada da contestação (espécie réplica). */
  briefingReplica?: string | null;
  dispositivoSentenca?: string | null;
  provas?: ProvaTextoCaso[];
}): DossieCasoLivre {
  const fatos = filtrarRuidoOcrRelato(params.fatos.trim());
  const partes: string[] = [
    "<DOSSIE_DO_CASO>",
    "MODO DOCUMENT-FIRST: os AUTOS/OCR abaixo SÃO o caso.",
    "Mensagens curtas do advogado = instrução de atuação (polo, remédio, ênfase) — não substituem os autos.",
    "Leia o dossiê inteiro antes de planejar e redigir. Aja cirurgicamente em favor do polo indicado.",
    "Ignore lixo de OCR/e-mail (Outlook, cid:, Página X de Y) — não copie isso para a peça.",
    "Campos de formulário, se houver, são pistas fracas; autos e provas prevalecem em conflito.",
    "",
    "<AUTOS_E_RELATO>",
    fatos,
    "</AUTOS_E_RELATO>",
    "",
  ];

  const provas = (params.provas ?? []).filter(
    (p) => (p.texto ?? "").trim().length >= 20 || (p.sintese ?? "").trim().length >= 10
  );
  if (provas.length) {
    partes.push("<PROVAS_E_ANEXOS>");
    for (const p of provas.slice(0, 12)) {
      const nome = p.nome?.trim() || "Documento";
      const sintese = p.sintese?.trim();
      const trecho = (p.texto ?? "").trim().slice(0, 2500);
      partes.push(`• ${nome}`);
      if (sintese) partes.push(`  Síntese: ${sintese}`);
      if (trecho) partes.push(`  Trecho: ${trecho}`);
    }
    partes.push("</PROVAS_E_ANEXOS>", "");
  }

  if (params.dispositivoSentenca?.trim()) {
    partes.push(
      "<DISPOSITIVO_SENTENCA>",
      params.dispositivoSentenca.trim().slice(0, 6000),
      "</DISPOSITIVO_SENTENCA>",
      ""
    );
  }

  if (params.briefingReplica?.trim()) {
    partes.push(
      "<CONTESTACAO_PARA_IMPUGNAR>",
      params.briefingReplica.trim().slice(0, 12_000),
      "</CONTESTACAO_PARA_IMPUGNAR>",
      ""
    );
  }

  if (params.briefingFormulario?.texto.trim()) {
    partes.push(
      "<INSTRUCAO_DO_ADVOGADO>",
      params.briefingFormulario.texto.trim(),
      "</INSTRUCAO_DO_ADVOGADO>",
      ""
    );
  }

  partes.push("</DOSSIE_DO_CASO>");

  const relatoExtra = [
    params.briefingFormulario?.texto ?? "",
    params.briefingReplica ?? "",
    params.dispositivoSentenca ?? "",
    ...provas.map((p) => p.sintese ?? p.texto ?? ""),
    fatos,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    bloco: partes.join("\n"),
    relato: relatoExtra.slice(0, 200_000),
  };
}

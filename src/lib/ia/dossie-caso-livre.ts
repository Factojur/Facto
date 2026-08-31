/**
 * Dossiê único do caso — relato + orientações + provas + dispositivo.
 * Fonte primária para triagem e redação (estilo leitura global Minuta.ia).
 */

import type { BriefingCasoLivre } from "@/lib/ia/briefing-caso-livre";
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
  const fatos = params.fatos.trim();
  const partes: string[] = [
    "<DOSSIE_DO_CASO>",
    "Leia o dossiê inteiro antes de planejar tópicos e pedidos.",
    "Campos do formulário são pistas; o relato e as provas prevalecem em conflito.",
    "",
  ];

  if (params.briefingFormulario?.texto.trim()) {
    partes.push(
      "<ORIENTACOES_FORMULARIO>",
      params.briefingFormulario.texto.trim(),
      "</ORIENTACOES_FORMULARIO>",
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

  if (params.dispositivoSentenca?.trim()) {
    partes.push(
      "<DISPOSITIVO_SENTENCA>",
      params.dispositivoSentenca.trim().slice(0, 6000),
      "</DISPOSITIVO_SENTENCA>",
      ""
    );
  }

  const provas = (params.provas ?? []).filter(
    (p) => (p.texto ?? "").trim().length >= 20 || (p.sintese ?? "").trim().length >= 10
  );
  if (provas.length) {
    partes.push("<SINTESE_PROVAS>");
    for (const p of provas.slice(0, 12)) {
      const nome = p.nome?.trim() || "Documento";
      const sintese = p.sintese?.trim();
      const trecho = (p.texto ?? "").trim().slice(0, 1500);
      partes.push(`• ${nome}`);
      if (sintese) partes.push(`  Síntese: ${sintese}`);
      else if (trecho) partes.push(`  Trecho: ${trecho}`);
    }
    partes.push("</SINTESE_PROVAS>", "");
  }

  partes.push("<RELATO_BRUTO_DO_USUARIO>", fatos, "</RELATO_BRUTO_DO_USUARIO>");
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

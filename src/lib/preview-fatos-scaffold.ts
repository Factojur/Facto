/**
 * Pré-visualização (0 tokens): esqueleto forense — não cola o relato cru em DOS FATOS.
 */

import { detectarTesesCanonicas } from "@/lib/teses-canonicas";
import { moduloDaArea } from "@/lib/minuta-modulo";

function norm(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function fatiarMarcoFatico(bruto: string, index: number): string {
  const inicio = Math.max(0, index - 35);
  const fim = Math.min(bruto.length, index + 85);
  let ctx = bruto.slice(inicio, fim).replace(/\s+/g, " ").trim();
  if (inicio > 0) {
    const corte = ctx.indexOf(" ");
    if (corte > 0 && corte < 12) ctx = ctx.slice(corte + 1).trim();
  }
  if (ctx.length > 150) {
    ctx = ctx.slice(0, 147).replace(/\s+\S*$/, "") + "…";
  }
  return ctx.charAt(0).toUpperCase() + ctx.slice(1);
}

/** Marcos fáticos curtos extraídos do relato (sem repetir o texto inteiro). */
export function extrairMarcosFaticos(fatos: string): string[] {
  const marcos: string[] = [];
  const n = norm(fatos);
  const bruto = fatos.trim();

  for (const m of bruto.matchAll(
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g
  )) {
    const linha = fatiarMarcoFatico(bruto, m.index ?? 0);
    if (linha.length >= 12) {
      marcos.push(linha);
    }
  }

  if (/tutela|urgencia|liminar|restabelecimento|religa/.test(n)) {
    marcos.push("Pedido de tutela de urgência identificado no relato.");
  }
  if (/dano moral|danos morais/.test(n)) {
    const val = bruto.match(/R\$\s*[\d.,]+/i);
    marcos.push(
      val
        ? `Pedido de danos morais (${val[0].trim()}).`
        : "Pedido de danos morais identificado."
    );
  }
  if (/justi[cç]a gratuita|gratuidade|hipossufici/.test(n)) {
    marcos.push("Pedido de justiça gratuita identificado.");
  }
  if (/\bbpc\b|\bloas\b|\binss\b|beneficio|aposentadoria|indefer/.test(n)) {
    marcos.push("Controvérsia previdenciária/benefício perante o INSS.");
  }
  if (/corte|interrup|cao do fornecimento|energia|agua|essencial/.test(n)) {
    marcos.push("Interrupção de serviço essencial ou conduta abusiva de concessionária.");
  }

  const uniq = new Set<string>();
  const out: string[] = [];
  for (const m of marcos) {
    const chave = norm(m);
    if (uniq.has(chave)) continue;
    uniq.add(chave);
    out.push(m);
  }
  return out.slice(0, 5);
}

/** Esqueleto de DOS FATOS para preview — forma forense, sem eco do relato. */
export function montarFatosPreviewScaffold(params: {
  fatos: string;
  tipoAcao: string;
  autoresNomes?: string[];
  reusNomes?: string[];
  areaId?: string;
}): string[] {
  const autor = params.autoresNomes?.[0]?.trim() || "a parte autora";
  const reu = params.reusNomes?.[0]?.trim() || "a parte passiva";
  const acao = params.tipoAcao.trim() || "demanda";
  const marcos = extrairMarcosFaticos(params.fatos);

  const linhas: string[] = [
    `a) Do contexto e do objeto`,
    `Trata-se de ${acao.toLowerCase()} proposta por ${autor} em face de ${reu}. Os fatos serão narrados em ordem cronológica na redação definitiva, com remissão aos documentos indicados no relato.`,
    `b) Dos marcos fáticos identificados`,
  ];

  if (marcos.length > 0) {
    marcos.forEach((m, i) => {
      linhas.push(`${String.fromCharCode(97 + i + 2)}) ${m}`);
    });
  } else {
    linhas.push(
      "c) [Marcos fáticos — serão desenvolvidos na redação com base no relato conferido no assistente.]"
    );
  }

  linhas.push(
    "",
    "[Pré-visualização: esta seção não repete o relato. Confira partes, pedidos e endereçamento; a narrativa completa entra ao confirmar Redigir.]"
  );

  return linhas;
}

/** Esqueleto de DO DIREITO para preview (áreas fora do JEC ou reserva). */
export function montarDireitoPreviewScaffold(params: {
  areaId: string;
  fatos: string;
  tipoAcao: string;
}): string[] {
  const teses = detectarTesesCanonicas(
    params.areaId,
    [params.tipoAcao, params.fatos].filter(Boolean).join("\n")
  ).slice(0, 4);

  const modulo = moduloDaArea(params.areaId);
  const linhas: string[] = [];

  if (teses.length > 0) {
    teses.forEach((t, i) => {
      const letra = String.fromCharCode(97 + i);
      linhas.push(
        `${letra}) ${t.rotulo.toUpperCase()}`,
        `[Desenvolvimento da tese com dispositivos legais e lastro — redação na confirmação (${modulo.tituloDashboard}).]`
      );
    });
  } else {
    linhas.push(
      "a) DA FUNDAMENTAÇÃO JURÍDICA",
      "As teses aplicáveis ao caso serão desenvolvidas na redação com IA, com citações rastreáveis e subsunção aos fatos narrados."
    );
  }

  return linhas;
}

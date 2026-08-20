/**
 * Síntese probatória local (heurística, sem IA) — preview para o advogado
 * e matriz para o prompt de redação.
 */

import type { ProvaTextoCaso } from "@/lib/provas-caso-texto";

const RX_DATA =
  /\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\b/gi;
const RX_VALOR = /R\$\s*[\d.,]+|\b[\d]{1,3}(?:\.[\d]{3})*,[\d]{2}\b/gi;
const RX_PROTOCOLO =
  /\b(?:protocolo|proc(?:esso)?\.?|n[º°.]?\s*\d{7,}|\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/gi;
const RX_EMAIL = /\b[\w.+-]+@[\w.-]+\.\w{2,}\b/gi;
const RX_TELEFONE = /\b(?:\(\d{2}\)\s*)?\d{4,5}[-\s]?\d{4}\b/g;

function uniq<T>(arr: T[], max: number): T[] {
  const s = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = String(item).toLowerCase();
    if (s.has(k)) continue;
    s.add(k);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

function extrairMatches(texto: string, rx: RegExp, max = 4): string[] {
  const m = texto.match(rx);
  return m ? uniq(m.map((x) => x.trim()), max) : [];
}

/** Resumo curto do que o documento traz (datas, valores, protocolos). */
export function sintetizarProvaLocal(nome: string, texto: string): string {
  const t = texto.trim();
  if (t.length < 40) {
    return nome.toLowerCase().includes("print")
      ? "Print/captura de tela — detalhe visual a conferir nos fatos."
      : "Sem texto legível extraído — cite pelo nome na peça.";
  }

  const datas = extrairMatches(t, RX_DATA, 3);
  const valores = extrairMatches(t, RX_VALOR, 3);
  const protocolos = extrairMatches(t, RX_PROTOCOLO, 2);
  const contatos = [
    ...extrairMatches(t, RX_EMAIL, 1),
    ...extrairMatches(t, RX_TELEFONE, 1),
  ];

  const trecho =
    t.length > 220 ? `${t.slice(0, 220).trim()}…` : t;

  const partes: string[] = [];
  if (datas.length) partes.push(`Datas: ${datas.join("; ")}`);
  if (valores.length) partes.push(`Valores: ${valores.join("; ")}`);
  if (protocolos.length) partes.push(`Refs.: ${protocolos.join("; ")}`);
  if (contatos.length) partes.push(`Contato: ${contatos.join("; ")}`);
  partes.push(`Trecho: “${trecho}”`);

  return partes.join(" · ");
}

export function montarRelatorioProvasLocal(
  provas: ProvaTextoCaso[],
  fatos: string
): string {
  if (!provas.length) {
    return "Nenhum documento de prova informado — a peça usará apenas o relato dos fatos.";
  }

  const linhas = [
    "Síntese probatória (extraída dos arquivos — confira antes do protocolo):",
    "",
  ];

  for (const p of provas) {
    const sintese =
      p.sintese?.trim() ||
      sintetizarProvaLocal(p.nome, p.texto);
    const origem =
      p.origemTexto === "ocr"
        ? " [OCR]"
        : p.origemTexto === "nativo"
          ? " [texto]"
          : "";
    linhas.push(`• ${p.nome}${origem}: ${sintese}`);
  }

  const comTexto = provas.filter((p) => p.texto.trim().length >= 40).length;
  linhas.push(
    "",
    `${comTexto} de ${provas.length} arquivo(s) com conteúdo lido para fundamentação.`,
    fatos.trim().length >= 40
      ? "Cruzamento: subsunção nos fatos e no direito será feita na redação da peça."
      : "Informe os fatos para cruzar melhor prova × narrativa."
  );

  return linhas.join("\n");
}

export function montarBlocoMatrizProbatória(
  provas: ProvaTextoCaso[]
): string {
  const comConteudo = provas.filter(
    (p) => (p.sintese?.trim() || p.texto.trim()).length >= 20
  );
  if (!comConteudo.length) return "";

  const linhas = [
    "",
    "<MATRIZ_PROBATORIA>",
    "Use para subsunção — NÃO invente além do que consta aqui e nos FATOS:",
  ];

  for (const p of comConteudo) {
    linhas.push(
      "",
      `Documento: ${p.nome}`,
      `Síntese: ${p.sintese?.trim() || sintetizarProvaLocal(p.nome, p.texto)}`
    );
    if (p.texto.trim().length >= 40) {
      const fatia =
        p.texto.length > 1_800
          ? `${p.texto.slice(0, 1_800)}…`
          : p.texto;
      linhas.push(`Conteúdo: ${fatia.trim()}`);
    }
  }

  linhas.push("</MATRIZ_PROBATORIA>");
  return linhas.join("\n");
}

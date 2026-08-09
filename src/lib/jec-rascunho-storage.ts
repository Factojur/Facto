/**
 * Rascunhos do formulário JEC no navegador (localStorage).
 * Sobrevive a sair do dashboard / F5; anexos de arquivo não são persistidos.
 */

import type { ComarcaValue } from "@/components/dashboard/comarca-form";
import type { PedidoItem } from "@/components/dashboard/pedidos-form";
import type { ValoresPorCategoria } from "@/components/dashboard/valores-causa-form";
import type { ReuValue } from "@/lib/reu-types";
import type { AutorValue } from "@/lib/autor-types";
import type { JurisCasoItem } from "@/lib/juris-caso-types";

export const JEC_RASCUNHOS_KEY = "facto:jec-rascunhos-v1";
export const MAX_RASCUNHOS_JEC = 8;

export type JecRascunhoPayload = {
  fatos: string;
  tipoSelecionado: string;
  /** JEC-1 — espécie da peça. */
  especiePeca?: string;
  tutelaUrgencia: boolean;
  comarca: ComarcaValue;
  valoresCausa: ValoresPorCategoria;
  usaLeiMunicipal: boolean;
  leiMunicipalTexto: string;
  leiMunicipalTitulo: string;
  linkNuvem: string;
  reus: ReuValue[];
  /** Lista de autores (rascunhos antigos podem ter `autor` singular). */
  autores: AutorValue[];
  /** @deprecated use autores */
  autor?: AutorValue | null;
  pedidos: PedidoItem[];
  /** Só texto/metadados — sem base64 de arquivo. */
  jurisCaso: JurisCasoItem[];
};

export type JecRascunhoSalvo = {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  /** Primeiras palavras dos fatos, para o checklist. */
  titulo: string;
  payload: JecRascunhoPayload;
};

function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `jec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function tituloDeFatos(fatos: string): string {
  const limpo = fatos.replace(/\s+/g, " ").trim();
  if (!limpo) return "Rascunho sem texto";
  return limpo.length > 72 ? `${limpo.slice(0, 72)}…` : limpo;
}

export function listarRascunhosJec(): JecRascunhoSalvo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JEC_RASCUNHOS_KEY);
    if (!raw) return [];
    const lista = JSON.parse(raw) as JecRascunhoSalvo[];
    if (!Array.isArray(lista)) return [];
    return lista.sort(
      (a, b) =>
        new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime()
    );
  } catch {
    return [];
  }
}

function gravarLista(lista: JecRascunhoSalvo[]): void {
  localStorage.setItem(JEC_RASCUNHOS_KEY, JSON.stringify(lista));
}

export function salvarRascunhoJec(
  payload: JecRascunhoPayload,
  idExistente?: string,
  tituloOverride?: string
): JecRascunhoSalvo {
  const agora = new Date().toISOString();
  const lista = listarRascunhosJec();
  const existente = idExistente
    ? lista.find((r) => r.id === idExistente)
    : undefined;

  const registro: JecRascunhoSalvo = {
    id: existente?.id ?? novoId(),
    criadoEm: existente?.criadoEm ?? agora,
    atualizadoEm: agora,
    titulo: tituloOverride?.trim() || tituloDeFatos(payload.fatos),
    payload,
  };

  const semAtual = lista.filter((r) => r.id !== registro.id);
  const proxima = [registro, ...semAtual].slice(0, MAX_RASCUNHOS_JEC);
  gravarLista(proxima);
  return registro;
}

export function excluirRascunhoJec(id: string): void {
  gravarLista(listarRascunhosJec().filter((r) => r.id !== id));
}

/** Remove blobs pesados antes de persistir. */
export function payloadLeveParaRascunho(opcoes: {
  fatos: string;
  tipoSelecionado: string;
  especiePeca?: string;
  tutelaUrgencia: boolean;
  comarca: ComarcaValue;
  valoresCausa: ValoresPorCategoria;
  usaLeiMunicipal: boolean;
  leiMunicipalTexto: string;
  leiMunicipalTitulo: string;
  linkNuvem: string;
  reus: ReuValue[];
  autores?: AutorValue[];
  /** @deprecated */
  autor?: AutorValue | null;
  pedidos?: PedidoItem[];
  jurisCaso: Array<{
    id: string;
    tipo: JurisCasoItem["tipo"];
    titulo: string;
    texto: string;
    nomeArquivo?: string | null;
    arquivo?: { nome?: string } | null;
  }>;
}): JecRascunhoPayload {
  return {
    fatos: opcoes.fatos,
    tipoSelecionado: opcoes.tipoSelecionado,
    especiePeca: opcoes.especiePeca,
    tutelaUrgencia: opcoes.tutelaUrgencia,
    comarca: opcoes.comarca,
    valoresCausa: opcoes.valoresCausa,
    usaLeiMunicipal: opcoes.usaLeiMunicipal,
    leiMunicipalTexto: opcoes.leiMunicipalTexto,
    leiMunicipalTitulo: opcoes.leiMunicipalTitulo,
    linkNuvem: opcoes.linkNuvem,
    reus: opcoes.reus.map((r) => ({
      ...r,
      // Nome do anexo pode ficar; o arquivo em si não.
    })),
    autores: opcoes.autores ?? (opcoes.autor ? [opcoes.autor] : []),
    pedidos: opcoes.pedidos ?? [],
    jurisCaso: opcoes.jurisCaso.map((j) => ({
      id: j.id,
      tipo: j.tipo,
      titulo: j.titulo,
      texto: j.texto,
      nomeArquivo: j.nomeArquivo ?? j.arquivo?.nome ?? null,
    })),
  };
}

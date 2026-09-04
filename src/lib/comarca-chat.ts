/**
 * Comarca no chat — edição manual e alerta quando metadados estão fracos (0 tokens).
 */

import type { ComarcaInfo } from "@/lib/endereco-comarca";
import {
  extrairCidadeUfDoForo,
  extrairComponentesForo,
  sanearNomeCidade,
  ufValida,
} from "@/lib/endereco-comarca";

export type NivelComarcaChat = "ok" | "vazia" | "suspeita";

export type AvaliacaoComarcaChat = {
  nivel: NivelComarcaChat;
  /** Mensagem curta para o painel (vazia se ok). */
  mensagem: string;
};

/** Texto exibido / editável do foro no entendimento. */
export function textoForoEditavel(
  comarca: Partial<ComarcaInfo> | null | undefined
): string {
  const foro = (comarca?.foro ?? "").trim();
  if (foro) return foro;
  const cidade = sanearNomeCidade((comarca?.cidade ?? "").trim());
  const uf = (comarca?.uf ?? "").trim().toUpperCase();
  if (cidade && uf) return `${cidade}/${uf}`;
  if (cidade) return cidade;
  return "";
}

/**
 * Aplica o texto digitado pelo advogado ao estado de comarca.
 * Extrai cidade/UF/vara quando possível.
 */
export function aplicarTextoForoAoComarca(
  texto: string,
  atual: Partial<ComarcaInfo> = {}
): Partial<ComarcaInfo> {
  const bruto = texto.replace(/\s+/g, " ").trim();
  if (!bruto) {
    return {
      ...atual,
      foro: "",
      cidade: undefined,
      uf: undefined,
    };
  }

  const comp = extrairComponentesForo(bruto);
  const extra = extrairCidadeUfDoForo(bruto);
  let cidade =
    sanearNomeCidade(comp.cidade) ||
    sanearNomeCidade(extra.cidade) ||
    sanearNomeCidade((atual.cidade ?? "").trim());
  let uf =
    (comp.uf || extra.uf || (atual.uf ?? "")).trim().toUpperCase() || undefined;
  if (uf && !ufValida(uf)) uf = undefined;

  // "Campinas/SP" puro
  if (!cidade || !uf) {
    const m = /^([A-Za-zÀ-ÿ'.\s]{2,40})\s*[\/–-]\s*([A-Za-z]{2})$/.exec(bruto);
    if (m) {
      const c = sanearNomeCidade(m[1]!);
      const u = m[2]!.toUpperCase();
      if (c && ufValida(u)) {
        cidade = c;
        uf = u;
      }
    }
  }

  const numeroJuizado =
    comp.numeroVara ||
    (atual.numeroJuizado ?? "").trim() ||
    undefined;

  const especialidadeVara =
    comp.especialidadeVara ||
    atual.especialidadeVara ||
    null;

  return {
    ...atual,
    foro: bruto,
    cidade: cidade || undefined,
    uf: uf || undefined,
    numeroJuizado: numeroJuizado || undefined,
    especialidadeVara: especialidadeVara || undefined,
  };
}

export function avaliarComarcaChat(
  comarca: Partial<ComarcaInfo> | null | undefined
): AvaliacaoComarcaChat {
  const foro = (comarca?.foro ?? "").trim();
  const cidadeRaw = (comarca?.cidade ?? "").trim();
  const cidade = sanearNomeCidade(cidadeRaw);
  const uf = (comarca?.uf ?? "").trim().toUpperCase();

  if (!foro && !cidade && !uf) {
    return {
      nivel: "vazia",
      mensagem:
        "Comarca não identificada — informe município/UF (ex.: Itararé/SP) antes de redigir, para o cabeçalho sair certo.",
    };
  }

  if (
    cidadeRaw &&
    !cidade &&
    /^(foro|vara|comarca|juizado|f[oó]rum)\b/i.test(cidadeRaw)
  ) {
    return {
      nivel: "suspeita",
      mensagem:
        "A cidade parece ser o nome do órgão (ex.: «Vara de…»). Ajuste para o município/UF reais.",
    };
  }

  if (foro && !cidade && !uf) {
    return {
      nivel: "suspeita",
      mensagem:
        "Foro preenchido, mas sem município/UF claros. Prefira «… de Município/UF».",
    };
  }

  if (cidade && !uf) {
    return {
      nivel: "suspeita",
      mensagem: "Falta a UF (ex.: Campinas/SP).",
    };
  }

  if (uf && !ufValida(uf)) {
    return {
      nivel: "suspeita",
      mensagem: "UF inválida — use a sigla de 2 letras (ex.: SP).",
    };
  }

  return { nivel: "ok", mensagem: "" };
}

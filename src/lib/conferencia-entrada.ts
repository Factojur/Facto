/**
 * Chips da conferência após “Preencher as três abas”.
 * Determinístico — não confia em camposIncertos do Gemini.
 */

import type {
  ChipConferencia,
  ConferenciaEntrada,
  PreenchimentoEntradaCaso,
} from "@/lib/entrada-caso-types";
import { moduloDaArea } from "@/lib/minuta-modulo";
import { metaEspecieDaArea } from "@/lib/peca-especie-area";
import {
  areaUsaPoloAdvocacia,
  inferirPoloPorEspecie,
} from "@/lib/polo-especies-por-area";

export function montarConferenciaEntrada(
  areaId: string,
  preenchimento: PreenchimentoEntradaCaso,
  teses: { id: string; rotulo: string }[]
): ConferenciaEntrada {
  const chips: ChipConferencia[] = [];
  const vazios: string[] = [];
  const modulo = moduloDaArea(areaId);

  const especieId = preenchimento.especiePeca?.trim() || "";
  const metaEsp = especieId ? metaEspecieDaArea(areaId, especieId) : null;
  if (especieId) {
    chips.push({
      chave: "especie",
      rotulo: metaEsp?.rotulo ?? especieId,
      preenchido: true,
    });
  } else {
    chips.push({
      chave: "especie",
      rotulo: "Espécie em branco — escolha na aba",
      preenchido: false,
    });
    vazios.push("espécie");
  }

  if (areaUsaPoloAdvocacia(areaId)) {
    const polo = especieId ? inferirPoloPorEspecie(areaId, especieId) : null;
    if (polo === "ativo") {
      chips.push({
        chave: "polo",
        rotulo: `Polo ${modulo.rotuloPoloAtivo}`,
        preenchido: true,
      });
    } else if (polo === "passivo") {
      chips.push({
        chave: "polo",
        rotulo: `Polo ${modulo.rotuloPoloPassivo}`,
        preenchido: true,
      });
    } else {
      chips.push({
        chave: "polo",
        rotulo: "Polo: conferir (cabe nos dois)",
        preenchido: false,
      });
    }
  }

  if (preenchimento.pedirJusticaGratuita === true) {
    chips.push({ chave: "jg", rotulo: "JG", preenchido: true });
  } else if (preenchimento.pedirJusticaGratuita === false) {
    chips.push({ chave: "jg", rotulo: "Sem JG", preenchido: true });
  } else {
    chips.push({
      chave: "jg",
      rotulo: "JG não marcado",
      preenchido: false,
    });
    vazios.push("justiça gratuita");
  }

  if (teses.length > 0) {
    for (const t of teses) {
      chips.push({ chave: `tese-${t.id}`, rotulo: t.rotulo, preenchido: true });
    }
  } else {
    chips.push({
      chave: "teses",
      rotulo: "Nenhuma tese do código bateu",
      preenchido: false,
    });
  }

  if (preenchimento.ultimoAto?.trim()) {
    chips.push({
      chave: "ultimoAto",
      rotulo: `Último ato: ${preenchimento.ultimoAto.trim().slice(0, 80)}`,
      preenchido: true,
    });
  }

  if (!preenchimento.fatos?.trim()) vazios.push("fatos");
  if (!preenchimento.autoresNomes.length && !preenchimento.reusNomes.length) {
    vazios.push("partes");
  }
  if (
    !preenchimento.foro?.trim() &&
    !preenchimento.cidade?.trim() &&
    !preenchimento.numeroProcesso?.trim()
  ) {
    vazios.push("comarca");
  } else if (!preenchimento.numeroProcesso?.trim()) {
    vazios.push("número do processo");
  }

  return {
    chips,
    vazios,
    resumo: preenchimento.resumoConferencia,
  };
}

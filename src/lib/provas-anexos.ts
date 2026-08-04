/**
 * Link de nuvem (Drive etc.) + lista de anexos na peça JEC.
 * Menção breve em DOS FATOS; tópico completo em PROVAS E ANEXOS (antes dos pedidos).
 */

export function normalizarLinkNuvem(link: string | null | undefined): string | null {
  const t = link?.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function listarNomesArquivos(nomes: string[] | undefined): string {
  if (!nomes?.length) return "nenhum arquivo informado";
  return nomes.join(", ");
}

/** Parágrafo curto ao final de DOS FATOS. */
export function montarMencaoFatosLinkNuvem(link: string): string {
  return (
    "Os documentos, prints e demais elementos de prova também estão disponíveis " +
    `para acesso digital em ambiente de nuvem, no link ${link}, a fim de facilitar ` +
    "a consulta por este Juízo, pela secretaria e pelas partes."
  );
}

/** Corpo do tópico DAS PROVAS E ANEXOS. */
export function montarCorpoProvasAnexos(opcoes: {
  linkNuvem: string | null;
  provas: string[];
  midias: string[];
}): string[] {
  const linhas: string[] = [
    "Instruem a presente demanda os documentos e mídias abaixo relacionados, " +
      "juntados aos autos e/ou disponibilizados em meio digital:",
  ];

  if (opcoes.provas.length > 0) {
    linhas.push(
      `Documentos e imagens probatórias: ${listarNomesArquivos(opcoes.provas)}.`
    );
  }
  if (opcoes.midias.length > 0) {
    linhas.push(
      `Áudios e vídeos: ${listarNomesArquivos(opcoes.midias)}.`
    );
  }
  if (opcoes.provas.length === 0 && opcoes.midias.length === 0) {
    linhas.push(
      "A relação nominal dos arquivos será complementada conforme a juntada efetiva nos autos."
    );
  }

  if (opcoes.linkNuvem) {
    linhas.push(
      "Para acesso integral e organizado do acervo digital (documentos, prints e mídias), " +
        `indica-se o seguinte link de nuvem: ${opcoes.linkNuvem}.`
    );
  }

  return linhas;
}

function romanoSeguinte(atual: string): string {
  const order = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const idx = order.indexOf(atual.toUpperCase());
  if (idx < 0) return "IV";
  return order[Math.min(idx + 1, order.length - 1)]!;
}

/**
 * Injeta menção em DOS FATOS e tópico PROVAS E ANEXOS antes dos pedidos.
 * Idempotente se o link já estiver no texto.
 */
export function injetarProvasELinkNuvem(
  peca: string,
  opcoes: {
    linkNuvem?: string | null;
    provas?: string[];
    midias?: string[];
  }
): string {
  const link = normalizarLinkNuvem(opcoes.linkNuvem ?? null);
  const provas = opcoes.provas ?? [];
  const midias = opcoes.midias ?? [];
  if (!link && provas.length === 0 && midias.length === 0) {
    return peca;
  }

  let texto = peca.replace(/\r\n/g, "\n");

  // Menção breve ao final de DOS FATOS (antes de II - DO DIREITO)
  if (link && !texto.includes(link)) {
    const mencao = montarMencaoFatosLinkNuvem(link);
    if (!/acesso digital em ambiente de nuvem/i.test(texto)) {
      texto = texto.replace(
        /(\nII\s*[-—–.]\s*DO DIREITO)/i,
        `\n${mencao}\n$1`
      );
    }
  }

  // Remove tópico PROVAS antigo se reprocessar
  texto = texto.replace(
    /\n+[IVXLCDM]+\s*[-—–.]\s*DAS PROVAS E ANEXOS\n[\s\S]*?(?=\n+[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS)/i,
    "\n"
  );

  const corpo = montarCorpoProvasAnexos({
    linkNuvem: link,
    provas,
    midias,
  }).join("\n");

  if (/\n[IVXLCDM]+\s*[-—–.]\s*DOS PEDIDOS/i.test(texto)) {
    texto = texto.replace(
      /\n([IVXLCDM]+)\s*[-—–.]\s*DOS PEDIDOS/i,
      (_m, romPedidos: string) => {
        const romProvas = String(romPedidos).toUpperCase();
        const romPed = romanoSeguinte(romProvas);
        return `\n${romProvas} - DAS PROVAS E ANEXOS\n${corpo}\n\n${romPed} - DOS PEDIDOS`;
      }
    );
  } else {
    texto = texto.replace(/\n(Termos em que,)/i, `\nIII - DAS PROVAS E ANEXOS\n${corpo}\n\n$1`);
  }

  return texto;
}

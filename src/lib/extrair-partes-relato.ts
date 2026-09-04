/**
 * Extração determinística de nomes das partes a partir do relato (0 tokens).
 * Fallback quando o preenchimento por IA deixa autoresNomes/reusNomes vazios.
 */

export type PartesExtraidasRelato = {
  autoresNomes: string[];
  reusNomes: string[];
};

const CORTE_NOME =
  /\s+(?:teve|pede|pediu|pretende|ajuizou|entrou|move|prop[oõ]e|contra|em\s+face|versus|vs\.?|foram|foi|com\s+pedido)\b/i;

const STOP_NOME =
  /\b(processo|comarca|juizado|peti[cç][aã]o|danos|tutela|valor|reais|r\$|cpf|cnpj|rg|promoveu|promove|ajuizou|interpoe|interp[oõ]e)\b/i;

function limparNome(bruto: string): string {
  return bruto
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–—:]+|[\s\-–—:.,;]+$/g, "")
    .trim();
}

function cortarQualificacao(s: string): string {
  let t = limparNome(s);
  const virgula = t.indexOf(",");
  if (virgula >= 8) t = t.slice(0, virgula).trim();
  const corte = t.search(CORTE_NOME);
  if (corte >= 8) t = t.slice(0, corte).trim();
  const ponto = t.indexOf(".");
  if (ponto >= 8 && ponto < 80) t = t.slice(0, ponto).trim();
  return t;
}

function pareceNomeParte(nome: string): boolean {
  const t = cortarQualificacao(nome);
  if (/^INSS$/i.test(t)) return true;
  if (t.length < 3 || t.length > 140) return false;
  if (/^\d/.test(t)) return false;
  if (STOP_NOME.test(t)) return false;
  if (/^r\$\s*/i.test(t)) return false;
  if (/\(fls\.?|\bfls\b/i.test(t)) return false;
  if (
    /^(foi|fora|sera|será|esta|está|vive|viveu|conviveu|apresentou|juntou|requereu|postulou)\b/i.test(
      t
    )
  ) {
    return false;
  }
  return /[A-Za-zÀ-ú]/.test(t);
}

function uniqNomes(nomes: string[]): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const bruto of nomes) {
    const n = cortarQualificacao(bruto);
    if (!pareceNomeParte(n)) continue;
    const chave = n.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push(n);
  }
  return out.slice(0, 4);
}

function capturarTodos(texto: string, re: RegExp): string[] {
  const out: string[] = [];
  for (const m of texto.matchAll(re)) {
    const g = m[1]?.trim();
    if (g) out.push(g);
  }
  return out;
}

function deduplicarAutorReu(
  partes: PartesExtraidasRelato
): PartesExtraidasRelato {
  if (!partes.autoresNomes.length) return partes;
  const chavesAutor = new Set(
    partes.autoresNomes.map((n) => n.toLowerCase().trim())
  );
  const reus = partes.reusNomes.filter((r) => {
    const chave = r.toLowerCase().trim();
    if (chavesAutor.has(chave)) return false;
    for (const a of chavesAutor) {
      if (chave.startsWith(a) || a.startsWith(chave)) return false;
    }
    return true;
  });
  return { autoresNomes: partes.autoresNomes, reusNomes: reus };
}

function ajustarPartesBeneficioPrevidenciario(
  texto: string,
  partes: PartesExtraidasRelato
): PartesExtraidasRelato {
  const n = texto.toLowerCase();
  if (!/\bbpc\b|\bloas\b/.test(n)) return partes;

  const filho = texto.match(
    /(?:meu|minha)\s+filh[oa]\s+([A-ZÀ-Ü][a-zà-ú]+(?:\s+[A-ZÀ-Ü][a-zà-ú]+)?)/i
  );
  if (!filho?.[1]) return partes;

  let nomeBenef = filho[1].trim();
  const rep = partes.autoresNomes[0] ?? "";
  const sobrenome = rep.match(/\s([A-ZÀ-Ü][a-zà-ú]+)\s*$/)?.[1];
  if (!nomeBenef.includes(" ") && sobrenome) {
    nomeBenef = `${nomeBenef} ${sobrenome}`;
  }

  const reus =
    partes.reusNomes.length > 0
      ? partes.reusNomes
      : /\binss\b/i.test(texto)
        ? ["INSS"]
        : [];

  return {
    autoresNomes: uniqNomes([nomeBenef]),
    reusNomes: uniqNomes(reus),
  };
}

/**
 * Tenta extrair autor(es) e réu(s) de linguagem natural comum no chat.
 */
export function extrairPartesDoRelato(texto: string): PartesExtraidasRelato {
  const t = String(texto ?? "").trim();
  if (t.length < 20) {
    return { autoresNomes: [], reusNomes: [] };
  }

  // Capa ESAJ / petição: "Requerente:" / "Requerido:" prevalecem sobre prosa.
  const capaAutores = uniqNomes(
    capturarTodos(
      t,
      /(?:^|\n)\s*(?:AUTOR(?:A)?|REQUERENTE|EXEQUENTE|RECLAMANTE)\s*[:\t]\s*([^\n]+)/gim
    )
  );
  const capaReus = uniqNomes(
    capturarTodos(
      t,
      /(?:^|\n)\s*(?:R[EÉ](?:U)?|REQUERID[OA]|EXECUTAD[OA]|RECLAMAD[OA]|RÉU)\s*[:\t]\s*([^\n]+)/gim
    )
  );
  if (capaAutores.length && capaReus.length) {
    return deduplicarAutorReu(
      ajustarPartesBeneficioPrevidenciario(t, {
        autoresNomes: capaAutores,
        reusNomes: capaReus,
      })
    );
  }

  const autores: string[] = [...capaAutores];
  const reus: string[] = [...capaReus];

  autores.push(
    ...capturarTodos(
      t,
      /(?:^|[.\n])\s*(?:O|A)\s+(?:autor(?:a)?|requerente|cliente|postulante|demandante)\s+(?:é\s+|,\s*)?([A-ZÀ-Ü][^\n,.]{2,70})/gim
    ),
    ...capturarTodos(
      t,
      /(?:^|\n)\s*(?:AUTOR(?:A)?|CLIENTE|REQUERENTE)\s*:\s*([^\n]+)/gim
    ),
    ...capturarTodos(
      t,
      /(?:meu|minha)\s+cliente[a]?\s+([A-ZÀ-Ü][a-zà-ú]+(?:\s+(?:de|da|do|dos|das)\s+)?[A-ZÀ-Ü][a-zà-ú]+(?:\s+[A-ZÀ-Ü][a-zà-ú]+)?)/gi
    ),
    ...capturarTodos(
      t,
      /\b(?:sou|eu\s+sou)\s+([A-ZÀ-Ü][a-zà-ú]+(?:\s+(?:de|da|do|dos|das)\s+)?[A-ZÀ-Ü][a-zà-ú]+(?:\s+[A-ZÀ-Ü][a-zà-ú]+)?)\s*,\s*brasileir[oa]/gi
    ),
    ...capturarTodos(
      t,
      /\b(?:autor(?:a)?|cliente)\s+([A-ZÀ-Ü][a-zà-ú]+(?:\s+(?:de|da|do|dos|das)\s+)?[A-ZÀ-Ü][a-zà-ú]+(?:\s+[A-ZÀ-Ü][a-zà-ú]+)?)\b/gi
    ),
    ...capturarTodos(
      t,
      /(?:^|\n)\s*([A-ZÀ-Ü][a-zà-ú]+(?:\s+(?:de|da|do|dos|das)\s+)?[A-ZÀ-Ü][a-zà-ú]+(?:\s+[A-ZÀ-Ü][a-zà-ú]+)?)\s*,\s*brasileir[oa]/gim
    )
  );

  reus.push(
    ...capturarTodos(
      t,
      /\b(?:contra|em\s+face\s+de|versus|vs\.?)\s+(?:a\s+)?([A-ZÀ-Ü0-9][^\n.]{2,120}(?:Ltda\.?|L\.T\.D\.A\.?|S\.?\/?A\.?|ME|EPP|EIRELI|S\.A\.|S\/A)?)/gi
    ),
    ...capturarTodos(
      t,
      /(?:^|[.\n])\s*(?:O|A)\s+(?:INSS|Instituto Nacional do Seguro Social)\b[^\n.]*/gim
    ).map(() => "INSS"),
    ...capturarTodos(
      t,
      /\b(?:a\s+)?([A-ZÀ-Ü][A-Za-zÀ-ú0-9\s]{2,48}(?:São Paulo|Paulo|Ltda|S\.A\.|S\/A)?)\s+cortou\b/gi
    ),
    ...capturarTodos(
      t,
      /(?:^|[.\n])\s*(?:O|A)\s+(?:réu|ré|requerid[oa]|demandad[oa])\s+(?:é\s+|,\s*)?([A-ZÀ-Ü][^\n,.]{2,70})/gim
    ),
    ...capturarTodos(
      t,
      /(?:^|\n)\s*(?:RÉ(?:U)?|REQUERID[OA]|RÉU)\s*:\s*([^\n]+)/gim
    ),
    ...capturarTodos(
      t,
      /\b(?:concession[aá]ria)\s+([A-ZÀ-Ü][^\n,.]{2,90})/gi
    )
  );

  if (/\b(?:o\s+)?INSS\b/i.test(t) && !reus.some((r) => /inss/i.test(r))) {
    reus.push("INSS");
  }

  return deduplicarAutorReu(
    ajustarPartesBeneficioPrevidenciario(t, {
      autoresNomes: uniqNomes(autores),
      reusNomes: uniqNomes(reus),
    })
  );
}

/** Preenche lacunas sem sobrescrever nomes já vindos da IA. */
export function mesclarPartesExtraidas(
  atual: PartesExtraidasRelato,
  extraidas: PartesExtraidasRelato
): PartesExtraidasRelato {
  return {
    autoresNomes: atual.autoresNomes.length
      ? atual.autoresNomes
      : extraidas.autoresNomes,
    reusNomes: atual.reusNomes.length ? atual.reusNomes : extraidas.reusNomes,
  };
}

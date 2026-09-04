/**
 * Extração determinística de dados estruturados do OCR de autos (0 tokens).
 * Alimenta scaffold, triagem e formulário sem precisar de IA.
 */

import { extrairPartesDoRelato } from "@/lib/extrair-partes-relato";

export type DadosOcrExtraidos = {
  numeroProcesso: string | null;
  foro: string | null;
  vara: string | null;
  uf: string | null;
  autores: string[];
  reus: string[];
  valorCausa: string | null;
  ultimoAto: string | null;
  tipoAcaoInferido: string | null;
};

// Padrões CNJ: 0000000-00.0000.0.00.0000
const RE_PROCESSO =
  /\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/;

const RE_VALOR_CAUSA =
  /valor\s+(?:da\s+)?causa[:\s]+R?\$?\s*([\d.,]+)/i;

const RE_VARA =
  /(\d+[ªº°]?\s*(?:Vara|VARA)[^\n,]{0,60})/i;

const PREFIXOS_FORO = [
  /Comarca\s+(?:de\s+)?([A-ZÀ-Ú][^\n,/]{2,50})/i,
  /Foro\s+(?:Regional\s+)?(?:de\s+)?([A-ZÀ-Ú][^\n,/]{2,50})/i,
  /Juízo\s+(?:da\s+)?(?:Comarca\s+(?:de\s+))?([A-ZÀ-Ú][^\n,/]{2,50})/i,
  /Juizado\s+Especial\s+(?:Cível\s+)?(?:de\s+)?([A-ZÀ-Ú][^\n,/]{2,50})/i,
];

const UF_SIGLAS = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
]);

// Mapa de cidades conhecidas → UF (extensível)
const CIDADE_UF: Record<string, string> = {
  "são paulo": "SP", "santos": "SP", "campinas": "SP", "guarulhos": "SP",
  "ribeirão preto": "SP", "sorocaba": "SP", "bauru": "SP", "osasco": "SP",
  "rio de janeiro": "RJ", "niterói": "RJ", "duque de caxias": "RJ",
  "belo horizonte": "MG", "uberlândia": "MG", "contagem": "MG",
  "salvador": "BA", "feira de santana": "BA",
  "fortaleza": "CE", "caucaia": "CE",
  "recife": "PE", "olinda": "PE", "caruaru": "PE",
  "manaus": "AM", "belém": "PA",
  "goiânia": "GO", "brasília": "DF", "anápolis": "GO",
  "curitiba": "PR", "londrina": "PR", "maringá": "PR",
  "porto alegre": "RS", "caxias do sul": "RS", "pelotas": "RS",
  "florianópolis": "SC", "joinville": "SC", "blumenau": "SC",
  "natal": "RN", "joão pessoa": "PB", "maceió": "AL",
  "aracaju": "SE", "teresina": "PI", "são luís": "MA",
  "cuiabá": "MT", "campo grande": "MS", "porto velho": "RO",
  "macapá": "AP", "boa vista": "RR", "palmas": "TO",
  "rio branco": "AC", "maceiô": "AL", "cedro": "PE",
};

function foroEhValido(foro: string): boolean {
  const n = foro
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\/.*$/, "")
    .trim();
  if (n.length < 3 || n.length > 60) return false;
  if (
    /^(considerando|ante o exposto|processo|excelentissimo|senhor|doutor|juiz|vara|comarca|foro|juizado|turma|pagina|outlook|email)$/i.test(
      n
    )
  ) {
    return false;
  }
  // Preferir cidades conhecidas; se tiver 2+ palavras capitalizadas, aceitar
  if (CIDADE_UF[n]) return true;
  if (/^[a-zà-ú]+(?:\s+[a-zà-ú]+){1,3}$/.test(n) && !/\d/.test(n)) {
    // rejeita verbos/artigos comuns
    if (
      /^(de |da |do |em |por |para |com |ao |aos |pela |pelo )/.test(n)
    ) {
      return false;
    }
    return true;
  }
  return false;
}

function inferirUfDaCidade(cidade: string): string | null {
  const n = cidade.toLowerCase().trim().replace(/\/.*$/, "").trim();
  return CIDADE_UF[n] ?? null;
}

function extrairUfDoTexto(texto: string): string | null {
  // UF explícita: "Comarca de Salvador/BA", "Salvador - BA", "SP"
  const mSlash = texto.match(/\/([A-Z]{2})\b/);
  if (mSlash && UF_SIGLAS.has(mSlash[1])) return mSlash[1];
  const mTraco = texto.match(/[-–]\s*([A-Z]{2})\b/);
  if (mTraco && UF_SIGLAS.has(mTraco[1])) return mTraco[1];
  // UF isolada no fim
  const mFim = texto.match(/\b([A-Z]{2})\s*$/);
  if (mFim && UF_SIGLAS.has(mFim[1])) return mFim[1];
  return null;
}

function extrairPartes(texto: string): { autores: string[]; reus: string[] } {
  const autores: string[] = [];
  const reus: string[] = [];

  // Padrões de autor
  const reAutor = [
    /(?:^|\n)\s*(?:Autor(?:a)?|Requerente|Apelante|Agravante|Reclamante|Impetrante|Exequente)\s*[:\-–]\s*([A-ZÀ-Ú][^\n,;]{3,80})/gim,
    /\b(?:promovid[ao]\s+por|ajuizad[ao]\s+por)\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+){1,4})/gi,
    /([A-ZÀ-Ú][A-ZÀ-Ú\s]{8,60}),\s*(?:brasileir[oa]|portador[a]?\s+(?:do\s+)?(?:CPF|RG))/g,
  ];

  // Padrões de réu
  const reReu = [
    /(?:^|\n)\s*(?:Réu|Ré|Requerid[oa]|Apelad[oa]|Agravad[oa]|Reclamad[oa]|Impetrad[oa]|Executad[oa])\s*[:\-–]\s*([A-ZÀ-Ú][^\n,;]{3,100})/gim,
    /\bem\s+face\s+d[aeo]?\s+([A-ZÀ-Ú][^\n,.]{3,100})/gi,
    /\bcontra\s+([A-ZÀ-Ú][A-Za-zÀ-ú\s]{3,60}(?:Ltda\.?|S\.A\.?|S\/A|EIRELI|ME|EPP)?)\b/gi,
  ];

  for (const re of reAutor) {
    for (const m of texto.matchAll(re)) {
      const nome = m[1]?.trim().replace(/\s+/g, " ").slice(0, 80);
      if (nome && nome.length >= 5) autores.push(nome);
    }
  }

  for (const re of reReu) {
    for (const m of texto.matchAll(re)) {
      const nome = m[1]?.trim().replace(/\s+/g, " ").slice(0, 100);
      if (nome && nome.length >= 3) reus.push(nome);
    }
  }

  // INSS sempre é réu se mencionado
  if (/\bINSS\b/.test(texto) && !reus.some(r => /inss/i.test(r))) {
    reus.push("INSS");
  }

  const doRelato = extrairPartesDoRelato(texto);
  const lixoNome =
    /^(considerando|ante o exposto|processo|comarca|vara|fls\.?|página|promoveu|promove|ajuizou|requereu|requerer|interpor|interpôs|excelent[ií]ssimo|senhor|doutor|juiz|outlook|email|mensagem|anexo|homolog|indefer|defer|homologou)$/i;
  const limpar = (lista: string[]) =>
    [...new Set(lista.map((n) => n.replace(/\s+/g, " ").trim()))]
      .filter((n) => {
        if (n.length < 3 || n.length > 120) return false;
        if (lixoNome.test(n)) return false;
        if (/^(de|da|do|em|por|para|com)\b/i.test(n)) return false;
        // verbo sozinho ou quase (1 palavra em minúsculas/título de verbo)
        if (!/\s/.test(n) && /(?:ou|eu|iu|ar|er|ir)$/i.test(n) && n.length <= 12)
          return false;
        if (/outlook|@|\.pdf|\.jus\.br|https?:/i.test(n)) return false;
        return true;
      })
      .slice(0, 4);

  return {
    autores: limpar([...doRelato.autoresNomes, ...autores]),
    reus: limpar([...doRelato.reusNomes, ...reus]),
  };
}

function extrairUltimoAto(texto: string): string | null {
  const padroes = [
    /(?:DECID[OI]|DESPACHO|SENTENÇA|ACÓRDÃO|DECISÃO)[:\s]+([^\n]{20,200})/i,
    /(?:Ante o exposto|Por (?:essas|tais|esses) razões),?\s+([^\n]{20,150})/i,
    /(?:indefiro|defiro|julgo|nego provimento|dou provimento)\s+([^\n]{10,120})/i,
  ];
  for (const re of padroes) {
    const m = texto.match(re);
    if (m?.[1]) return m[1].trim().slice(0, 200);
  }
  return null;
}

function inferirTipoAcao(texto: string): string | null {
  const n = texto.toLowerCase();
  if (/agravo\s+de\s+instrumento/.test(n)) return "Agravo de Instrumento";
  if (/agravo\s+interno/.test(n)) return "Agravo Interno";
  if (/apela[cç][aã]o/.test(n)) return "Apelação Cível";
  if (/embargos?\s+de\s+declara[cç][aã]o/.test(n)) return "Embargos de Declaração";
  if (/embargos?\s+[àa]\s+execu[cç][aã]o/.test(n)) return "Embargos à Execução";
  if (/cumprimento\s+de\s+senten[cç]a/.test(n)) return "Cumprimento de Sentença";
  if (/execu[cç][aã]o/.test(n)) return "Execução";
  if (/peti[cç][aã]o\s+inicial|a[cç][aã]o\s+(?:indenizat|civil|de\s+cobran)/.test(n)) return "Petição Inicial";
  if (/habeas\s+corpus/.test(n)) return "Habeas Corpus";
  if (/mandado\s+de\s+seguran[cç]a/.test(n)) return "Mandado de Segurança";
  if (/reclamação\s+trabalhista/.test(n)) return "Reclamação Trabalhista";
  if (/contestação/.test(n)) return "Contestação";
  if (/impugna[cç][aã]o/.test(n)) return "Impugnação ao Cumprimento de Sentença";
  return null;
}

/**
 * Extrai dados estruturados do texto OCR dos autos (0 tokens).
 * Usado pelo scaffold para preencher partes, foro, processo automaticamente.
 */
export function extrairDadosOcr(texto: string): DadosOcrExtraidos {
  if (!texto?.trim()) {
    return {
      numeroProcesso: null, foro: null, vara: null, uf: null,
      autores: [], reus: [], valorCausa: null, ultimoAto: null, tipoAcaoInferido: null,
    };
  }

  // Número do processo (CNJ)
  const mProcesso = texto.match(RE_PROCESSO);
  const numeroProcesso = mProcesso?.[1] ?? null;

  // Foro / comarca
  let foro: string | null = null;
  let uf: string | null = null;
  for (const re of PREFIXOS_FORO) {
    const m = texto.match(re);
    if (m?.[1]) {
      const candidato = m[1].trim().replace(/\s+/g, " ").slice(0, 80);
      if (!foroEhValido(candidato)) continue;
      foro = candidato;
      uf = extrairUfDoTexto(foro) ?? inferirUfDaCidade(foro);
      if (!uf) {
        const cidade = foro.replace(/\s*\/.*$/, "").trim();
        uf = inferirUfDaCidade(cidade);
      }
      break;
    }
  }

  // Vara
  const mVara = texto.match(RE_VARA);
  const vara = mVara?.[1]?.trim().slice(0, 80) ?? null;

  // Se não achou foro mas achou vara, extrai cidade da vara
  if (!foro && vara) {
    const mCidade = vara.match(/de\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)?)/i);
    if (mCidade?.[1]) {
      foro = mCidade[1].trim();
      uf = inferirUfDaCidade(foro);
    }
  }

  // Valor da causa
  const mValor = texto.match(RE_VALOR_CAUSA);
  const valorCausa = mValor?.[1] ? `R$ ${mValor[1].trim()}` : null;

  // Partes
  const { autores, reus } = extrairPartes(texto);

  // Último ato
  const ultimoAto = extrairUltimoAto(texto);

  // Tipo de ação inferido
  const tipoAcaoInferido = inferirTipoAcao(texto);

  return {
    numeroProcesso,
    foro,
    vara,
    uf,
    autores,
    reus,
    valorCausa,
    ultimoAto,
    tipoAcaoInferido,
  };
}

/**
 * Mescla dados extraídos do OCR com o estado atual do formulário.
 * Não sobrescreve campos já preenchidos pelo usuário.
 */
export function mesclarDadosOcrNoEstado<T extends {
  comarca?: { foro?: string; uf?: string; numeroProcesso?: string; numeroJuizado?: string };
  autoresNomes?: string[];
  reusNomes?: string[];
  tipoAcao?: string;
  ultimoAto?: string | null;
}>(estado: T, ocr: DadosOcrExtraidos): Partial<T> {
  const patch: Record<string, unknown> = {};
  const comarcaAtual = estado.comarca ?? {};
  const comarcaNext = { ...comarcaAtual };
  let comarcaMudou = false;

  if (!comarcaAtual.foro?.trim() && ocr.foro) {
    comarcaNext.foro = ocr.foro;
    comarcaMudou = true;
  }
  if (!comarcaAtual.uf?.trim() && ocr.uf) {
    comarcaNext.uf = ocr.uf;
    comarcaMudou = true;
  }
  if (!comarcaAtual.numeroProcesso?.trim() && ocr.numeroProcesso) {
    comarcaNext.numeroProcesso = ocr.numeroProcesso;
    comarcaMudou = true;
  }
  if (!comarcaAtual.numeroJuizado?.trim() && ocr.vara) {
    comarcaNext.numeroJuizado = ocr.vara;
    comarcaMudou = true;
  }
  if (comarcaMudou) patch.comarca = comarcaNext;

  if ((!estado.autoresNomes?.length) && ocr.autores.length) {
    patch.autoresNomes = ocr.autores;
  }

  if ((!estado.reusNomes?.length) && ocr.reus.length) {
    patch.reusNomes = ocr.reus;
  }

  if (!estado.tipoAcao?.trim() && ocr.tipoAcaoInferido) {
    patch.tipoAcao = ocr.tipoAcaoInferido;
  }

  if (!estado.ultimoAto?.trim() && ocr.ultimoAto) {
    patch.ultimoAto = ocr.ultimoAto;
  }

  return patch as Partial<T>;
}

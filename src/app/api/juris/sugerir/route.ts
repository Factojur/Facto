import { NextResponse } from "next/server";
import { exigirAcessoAreaMinuta } from "@/lib/acesso-minuta-api";
import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import { SUMULAS_ATIVAS_CURADAS } from "@/lib/sumulas";
import { buscarJulgadosProvedorSecundario } from "@/lib/juris-provedores/provedor-secundario";
import {
  chaveDedupJuris,
  type JurisCandidato,
  type RespostaSugestoesJuris,
} from "@/lib/juris-provedores/types";
import {
  MAX_TRIBUNAIS_POR_BUSCA,
  inferirSlugTribunalDoTexto,
  normalizarTribunaisEscolhidos,
} from "@/lib/juris-provedores/tribunais-opcoes";
import type { TipoFonteJurisCaso } from "@/lib/juris-caso-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type UploadIn = {
  id?: string;
  titulo?: string;
  tipo?: TipoFonteJurisCaso;
  texto?: string;
};

type Bruto = Omit<JurisCandidato, "id" | "letra">;

function letra(i: number): string {
  return LETRAS[i] || String(i + 1);
}

function dedupe(brutos: Bruto[]): Bruto[] {
  const vistos = new Set<string>();
  const unicos: Bruto[] = [];
  for (const c of brutos) {
    const k = chaveDedupJuris(c);
    if (vistos.has(k)) continue;
    vistos.add(k);
    unicos.push(c);
  }
  return unicos;
}

/**
 * Sugestões de jurisprudência só do acervo FACTO (+ uploads do caso).
 * Busca ao vivo em tribunais (Jurisprudências.ai / scrape) fica nos scripts de seed —
 * não no runtime do advogado.
 */
export async function POST(request: Request) {
  let body: {
    consulta?: string;
    uploads?: UploadIn[];
    tribunais?: unknown;
    /** @deprecated ignorado — sempre acervo FACTO */
    somenteBase?: boolean;
    areaId?: string;
    polo?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const gate = await exigirAcessoAreaMinuta(body.areaId);
  if (!gate.ok) return gate.response;

  const consulta = String(body.consulta ?? "").trim();
  if (consulta.length < 8) {
    return NextResponse.json(
      { error: "Informe fatos ou tipo de ação (mín. 8 caracteres) para buscar." },
      { status: 400 }
    );
  }

  const areaId = gate.areaId;
  const poloRaw = String(body.polo ?? "").trim().toLowerCase();
  const polo =
    poloRaw === "passivo" || poloRaw === "ativo"
      ? poloRaw
      : null;

  const tribunaisNorm = normalizarTribunaisEscolhidos(body.tribunais);
  if (!tribunaisNorm.ok) {
    return NextResponse.json({ error: tribunaisNorm.erro }, { status: 400 });
  }
  const tribunais = tribunaisNorm.ids;

  const uploadsBrutos: Bruto[] = [];
  for (const u of body.uploads ?? []) {
    const texto = String(u.texto ?? "").trim();
    const titulo = String(u.titulo ?? "").trim() || "Julgado anexado";
    if (texto.length < 20 && !titulo) continue;
    uploadsBrutos.push({
      origem: "upload_usuario",
      tribunal: "Caso",
      titulo,
      ementa: texto || "(conteúdo no arquivo anexado — revise antes de citar)",
      tipo: u.tipo ?? "acordao",
    });
  }

  let melhorSumula: Bruto | null = null;
  try {
    const trechos = await buscarConhecimentoRelacionado(
      consulta,
      14,
      consulta,
      areaId,
      { polo }
    );
    for (const t of trechos) {
      const cat = t.categoria.toLowerCase();
      const isSumula = cat.includes("súmula") || cat.includes("sumula");
      if (!isSumula) continue;
      const slug = inferirSlugTribunalDoTexto(t.titulo, t.categoria, t.texto);
      const querFederal =
        tribunais.includes("stf") || tribunais.includes("stj");
      if (slug && !tribunais.includes(slug)) continue;
      if (!slug && !querFederal) continue;
      melhorSumula = {
        origem: "sumula",
        tribunal: "Súmula",
        titulo: t.titulo,
        ementa: t.texto,
        tipo: "sumula",
      };
      break;
    }
  } catch {
    /* segue */
  }

  if (!melhorSumula && (tribunais.includes("stf") || tribunais.includes("stj"))) {
    const s = SUMULAS_ATIVAS_CURADAS[0];
    if (s) {
      melhorSumula = {
        origem: "sumula",
        tribunal: "STF",
        titulo: s.titulo,
        ementa: s.texto,
        tipo: "sumula",
      };
    }
  }

  const excluir = new Set<string>();
  if (melhorSumula) excluir.add(melhorSumula.titulo.toLowerCase().trim());

  let secundarios: Bruto[] = [];
  let usandoFallbackSecundario = true;
  let avisoSecundario: string | undefined;
  try {
    const r = await buscarJulgadosProvedorSecundario(consulta, excluir, {
      incluirTjsp: false,
      min: 5,
      max: 8,
      tribunais,
      areaId,
      polo,
    });
    secundarios = r.precedentes;
    usandoFallbackSecundario = r.usandoFallbackLocal;
    avisoSecundario = r.aviso;
  } catch {
    secundarios = [];
  }

  const uploads = dedupe(uploadsBrutos);
  const ordenados: Bruto[] = [];
  const vistos = new Set<string>();

  const grupos: Bruto[][] = [
    uploads,
    [],
    melhorSumula ? [melhorSumula] : [],
    secundarios,
  ];

  for (const grupo of grupos) {
    for (const c of grupo) {
      const k = chaveDedupJuris(c);
      if (vistos.has(k)) continue;
      vistos.add(k);
      ordenados.push(c);
    }
  }

  const candidatos: JurisCandidato[] = ordenados.map((c, i) => ({
    ...c,
    id: `cand-${i}-${Date.now()}`,
    letra: letra(i),
  }));

  const partesAviso: string[] = [
    `Busca no acervo FACTO (${tribunais.map((t) => t.toUpperCase()).join(", ")}). Julgado ausente? Anexe a ementa abaixo — entra na fila de verificação.`,
  ];
  if (avisoSecundario) partesAviso.push(avisoSecundario);
  if (usandoFallbackSecundario && secundarios.length) {
    partesAviso.push(
      `${secundarios.length} julgado(s) ranqueados por afinidade ao caso no acervo curado.`
    );
  }

  const resposta: RespostaSugestoesJuris = {
    candidatos,
    provedorExternoAtivo: false,
    totais: {
      uploads: uploads.length,
      julgados: secundarios.length,
      sumulas: melhorSumula ? 1 : 0,
    },
    aviso: partesAviso.join(" "),
    fonteTjsp: "off",
    usandoFallbackLocal: usandoFallbackSecundario,
  };

  return NextResponse.json(resposta);
}

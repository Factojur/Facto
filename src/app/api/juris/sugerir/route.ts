import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buscarConhecimentoRelacionado } from "@/lib/base-conhecimento";
import { SUMULAS_ATIVAS_CURADAS } from "@/lib/sumulas";
import {
  buscarPrecedentes,
  jurisprudenciaServiceConfigurado,
  JURIS_BUSCAS_POR_USUARIO_MES,
} from "@/lib/juris-provedores/jurisprudencia-service";
import {
  consumirCotaJurisUsuario,
  obterCotaJurisUsuario,
} from "@/lib/juris-provedores/juris-cota";
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
 * Mix por clique em "Sugerir":
 * - uploads do usuário (sem cota)
 * - 1 súmula que melhor encaixa (base/curadas)
 * - até 3 julgados Jurisprudências.ai (1 por tribunal selecionado; cada um consome cota)
 * - 3–5 julgados do provedor secundário (TJSP se selecionado / base FACTO)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let body: {
    consulta?: string;
    uploads?: UploadIn[];
    tribunais?: unknown;
    somenteBase?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const consulta = String(body.consulta ?? "").trim();
  if (consulta.length < 8) {
    return NextResponse.json(
      { error: "Informe fatos ou tipo de ação (mín. 8 caracteres) para buscar." },
      { status: 400 }
    );
  }

  const somenteBase = Boolean(body.somenteBase);

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
    const trechos = await buscarConhecimentoRelacionado(consulta, 14, consulta);
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

  const provedorExternoAtivo = jurisprudenciaServiceConfigurado();
  let avisoExterno: string | undefined;
  let cotaUsadas = 0;
  let cotaRestantes = JURIS_BUSCAS_POR_USUARIO_MES;
  let cotaIlimitada = false;
  const julgadoAi: Bruto[] = [];

  if (somenteBase) {
    avisoExterno = `Busca só na base FACTO nos tribunais marcados (${tribunais
      .map((t) => t.toUpperCase())
      .join(", ")}). Não consome a cota mensal.`;
  } else if (provedorExternoAtivo) {
    const cotaAntes = await obterCotaJurisUsuario(user.id, user.email);
    cotaUsadas = cotaAntes.usadas;
    cotaRestantes = cotaAntes.restantes;
    cotaIlimitada = cotaAntes.ilimitado;

    if (!cotaAntes.podeBuscarExterno) {
      avisoExterno = `Limite mensal de buscas externas atingido (${JURIS_BUSCAS_POR_USUARIO_MES}/mês). Uploads e base FACTO continuam disponíveis. A cota renova no dia 1º (horário de Brasília).`;
    } else {
      const tribunaisParaBuscar = tribunais.slice(
        0,
        Math.min(MAX_TRIBUNAIS_POR_BUSCA, cotaRestantes)
      );
      if (tribunaisParaBuscar.length < tribunais.length) {
        avisoExterno = `Cota restante (${cotaRestantes}) menor que tribunais selecionados — buscando só: ${tribunaisParaBuscar
          .map((t) => t.toUpperCase())
          .join(", ")}.`;
      }

      for (const court of tribunaisParaBuscar) {
        const consumo = await consumirCotaJurisUsuario(user.id, user.email);
        cotaUsadas = consumo.usadas;
        cotaRestantes = consumo.restantes;
        if (!consumo.consumida) {
          avisoExterno = [
            avisoExterno,
            `Cota esgotada ao buscar ${court.toUpperCase()}.`,
          ]
            .filter(Boolean)
            .join(" ");
          break;
        }

        const { precedentes, erroApi, aviso } = await buscarPrecedentes(
          consulta,
          { tribunal: court }
        );
        julgadoAi.push(...precedentes);
        if (erroApi) {
          avisoExterno = [avisoExterno, `${court.toUpperCase()}: ${erroApi}`]
            .filter(Boolean)
            .join(" ");
        } else if (aviso && !precedentes.length) {
          avisoExterno = [avisoExterno, `${court.toUpperCase()}: ${aviso}`]
            .filter(Boolean)
            .join(" ");
        }
      }
    }
  } else {
    avisoExterno =
      "Busca externa de tribunais indisponível neste ambiente — nesta busca entram súmula, base FACTO e seus anexos.";
  }

  const excluir = new Set<string>();
  if (melhorSumula) excluir.add(melhorSumula.titulo.toLowerCase().trim());
  for (const j of julgadoAi) excluir.add(j.titulo.toLowerCase().trim());

  let secundarios: Bruto[] = [];
  let usandoFallbackSecundario = true;
  let avisoSecundario: string | undefined;
  let fonteTjsp: RespostaSugestoesJuris["fonteTjsp"] = "off";
  const querTjsp = !somenteBase && tribunais.includes("tjsp");
  try {
    const r = await buscarJulgadosProvedorSecundario(consulta, excluir, {
      incluirTjsp: querTjsp,
      min: somenteBase ? 5 : undefined,
      max: somenteBase ? 8 : undefined,
      tribunais,
    });
    secundarios = r.precedentes;
    usandoFallbackSecundario = r.usandoFallbackLocal;
    avisoSecundario = r.aviso;
    fonteTjsp = r.fonteTjsp ?? "off";
    console.info("[sugerir] fonteTjsp=", fonteTjsp, "fallback=", usandoFallbackSecundario, "tribunais=", tribunais.join(","));
  } catch {
    secundarios = [];
  }

  const uploads = dedupe(uploadsBrutos);
  const ordenados: Bruto[] = [];
  const vistos = new Set<string>();

  // Ordem de exibição: anexos → 1 AI → 1 súmula → 3–5 secundários
  const grupos: Bruto[][] = [
    uploads,
    julgadoAi,
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

  const partesAviso: string[] = [];
  if (avisoExterno) partesAviso.push(avisoExterno);
  if (avisoSecundario) partesAviso.push(avisoSecundario);
  const nTjsp = secundarios.filter((s) => s.origem === "tribunal_scraper").length;
  if (nTjsp > 0) {
    partesAviso.push(
      `${nTjsp} julgado(s) TJSP ranqueados por afinidade ao caso (pool ≤4 anos) — fila de verificação.`
    );
  } else if (usandoFallbackSecundario && secundarios.length) {
    partesAviso.push(
      `${secundarios.length} julgado(s) da base FACTO (complemento do provedor secundário).`
    );
  }

  const resposta: RespostaSugestoesJuris = {
    candidatos,
    provedorExternoAtivo,
    totais: {
      uploads: uploads.length,
      julgados: julgadoAi.length + secundarios.length,
      sumulas: melhorSumula ? 1 : 0,
    },
    cota: provedorExternoAtivo
      ? {
          usadas: cotaUsadas,
          limite: JURIS_BUSCAS_POR_USUARIO_MES,
          restantes: cotaRestantes,
          ilimitado: cotaIlimitada,
        }
      : undefined,
    aviso: partesAviso.length ? partesAviso.join(" ") : undefined,
    fonteTjsp,
    usandoFallbackLocal: usandoFallbackSecundario,
  };

  return NextResponse.json(resposta);
}

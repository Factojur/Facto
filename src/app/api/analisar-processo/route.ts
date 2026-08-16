import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  extrairTextoDeArquivo,
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
} from "@/lib/base-conhecimento";
import type {
  ArquivoProcessoPayload,
  DocumentoTextoPayload,
} from "@/lib/analisar-processo-types";
import { LIMITE_UPLOAD_ANALISE_BYTES } from "@/lib/analisar-processo-types";
import { analisarProcessoComGemini } from "@/lib/ia/analisar-processo-gemini";
import {
  obterResumoCotaUsuario,
  registrarUmaAnalise,
} from "@/lib/cota-pecas-server";

export const maxDuration = 90;

const MAX_ARQUIVOS = 6;

type DocTexto = { nome: string; rotuloHint?: string; texto: string };
type ArquivoBin = {
  nome: string;
  mime: string;
  buffer: Buffer;
  rotulo?: string;
};

function mimeDoArquivo(nome: string, mime: string): string {
  const m = mime.trim();
  if (m && m !== "application/octet-stream") return m;
  const n = nome.toLowerCase();
  if (n.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/pdf";
}

function rotuloHint(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return s || undefined;
}

function documentosDoJson(body: {
  documentos?: DocumentoTextoPayload[];
} | null):
  | { ok: true; docs: DocTexto[] | null }
  | { ok: false; error: string; codigo: string } {
  const lista = Array.isArray(body?.documentos) ? body!.documentos : [];
  if (lista.length === 0) return { ok: true, docs: null };
  const docs: DocTexto[] = [];
  for (const d of lista) {
    const nome = String(d.nome ?? "documento").slice(0, 180);
    const texto = String(d.texto ?? "").trim();
    if (texto.length < 40) {
      return {
        ok: false,
        codigo: "TEXTO_INSUFICIENTE",
        error: `Não foi possível extrair texto útil de “${nome}” (PDF escaneado sem OCR?).`,
      };
    }
    docs.push({ nome, texto, rotuloHint: rotuloHint(d.rotulo) });
  }
  return { ok: true, docs };
}

function arquivosDoBodyJson(body: {
  arquivos?: ArquivoProcessoPayload[];
} | null):
  | { ok: true; itens: ArquivoBin[] }
  | { ok: false; error: string; codigo: string } {
  const arquivos = Array.isArray(body?.arquivos) ? body!.arquivos : [];
  const itens: ArquivoBin[] = [];
  let total = 0;
  for (const arq of arquivos) {
    const nome = String(arq.nome ?? "documento").slice(0, 180);
    const mime = mimeDoArquivo(nome, String(arq.mimeType ?? ""));
    const b64 = String(arq.base64 ?? "").replace(/^data:[^;]+;base64,/, "");
    if (!b64) {
      return { ok: false, error: `Arquivo vazio: ${nome}`, codigo: "ARQUIVO_VAZIO" };
    }
    const buffer = Buffer.from(b64, "base64");
    total += buffer.length;
    if (total > LIMITE_UPLOAD_ANALISE_BYTES) {
      return {
        ok: false,
        codigo: "ARQUIVO_GRANDE",
        error:
          "Os arquivos somam mais de ~3,5 MB. Envie só a sentença ou a inicial, ou um PDF mais leve.",
      };
    }
    itens.push({
      nome,
      mime,
      buffer,
      rotulo: rotuloHint(arq.rotulo),
    });
  }
  return { ok: true, itens };
}

async function arquivosDoMultipart(request: Request): Promise<
  | { ok: true; itens: ArquivoBin[] }
  | { ok: false; error: string; codigo: string }
> {
  const form = await request.formData();
  const files = form.getAll("arquivo");
  const rotulos = form.getAll("rotulo");
  const itens: ArquivoBin[] = [];
  let total = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!(f instanceof File)) continue;
    total += f.size;
    if (total > LIMITE_UPLOAD_ANALISE_BYTES) {
      return {
        ok: false,
        codigo: "ARQUIVO_GRANDE",
        error:
          "Os arquivos somam mais de ~3,5 MB. A hospedagem recusa o envio (HTTP 413). Envie só a sentença ou a inicial, ou um PDF mais leve.",
      };
    }
    itens.push({
      nome: f.name.slice(0, 180),
      mime: mimeDoArquivo(f.name, f.type),
      buffer: Buffer.from(await f.arrayBuffer()),
      rotulo: rotuloHint(rotulos[i]),
    });
  }
  return { ok: true, itens };
}

async function textosDosArquivos(itens: ArquivoBin[]): Promise<
  | { ok: true; docs: DocTexto[] }
  | { ok: false; error: string; codigo: string; status: number }
> {
  const docs: DocTexto[] = [];
  for (const arq of itens) {
    if (!(arq.mime in TIPOS_ARQUIVO_ACEITOS)) {
      return {
        ok: false,
        status: 400,
        codigo: "MIME_INVALIDO",
        error: `Formato não suportado (${arq.nome}). Use PDF ou DOCX.`,
      };
    }
    if (arq.buffer.length > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
      return {
        ok: false,
        status: 400,
        codigo: "ARQUIVO_GRANDE",
        error: `${arq.nome} ultrapassa o tamanho máximo permitido.`,
      };
    }
    const texto = await extrairTextoDeArquivo(arq.buffer, arq.mime);
    if (texto.trim().length < 40) {
      return {
        ok: false,
        status: 400,
        codigo: "TEXTO_INSUFICIENTE",
        error: `Não foi possível extrair texto útil de “${arq.nome}” (PDF escaneado sem OCR?).`,
      };
    }
    docs.push({
      nome: arq.nome,
      rotuloHint: arq.rotulo,
      texto,
    });
  }
  return { ok: true, docs };
}

/**
 * POST /api/analisar-processo
 * Prefere JSON com textos já extraídos no cliente (PDF grande).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ct = request.headers.get("content-type") ?? "";
    let docsTexto: DocTexto[] = [];
    let areaId = "jec";

    if (ct.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as {
        documentos?: DocumentoTextoPayload[];
        arquivos?: ArquivoProcessoPayload[];
        areaId?: string;
      } | null;
      if (body?.areaId?.trim()) areaId = body.areaId.trim();
      const doJson = documentosDoJson(body);
      if (!doJson.ok) {
        return NextResponse.json(
          { error: doJson.error, codigo: doJson.codigo },
          { status: 400 }
        );
      }
      if (doJson.docs) {
        docsTexto = doJson.docs;
      } else {
        const lidos = arquivosDoBodyJson(body);
        if (!lidos.ok) {
          return NextResponse.json(
            { error: lidos.error, codigo: lidos.codigo },
            { status: 400 }
          );
        }
        const extraidos = await textosDosArquivos(lidos.itens);
        if (!extraidos.ok) {
          return NextResponse.json(
            { error: extraidos.error, codigo: extraidos.codigo },
            { status: extraidos.status }
          );
        }
        docsTexto = extraidos.docs;
      }
    } else {
      const lidos = await arquivosDoMultipart(request);
      if (!lidos.ok) {
        return NextResponse.json(
          { error: lidos.error, codigo: lidos.codigo },
          { status: 400 }
        );
      }
      const extraidos = await textosDosArquivos(lidos.itens);
      if (!extraidos.ok) {
        return NextResponse.json(
          { error: extraidos.error, codigo: extraidos.codigo },
          { status: extraidos.status }
        );
      }
      docsTexto = extraidos.docs;
    }

    if (docsTexto.length === 0) {
      return NextResponse.json(
        {
          error: "Envie ao menos um PDF ou DOCX (autos ou peças selecionadas).",
          codigo: "SEM_ARQUIVOS",
        },
        { status: 400 }
      );
    }
    if (docsTexto.length > MAX_ARQUIVOS) {
      return NextResponse.json(
        {
          error: `No máximo ${MAX_ARQUIVOS} arquivos por análise.`,
          codigo: "LIMITE_ARQUIVOS",
        },
        { status: 400 }
      );
    }

    const cotaAntes = await obterResumoCotaUsuario({
      userId: user.id,
      email: user.email,
    });
    if (cotaAntes.trackingAtivo && cotaAntes.esgotadaAnalises) {
      return NextResponse.json(
        {
          error: `Limite mensal de análises atingido (${cotaAntes.limiteAnalisesTotal}/mês). Compre o pacote +10 análises ou aguarde o próximo ciclo. Não consome cota de peça.`,
          codigo: "LIMITE_ANALISES",
          analises: cotaAntes.analisesUsadas,
          limite: cotaAntes.limiteAnalisesTotal,
        },
        { status: 429 }
      );
    }

    const analise = await analisarProcessoComGemini(docsTexto, areaId);

    const registro = await registrarUmaAnalise({
      userId: user.id,
      email: user.email,
    });
    if (!registro.ok) {
      return NextResponse.json({
        analise,
        analisesNoCiclo: registro.analises,
        aviso: "Limite mensal de análises atingido após esta solicitação.",
      });
    }

    return NextResponse.json({
      analise,
      analisesNoCiclo: registro.analises,
    });
  } catch (erro) {
    console.error("[analisar-processo]", erro);
    return NextResponse.json(
      {
        error:
          erro instanceof Error
            ? erro.message
            : "Falha ao analisar o processo.",
      },
      { status: 500 }
    );
  }
}

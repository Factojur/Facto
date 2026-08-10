import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  TAMANHO_MAXIMO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_ACEITOS,
  extrairTextoDeArquivo,
} from "@/lib/base-conhecimento";

const EMAIL_ADMIN = "admin@facto.com";
const BUCKET = "base-conhecimento";

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== EMAIL_ADMIN) return null;
  return user;
}

async function garantirBucket(
  admin: ReturnType<typeof createAdminClient>
) {
  try {
    await admin.storage.createBucket(BUCKET, { public: false });
  } catch {
    // Já existe — segue normalmente.
  }
}

async function criarViaArquivo(request: Request, userId: string) {
  const formData = await request.formData();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const arquivo = formData.get("arquivo");

  if (!titulo || !categoria) {
    return NextResponse.json(
      { error: "Título e categoria são obrigatórios." },
      { status: 400 }
    );
  }

  if (!(arquivo instanceof File)) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 }
    );
  }

  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande. O limite é 8 MB." },
      { status: 400 }
    );
  }

  const extensao =
    TIPOS_ARQUIVO_ACEITOS[arquivo.type as keyof typeof TIPOS_ARQUIVO_ACEITOS];

  if (!extensao) {
    return NextResponse.json(
      {
        error:
          "Formato não suportado. Envie um arquivo PDF ou Word (.docx). Arquivos .doc antigos não são aceitos — salve como .docx antes de enviar.",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  let texto: string;
  try {
    texto = await extrairTextoDeArquivo(buffer, arquivo.type);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler o texto do arquivo. Ele pode estar corrompido ou protegido." },
      { status: 400 }
    );
  }

  if (!texto) {
    return NextResponse.json(
      {
        error:
          "Não foi encontrado texto no arquivo (pode ser um PDF escaneado sem OCR). Cole o texto manualmente.",
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  await garantirBucket(admin);

  const caminhoArquivo = `${userId}/${Date.now()}-${arquivo.name}`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(caminhoArquivo, buffer, {
      contentType: arquivo.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Não foi possível salvar o arquivo no armazenamento." },
      { status: 500 }
    );
  }

  const { data, error } = await admin
    .from("base_conhecimento")
    .insert({
      titulo,
      categoria,
      texto,
      criado_por: userId,
      arquivo_nome: arquivo.name,
      arquivo_path: caminhoArquivo,
      arquivo_tipo: arquivo.type,
    })
    .select("id, titulo, categoria, texto, criado_em, arquivo_nome, arquivo_path, arquivo_tipo")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error:
          "Não foi possível salvar. Verifique se a migration supabase/migration-base-conhecimento-arquivos.sql já foi executada.",
      },
      { status: 500 }
    );
  }

  if (data?.id) {
    void import("@/lib/ia/indexar-conhecimento").then(({ indexarConhecimentoPorId }) =>
      indexarConhecimentoPorId(data.id)
    );
  }

  return NextResponse.json({ item: data });
}

async function criarViaTexto(request: Request, userId: string) {
  const body = await request.json().catch(() => null);
  const titulo = String(body?.titulo ?? "").trim();
  const categoria = String(body?.categoria ?? "").trim();
  const texto = String(body?.texto ?? "").trim();

  if (!titulo || !categoria || !texto) {
    return NextResponse.json(
      { error: "Título, categoria e texto/conteúdo são obrigatórios." },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("base_conhecimento")
      .insert({ titulo, categoria, texto, criado_por: userId })
      .select("id, titulo, categoria, texto, criado_em, arquivo_nome, arquivo_path, arquivo_tipo")
      .single();

    if (error) throw error;

    // Indexação semântica em background (não bloqueia o save se falhar)
    if (data?.id) {
      void import("@/lib/ia/indexar-conhecimento").then(({ indexarConhecimentoPorId }) =>
        indexarConhecimentoPorId(data.id)
      );
    }

    return NextResponse.json({ item: data });
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível salvar. Verifique se a migration supabase/migration-base-conhecimento.sql já foi executada.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    return criarViaArquivo(request, user.id);
  }

  return criarViaTexto(request, user.id);
}

export async function DELETE(request: Request) {
  const user = await exigirAdmin();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const { data: item } = await admin
      .from("base_conhecimento")
      .select("arquivo_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await admin.from("base_conhecimento").delete().eq("id", id);
    if (error) throw error;

    if (item?.arquivo_path) {
      await admin.storage.from(BUCKET).remove([item.arquivo_path]);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível remover o item." },
      { status: 500 }
    );
  }
}

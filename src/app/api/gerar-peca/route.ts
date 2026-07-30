import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  gerarPecaJec,
  type GerarPecaJecInput,
} from "@/lib/gerar-peca-jec";
import { ufValida } from "@/lib/endereco-comarca";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as GerarPecaJecInput;

  if (!body.tipoAcao || !body.fatos?.trim()) {
    return NextResponse.json(
      { error: "Tipo de ação e fatos são obrigatórios." },
      { status: 400 }
    );
  }

  if (body.comarca?.uf && !ufValida(body.comarca.uf)) {
    return NextResponse.json(
      { error: "UF da comarca inválida." },
      { status: 400 }
    );
  }

  // O total e o endereçamento são sempre recalculados aqui a partir dos
  // itens/dados brutos enviados — nunca a partir de um total ou texto de
  // cabeçalho já pronto vindo do cliente, para garantir exatidão.
  const resultado = gerarPecaJec({
    ...body,
    autorNome: user.user_metadata?.nome_completo,
    autorOab: user.user_metadata?.oab_numero,
  });

  return NextResponse.json(resultado);
}

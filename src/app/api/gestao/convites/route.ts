import { NextResponse } from "next/server";
import { requireGestaoAuth } from "@/lib/gestao/gestao-api-auth";
import {
  aceitarConviteGestao,
  criarConviteGestao,
  listarConvitesAtivos,
  obterContextoGestao,
} from "@/lib/gestao/gestao-service";

export async function GET() {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const { escritorio, membro } = await obterContextoGestao(auth.user.id);
  if (!escritorio || membro?.papel !== "admin") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const convites = await listarConvitesAtivos(escritorio.id);
  return NextResponse.json({ convites });
}

export async function POST(request: Request) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    acao?: string;
    token?: string;
    codigo?: string;
  };

  if (body.acao === "aceitar") {
    const resultado = await aceitarConviteGestao({
      userId: auth.user.id,
      email: auth.email,
      nomeUsuario: auth.nome,
      token: String(body.token ?? ""),
      codigo: body.codigo ? String(body.codigo) : undefined,
    });
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.erro }, { status: 400 });
    }
    return NextResponse.json({ escritorio: resultado.escritorio });
  }

  const resultado = await criarConviteGestao({
    userId: auth.user.id,
    email: auth.email,
  });
  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.erro }, { status: 400 });
  }

  return NextResponse.json({
    convite: {
      id: resultado.convite.id,
      codigo: resultado.convite.codigo,
      expiraEm: resultado.convite.expiraEm,
    },
    link: resultado.link,
  });
}

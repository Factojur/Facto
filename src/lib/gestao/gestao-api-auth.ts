import { NextResponse } from "next/server";
import { gestaoHabilitada } from "@/lib/gestao/gestao-flags";
import { GestaoLimiteError } from "@/lib/gestao/gestao-limites-dados";
import { gestaoPersistenciaPronta } from "@/lib/gestao/gestao-persistencia";
import { dentroDoLimite } from "@/lib/rate-limit-memoria";
import { getUsuarioServidor } from "@/lib/sessao-servidor";

export function gestaoIndisponivel() {
  return NextResponse.json({ error: "FACTO Gestão indisponível." }, { status: 404 });
}

function ipDoRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/** Evita rajadas que inflam custo de serverless / disco. */
export function rateLimitGestaoApi(
  request: Request,
  userId: string,
  acao: string,
  maxPorUsuario = 80,
  janelaMs = 60_000
): NextResponse | null {
  const ip = ipDoRequest(request);
  const okUsuario = dentroDoLimite({
    chave: `gestao:${acao}:u:${userId}`,
    max: maxPorUsuario,
    janelaMs,
  });
  const okIp = dentroDoLimite({
    chave: `gestao:${acao}:ip:${ip}`,
    max: maxPorUsuario * 3,
    janelaMs,
  });
  if (!okUsuario || !okIp) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde um momento." },
      { status: 429 }
    );
  }
  return null;
}

export async function requireGestaoAuth(request?: Request) {
  if (!gestaoHabilitada()) return { error: gestaoIndisponivel() as NextResponse };

  const persistencia = await gestaoPersistenciaPronta();
  if (!persistencia.ok) {
    return {
      error: NextResponse.json({ error: persistencia.mensagem }, { status: 503 }),
    };
  }

  const user = await getUsuarioServidor();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    };
  }
  const nome =
    (user.user_metadata?.nome_completo as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Usuário";
  return {
    user,
    email: user.email ?? "",
    nome,
  };
}

export async function requireGestaoAuthMutation(
  request: Request,
  acao: string,
  maxPorUsuario = 60
) {
  const auth = await requireGestaoAuth();
  if ("error" in auth && auth.error) return auth;
  const limited = rateLimitGestaoApi(
    request,
    auth.user.id,
    acao,
    maxPorUsuario
  );
  if (limited) return { error: limited };
  return auth;
}

export function respostaErroGestao(e: unknown): NextResponse | null {
  if (e instanceof GestaoLimiteError) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return null;
}

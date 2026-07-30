import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { limparFotoDeMetadata } from "@/lib/perfil-merge";

const COOKIE_SESSAO = "facto_sessao";
const EMAIL_ADMIN = "admin@facto.com";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Autocorreção: uma foto de perfil pode ter ficado presa em user_metadata
  // (na raiz ou dentro de perfil_dados) antes da correção definitiva — ela
  // deve morar só na tabela profiles. Isso infla o cookie de sessão e
  // derruba o site com erro 431. Como o middleware roda em toda navegação,
  // é o lugar certo para limpar isso assim que a conta afetada acessar o
  // site novamente.
  if (user) {
    const { limpo, removeu } = limparFotoDeMetadata(user.user_metadata);
    if (removeu) {
      await supabase.auth.updateUser({ data: limpo });
    }
  }

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname.startsWith("/dashboard")) {
    const sessaoCookie = request.cookies.get(COOKIE_SESSAO)?.value;
    const { data: profile } = await supabase
      .from("profiles")
      .select("sessao_ativa_id")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profile?.sessao_ativa_id &&
      sessaoCookie !== profile.sessao_ativa_id
    ) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("sessao", "encerrada");
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete(COOKIE_SESSAO);
      return redirectResponse;
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    // Painel administrativo (financeiro) restrito a uma única conta por
    // enquanto. Quem não for o e-mail autorizado nem sabe que a rota existe.
    if (user.email !== EMAIL_ADMIN) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (user && (pathname === "/login" || pathname === "/cadastro")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

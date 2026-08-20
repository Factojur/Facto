import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { limparFotoDeMetadata } from "@/lib/perfil-merge";
import { acessoAssinaturaLiberado } from "@/lib/acesso-assinatura";
import { isAdminEmail } from "@/lib/admin-auth";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";

const COOKIE_SESSAO = "facto_sessao";
/** Evita consultar assinaturas a cada clique no dashboard (5 min). */
const COOKIE_ACESSO_OK = "facto_acesso_ok";
const ACESSO_OK_TTL_S = 300;

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
      // signOut atualiza cookies em supabaseResponse; precisamos copiá-los
      // para o redirect, senão o auth cookie permanece e o usuário entra em
      // loop login → dashboard → sessao=encerrada.
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("sessao", "encerrada");
      const redirectResponse = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      redirectResponse.cookies.set(COOKIE_SESSAO, "", {
        path: "/",
        maxAge: 0,
      });
      return redirectResponse;
    }

    // Corta quem não tem assinatura vigente (exceto e-mails de acesso livre)
    // e quem cancelou/expirou fora da janela de acesso.
    if (!isEmailAcessoLivre(user.email)) {
      const acessoEmCache =
        request.cookies.get(COOKIE_ACESSO_OK)?.value === "1";
      if (!acessoEmCache) {
        const liberado = await acessoAssinaturaLiberado(user.email);
        if (!liberado) {
          await supabase.auth.signOut();
          const loginUrl = request.nextUrl.clone();
          loginUrl.pathname = "/login";
          loginUrl.searchParams.set("acesso", "expirado");
          const redirectResponse = NextResponse.redirect(loginUrl);
          supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
          });
          redirectResponse.cookies.set(COOKIE_SESSAO, "", {
            path: "/",
            maxAge: 0,
          });
          redirectResponse.cookies.set(COOKIE_ACESSO_OK, "", {
            path: "/",
            maxAge: 0,
          });
          return redirectResponse;
        }
        supabaseResponse.cookies.set(COOKIE_ACESSO_OK, "1", {
          path: "/",
          maxAge: ACESSO_OK_TTL_S,
          httpOnly: true,
          sameSite: "lax",
        });
      }
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
    if (!isAdminEmail(user.email)) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Só manda usuário autenticado embora do /login|/cadastro se a sessão
  // única deste dispositivo estiver ok. Caso contrário deixa a página
  // limpar o auth residual (evita loop com ?sessao=encerrada).
  // /redefinir-senha e /esqueci-senha ficam acessíveis com ou sem sessão.
  if (user && (pathname === "/login" || pathname === "/cadastro" || pathname === "/trial")) {
    const veioDeConflito =
      request.nextUrl.searchParams.get("sessao") === "encerrada";
    if (!veioDeConflito) {
      const sessaoCookie = request.cookies.get(COOKIE_SESSAO)?.value;
      const { data: profile } = await supabase
        .from("profiles")
        .select("sessao_ativa_id")
        .eq("id", user.id)
        .maybeSingle();

      const sessaoOk =
        !profile?.sessao_ativa_id ||
        (sessaoCookie != null && sessaoCookie === profile.sessao_ativa_id);

      if (sessaoOk) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|monitoring|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

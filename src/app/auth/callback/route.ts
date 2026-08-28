import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback OAuth (Google): troca ?code= por sessão e segue para /auth/completar.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const intent = url.searchParams.get("intent") === "trial" ? "trial" : "login";
  const destino = url.searchParams.get("destino");
  const err = url.searchParams.get("error");
  const errDesc = url.searchParams.get("error_description");

  if (err) {
    const login = new URL("/login", url.origin);
    login.searchParams.set(
      "oauth",
      errDesc?.slice(0, 120) || err || "falha"
    );
    return NextResponse.redirect(login);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback]", error.message);
      const login = new URL("/login", url.origin);
      login.searchParams.set("oauth", "Não foi possível concluir o login Google.");
      return NextResponse.redirect(login);
    }
  }

  const next = new URL("/auth/completar", url.origin);
  next.searchParams.set("intent", intent);
  if (destino === "gestao") next.searchParams.set("destino", "gestao");
  return NextResponse.redirect(next);
}

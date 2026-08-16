import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JecForm } from "@/components/dashboard/jec-form";
import { areaAbertaParaCliente } from "@/lib/acesso-areas";
import { isEmailAcessoLivre } from "@/lib/emails-acesso-livre";
import type { AreaIdMinuta } from "@/lib/minuta-modulo";
import type { PlanoId } from "@/lib/planos-facto";

export async function AreaMinutaPage({ areaId }: { areaId: AreaIdMinuta }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const acessoLivre = isEmailAcessoLivre(user?.email);
  let tipoUsuario =
    (user?.user_metadata?.tipo_usuario as string | undefined) ?? "advogado";
  let plano: PlanoId | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo_usuario")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.tipo_usuario) tipoUsuario = profile.tipo_usuario;

    try {
      const admin = createAdminClient();
      const email = user.email?.trim().toLowerCase();
      if (email) {
        const { data: ass } = await admin
          .from("assinaturas")
          .select("plano, status, acesso_valido_ate")
          .ilike("email", email)
          .order("criado_em", { ascending: false })
          .limit(5);
        const agora = Date.now();
        const ativa = (ass ?? []).find((a) => {
          const ate = a.acesso_valido_ate
            ? new Date(a.acesso_valido_ate).getTime()
            : null;
          if (a.status === "authorized" && ate === null) return true;
          return ate !== null && ate > agora;
        });
        if (
          ativa?.plano === "jec" ||
          ativa?.plano === "mensal" ||
          ativa?.plano === "pro" ||
          ativa?.plano === "anual" ||
          ativa?.plano === "pro_anual"
        ) {
          plano = ativa.plano;
        }
      }
    } catch {
      /* sem assinatura */
    }
  }

  if (
    !areaAbertaParaCliente(areaId, {
      plano,
      tipoUsuario,
      acessoLivre,
    })
  ) {
    notFound();
  }

  const leigo = tipoUsuario === "leigo" && !acessoLivre && areaId === "jec";

  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-500">Carregando formulário…</div>
      }
    >
      <JecForm leigo={leigo} areaId={areaId} />
    </Suspense>
  );
}

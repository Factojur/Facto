import type { SupabaseClient } from "@supabase/supabase-js";
import { resumoEstiloParaPrompt } from "@/lib/estilo-presets-facto";

/** Estilo do escritório (opt-in) — usado no chat e na redação. */
export async function obterEstiloEscritorioDoPerfil(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("estilo_resumo, estilo_opt_in")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.estilo_opt_in && profile.estilo_resumo?.trim()) {
      return resumoEstiloParaPrompt(profile.estilo_resumo);
    }
  } catch {
    /* coluna ausente em ambientes antigos */
  }
  return null;
}

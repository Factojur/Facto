import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Contagem pública de lastro na landing (jurisprudências + súmulas).
 * Cache 1h — seed cresce ao longo do dia; não precisa de tempo real.
 */
export async function contarLastroLanding(): Promise<number> {
  return unstable_cache(
    async () => {
      try {
        const admin = createAdminClient();
        const { count, error } = await admin
          .from("base_conhecimento")
          .select("id", { count: "exact", head: true })
          .or(
            "categoria.ilike.juris%,categoria.ilike.súmul%,categoria.ilike.sumul%"
          );
        if (error) return 0;
        return count ?? 0;
      } catch {
        return 0;
      }
    },
    ["landing-lastro-count-v2"],
    { revalidate: 3600 }
  )();
}

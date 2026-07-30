import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service role key: ignora RLS.
 *
 * Uso restrito a código que roda só no servidor (rotas de API e Server
 * Components) para tarefas administrativas — como o webhook do Mercado
 * Pago (que não tem sessão de usuário) e o painel /admin (que precisa
 * enxergar dados de todos os assinantes, não só do usuário logado).
 *
 * NUNCA importe este arquivo em código que roda no navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione a chave 'service_role' do Supabase (Project Settings > API) no .env.local."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

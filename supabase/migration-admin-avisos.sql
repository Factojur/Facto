-- Avisos do painel admin: último acesso + tamanho do database.
-- Execute no Supabase SQL Editor.

-- Meta operacional (último acesso do admin, etc.)
create table if not exists public.admin_meta (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.admin_meta enable row level security;
-- Sem policy: apenas service role.

comment on table public.admin_meta is
  'Chaves operacionais do admin (ex.: ultimo_acesso). Sem RLS para clients.';

-- Tamanho do banco (bytes). Só service_role.
create or replace function public.admin_database_size_bytes()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select pg_database_size(current_database());
$$;

revoke all on function public.admin_database_size_bytes() from public;
grant execute on function public.admin_database_size_bytes() to service_role;

comment on function public.admin_database_size_bytes is
  'Retorna pg_database_size do projeto — usado no banner do /admin.';

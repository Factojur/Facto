-- Migration: registro de aceite de Termos de uso + Política de Privacidade
-- Execute no Supabase SQL Editor.
--
-- Usado por:
-- - POST /api/perfil/aceite-termos (grava no clique do usuário)
-- - painel admin /admin/aceites

create table if not exists public.aceites_termos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  nome text,
  versao text not null,
  aceito_em timestamptz not null default now(),
  confirmado boolean not null default true,
  unique (user_id, versao)
);

create index if not exists aceites_termos_aceito_em_idx
  on public.aceites_termos (aceito_em desc);

create index if not exists aceites_termos_email_idx
  on public.aceites_termos (email);

alter table public.aceites_termos enable row level security;

-- Sem policy: apenas service role (servidor / admin API).

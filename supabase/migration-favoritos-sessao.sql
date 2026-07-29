-- Favoritos de áreas + controle de sessão única por conta
-- Execute no SQL Editor do Supabase (Projeto Factojur)

alter table public.profiles
  add column if not exists areas_favoritas text[] not null default '{}',
  add column if not exists sessao_ativa_id uuid;

comment on column public.profiles.areas_favoritas is
  'IDs das áreas de atuação favoritas do advogado (ex: jec, trabalhista)';

comment on column public.profiles.sessao_ativa_id is
  'UUID da sessão ativa; novo login invalida sessões anteriores';

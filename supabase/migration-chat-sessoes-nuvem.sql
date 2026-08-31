-- Sessões do assistente de minuta na nuvem (opt-in LGPD, mesmo gate que minutas_historico).
-- Pré-requisito: migration-sync-nuvem-lgpd.sql

create table if not exists public.chat_sessoes_nuvem (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  sessao_id text not null,
  titulo text not null,
  area_id text not null,
  snapshot jsonb not null default '{}'::jsonb,
  historico_pecas jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (profile_id, sessao_id)
);

create index if not exists chat_sessoes_nuvem_profile_idx
  on public.chat_sessoes_nuvem (profile_id, atualizado_em desc);

alter table public.chat_sessoes_nuvem enable row level security;

drop policy if exists chat_sessoes_select_own on public.chat_sessoes_nuvem;
create policy chat_sessoes_select_own on public.chat_sessoes_nuvem
  for select using (auth.uid() = profile_id);

drop policy if exists chat_sessoes_insert_own on public.chat_sessoes_nuvem;
create policy chat_sessoes_insert_own on public.chat_sessoes_nuvem
  for insert with check (auth.uid() = profile_id);

drop policy if exists chat_sessoes_update_own on public.chat_sessoes_nuvem;
create policy chat_sessoes_update_own on public.chat_sessoes_nuvem
  for update using (auth.uid() = profile_id);

drop policy if exists chat_sessoes_delete_own on public.chat_sessoes_nuvem;
create policy chat_sessoes_delete_own on public.chat_sessoes_nuvem
  for delete using (auth.uid() = profile_id);

-- FACTO Gestão MVP — persistência em nuvem (escritório + membros + dados operacionais).
-- Rodar no SQL Editor do Supabase antes de usar gestão em produção.

create table if not exists public.gestao_escritorios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  admin_email text not null default '',
  oab_responsavel text not null default '',
  plano_gestao text not null default 'intermediario'
    check (plano_gestao in ('basico', 'intermediario', 'ilimitado')),
  store_json jsonb not null default jsonb_build_object(
    'clientes', '[]'::jsonb,
    'processos', '[]'::jsonb,
    'prazos', '[]'::jsonb,
    'agenda', '[]'::jsonb,
    'convites', '[]'::jsonb,
    'atividades', '[]'::jsonb
  ),
  criado_em timestamptz not null default now()
);

create unique index if not exists gestao_escritorios_admin_user_id_uidx
  on public.gestao_escritorios (admin_user_id);

create table if not exists public.gestao_membros (
  escritorio_id uuid not null references public.gestao_escritorios (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null default '',
  nome text not null default '',
  papel text not null default 'colaborador'
    check (papel in ('admin', 'socio', 'colaborador')),
  criado_em timestamptz not null default now(),
  primary key (escritorio_id, user_id)
);

create unique index if not exists gestao_membros_user_id_uidx
  on public.gestao_membros (user_id);

alter table public.gestao_escritorios enable row level security;
alter table public.gestao_membros enable row level security;

comment on table public.gestao_escritorios is
  'FACTO Gestão — escritório e payload operacional (clientes, processos, prazos…).';
comment on table public.gestao_membros is
  'Vínculo usuário ↔ escritório Gestão (titular, sócio, colaborador).';

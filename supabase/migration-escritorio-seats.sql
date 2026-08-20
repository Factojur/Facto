-- Escritório multi-assento (S=5, M=10). Admin com OAB; membros sem OAB.
create table if not exists public.escritorios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  admin_user_id uuid not null references auth.users (id) on delete cascade,
  plano text not null check (plano in ('escritorio_s', 'escritorio_m')),
  oab_responsavel text not null,
  seats_max int not null check (seats_max in (5, 10)),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists escritorios_admin_user_id_uidx
  on public.escritorios (admin_user_id);

create table if not exists public.escritorio_membros (
  id uuid primary key default gen_random_uuid(),
  escritorio_id uuid not null references public.escritorios (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  papel text not null default 'membro'
    check (papel in ('admin', 'advogado', 'membro')),
  estilo_proprio boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (escritorio_id, user_id)
);

create index if not exists escritorio_membros_user_id_idx
  on public.escritorio_membros (user_id);

alter table public.escritorios enable row level security;
alter table public.escritorio_membros enable row level security;

comment on table public.escritorios is
  'Org do plano Escritório S/M — cota compartilhada (pool) no admin.';
comment on table public.escritorio_membros is
  'Assentos: estagiário/membro sem OAB; responsável = OAB do admin.';

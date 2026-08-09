-- Cache técnico de scrapes (query → resultados) + prioridade na fila de verificação.

create table if not exists public.juris_scrape_cache (
  id uuid primary key default gen_random_uuid(),
  tribunal text not null,
  query_norm text not null,
  resultados jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now(),
  unique (tribunal, query_norm)
);

create index if not exists juris_scrape_cache_criado_idx
  on public.juris_scrape_cache (criado_em desc);

alter table public.juris_scrape_cache enable row level security;

comment on table public.juris_scrape_cache is
  'Cache técnico de buscas em tribunais (evita re-scrape da mesma query). Não é a base definitiva.';

alter table public.juris_verificacao
  add column if not exists prioridade integer not null default 0,
  add column if not exists escolhido_usuario boolean not null default false,
  add column if not exists scrape_cache_id uuid references public.juris_scrape_cache (id) on delete set null;

create index if not exists juris_verificacao_prioridade_idx
  on public.juris_verificacao (status, prioridade desc, criado_em desc);

comment on column public.juris_verificacao.prioridade is
  'Maior = revisar antes. Seleção do usuário eleva a prioridade.';
comment on column public.juris_verificacao.escolhido_usuario is
  'true quando um usuário marcou o julgado na geração de peça (1ª conferência humana).';

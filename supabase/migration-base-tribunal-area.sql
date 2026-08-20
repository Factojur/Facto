-- Metadados de juris para mapa por tribunal/área (seed + retrieve).
alter table public.base_conhecimento
  add column if not exists tribunal text,
  add column if not exists area_tags text[] default '{}';

create index if not exists base_conhecimento_tribunal_idx
  on public.base_conhecimento (tribunal)
  where tribunal is not null;

create index if not exists base_conhecimento_area_tags_gin_idx
  on public.base_conhecimento using gin (area_tags);

comment on column public.base_conhecimento.tribunal is
  'Tribunal do julgado (TJSP, STJ, …) — preenchido no seed.';
comment on column public.base_conhecimento.area_tags is
  'Áreas FACTO relacionadas (multi-label), ex.: {jec,consumidor}.';

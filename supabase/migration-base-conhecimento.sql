-- Base de conhecimento jurídico (fundação do sistema de RAG do FACTO).
-- Guarda leis específicas, súmulas e jurisprudências cadastradas manualmente
-- pelo admin em /admin/conhecimento, usadas para enriquecer a geração de peças.

create table if not exists public.base_conhecimento (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text not null,
  texto text not null,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);

create index if not exists base_conhecimento_categoria_idx
  on public.base_conhecimento (categoria);

create index if not exists base_conhecimento_criado_em_idx
  on public.base_conhecimento (criado_em desc);

alter table public.base_conhecimento enable row level security;

-- Qualquer usuário logado pode ler (a busca roda a partir da rota de geração
-- de peça, para qualquer advogado ou leigo). Apenas o backend com a service
-- role key (admin) grava, edita ou remove itens — não existe policy de
-- insert/update/delete para o usuário comum de propósito.
drop policy if exists "base_conhecimento_select_authenticated" on public.base_conhecimento;
create policy "base_conhecimento_select_authenticated"
  on public.base_conhecimento
  for select
  to authenticated
  using (true);

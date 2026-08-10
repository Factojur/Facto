-- Busca semântica (RAG) na base_conhecimento.
-- Extensão pgvector + coluna embedding + RPC de similaridade.

create extension if not exists vector;

alter table public.base_conhecimento
  add column if not exists embedding vector(768);

comment on column public.base_conhecimento.embedding is
  'Embedding Gemini gemini-embedding-001 (768d). Null = ainda não indexado.';

-- Índice HNSW (bom para leitura; exige linhas indexadas).
create index if not exists base_conhecimento_embedding_hnsw_idx
  on public.base_conhecimento
  using hnsw (embedding vector_cosine_ops);

create or replace function public.match_base_conhecimento(
  query_embedding vector(768),
  match_count int default 20
)
returns table (
  id uuid,
  titulo text,
  categoria text,
  texto text,
  criado_em timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    bc.id,
    bc.titulo,
    bc.categoria,
    bc.texto,
    bc.criado_em,
    (1 - (bc.embedding <=> query_embedding))::float as similarity
  from public.base_conhecimento bc
  where bc.embedding is not null
  order by bc.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

comment on function public.match_base_conhecimento is
  'Retorna documentos da base ordenados por similaridade de cosseno ao embedding da query.';

grant execute on function public.match_base_conhecimento(vector, int) to service_role;
grant execute on function public.match_base_conhecimento(vector, int) to authenticated;

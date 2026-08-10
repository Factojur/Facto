-- Contador de análises de processo (observabilidade de custo Gemini).
-- Não é cota cobrável do usuário — só métrica operacional no admin.
-- Execute no Supabase SQL Editor após migration-cota-pecas.sql.

alter table public.cota_pecas_ciclo
  add column if not exists analises integer not null default 0
  check (analises >= 0);

comment on column public.cota_pecas_ciclo.analises is
  'Quantidade de análises de processo (Analisar processo) no ciclo. Grátis para o usuário; custo Gemini no admin.';

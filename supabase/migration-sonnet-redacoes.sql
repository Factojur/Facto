-- Contador de redações Claude Sonnet no ciclo (roteador multi-IA).
-- Execute no Supabase SQL Editor após o deploy do roteador.
--
-- Tetos de produto (código): Completo 12% · Pro 22% · JEC 0%.

alter table public.cota_pecas_ciclo
  add column if not exists sonnet_redacoes integer not null default 0
  check (sonnet_redacoes >= 0);

comment on column public.cota_pecas_ciclo.sonnet_redacoes is
  'Redações com Claude Sonnet no ciclo YYYY-MM (teto % do plano).';

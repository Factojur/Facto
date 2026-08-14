-- Cota cobrável de análises de processo + extras (+10 análises).
-- Execute no SQL Editor após migration-cota-analises.sql e migration-pagamentos-extras.sql.

alter table public.cota_pecas_ciclo
  add column if not exists extras_analises integer not null default 0
  check (extras_analises >= 0);

comment on column public.cota_pecas_ciclo.analises is
  'Análises de processo usadas no ciclo (cota do plano + extras).';

comment on column public.cota_pecas_ciclo.extras_analises is
  'Créditos extras de análises comprados no ciclo (pacote +10).';

alter table public.pagamentos_extras
  drop constraint if exists pagamentos_extras_pecas_check;

alter table public.pagamentos_extras
  add constraint pagamentos_extras_pecas_check check (pecas >= 0);

alter table public.pagamentos_extras
  add column if not exists analises integer not null default 0
  check (analises >= 0);

-- Trial grátis: área escolhida + cota limitada, sem OAB no início.
alter table public.profiles
  add column if not exists trial_ate timestamptz,
  add column if not exists trial_area_id text,
  add column if not exists trial_pecas_usadas int not null default 0;

comment on column public.profiles.trial_ate is
  'Fim do período de teste gratuito (null = sem trial).';
comment on column public.profiles.trial_area_id is
  'Única área liberada no trial (ex.: jec, consumidor).';
comment on column public.profiles.trial_pecas_usadas is
  'Peças geradas no trial (teto em cota-pecas / PLANOS).';

create index if not exists profiles_trial_ate_idx
  on public.profiles (trial_ate)
  where trial_ate is not null;

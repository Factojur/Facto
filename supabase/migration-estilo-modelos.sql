-- Modelos de peça no Tom do escritório (1 por espécie; parâmetro de forma).
alter table public.profiles
  add column if not exists estilo_modelos_json jsonb not null default '{}'::jsonb;

comment on column public.profiles.estilo_modelos_json is
  'Mapa especieId → { nome, texto, atualizadoEm }. Um modelo ativo por espécie; parâmetro opcional no chat.';

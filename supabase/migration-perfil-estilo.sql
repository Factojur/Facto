-- Perfil de estilo do escritório (opt-in, resumo curto — não guarda PDFs inteiros)
alter table public.profiles
  add column if not exists estilo_resumo text,
  add column if not exists estilo_atualizado_em timestamptz,
  add column if not exists estilo_opt_in boolean not null default false;

comment on column public.profiles.estilo_resumo is
  'Resumo (~500 palavras) do estilo de redação, gerado uma vez a partir de amostras do advogado.';
comment on column public.profiles.estilo_opt_in is
  'Usuário autorizou uso de amostras para personalizar tom (LGPD).';

-- Ajuste documental: juris_busca_cota.dia passa a guardar o 1º dia do mês
-- (ciclo mensal). Sem alteração de schema — a PK (user_id, dia) permanece.
-- Ex.: agosto/2026 → dia = '2026-08-01'. Contador zera automaticamente no mês novo.

comment on table public.juris_busca_cota is
  'Cota mensal de buscas Jurisprudências.ai por usuário FACTO. Coluna dia = 1º dia do mês (America/Sao_Paulo).';

comment on column public.juris_busca_cota.dia is
  'Chave do ciclo: primeiro dia do mês civil (YYYY-MM-01).';

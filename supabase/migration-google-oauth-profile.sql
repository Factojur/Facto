-- Google OAuth: perfil automático com nome do Google e CPF placeholder único.
-- Execute no Supabase SQL Editor (uma vez).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nome text;
  cpf_val text;
begin
  nome := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nome_completo'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, 'usuario'), '@', 1)
  );

  cpf_val := nullif(trim(new.raw_user_meta_data->>'cpf'), '');
  if cpf_val is null or cpf_val = '' then
    cpf_val := 'pending-' || new.id::text;
  end if;

  insert into public.profiles (id, nome_completo, cpf, email, oab_numero, tipo_usuario)
  values (
    new.id,
    nome,
    cpf_val,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'oab_numero', ''),
    coalesce(nullif(new.raw_user_meta_data->>'tipo_usuario', ''), 'leigo')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

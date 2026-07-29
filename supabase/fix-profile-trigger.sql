-- Corrige cadastro: cria perfil automaticamente quando um usuário se registra.
-- Execute este SQL no Supabase → SQL Editor → Run

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo, cpf, email, oab_numero)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', ''),
    coalesce(new.raw_user_meta_data->>'cpf', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'oab_numero', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

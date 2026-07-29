-- Confirma e-mails de usuários de teste (execute no SQL Editor)
-- Use se o login falhar mesmo com senha correta

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

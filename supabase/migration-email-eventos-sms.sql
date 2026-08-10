-- Amplia tipos de email_eventos para alertas SMS de compra (Twilio).
-- Execute no Supabase SQL Editor (produção).

alter table public.email_eventos
  drop constraint if exists email_eventos_tipo_check;

alter table public.email_eventos
  add constraint email_eventos_tipo_check
  check (
    tipo in (
      'suporte',
      'convite',
      'financeiro_compra',
      'financeiro_cancelamento',
      'alerta_sms_compra'
    )
  );

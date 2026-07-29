export function getAuthErrorMessage(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("rate limit") || msg.includes("email rate limit")) {
    return "Limite de e-mails atingido. Aguarde 1 hora, desative 'Confirm email' no Supabase ou use outro e-mail para testar.";
  }

  if (msg.includes("email not confirmed")) {
    return "E-mail não confirmado. No Supabase, desative 'Confirm email' em Authentication → Providers → Email.";
  }

  if (msg.includes("invalid login credentials")) {
    return "Login recusado. Verifique e-mail e senha — ou confirme o e-mail no Supabase (Authentication → Users).";
  }

  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Este e-mail já está cadastrado. Apague o usuário no Supabase ou use outro e-mail.";
  }

  return message;
}

export function getAuthErrorMessage(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("rate limit") || msg.includes("email rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  }

  if (msg.includes("email not confirmed")) {
    return "Confirme o e-mail enviado na sua caixa de entrada (ou spam) antes de entrar.";
  }

  if (msg.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Verifique os dados e tente novamente.";
  }

  if (msg.includes("already registered") || msg.includes("already been registered")) {
    return "Este e-mail já possui conta. Use Entrar ou recupere a senha.";
  }

  if (msg.includes("user already registered")) {
    return "Este e-mail já possui conta. Use Entrar ou recupere a senha.";
  }

  // Não repassa jargão de provedor / admin
  if (
    msg.includes("supabase") ||
    msg.includes("provider") ||
    msg.includes("oauth") ||
    message.length > 180
  ) {
    return "Não foi possível concluir o acesso. Tente novamente ou use e-mail e senha.";
  }

  return message;
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou senha incorretos.",
  invalid_login_credentials: "Email ou senha incorretos.",
  email_not_confirmed: "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
  user_already_registered: "Este email já está cadastrado.",
  weak_password: "Senha muito fraca. Use no mínimo 8 caracteres.",
  over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos.",
  signup_disabled: "Cadastro temporariamente indisponível.",
};

export function translateAuthError(message: string): string {
  const key = message.toLowerCase().replace(/\s+/g, "_");
  for (const [pattern, pt] of Object.entries(MESSAGES)) {
    if (key.includes(pattern) || message.toLowerCase().includes(pattern.replace(/_/g, " "))) {
      return pt;
    }
  }
  return message;
}

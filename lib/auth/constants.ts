export const AUTH_ROUTES = {
  login: "/login",
  register: "/cadastro",
  forgotPassword: "/recuperar-senha",
  updatePassword: "/recuperar-senha/atualizar",
  verifyEmail: "/verificar-email",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  callback: "/api/auth/callback",
  google: "/api/auth/google",
} as const;

export const PUBLIC_API_PREFIXES = [
  "/api/auth/",
  "/api/webhooks/",
  "/api/whatsapp/webhooks/",
] as const;

export function isPublicApiRoute(pathname: string) {
  return PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p));
}

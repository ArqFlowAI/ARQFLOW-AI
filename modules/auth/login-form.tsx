"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth.actions";
import { initialAuthState } from "@/types/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const urlError = searchParams.get("error");
  const urlMessage = searchParams.get("message");

  const [state, formAction, pending] = useActionState(
    loginAction,
    initialAuthState
  );

  const displayError =
    state.error ??
    (urlError === "auth_callback"
      ? "Falha na autenticação. Tente novamente."
      : urlError
        ? decodeURIComponent(urlError)
        : undefined);

  const displayMessage =
    state.message ??
    (urlMessage === "password_updated"
      ? "Senha atualizada com sucesso. Faça login."
      : undefined);

  return (
    <>
      <AuthMessage
        error={displayError}
        success={!!displayMessage && !displayError}
        message={displayMessage}
      />

      <form action={formAction} className="mt-4 space-y-4">
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1"
          />
        </div>
        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-sm text-brand-dark hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-brand-light/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-brand-dark/60 dark:bg-brand-black">
            ou
          </span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link
          href={
            redirect
              ? `/api/auth/google?redirect=${encodeURIComponent(redirect)}`
              : "/api/auth/google"
          }
        >
          <GoogleIcon />
          Continuar com Google
        </Link>
      </Button>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-brand-beige/20" />}>
      <LoginFormInner />
    </Suspense>
  );
}

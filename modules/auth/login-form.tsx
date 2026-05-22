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
    </>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-brand-beige/20" />}>
      <LoginFormInner />
    </Suspense>
  );
}

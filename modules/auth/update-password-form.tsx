"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePasswordAction } from "@/actions/auth.actions";
import { initialAuthState } from "@/types/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialAuthState
  );

  return (
    <>
      <AuthMessage error={state.error} />

      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Salvando..." : "Definir nova senha"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-brand-dark hover:underline">
          Voltar ao login
        </Link>
      </p>
    </>
  );
}

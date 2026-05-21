"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth.actions";
import { initialAuthState } from "@/types/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthState
  );

  return (
    <>
      <AuthMessage
        error={state.error}
        success={state.success}
        message={state.message}
      />

      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="email">Email da sua conta</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link de recuperação"}
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

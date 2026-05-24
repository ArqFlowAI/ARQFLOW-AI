"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/auth.actions";
import { initialAuthState } from "@/types/auth";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialAuthState
  );

  if (state.success && state.message) {
    return (
      <div className="space-y-4">
        <AuthMessage success message={state.message} />
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthMessage error={state.error} />

      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Seu nome</Label>
          <Input id="name" name="name" autoComplete="name" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="organizationName">Nome do escritório</Label>
          <Input
            id="organizationName"
            name="organizationName"
            required
            className="mt-1"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-brand-dark/50">Mínimo 8 caracteres</p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </>
  );
}

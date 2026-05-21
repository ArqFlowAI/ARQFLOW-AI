"use server";

import { createClient } from "@/lib/supabase/server";
import {
  syncUserFromSupabase,
  getPostAuthRedirect,
} from "@/services/auth.service";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/utils/validations";
import { translateAuthError } from "@/lib/auth/errors";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import type { AuthActionState } from "@/types/auth";

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.user) {
    return { error: "Falha ao autenticar" };
  }

  await syncUserFromSupabase({
    supabaseId: data.user.id,
    email: data.user.email!,
    name: data.user.user_metadata?.name,
    avatarUrl: data.user.user_metadata?.avatar_url,
  });

  const redirectTo = formData.get("redirect") as string | null;
  const destination =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : await getPostAuthRedirect(data.user.id);

  redirect(destination);
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        organization_name: parsed.data.organizationName,
      },
      emailRedirectTo: `${appUrl}${AUTH_ROUTES.callback}?next=/onboarding`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (!data.user) {
    return { error: "Falha ao criar conta" };
  }

  await syncUserFromSupabase({
    supabaseId: data.user.id,
    email: parsed.data.email,
    name: parsed.data.name,
    organizationName: parsed.data.organizationName,
  });

  if (!data.session) {
    redirect(AUTH_ROUTES.verifyEmail);
  }

  redirect("/onboarding");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_ROUTES.login);
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Email é obrigatório" };

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}${AUTH_ROUTES.updatePassword}`,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success: true,
    message: "Enviamos um link de recuperação para seu email.",
  };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Senha deve ter no mínimo 8 caracteres" };
  }

  if (password !== confirm) {
    return { error: "As senhas não coincidem" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Solicite um novo link de recuperação." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect(`${AUTH_ROUTES.login}?message=password_updated`);
}

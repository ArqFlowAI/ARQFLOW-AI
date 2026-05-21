import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/modules/auth/update-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Nova senha",
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);

    if (error) {
      redirect(
        `/recuperar-senha?error=${encodeURIComponent("Link expirado ou inválido. Solicite um novo.")}`
      );
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/recuperar-senha?error=Sessão inválida. Solicite um novo link.");
    }
  }

  return (
    <Card className="glass border-brand-light/20 shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="font-display text-2xl font-bold">
          ARQFLOW AI
        </Link>
        <CardTitle className="mt-4 font-display">Definir nova senha</CardTitle>
        <CardDescription>Escolha uma senha forte com 8+ caracteres</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}

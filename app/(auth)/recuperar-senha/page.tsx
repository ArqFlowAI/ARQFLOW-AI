import Link from "next/link";
import { ForgotPasswordForm } from "@/modules/auth/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="glass border-brand-light/20 shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="font-display text-2xl font-bold">
          ARQFLOW AI
        </Link>
        <CardTitle className="mt-4 font-display">Recuperar senha</CardTitle>
        <CardDescription>
          Enviaremos um link seguro para seu email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}

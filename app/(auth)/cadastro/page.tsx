import Link from "next/link";
import { RegisterForm } from "@/modules/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <Card className="glass border-brand-light/20 shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="font-display text-2xl font-bold">
          ARQFLOW AI
        </Link>
        <CardTitle className="mt-4 font-display">Crie sua conta</CardTitle>
        <CardDescription>14 dias grátis · Sem cartão de crédito</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-brand-dark/70">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

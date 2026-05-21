import Link from "next/link";
import { LoginForm } from "@/modules/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <Card className="glass border-brand-light/20 shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="font-display text-2xl font-bold">
          ARQFLOW AI
        </Link>
        <CardTitle className="mt-4 font-display">Bem-vindo de volta</CardTitle>
        <CardDescription>Entre com email ou Google</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-brand-dark/70">
          Não tem conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-brand-dark hover:underline"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

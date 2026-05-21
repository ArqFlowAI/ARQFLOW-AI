import Link from "next/link";
import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Verificar email",
};

export default function VerifyEmailPage() {
  return (
    <Card className="glass border-brand-light/20 shadow-xl text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-beige/50">
          <Mail className="h-7 w-7 text-brand-dark" />
        </div>
        <CardTitle className="font-display">Verifique seu email</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação. Clique no email para ativar sua conta
          ARQFLOW AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-brand-dark/60">
          Não recebeu? Verifique o spam ou cadastre-se novamente.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Ir para login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

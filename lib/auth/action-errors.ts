import { Prisma } from "@prisma/client";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export function rethrowIfRedirect(error: unknown): never | void {
  if (isRedirectError(error)) throw error;
}

export function formatSyncError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "Este email já está cadastrado. Tente fazer login.";
    }
    if (error.code === "P2021" || error.code === "P2022") {
      return "Banco de dados desatualizado. Rode npm run db:sync no servidor.";
    }
  }

  if (error instanceof Error && error.message.includes("SubscriptionPlan")) {
    return "Plano de assinatura inválido no banco. Rode npm run db:sync.";
  }

  console.error("[auth sync]", error);
  return "Conta criada no login, mas falhou ao salvar no sistema. Tente entrar novamente ou contate o suporte.";
}

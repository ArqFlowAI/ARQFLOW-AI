import { Resend } from "resend";
import { welcomeEmailHtml } from "./templates/welcome";
import { passwordResetHtml } from "./templates/password-reset";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const from = process.env.RESEND_FROM_EMAIL ?? "ARQFLOW AI <onboarding@arqflow.ai>";

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}) {
  return getResend().emails.send({
    from,
    to: params.to,
    subject: "Bem-vindo ao ARQFLOW AI — Sua conta está ativa",
    html: welcomeEmailHtml(params.name),
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  return getResend().emails.send({
    from,
    to: params.to,
    subject: "Redefinir sua senha — ARQFLOW AI",
    html: passwordResetHtml(params.resetUrl),
  });
}

export async function sendLeadRecoveryEmail(params: {
  to: string;
  name: string;
  message: string;
}) {
  return getResend().emails.send({
    from,
    to: params.to,
    subject: "Ainda pensando no seu projeto? — ARQFLOW AI",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #F7F3EE;">
        <h1 style="font-family: 'Space Grotesk', sans-serif; color: #1E1E1E;">Olá, ${params.name}</h1>
        <p style="color: #6B4F3A; line-height: 1.6;">${params.message}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; margin-top: 24px; padding: 14px 28px; background: #6B4F3A; color: #F7F3EE; text-decoration: none; border-radius: 8px;">Acessar plataforma</a>
      </div>
    `,
  });
}

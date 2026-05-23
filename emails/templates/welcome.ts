export function welcomeEmailHtml(name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arqflow-ai.vercel.app";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F7F3EE;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,30,30,0.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#D6C2A1,#A67C52);padding:40px;text-align:center;">
        <h1 style="margin:0;font-family:'Space Grotesk',Arial,sans-serif;color:#1E1E1E;font-size:28px;">ARQFLOW AI</h1>
        <p style="margin:8px 0 0;color:#1E1E1E;opacity:0.8;">Inteligência para seu escritório</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="color:#1E1E1E;margin:0 0 16px;">Bem-vindo, ${name}!</h2>
        <p style="color:#6B4F3A;line-height:1.7;margin:0 0 24px;">
          Sua conta está ativa. Agora você pode gerar conceitos arquitetônicos, renders IA,
          orçamentos profissionais e automatizar suas vendas.
        </p>
        <a href="${appUrl}/dashboard" style="display:inline-block;padding:14px 32px;background:#6B4F3A;color:#F7F3EE;text-decoration:none;border-radius:8px;font-weight:600;">
          Acessar Dashboard
        </a>
        <p style="color:#A67C52;font-size:13px;margin-top:32px;">
          Dúvidas? Responda este email — estamos aqui para ajudar.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

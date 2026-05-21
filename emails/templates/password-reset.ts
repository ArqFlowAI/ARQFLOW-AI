export function passwordResetHtml(resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F7F3EE;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;">
    <tr>
      <td>
        <h1 style="font-family:'Space Grotesk',Arial,sans-serif;color:#1E1E1E;">Redefinir senha</h1>
        <p style="color:#6B4F3A;line-height:1.7;">
          Recebemos uma solicitação para redefinir sua senha no ARQFLOW AI.
          Clique no botão abaixo para criar uma nova senha.
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#6B4F3A;color:#F7F3EE;text-decoration:none;border-radius:8px;">
          Redefinir senha
        </a>
        <p style="color:#A67C52;font-size:13px;">
          Se você não solicitou isso, ignore este email. O link expira em 1 hora.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

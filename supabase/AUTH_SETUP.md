# Configuração de Autenticação — Supabase

## 1. URLs de redirect (Authentication → URL Configuration)

Adicione em **Redirect URLs**:

```
http://localhost:3000/api/auth/callback
http://localhost:3000/recuperar-senha/atualizar
https://SEU-DOMINIO.com/api/auth/callback
https://SEU-DOMINIO.com/recuperar-senha/atualizar
```

**Site URL:** `http://localhost:3000` (dev) ou seu domínio em produção.

## 2. Google OAuth

1. Authentication → Providers → Google → Enable
2. Crie credenciais no [Google Cloud Console](https://console.cloud.google.com/)
3. Authorized redirect URI do Supabase:
   `https://SEU-PROJECT.supabase.co/auth/v1/callback`
4. Cole Client ID e Secret no painel Supabase

## 3. Email

- **Confirm email:** pode ficar ativo (recomendado em produção)
- **Reset password:** usa template padrão; redirect para `/recuperar-senha/atualizar`

## 4. Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Fluxos implementados

| Fluxo | Rota |
|-------|------|
| Login email/senha | `/login` → Supabase `signInWithPassword` |
| Cadastro | `/cadastro` → `signUp` + sync Prisma |
| Google OAuth | `/api/auth/google` → callback |
| Callback OAuth/email | `/api/auth/callback` |
| Recuperar senha | `/recuperar-senha` |
| Nova senha | `/recuperar-senha/atualizar?code=...` |
| Verificar email | `/verificar-email` |
| Sessão API | `GET /api/auth/session` |
| Logout | Server Action + `POST /api/auth/signout` |

## 6. Sincronização Prisma

Todo login (email ou Google) executa `syncUserFromSupabase`:

- Cria `User` + `Organization` + `Subscription` **FREE** se novo
- Vincula por `supabaseId` ou email existente
- Middleware renova cookies JWT automaticamente

### Banco desatualizado (signup falha após criar usuário no Supabase)

Se o Postgres ainda tiver o plano `STARTER` no enum, o Prisma quebra ao criar assinatura `FREE`.

```bash
npm run db:sync
```

Isso adiciona `FREE`/`BASIC`, migra `STARTER` → `FREE` e aplica `prisma db push`.

### Cadastro não redireciona

- Confirme `NEXT_PUBLIC_APP_URL` em `.env.local` (sem placeholder)
- Adicione a URL de callback nas Redirect URLs do Supabase
- Com **Confirm email** ativo, o fluxo vai para `/verificar-email` (sem sessão até confirmar)

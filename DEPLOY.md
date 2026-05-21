# Deploy ARQFLOW AI — GitHub + Vercel + Supabase

Guia completo para colocar o ARQFLOW AI em produção.

## Pré-requisitos

- Conta [GitHub](https://github.com)
- Conta [Vercel](https://vercel.com)
- Projeto [Supabase](https://supabase.com) (Auth + PostgreSQL + Storage)
- (Opcional) Stripe, Kiwify, OpenAI, Replicate, Resend, Z-API

---

## 1. Subir código no GitHub

```bash
git init
git add .
git commit -m "chore: prepare ARQFLOW AI for production"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/arqflow-ai.git
git push -u origin main
```

**Não commite** `.env`, `.env.local` nem chaves secretas. O `.gitignore` já ignora esses arquivos.

---

## 2. Banco de dados (Supabase + Prisma)

### 2.1 Connection strings (produção)

No Supabase: **Settings → Database → Connection string → ORM (Prisma)**

| Variável | Uso | Porta |
|----------|-----|-------|
| `DATABASE_URL` | Pooler transacional | **6543** + `?pgbouncer=true` |
| `DIRECT_URL` | Migrations / Prisma push | **5432** (session pooler) |

Exemplo:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.PROJECT_REF:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

Localmente, gere com:

```bash
SUPABASE_DB_PASSWORD=sua_senha npm run env:setup
```

### 2.2 Sincronizar schema

Na primeira vez (local ou CI com `DIRECT_URL`):

```bash
npm run db:push
```

Em produção na Vercel, o schema deve estar aplicado **antes** do primeiro deploy (rode `db:push` local apontando para o banco de produção, ou use `prisma migrate deploy` se criar migrations).

O Prisma está configurado com `binaryTargets` para Vercel (`rhel-openssl-3.0.x`).

### 2.3 RLS e Storage

1. Execute `supabase/migrations/001_rls_policies.sql` no SQL Editor do Supabase.
2. Crie buckets: `renders`, `budgets`, `avatars` (leitura pública conforme seu modelo).

---

## 3. Supabase Auth (URLs de produção)

**Authentication → URL Configuration**

| Campo | Valor |
|-------|-------|
| Site URL | `https://seu-dominio.vercel.app` |
| Redirect URLs | `https://seu-dominio.vercel.app/api/auth/callback` |
| | `https://seu-dominio.vercel.app/recuperar-senha/atualizar` |

Para preview deployments, adicione também:

`https://*.vercel.app/api/auth/callback`

**Google OAuth:** redirect do Google → `https://PROJECT_REF.supabase.co/auth/v1/callback`

---

## 4. Variáveis de ambiente na Vercel

**Project → Settings → Environment Variables**

Marque **Production**, **Preview** e **Development** conforme necessário.

### Obrigatórias

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_APP_URL` | `https://seu-dominio.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `ARQFLOW AI` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (secreta) |
| `DATABASE_URL` | Pooler :6543 + pgbouncer |
| `DIRECT_URL` | Pooler :5432 |

### IA e core

| Variável | Descrição |
|----------|-----------|
| `OPENAI_API_KEY` | OpenAI |
| `OPENAI_CONCEPT_MODEL` | `gpt-4o` (opcional) |
| `REPLICATE_API_TOKEN` | Renders |
| `REPLICATE_FLUX_MODEL` | `black-forest-labs/flux-schnell` |

### Pagamentos

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_PRICE_STARTER` | Price ID |
| `STRIPE_PRICE_PRO` | Price ID |
| `STRIPE_PRICE_PREMIUM` | Price ID |
| `KIWIFY_WEBHOOK_SECRET` | Secret do webhook Kiwify |

### Opcionais

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `N8N_WEBHOOK_URL`, `N8N_API_KEY`, `ZAPI_*`, `TWILIO_*`, `CRON_SECRET`, `FAL_KEY`, `IMAGE_PROVIDER`

---

## 5. Deploy na Vercel

### 5.1 Importar projeto

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Selecione o repositório `arqflow-ai`
3. Framework: **Next.js** (detectado automaticamente)

### 5.2 Build settings

| Campo | Valor |
|-------|-------|
| Build Command | `prisma generate && next build` (padrão do `package.json`) |
| Install Command | `npm install` |
| Output Directory | (deixe vazio — padrão Next.js) |

O `postinstall` já roda `prisma generate`.

### 5.3 Deploy

Clique **Deploy**. Após o build, teste as rotas:

| Rota | Descrição |
|------|-----------|
| `/` | Landing |
| `/login` | Auth |
| `/dashboard` | Dashboard principal |
| `/crm` | CRM Kanban |
| `/whatsapp` | Automações WhatsApp |
| `/billing` | Planos e assinatura |

Redirects legados: `/dashboard/billing` → `/billing`, `/dashboard/whatsapp` → `/whatsapp`.

### 5.4 Cron (Vercel)

O arquivo `vercel.json` define:

```json
{
  "crons": [{ "path": "/api/cron/inactive-leads", "schedule": "0 9 * * *" }]
}
```

Configure `CRON_SECRET` na Vercel. O cron envia `Authorization: Bearer CRON_SECRET`.

> Cron jobs exigem plano Vercel Pro em produção.

---

## 6. Webhooks em produção

| Serviço | URL |
|---------|-----|
| Stripe | `https://seu-dominio.vercel.app/api/webhooks/stripe` |
| Kiwify | `https://seu-dominio.vercel.app/api/webhooks/kiwify` |
| Z-API | `https://seu-dominio.vercel.app/api/whatsapp/webhooks/zapi` |
| Twilio | `https://seu-dominio.vercel.app/api/whatsapp/webhooks/twilio` |

**Stripe — eventos:** `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

**Stripe — checkout/portal success URLs:** já usam `NEXT_PUBLIC_APP_URL/billing`

---

## 7. Checklist pós-deploy

- [ ] Login email e Google funcionam
- [ ] `/dashboard` carrega métricas
- [ ] `/crm` lista leads
- [ ] `/whatsapp` conexão e automações
- [ ] `/billing` planos e créditos
- [ ] Checkout Stripe redireciona e volta com `?success=true`
- [ ] Webhook Stripe recebe eventos (Stripe Dashboard → Webhooks → logs)
- [ ] `npm run build` passa localmente (validação final)

---

## 8. Build local (validação)

```bash
cp .env.example .env.local
# preencha variáveis
npm install
npm run db:push
npm run build
npm run start
```

Se `prisma generate` falhar no Windows (EPERM), feche processos Node e tente de novo, ou rode apenas `npx next build` após um generate bem-sucedido.

---

## 9. Troubleshooting

| Erro | Solução |
|------|---------|
| `P1001` / DB connection | Verifique `DATABASE_URL` e `DIRECT_URL` (pooler Supabase) |
| Auth redirect loop | Confira Site URL e Redirect URLs no Supabase |
| Prisma client on Vercel | `binaryTargets` em `schema.prisma`; `postinstall` ativo |
| Stripe webhook 400 | `STRIPE_WEBHOOK_SECRET` correto para o endpoint de produção |
| 401 em APIs | Usuário não logado; cookies Supabase no domínio correto |
| Rotas 404 | Use `/billing` e `/whatsapp` (não apenas paths antigos em `/dashboard/`) |

---

## Suporte

Documentação adicional: `README.md`, `supabase/AUTH_SETUP.md`

# ARQFLOW AI

SaaS premium de IA para arquitetos, designers de interiores, marcenarias e escritórios criativos.

## Stack

- **Frontend:** Next.js 15, TypeScript, TailwindCSS, Shadcn UI, Framer Motion
- **Backend:** Next.js API Routes + Server Actions
- **Banco:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** Supabase Auth (email + Google OAuth)
- **IA Texto:** OpenAI GPT-4o
- **IA Imagem:** Replicate (Flux Schnell)
- **Pagamentos:** Stripe + Webhook Kiwify
- **Emails:** Resend
- **Automações:** n8n
- **Storage:** Supabase Storage
- **Deploy:** Vercel

## Estrutura

```
/app              → Rotas (landing, auth, dashboard, API)
/components       → UI components
/modules          → Feature modules (landing, CRM, concepts...)
/services         → Business logic (OpenAI, Stripe, Kiwify...)
/repositories     → Data access layer
/actions          → Server Actions
/lib              → Utilities, Prisma, Supabase clients
/prisma           → Database schema
/workflows/n8n    → n8n workflow definitions
/emails           → Resend email templates
/config           → Plans, site config
```

## Setup local

### 1. Clonar e instalar

```bash
npm install
cp .env.example .env.local
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie `URL` e `anon key` para `.env.local` (`NEXT_PUBLIC_SUPABASE_*`)
3. Gere as URLs do Prisma automaticamente (senha em **Settings → Database**):

```bash
SUPABASE_DB_PASSWORD=sua_senha npm run env:setup
# opcional: SUPABASE_DB_REGION=aws-1-sa-east-1
```
4. Habilite **Google OAuth** em Authentication → Providers
5. Crie buckets de storage: `renders`, `budgets`, `avatars` (públicos para leitura)
6. Execute as migrations:

```bash
npx prisma db push
```

7. Execute `supabase/migrations/001_rls_policies.sql` no SQL Editor

### 3. Configurar integrações

| Variável | Serviço |
|----------|---------|
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) |
| `REPLICATE_API_TOKEN` | [Replicate](https://replicate.com) |
| `STRIPE_*` | [Stripe Dashboard](https://dashboard.stripe.com) |
| `RESEND_API_KEY` | [Resend](https://resend.com) |
| `KIWIFY_WEBHOOK_SECRET` | Painel Kiwify → Webhooks |
| `N8N_WEBHOOK_URL` | Sua instância n8n |
| `ZAPI_*` | [Z-API](https://z-api.io) (opcional) |

### 4. Stripe — criar produtos

Crie 3 produtos recorrentes (Starter R$97, Pro R$197, Premium R$397) e copie os Price IDs para:

```
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
```

Configure webhook endpoint: `https://seu-dominio.com/api/webhooks/stripe`

**Deploy em produção:** veja [DEPLOY.md](./DEPLOY.md) (GitHub, Vercel, variáveis, Prisma, rotas `/dashboard`, `/crm`, `/whatsapp`, `/billing`).

Eventos: `customer.subscription.*`, `invoice.payment_succeeded`

### 5. Kiwify

Configure webhook: `https://seu-dominio.com/api/webhooks/kiwify`

### 6. n8n

Importe os workflows em `workflows/n8n/` e configure variáveis de ambiente.

### 7. Rodar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy Vercel

```bash
npm i -g vercel
vercel
```

Configure todas as variáveis de `.env.example` no painel Vercel.

**Redirect URLs Supabase:** adicione `https://seu-dominio.com/api/auth/callback`

## Planos e créditos

| Plano | Preço | Créditos/mês |
|-------|-------|--------------|
| Starter | R$97 | 50 |
| Pro | R$197 | 200 |
| Premium | R$397 | 500 |

- Conceito IA: 2 créditos
- Render IA: 5 créditos
- Orçamento PDF: 1 crédito

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhooks/stripe` | Webhook Stripe |
| POST | `/api/webhooks/kiwify` | Webhook Kiwify |
| POST | `/api/billing/checkout` | Iniciar checkout |
| POST | `/api/billing/portal` | Portal Stripe |
| POST | `/api/whatsapp/send` | Enviar WhatsApp |
| GET | `/api/dashboard/stats` | Métricas dashboard |
| GET | `/api/cron/inactive-leads` | Cron recuperação leads |

## Licença

Proprietário — ARQFLOW AI © 2026

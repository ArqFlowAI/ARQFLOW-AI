# Planos e controle de acesso — ARQFLOW AI

## Planos

| Plano | Preço | Render IA | Orçamentos | CRM | WhatsApp | Automações |
|-------|-------|-----------|------------|-----|----------|------------|
| **FREE** | R$0 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **BASIC** | R$97 | ❌ | ✅ | ❌ | ❌ | ❌ |
| **PRO** | R$197 | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PREMIUM** | R$397 | ✅ | ✅ | ✅ | ✅ | ✅ |

## Cadastro

Novos usuários recebem `plan: FREE`, `status: ACTIVE` em `services/auth.service.ts`.

## Camadas de proteção

1. **Middleware** (`lib/supabase/middleware.ts` + `lib/billing/middleware-plan.ts`)  
   Bloqueia URL manual e APIs premium → redirect `/billing/upgrade` ou JSON 403.

2. **Layout server** (`app/(dashboard)/**/layout.tsx` com `PlanRouteGuard`)  
   Segunda barreira com Prisma via `enforcePlanFeature`.

3. **Server Actions / Services** (`assertPlanFeature`, `assertPlanLimit`)  
   Impede bypass mesmo chamando API internamente.

4. **Sidebar** (`components/dashboard/sidebar.tsx`)  
   Itens bloqueados linkam para upgrade com badge do plano mínimo.

## Migração banco

```bash
npx prisma db push
# ou
psql ... -f prisma/migrations/20260520120000_plans_free_basic/migration.sql
```

## Variáveis Stripe

```env
STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_PREMIUM=price_xxx
```

## Arquivos principais

- `config/plans.ts` — matriz de features
- `lib/billing/routes.ts` — rota → feature
- `lib/billing/plan-access.ts` — `checkPlanAccess`
- `lib/billing/enforce-plan.ts` — redirect upgrade
- `app/(dashboard)/billing/upgrade/page.tsx` — tela de upgrade

import type { PaymentProvider, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export type BillingSubscriptionDto = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  credits: number;
  creditsUsed: number;
  creditsRemaining: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  billingProvider: PaymentProvider | null;
  stripeCustomerId: string | null;
  hasStripe: boolean;
};

export type BillingPaymentDto = {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: string;
  externalId: string;
  createdAt: string;
};

export type BillingUsageByUserDto = {
  userId: string | null;
  userName: string;
  totalCredits: number;
  breakdown: { type: string; amount: number }[];
};

export type BillingPageData = {
  subscription: BillingSubscriptionDto;
  payments: BillingPaymentDto[];
  usageByUser: BillingUsageByUserDto[];
  usageByType: { type: string; amount: number }[];
};

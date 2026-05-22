UPDATE "Subscription" SET plan = 'FREE'::"SubscriptionPlan"
WHERE plan::text = 'STARTER';

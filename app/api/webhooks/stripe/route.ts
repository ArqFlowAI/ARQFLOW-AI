import {
  getStripe,
  handleSubscriptionUpdated,
  recordStripePayment,
} from "@/services/stripe.service";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook]", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated({
        ...subscription,
        status: "canceled",
      } as Stripe.Subscription);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      let organizationId =
        typeof invoice.metadata?.organizationId === "string"
          ? invoice.metadata.organizationId
          : undefined;

      if (!organizationId && invoice.customer) {
        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: String(invoice.customer) },
        });
        organizationId = sub?.organizationId;
      }

      if (organizationId && invoice.id) {
        const sub = await prisma.subscription.findUnique({
          where: { organizationId },
        });
        if (sub) {
          await recordStripePayment({
            organizationId,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? "brl",
            status: "paid",
            metadata: { invoice: invoice.id, plan: sub.plan },
          });
        }
      }
      break;
    }
  }

  return Response.json({ received: true });
}

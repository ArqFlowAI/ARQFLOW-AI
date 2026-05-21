import {
  handleKiwifyPurchase,
  handleKiwifyCancellation,
} from "@/services/kiwify.service";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;
  const signature = (await headers()).get("x-kiwify-signature");

  if (secret && signature !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const event = payload.webhook_event_type ?? payload.event;

  try {
    switch (event) {
      case "order_approved":
      case "compra_aprovada":
        await handleKiwifyPurchase(payload);
        break;
      case "subscription_canceled":
      case "assinatura_cancelada":
        await handleKiwifyCancellation(payload);
        break;
      default:
        console.log("[Kiwify] Unhandled event:", event);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[Kiwify Webhook]", error);
    return Response.json({ error: "Processing failed" }, { status: 500 });
  }
}

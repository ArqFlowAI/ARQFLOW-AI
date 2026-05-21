export async function triggerN8nWebhook(
  event: string,
  data: Record<string, unknown>
) {
  const baseUrl = process.env.N8N_WEBHOOK_URL;
  if (!baseUrl) return null;

  const url = `${baseUrl}/${event}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.N8N_API_KEY
        ? { Authorization: `Bearer ${process.env.N8N_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({ event, timestamp: new Date().toISOString(), ...data }),
  });

  if (!res.ok) {
    console.error(`[n8n] Webhook ${event} failed:`, await res.text());
    return null;
  }

  return res.json();
}

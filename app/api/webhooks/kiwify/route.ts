export async function POST() {
  return new Response(
    JSON.stringify({
      error: "Webhooks de Kiwify não estão habilitados neste produto.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}

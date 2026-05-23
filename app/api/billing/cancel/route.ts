export async function POST() {
  return new Response(
    JSON.stringify({
      error: "Cancelamento de assinatura interna não está disponível.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}

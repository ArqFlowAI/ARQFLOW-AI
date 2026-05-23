export async function POST() {
  return new Response(
    JSON.stringify({
      error: "Portal de pagamento interno não está disponível.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}

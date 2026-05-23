export async function POST() {
  return new Response(
    JSON.stringify({
      error: "Cobrança interna não está habilitada neste produto.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}

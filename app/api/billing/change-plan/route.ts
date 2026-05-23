export async function POST() {
  return new Response(
    JSON.stringify({
      error: "Alteração de plano interno não está disponível.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    }
  );
}

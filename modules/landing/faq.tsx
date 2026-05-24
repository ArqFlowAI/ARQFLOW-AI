const faqs = [
  {
    q: "Preciso de conhecimento técnico para usar?",
    a: "Não. O ARQFLOW AI foi projetado para arquitetos e designers. Interface intuitiva, resultados em minutos.",
  },
  {
    q: "Quais integrações estão disponíveis?",
    a: "Stripe, Kiwify, WhatsApp (Z-API/Twilio), OpenAI, Replicate, Resend, n8n e Supabase Storage.",
  },
  {
    q: "Como funcionam os recursos de IA?",
    a: "Todos os recursos de IA (Render, Conceitos, Orçamentos) estão disponíveis e ilimitados para usuários autenticados.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Cancele pelo portal de billing sem multas. Seus dados permanecem por 30 dias após cancelamento.",
  },
  {
    q: "Funciona para marcenarias e móveis planejados?",
    a: "Perfeitamente. Templates de orçamento, CRM e automações são adaptáveis para qualquer escritório criativo.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center font-display text-4xl font-bold">
          Perguntas frequentes
        </h2>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="glass rounded-xl overflow-hidden group">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium list-none hover:bg-brand-beige/10">
                {faq.q}
                <span className="text-brand-light group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-brand-dark/70 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

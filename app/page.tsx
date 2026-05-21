import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/modules/landing/hero";
import { Features } from "@/modules/landing/features";
import { Pricing } from "@/modules/landing/pricing";
import { FAQ } from "@/modules/landing/faq";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="py-16 border-y border-brand-light/20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-sm text-brand-dark/60 mb-8">Confiado por escritórios em todo o Brasil</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-60">
              {["Studio Forma", "Arq. Silva", "Planejados+", "Design Co.", "Marcenaria Lux"].map((n) => (
                <span key={n} className="font-display text-lg font-semibold text-brand-dark">{n}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="beneficios" className="py-24">
          <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold">Venda mais. Trabalhe menos.</h2>
              <p className="mt-4 text-brand-dark/70 leading-relaxed">
                Automatize follow-ups, gere propostas em segundos e impressione clientes com renders IA de alto padrão.
              </p>
              <ul className="mt-8 space-y-4">
                {["+40% conversão comercial", "80% menos tempo em propostas", "Renders em 2 minutos", "CRM integrado"].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-brand-light fill-brand-light" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-8 h-80 flex items-center justify-center bg-gradient-to-br from-brand-beige/30 to-brand-light/20">
              <p className="font-display text-6xl font-bold text-brand-dark/20">ARQFLOW</p>
            </div>
          </div>
        </section>

        <Features />

        <section id="demo" className="py-24 bg-brand-bg">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="font-display text-4xl font-bold">Veja em ação</h2>
            <p className="mt-4 text-brand-dark/70">Do conceito ao fechamento em uma única plataforma</p>
            <div className="mt-12 glass rounded-2xl aspect-video max-w-4xl mx-auto flex items-center justify-center">
              <Button size="lg" asChild>
                <Link href="/cadastro">
                  Testar grátis por 14 dias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Pricing />
        <FAQ />

        <section className="py-24 bg-brand-dark text-brand-bg">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="font-display text-4xl font-bold">
              Pronto para transformar seu escritório?
            </h2>
            <p className="mt-4 text-brand-beige/80">
              Junte-se a centenas de arquitetos que já automatizam com IA.
            </p>
            <Button size="lg" className="mt-8 bg-brand-beige text-brand-black hover:bg-brand-bg" asChild>
              <Link href="/cadastro">Começar agora — é grátis</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

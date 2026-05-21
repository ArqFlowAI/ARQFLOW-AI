import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-brand-light/20 bg-brand-black text-brand-bg">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold">{siteConfig.name}</h3>
            <p className="mt-4 max-w-md text-brand-beige/80">
              Plataforma premium de IA para arquitetos, designers e marcenarias.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-beige">Produto</h4>
            <ul className="mt-4 space-y-2 text-sm text-brand-beige/70">
              <li><Link href="#funcionalidades" className="hover:text-brand-bg">Funcionalidades</Link></li>
              <li><Link href="#precos" className="hover:text-brand-bg">Preços</Link></li>
              <li><Link href="#faq" className="hover:text-brand-bg">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-beige">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-brand-beige/70">
              <li><Link href="/termos" className="hover:text-brand-bg">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-brand-bg">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-brand-dark pt-8 text-center text-sm text-brand-beige/50">
          © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

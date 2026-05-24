"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-bg to-brand-beige/20 dark:from-brand-black dark:to-brand-dark/30" />
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-brand-beige/30 blur-3xl" />
      <div className="absolute left-0 bottom-1/4 h-64 w-64 rounded-full bg-brand-light/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-brand-dark">
            <Sparkles className="h-4 w-4 text-brand-light" />
            IA para arquitetura e vendas
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-brand-black dark:text-brand-bg md:text-7xl">
            Automatize seu escritório com{" "}
            <span className="text-gradient">inteligência artificial</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-brand-dark/80 dark:text-brand-beige/80">
            Crie renders, propostas e automações de vendas em minutos.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cadastro">Começar agora</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-brand-light">
            14 dias grátis · Sem cartão · Cancele quando quiser
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="glass overflow-hidden rounded-2xl border border-brand-light/20 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-brand-light/10 bg-brand-black/5 px-4 py-3 dark:bg-brand-black/40">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-brand-dark/50">dashboard.arqflow.ai</span>
            </div>
            <div className="grid grid-cols-4 gap-4 p-6">
              {[
                { label: "Leads", value: "127", change: "+23%" },
                { label: "Renders", value: "48", change: "+12" },
                { label: "Conversão", value: "34%", change: "+5%" },
                { label: "Propostas", value: "19", change: "+8" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-brand-bg/50 p-4 dark:bg-brand-black/30"
                >
                  <p className="text-xs text-brand-dark/60">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-emerald-600">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 px-6 pb-6">
              <div className="col-span-2 h-40 rounded-xl bg-gradient-to-br from-brand-beige/40 to-brand-light/30" />
              <div className="space-y-4">
                <div className="h-16 rounded-xl bg-brand-dark/10" />
                <div className="h-16 rounded-xl bg-brand-beige/30" />
                <div className="h-8 rounded-xl bg-brand-light/20" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

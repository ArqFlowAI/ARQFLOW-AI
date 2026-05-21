"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/config/plans";
import { cn } from "@/lib/utils";

const planOrder = ["STARTER", "PRO", "PREMIUM"] as const;

export function Pricing() {
  return (
    <section id="precos" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold text-brand-black dark:text-brand-bg">
            Planos para cada fase do seu escritório
          </h2>
          <p className="mt-4 text-brand-dark/70">
            Escale conforme cresce. Upgrade ou downgrade a qualquer momento.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {planOrder.map((key, i) => {
            const plan = PLANS[key];
            const isPopular = key === "PRO";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className={cn(
                    "relative h-full",
                    isPopular && "border-brand-dark shadow-xl scale-105"
                  )}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-dark px-4 py-1 text-xs text-brand-bg">
                      Mais popular
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="font-display text-4xl font-bold">
                        R${plan.price}
                      </span>
                      <span className="text-brand-dark/60">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-8 w-full"
                      variant={isPopular ? "default" : "outline"}
                      asChild
                    >
                      <Link href={`/cadastro?plan=${key.toLowerCase()}`}>
                        Começar com {plan.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

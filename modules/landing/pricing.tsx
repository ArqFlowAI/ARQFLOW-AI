"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/config/plans";
import { cn } from "@/lib/utils";

const planOrder = ["PRO"] as const;

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

          <div className="mt-16 grid gap-8 md:grid-cols-1">
            {planOrder.map((key, i) => {
              const plan = PLANS[key];

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="relative h-full border-brand-dark shadow-xl scale-100">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl">{plan.name} — R$99/mês</CardTitle>
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
                      <Button className="mt-8 w-full" asChild>
                        <Link href={`/cadastro?plan=pro`}>Assinar PRO</Link>
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
